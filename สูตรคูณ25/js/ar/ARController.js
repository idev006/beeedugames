import { EventBus } from "../core/EventBus.js?v=20260730-14";

const INDEX_FINGER_TIP = 8;
const INDEX_FINGER_PIP = 6;
const INDEX_FINGER_MCP = 5;
const WRIST = 0;
const VIDEO_READY = 2;
const MIN_POINTER = 0.025;
const MAX_POINTER = 0.975;

export class ARController extends EventBus {
  constructor(config) {
    super();
    this.config = config;
    this.enabled = false;
    this.busy = false;
    this.stream = null;
    this.video = null;
    this.handLandmarker = null;
    this.raf = null;
    this.lastVideoTime = -1;
    this.lastInferenceAt = 0;
    this.inferenceDurationEma = 0;
    this.inferenceCanvas = null;
    this.inferenceContext = null;
    this.processingFrame = false;
    this.inferenceTimer = null;
    this.lastNoHandStatusAt = 0;
    this.lastHandStatusAt = 0;
    this.consecutiveErrors = 0;
    this.mirrorInput = Boolean(config.ar?.mirrorInput);
  }

  setMirrorInput(value) {
    this.mirrorInput = Boolean(value);
  }

  getMirrorInput() {
    return this.mirrorInput;
  }

  async start(video) {
    if (this.busy || this.enabled) return;
    this.busy = true;
    this.video = video;
    this.emit("status", { text: "กำลังเปิดกล้อง AR..." });
    this.emitPointer(false, 0.5, 0.52);

    try {
      this.assertCameraSupport();
      await this.startCamera();
      this.emit("status", { text: "เปิดกล้องแล้ว กำลังเตรียมระบบตรวจจับนิ้ว..." });
      this.handLandmarker = await this.createHandLandmarker();

      this.enabled = true;
      this.busy = false;
      this.lastVideoTime = -1;
      this.lastInferenceAt = 0;
      this.inferenceDurationEma = 0;
      this.emit("status", {
        text: "AR พร้อมแล้ว ยกฝ่ามือเข้าใกล้กล้องให้กินพื้นที่ประมาณ 1/4–1/2 ของภาพ"
      });
      this.loop();
    } catch (error) {
      this.stop();
      this.busy = false;
      this.emit("error", {
        text: `เปิด AR ไม่สำเร็จ: ${this.describeError(error)}`
      });
    }
  }

  assertCameraSupport() {
    if (!window.isSecureContext) {
      throw new Error("ต้องเปิดผ่าน localhost หรือ HTTPS");
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("เบราว์เซอร์นี้ไม่มี Camera API");
    }
  }

  async startCamera() {
    const arConfig = this.config.ar || {};
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: Number(arConfig.captureWidth) || 1280 },
        height: { ideal: Number(arConfig.captureHeight) || 720 },
        frameRate: { ideal: Number(arConfig.captureFps) || 30, min: 15 }
      },
      audio: false
    });
    this.video.srcObject = this.stream;
    await this.video.play();
    await waitForVideoDimensions(this.video);
    this.video.classList.add("is-active");
  }

  async createHandLandmarker() {
    const arConfig = this.config.ar || {};
    const visionModule = await import(arConfig.tasksVisionUrl);
    const vision = await visionModule.FilesetResolver.forVisionTasks(arConfig.tasksVisionWasmRoot);
    const preferredDelegate = String(arConfig.delegate || "CPU").toUpperCase();
    const baseOptions = {
      modelAssetPath: arConfig.handLandmarkerModelUrl,
      delegate: preferredDelegate
    };
    const options = {
      baseOptions,
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence: confidence(arConfig.minHandDetectionConfidence, 0.3),
      minHandPresenceConfidence: confidence(arConfig.minHandPresenceConfidence, 0.3),
      minTrackingConfidence: confidence(arConfig.minTrackingConfidence, 0.35)
    };

    let landmarker;
    try {
      landmarker = await visionModule.HandLandmarker.createFromOptions(vision, options);
    } catch (preferredError) {
      if (preferredDelegate === "CPU") throw preferredError;
      this.emit("status", { text: "อุปกรณ์นี้ไม่รองรับ GPU สำหรับ AR กำลังเปลี่ยนเป็น CPU..." });
      landmarker = await visionModule.HandLandmarker.createFromOptions(vision, {
        ...options,
        baseOptions: {
          modelAssetPath: arConfig.handLandmarkerModelUrl,
          delegate: "CPU"
        }
      });
    }

    this.emit("status", { text: "โมเดล AR พร้อมแล้ว กำลังปรับความเร็วให้เหมาะกับอุปกรณ์..." });
    await waitForNextPaint();
    this.warmUpLandmarker(landmarker);
    return landmarker;
  }

  warmUpLandmarker(landmarker) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    landmarker.detectForVideo(canvas, performance.now());
  }

  stop() {
    this.enabled = false;
    this.busy = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    if (this.inferenceTimer) window.clearTimeout(this.inferenceTimer);
    this.inferenceTimer = null;
    this.lastVideoTime = -1;
    this.lastInferenceAt = 0;
    this.inferenceDurationEma = 0;
    this.inferenceCanvas = null;
    this.inferenceContext = null;
    this.processingFrame = false;
    this.consecutiveErrors = 0;

    if (this.handLandmarker) {
      try {
        this.handLandmarker.close();
      } catch {
        // The camera can still be stopped safely if MediaPipe is already closed.
      }
    }
    this.handLandmarker = null;

    if (this.video) {
      this.video.classList.remove("is-active");
      this.video.srcObject = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    this.stream = null;
    this.emitPointer(false, 0.5, 0.52);
  }

  loop() {
    if (!this.enabled || !this.handLandmarker || !this.video) return;

    const now = performance.now();
    const maxFps = Math.max(6, Number(this.config.ar?.maxInferenceFps) || 15);
    const mainThreadBudget = clamp(Number(this.config.ar?.maxMainThreadBudget) || 0.35, 0.2, 0.6);
    const baseInterval = 1000 / maxFps;
    const adaptiveInterval = this.inferenceDurationEma > 0
      ? this.inferenceDurationEma / mainThreadBudget
      : baseInterval;
    const inferenceInterval = Math.max(baseInterval, adaptiveInterval);
    if (
      !this.processingFrame &&
      this.video.readyState >= VIDEO_READY &&
      this.video.currentTime !== this.lastVideoTime &&
      now - this.lastInferenceAt >= inferenceInterval
    ) {
      this.lastVideoTime = this.video.currentTime;
      this.lastInferenceAt = now;
      this.processingFrame = true;
      this.inferenceTimer = window.setTimeout(() => this.processFrame(), 0);
    }

    this.raf = requestAnimationFrame(() => this.loop());
  }

  processFrame() {
    this.inferenceTimer = null;
    if (!this.enabled || !this.handLandmarker || !this.video) {
      this.processingFrame = false;
      return;
    }

    const startedAt = performance.now();
    try {
      const inferenceSource = this.prepareInferenceFrame();
      const results = this.handLandmarker.detectForVideo(inferenceSource, startedAt);
      const duration = performance.now() - startedAt;
      this.inferenceDurationEma = this.inferenceDurationEma > 0
        ? (this.inferenceDurationEma * 0.82) + (duration * 0.18)
        : duration;
      this.consecutiveErrors = 0;
      this.handleResults(results);
    } catch (error) {
      this.handleInferenceError(error);
    } finally {
      this.processingFrame = false;
    }
  }

  prepareInferenceFrame() {
    const arConfig = this.config.ar || {};
    const width = Math.max(256, Number(arConfig.inferenceWidth) || 512);
    const height = Math.max(256, Number(arConfig.inferenceHeight) || width);
    if (!this.inferenceCanvas) {
      this.inferenceCanvas = document.createElement("canvas");
      this.inferenceCanvas.width = width;
      this.inferenceCanvas.height = height;
      this.inferenceContext = this.inferenceCanvas.getContext("2d", {
        alpha: false,
        desynchronized: true
      });
    }
    if (!this.inferenceContext) return this.video;
    this.inferenceContext.drawImage(this.video, 0, 0, width, height);
    return this.inferenceCanvas;
  }

  handleResults(results) {
    const hand = results?.landmarks?.[0];
    if (!hand?.[INDEX_FINGER_TIP]) {
      const now = performance.now();
      if (now - this.lastNoHandStatusAt > 1300) {
        this.lastNoHandStatusAt = now;
        this.emit("status", {
          text: "ยังไม่พบมือ ยกฝ่ามือเข้าใกล้กล้อง ให้เห็นครบทั้งมือ และเปิดไฟจากด้านหน้า"
        });
      }
      this.emitPointer(false, 0.5, 0.52, false);
      return;
    }

    const tip = hand[INDEX_FINGER_TIP];
    if (!isIndexFingerExtended(hand)) {
      const now = performance.now();
      if (now - this.lastHandStatusAt > 900) {
        this.lastHandStatusAt = now;
        this.emit("status", { text: "พบฝ่ามือแล้ว กางนิ้วชี้ขึ้นหนึ่งนิ้วเพื่อเปิด pointer" });
      }
      this.emitPointer(false, 0.5, 0.52, true);
      return;
    }
    const mappedX = this.mirrorInput ? 1 - tip.x : tip.x;
    const x = clamp(mappedX, MIN_POINTER, MAX_POINTER);
    const y = clamp(tip.y, MIN_POINTER, MAX_POINTER);
    const now = performance.now();

    if (now - this.lastHandStatusAt > 1100) {
      this.lastHandStatusAt = now;
      this.emit("status", { text: "พบนิ้วแล้ว เล็งวงแสงไปที่แกนคริสตัลและค้างไว้ครึ่งวินาที" });
    }
    this.emitPointer(true, x, y, true);
  }

  handleInferenceError(error) {
    this.consecutiveErrors += 1;
    // An inference failure cannot prove that a finger is still present.
    // Hide and disarm the pointer immediately instead of reusing stale coordinates.
    this.emitPointer(false, 0.5, 0.52);
    if (this.consecutiveErrors === 3) {
      this.emit("status", {
        text: `ระบบตรวจนิ้วสะดุด: ${this.describeError(error)} — กำลังลองใหม่`
      });
    }
    if (this.consecutiveErrors >= 30) {
      this.emit("error", {
        text: `AR ตรวจจับมือไม่ได้: ${this.describeError(error)}`
      });
      this.stop();
    }
  }

  emitPointer(tracking, x, y, handDetected = tracking) {
    const fingerDetected = Boolean(tracking);
    this.emit("pointer", {
      visible: fingerDetected,
      tracking: fingerDetected,
      handDetected: Boolean(handDetected),
      x,
      y
    });
  }

  describeError(error) {
    if (error?.name === "NotAllowedError") return "ยังไม่ได้อนุญาตให้ใช้กล้อง";
    if (error?.name === "NotFoundError") return "ไม่พบกล้องในอุปกรณ์";
    if (error?.name === "NotReadableError") return "กล้องกำลังถูกโปรแกรมอื่นใช้งาน";
    return error?.message || "ตรวจสอบอินเทอร์เน็ต การอนุญาตกล้อง และลองใหม่";
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0.5));
}

function confidence(value, fallback) {
  return clamp(Number(value) || fallback, 0.15, 0.9);
}

function isIndexFingerExtended(hand) {
  const wrist = hand?.[WRIST];
  const mcp = hand?.[INDEX_FINGER_MCP];
  const pip = hand?.[INDEX_FINGER_PIP];
  const tip = hand?.[INDEX_FINGER_TIP];
  if (!wrist || !mcp || !pip || !tip) return false;
  const extendsFromPalm = landmarkDistance(tip, wrist) > landmarkDistance(pip, wrist) * 1.03;
  const extendsFromKnuckle = landmarkDistance(tip, mcp) > landmarkDistance(pip, mcp) * 1.22;
  const straightEnough = jointCosine(mcp, pip, tip) < -0.2;
  return extendsFromPalm || (extendsFromKnuckle && straightEnough);
}

function landmarkDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
}

function jointCosine(a, joint, b) {
  const ax = a.x - joint.x;
  const ay = a.y - joint.y;
  const az = (a.z || 0) - (joint.z || 0);
  const bx = b.x - joint.x;
  const by = b.y - joint.y;
  const bz = (b.z || 0) - (joint.z || 0);
  const lengthA = Math.hypot(ax, ay, az) || 1;
  const lengthB = Math.hypot(bx, by, bz) || 1;
  return (ax * bx + ay * by + az * bz) / (lengthA * lengthB);
}

function waitForVideoDimensions(video) {
  if (video.videoWidth > 0 && video.videoHeight > 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("กล้องเปิดแล้วแต่ยังไม่มีภาพ ลองปิดโปรแกรมอื่นที่ใช้กล้อง"));
    }, 5000);
    const onReady = () => {
      if (video.videoWidth <= 0 || video.videoHeight <= 0) return;
      cleanup();
      resolve();
    };
    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("resize", onReady);
    };
    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("resize", onReady);
  });
}

function waitForNextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => window.setTimeout(resolve, 0));
  });
}

import { ARController } from "./ar/ARController.js?v=20260801-64";
import { AudioEngine } from "./audio/AudioEngine.js?v=20260731-36";
import { GameStore } from "./core/GameStore.js?v=20260802-76";
import { PhaserGameBridge } from "./game/PhaserGameBridge.js?v=20260801-66";
import { LocalProgressRepository } from "./progression/repositories/LocalProgressRepository.js?v=20260802-03";
import { LeaderboardInfrastructure } from "./progression/leaderboard/LeaderboardInfrastructure.js?v=20260802-02";
import { PodiumLayout } from "./progression/leaderboard/PodiumLayout.js?v=20260802-02";
import { createProgressStoreDefinition } from "./progression/ProgressStore.js?v=20260802-04";
import { RewardService } from "./progression/RewardService.js?v=20260801-01";
import { CityProgressService } from "./progression/CityProgressService.js?v=20260802-02";
import { LeaderboardService } from "./progression/LeaderboardService.js?v=20260802-09";
import { HallController } from "./progression/leaderboard/HallController.js?v=20260802-03";

const CONFIG_URL = "config/game.config.json?v=20260802-78";
const VueRef = window.Vue;
const PiniaRef = window.Pinia;
const PhaserRef = window.Phaser;

async function bootstrap() {
  const config = await fetch(CONFIG_URL).then((response) => response.json());
  if (!PiniaRef) throw new Error("PINIA_UNAVAILABLE");
  const pinia = PiniaRef.createPinia();
  const progressRepository = new LocalProgressRepository(window.localStorage, config);
  const leaderboardRepository = LeaderboardInfrastructure.createRepository({
    config,
    storage: window.localStorage,
    fetchImpl: window.fetch.bind(window)
  });
  const useProgressStore = createProgressStoreDefinition(PiniaRef, progressRepository);
  const progressStore = useProgressStore(pinia);
  await progressStore.initialize();
  const store = VueRef.reactive(new GameStore(config));
  Object.assign(store.settings, progressStore.preferences);
  store.setLearningHistory(progressStore.snapshot.mastery);
  const audio = new AudioEngine(store);
  const bridge = new PhaserGameBridge(config, store);
  const arController = new ARController(config);
  const rewardService = new RewardService(progressStore, config);
  const cityProgress = new CityProgressService(
    progressStore,
    config.progression.cityRepair,
    config.assets.backgrounds
  );
  const leaderboard = new LeaderboardService(leaderboardRepository);
  const podiumLayout = new PodiumLayout(config.leaderboard?.presentation);
  const leaderboardCommit = { current: Promise.resolve() };

  const vueApp = VueRef.createApp({
    setup() {
      const screen = VueRef.ref("start");
      const settingsOpen = VueRef.ref(false);
      const privacyOpen = VueRef.ref(false);
      const deleteConfirm = VueRef.ref(false);
      const playerName = VueRef.ref(progressStore.player.displayName);
      const leaderboardEntries = VueRef.ref([]);
      const hallBoards = VueRef.ref([]);
      const selectedHallBoardKey = VueRef.ref("");
      const hallDataLoading = VueRef.ref(false);
      const hallDataError = VueRef.ref("");
      const hallSceneReady = VueRef.ref(false);
      const hallSceneFailed = VueRef.ref(false);
      const playSceneReady = VueRef.ref(false);
      const playSceneFailed = VueRef.ref(false);
      const gameStarting = VueRef.ref(false);
      const heartPulse = VueRef.ref(false);
      const cityBusy = VueRef.ref(false);
      const cityMessage = VueRef.ref("เลือกจุดซ่อมที่พร้อม แล้วใช้วัสดุฟื้นฟูเมือง");
      const uiVersion = VueRef.ref(0);
      const ar = VueRef.reactive({
        enabled: false,
        busy: false,
        status: "AR ยังไม่เปิด",
        visible: false,
        tracking: false,
        handDetected: false,
        x: 0.5,
        y: 0.5,
        mirrorInput: Boolean(config.ar?.mirrorInput),
        progress: 0,
        progressLabel: "",
        parked: false,
        parkUntil: 0,
        answerTargets: [],
        selections: 0,
        lastSelection: ""
      });

      let timer = null;
      const sessionTimeouts = new Set();

      const clearSessionTimeouts = () => {
        sessionTimeouts.forEach((timeout) => window.clearTimeout(timeout));
        sessionTimeouts.clear();
      };

      const currentDistrictLabel = computedWithVersion(uiVersion, () => {
        const bg = config.assets.backgrounds[store.levelIndex] || config.assets.backgrounds[1];
        return bg.label;
      });
      const currentBgPath = computedWithVersion(uiVersion, () => {
        const bg = config.assets.backgrounds[store.levelIndex] || config.assets.backgrounds[1];
        return bg.path;
      });
      const starsValue = computedWithVersion(uiVersion, () => store.stars);
      const secondsValue = computedWithVersion(uiVersion, () => store.secondsLeft);
      const comboValue = computedWithVersion(uiVersion, () => store.combo);
      const repairedValue = computedWithVersion(uiVersion, () => store.repaired);
      const inventoryValue = VueRef.computed(() => progressStore.inventory);
      const restorationStage = computedWithVersion(uiVersion, () => {
        const district = config.assets.backgrounds[store.levelIndex] || config.assets.backgrounds[1];
        return cityProgress.getStage(district.id);
      });
      const cityDistricts = computedWithVersion(uiVersion, () => cityProgress.getDistricts());
      const currentRestorationNodes = computedWithVersion(uiVersion, () => {
        const district = config.assets.backgrounds[store.levelIndex] || config.assets.backgrounds[1];
        return cityProgress.getDistricts().find((entry) => entry.id === district.id)?.nodes || [];
      });
      const teamPortraits = Object.entries(config.assets.characterPortraits || {}).map(([id, portrait]) => ({
        id,
        ...portrait
      }));
      const tableMinValue = computedWithVersion(uiVersion, () => store.settings.tableMin);
      const tableMaxValue = computedWithVersion(uiVersion, () => store.settings.tableMax);
      const heartsText = computedWithVersion(uiVersion, () => "♥".repeat(store.lives) || "0");
      const missionTitle = computedWithVersion(uiVersion, () => store.missionTitle);
      const missionHint = computedWithVersion(uiVersion, () => store.missionHint);
      const learningPhaseLabel = computedWithVersion(uiVersion, () => store.learningPhaseLabel);
      const miniGroups = computedWithVersion(uiVersion, () => {
        const count = store.miniGroupCount || 3;
        return Array.from({ length: count }, (_, index) => index);
      });
      const sessionProgress = computedWithVersion(uiVersion, () => {
        const total = Math.max(1, store.settings.seconds);
        return Math.round(((total - store.secondsLeft) / total) * 100);
      });
      const resultTitle = computedWithVersion(uiVersion, () => {
        return store.lives <= 0 ? "เมืองยังต้องการทีมช่าง" : "ซ่อมเมืองได้ยอดเยี่ยม";
      });
      const accuracyText = computedWithVersion(uiVersion, () => {
        if (!store.totalAnswers) return "0%";
        return `${Math.round((store.correctAnswers / store.totalAnswers) * 100)}%`;
      });
      const resultMessage = computedWithVersion(uiVersion, () => {
        const min = Math.min(store.settings.tableMin, store.settings.tableMax);
        const max = Math.max(store.settings.tableMin, store.settings.tableMax);
        return `รอบนี้ฝึกแม่ ${min} ถึง ${max} ตอบถูก ${store.repaired} ครั้ง และได้รับวัสดุซ่อมเมือง`;
      });
      const materialLabels = Object.freeze({ gear: "เฟือง", crystal: "คริสตัล", energyCell: "เซลล์พลัง", prism: "ปริซึม" });
      const recipeText = (recipe = {}) => Object.entries(recipe)
        .map(([type, amount]) => `${materialLabels[type] || type} ${amount}`)
        .join(" • ");
      const canRepairNode = (districtId, nodeId) => cityProgress.canRepair(districtId, nodeId).ok;
      const hallPodiumStyle = (index) => podiumLayout.getStyle(index);
      const hallBoardLabel = VueRef.computed(() => leaderboard.describeBoardKey(
        selectedHallBoardKey.value || leaderboard.buildBoardKey(store.settings)
      ));
      const hallBoardOptionLabel = (board) => `${leaderboard.describeBoardKey(board.boardKey)} • ${board.count} คน`;
      const arPointerStyle = VueRef.computed(() => ({
        left: `${ar.x * 100}%`,
        top: `${ar.y * 100}%`,
        "--progress": `${Math.round(ar.progress * 360)}deg`
      }));
      const arVideoClass = VueRef.computed(() => ({
        "is-mirrored": ar.mirrorInput
      }));
      const arPointerClass = VueRef.computed(() => ({
        "is-tracking": ar.tracking,
        "is-searching": ar.enabled && !ar.tracking
      }));
      const arGuideTitle = VueRef.computed(() => (
        ar.handDetected ? "เห็นมือแล้ว—กางนิ้วชี้" : "ยกฝ่ามือเข้าใกล้กล้อง"
      ));
      const arGuideHint = VueRef.computed(() => (
        ar.handDetected
          ? "ชูนิ้วชี้เพียงนิ้วเดียว แล้วเล็งไปที่วัตถุ"
          : "ให้ฝ่ามือกินพื้นที่ประมาณ 1/4–1/2 ของภาพ"
      ));
      const arChecks = VueRef.computed(() => ([
        { id: "camera", label: "กล้องพร้อม", pass: ar.enabled },
        { id: "hand", label: "พบมือ", pass: ar.handDetected },
        { id: "gesture", label: "พบนิ้วชี้", pass: ar.tracking },
        { id: "pointer", label: "pointer พร้อม", pass: ar.visible },
        { id: "selection", label: "เลือกวัตถุได้", pass: ar.selections > 0 }
      ]));

      const startGame = async (withAR) => {
        if (gameStarting.value) return;
        gameStarting.value = true;
        playSceneReady.value = false;
        playSceneFailed.value = false;
        normalizeSettings(store, config);
        const activeLevelIndex = cityProgress.getActiveLevelIndex();
        store.levelIndex = activeLevelIndex;
        uiVersion.value += 1;
        const activeBackground = config.assets.backgrounds[activeLevelIndex] || config.assets.backgrounds[1];
        const backgroundReady = preloadImage(activeBackground.path);
        try {
          await progressStore.setDisplayName(playerName.value);
          playerName.value = progressStore.player.displayName;
          await progressStore.savePreferences({
            seconds: store.settings.seconds,
            mode: store.settings.mode,
            tableMin: store.settings.tableMin,
            tableMax: store.settings.tableMax,
            difficulty: store.settings.difficulty,
            arAnswerDwellMs: store.settings.arAnswerDwellMs
          });
          await backgroundReady;
          clearSessionTimeouts();
          screen.value = "play";
          await VueRef.nextTick();
          bridge.mount();
          if (withAR) await toggleAR();
          store.setLearningHistory(progressStore.snapshot.mastery);
          store.start({ levelIndex: activeLevelIndex });
          void leaderboard.beginSession(store.sessionId, progressStore.player, store.sessionSettings);
          audio.startMusic();
          clearInterval(timer);
          timer = setInterval(() => store.tick(), 1000);
        } catch (error) {
          playSceneFailed.value = true;
          console.error("Game scene preload failed", error);
        } finally {
          gameStarting.value = false;
        }
      };

      const onPlaySceneLoad = () => {
        playSceneReady.value = true;
        playSceneFailed.value = false;
      };

      const onPlaySceneError = () => {
        playSceneReady.value = false;
        playSceneFailed.value = true;
      };

      const endGame = () => {
        store.finish("exit");
      };

      const openSettings = () => {
        settingsOpen.value = true;
      };

      const eraseLocalData = async () => {
        if (!deleteConfirm.value || store.started) return;
        Object.keys(window.localStorage).filter((key) => key.startsWith("luminara."))
          .forEach((key) => window.localStorage.removeItem(key));
        await progressStore.resetLocalProgress();
        playerName.value = progressStore.player.displayName;
        Object.assign(store.settings, progressStore.preferences);
        deleteConfirm.value = false;
        privacyOpen.value = false;
        settingsOpen.value = false;
        screen.value = "start";
        uiVersion.value += 1;
      };

      const openCity = () => {
        cityMessage.value = "เลือกจุดซ่อมที่พร้อม แล้วใช้วัสดุฟื้นฟูเมือง";
        screen.value = "city";
        uiVersion.value += 1;
      };

      const selectCityDistrict = async (districtId) => {
        if (cityBusy.value) return;
        cityBusy.value = true;
        try {
          const selected = await cityProgress.selectDistrict(districtId);
          cityMessage.value = selected ? "เลือกเขตสำหรับภารกิจถัดไปแล้ว" : "เขตนี้ยังล็อกอยู่—ซ่อมเขตก่อนหน้าให้ครบ";
          uiVersion.value += 1;
        } finally {
          cityBusy.value = false;
        }
      };

      const repairCityNode = async (districtId, nodeId) => {
        if (cityBusy.value) return;
        cityBusy.value = true;
        try {
          const result = await cityProgress.repairNode(districtId, nodeId);
          cityMessage.value = result.ok
            ? (result.districtComplete ? "ซ่อมเขตครบแล้ว! เขตถัดไปเปิดออกและทีมช่างเดินทางต่อ" : "ซ่อมสำเร็จ! เมืองสว่างขึ้นอีกหนึ่งจุด")
            : ({
                MISSING_MATERIALS: "วัสดุยังไม่พอ—กลับไปทำภารกิจเพื่อรวบรวมเพิ่ม",
                NODE_LOCKED: "ซ่อมจุดก่อนหน้าให้เสร็จก่อน",
                DISTRICT_LOCKED: "ซ่อมเขตก่อนหน้าให้ครบเพื่อเปิดเส้นทาง"
              }[result.reason] || "จุดนี้ยังซ่อมไม่ได้");
          uiVersion.value += 1;
        } finally {
          cityBusy.value = false;
        }
      };

      const hallController = new HallController({
        leaderboard, store, screen, hallSceneReady, hallSceneFailed,
        hallDataLoading, hallDataError, hallBoards, selectedHallBoardKey,
        leaderboardEntries, leaderboardCommit, nextTick: VueRef.nextTick
      });
      const openHall = () => hallController.open();
      const loadHallBoard = () => hallController.loadSelected();

      const onHallSceneLoad = () => {
        hallSceneReady.value = true;
        hallSceneFailed.value = false;
      };

      const onHallSceneError = () => {
        hallSceneReady.value = false;
        hallSceneFailed.value = true;
      };

      const toggleAR = async () => {
        if (ar.busy) return;
        if (ar.enabled) {
          arController.stop();
          ar.enabled = false;
          ar.visible = false;
          ar.handDetected = false;
          ar.progress = 0;
          ar.status = "AR ปิดแล้ว ใช้เมาส์หรือแตะจอเล่นต่อได้";
          return;
        }
        const video = document.getElementById("ar-video");
        const shouldResumeTimer = store.started && Boolean(timer);
        if (shouldResumeTimer) {
          clearInterval(timer);
          timer = null;
        }
        ar.busy = true;
        await arController.start(video);
        // Camera availability is not the same as finger detection.
        // The pointer event will make this visible only after a real finger is found.
        ar.visible = false;
        ar.tracking = false;
        ar.handDetected = false;
        ar.x = 0.5;
        ar.y = 0.52;
        ar.progress = 0;
        ar.progressLabel = "หา มือ";
        ar.selections = 0;
        ar.lastSelection = "";
        ar.busy = false;
        if (shouldResumeTimer && store.started && !timer) {
          timer = setInterval(() => store.tick(), 1000);
        }
      };

      const toggleARMirror = () => {
        ar.mirrorInput = !ar.mirrorInput;
        config.ar.mirrorInput = ar.mirrorInput;
        arController.setMirrorInput(ar.mirrorInput);
        ar.status = ar.mirrorInput
          ? "AR สลับซ้าย-ขวาแล้ว: ถ้าชี้ซ้ายแล้ว pointer ไปซ้าย แปลว่าถูก"
          : "AR ใช้พิกัดตรง: ถ้าชี้ซ้ายแล้ว pointer ไปซ้าย แปลว่าถูก";
      };

      const syncAudio = () => {
        audio.sync();
      };

      wireStoreEvents(store, screen, bridge, arController, audio, uiVersion, timerRef(() => timer, (value) => {
        timer = value;
      }), sessionTimeouts, { progressStore, rewardService, cityProgress, leaderboard, leaderboardEntries, leaderboardCommit, heartPulse, config });
      wireAREvents(arController, bridge, ar);
      wireBridgeEvents(bridge, ar);

      VueRef.onMounted(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("autostart") === "1") startGame(false);
      });

      VueRef.watch(currentBgPath, () => {
        if (screen.value !== "play") return;
        playSceneReady.value = false;
        playSceneFailed.value = false;
      });

      VueRef.onBeforeUnmount(() => {
        clearInterval(timer);
        clearSessionTimeouts();
        arController.stop();
        bridge.destroy();
        audio.stopMusic();
      });

      return {
        config,
        Math,
        ar,
        store,
        screen,
        settingsOpen,
        privacyOpen,
        deleteConfirm,
        playerName,
        progressStore,
        leaderboardEntries,
        hallBoards,
        selectedHallBoardKey,
        hallDataLoading,
        hallDataError,
        hallSceneReady,
        hallSceneFailed,
        playSceneReady,
        playSceneFailed,
        gameStarting,
        heartPulse,
        cityBusy,
        cityMessage,
        currentDistrictLabel,
        currentBgPath,
        starsValue,
        secondsValue,
        comboValue,
        repairedValue,
        inventoryValue,
        restorationStage,
        cityDistricts,
        currentRestorationNodes,
        teamPortraits,
        tableMinValue,
        tableMaxValue,
        heartsText,
        sessionProgress,
        missionTitle,
        missionHint,
        learningPhaseLabel,
        miniGroups,
        resultTitle,
        accuracyText,
        resultMessage,
        recipeText,
        canRepairNode,
        hallPodiumStyle,
        hallBoardLabel,
        hallBoardOptionLabel,
        arPointerStyle,
        arPointerClass,
        arGuideTitle,
        arGuideHint,
        arChecks,
        arVideoClass,
        startGame,
        onPlaySceneLoad,
        onPlaySceneError,
        endGame,
        openSettings,
        eraseLocalData,
        openCity,
        selectCityDistrict,
        repairCityNode,
        openHall,
        loadHallBoard,
        onHallSceneLoad,
        onHallSceneError,
        toggleAR,
        toggleARMirror,
        syncAudio
      };
    }
  });
  vueApp.use(pinia);
  vueApp.mount("#app");
}

function computedWithVersion(uiVersion, getter) {
  return VueRef.computed(() => {
    uiVersion.value;
    return getter();
  });
}

function preloadImage(path, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timeout = window.setTimeout(() => reject(new Error(`IMAGE_PRELOAD_TIMEOUT:${path}`)), timeoutMs);
    const settle = (callback) => {
      window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      callback();
    };
    image.onload = () => settle(resolve);
    image.onerror = () => settle(() => reject(new Error(`IMAGE_PRELOAD_FAILED:${path}`)));
    image.src = path;
    if (image.complete && image.naturalWidth > 0) settle(resolve);
  });
}

function normalizeSettings(store, config) {
  if (store.settings.tableMin > store.settings.tableMax) {
    const oldMin = store.settings.tableMin;
    store.settings.tableMin = store.settings.tableMax;
    store.settings.tableMax = oldMin;
  }
  store.settings.tableMin = PhaserRef.Math.Clamp(store.settings.tableMin, config.tables.min, config.tables.max);
  store.settings.tableMax = PhaserRef.Math.Clamp(store.settings.tableMax, config.tables.min, config.tables.max);
  store.settings.seconds = PhaserRef.Math.Clamp(
    store.settings.seconds,
    config.session.minSeconds,
    config.session.maxSeconds
  );
  store.settings.mode = store.settings.mode === "practice" ? "practice" : "challenge";
  store.settings.arAnswerDwellMs = PhaserRef.Math.Clamp(
    Number(store.settings.arAnswerDwellMs) || config.ar.answerDwellMs,
    config.ar.answerDwellMinMs,
    config.ar.answerDwellMaxMs
  );
}

function timerRef(get, set) {
  return { get, set };
}

function wireStoreEvents(store, screen, bridge, arController, audio, uiVersion, timer, sessionTimeouts, progression) {
  const scheduleSessionTimeout = (callback, delay, generation) => {
    const timeout = window.setTimeout(() => {
      sessionTimeouts.delete(timeout);
      if (generation !== store.runtimeGeneration) return;
      callback();
    }, delay);
    sessionTimeouts.add(timeout);
  };

  store.on("runtime:update", () => {
    uiVersion.value += 1;
  });

  store.on("round:new", () => {
    uiVersion.value += 1;
  });

  store.on("answer:correct", (event) => {
    audio.correct();
    void (async () => {
      const detail = event.detail;
      const context = {
        ...detail,
        sessionId: store.sessionId,
        roundIndex: store.roundIndex,
        combo: store.combo,
        totalAnswers: store.totalAnswers,
        correctAnswers: store.correctAnswers
      };
      await progression.rewardService.handleCorrect(context);
      await progression.progressStore.recordMastery(detail.learningKey, detail.mastery);
      uiVersion.value += 1;
    })();
  });
  store.on("answer:wrong", () => {
    audio.wrong();
    progression.heartPulse.value = false;
    window.requestAnimationFrame(() => { progression.heartPulse.value = true; });
    scheduleSessionTimeout(() => { progression.heartPulse.value = false; }, 620, store.runtimeGeneration);
  });
  store.on("answer:wrong", (event) => {
    void progression.progressStore.recordMastery(event.detail.learningKey, event.detail.mastery);
  });
  store.on("progress:milestone", () => {
    const generation = store.runtimeGeneration;
    scheduleSessionTimeout(() => {
      if (store.started && store.milestoneActive) audio.milestone();
    }, store.config.progression?.announcementLeadMs || 600, generation);
  });

  store.on("game:finish", (event) => {
    uiVersion.value += 1;
    sessionTimeouts.forEach((timeout) => window.clearTimeout(timeout));
    sessionTimeouts.clear();
    clearInterval(timer.get());
    timer.set(null);
    arController.stop();
    audio.stopMusic();
    progression.leaderboardCommit.current = progression.leaderboardCommit.current.catch(() => null).then(async () => {
      const submitted = await progression.leaderboard.submit(
        event.detail.result,
        progression.progressStore.player,
        event.detail.settings
      );
      if (submitted) {
        await progression.progressStore.recordSession(
          { ...event.detail.result, score: submitted.score },
          progression.leaderboard.buildBoardKey(event.detail.settings)
        );
      }
      progression.leaderboardEntries.value = await progression.leaderboard.getTop(event.detail.settings, 10);
    }).catch((error) => {
      console.error("Leaderboard commit failed", error);
      return null;
    });
    const generation = store.runtimeGeneration;
    scheduleSessionTimeout(() => {
      bridge.destroy();
      screen.value = "result";
    }, 0, generation);
  });
}

function wireAREvents(arController, bridge, ar) {
  arController.on("status", (event) => {
    ar.status = event.detail.text;
    ar.enabled = arController.enabled;
    ar.busy = arController.busy;
  });

  arController.on("error", (event) => {
    ar.status = event.detail.text;
    ar.enabled = false;
    ar.busy = false;
  });

  arController.on("pointer", (event) => {
    const pointer = event.detail;
    ar.enabled = arController.enabled;
    ar.handDetected = Boolean(pointer.handDetected);
    if (!pointer.tracking) {
      ar.visible = false;
      ar.tracking = false;
      ar.progress = 0;
      ar.progressLabel = "";
      ar.parked = false;
      bridge.setARPointer({ visible: false, x: ar.x, y: ar.y });
      return;
    }

    if (ar.parked) {
      const remainsOverChoice = ar.answerTargets.some((target) => (
        Math.hypot(
          (pointer.x - target.ncx) / target.nrx,
          (pointer.y - target.ncy) / target.nry
        ) <= 1
      ));
      if (Date.now() < ar.parkUntil || remainsOverChoice) {
        ar.visible = true;
        ar.tracking = true;
        bridge.setARPointer({ visible: true, x: ar.x, y: ar.y });
        return;
      }
      ar.parked = false;
      ar.progressLabel = "";
    }

    ar.visible = true;
    ar.tracking = Boolean(pointer.tracking);
    const deltaX = pointer.x - ar.x;
    const deltaY = pointer.y - ar.y;
    const movement = Math.hypot(deltaX, deltaY);
    const alpha = Math.min(0.92, Math.max(0.54, 0.5 + movement * 2.6));
    ar.x += deltaX * alpha;
    ar.y += deltaY * alpha;
    ar.progressLabel = ar.tracking ? ar.progressLabel : "หา มือ";
    bridge.setARPointer({ visible: ar.tracking, x: ar.x, y: ar.y });
  });
}

function wireBridgeEvents(bridge, ar) {
  bridge.on("scene:targets", (event) => {
    ar.answerTargets = event.detail;
  });

  bridge.on("ar:pointer-park", (event) => {
    if (!ar.enabled) return;
    ar.parked = true;
    ar.parkUntil = Date.now() + (event.detail.durationMs || 700);
    ar.x = event.detail.x;
    ar.y = event.detail.y;
    ar.progress = 0;
    ar.progressLabel = event.detail.label || "พัก";
    if (event.detail.status) ar.status = event.detail.status;
    bridge.setARPointer({ visible: ar.visible, x: ar.x, y: ar.y });
  });

  bridge.on("ar:progress", (event) => {
    ar.progress = event.detail.progress;
    ar.progressLabel = event.detail.label;
    if (event.detail.status) ar.status = event.detail.status;
  });

  bridge.on("ar:selection", (event) => {
    ar.selections += 1;
    ar.lastSelection = event.detail.label || String(event.detail.value ?? "");
  });
}

bootstrap().catch((error) => {
  console.error(error);
  document.body.innerHTML = `<pre style="color:white;padding:24px">Game initialization failed: ${error.message}</pre>`;
});

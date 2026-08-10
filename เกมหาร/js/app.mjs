import { SoundEngine } from './audio/SoundEngine.mjs?v=drop-split-sfx-v2';
import { BasketGroup } from './components/BasketGroup.mjs';
import { CloudLayer } from './components/CloudLayer.mjs';
import { FestivalBunting } from './components/FestivalBunting.mjs?v=festival-bunting-v19';
import { FruitPiece } from './components/FruitPiece.mjs?v=polish-anim-v1';
import { HallOfFameDialog } from './components/HallOfFameDialog.mjs';
import { MonsterSprite, SPRITE_FRAMES } from './components/MonsterSprite.mjs';
import { HandoffDialog } from './components/HandoffDialog.mjs';
import { OrchardMap } from './components/OrchardMap.mjs';
import { PhaserStage } from './components/PhaserStage.mjs';
import { PauseDialog } from './components/PauseDialog.mjs';
import { PlayerProfileDialog } from './components/PlayerProfileDialog.mjs';
import { SelfCheckCard } from './components/SelfCheckCard.mjs';
import { SessionSummaryDialog } from './components/SessionSummaryDialog.mjs';
import { SettingsDialog } from './components/SettingsDialog.mjs';
import { StoryDialog } from './components/StoryDialog.mjs';
import { fruitBundles } from './core/FruitBundles.mjs?v=uniform-10-5-groups-v1';
import { GameController } from './core/GameController.mjs';
import { icon } from './core/IconLanguage.mjs';
import { SessionDirector } from './core/SessionDirector.mjs';
import { transferFruitIds } from './input/DragTransfer.mjs';
import { fruitIdsInsideSelection, resetSelectionBox, updateSelectionBoxFromPointer } from './input/SelectionBox.mjs';
import { LocalPlayerProfileRepository } from './repositories/LocalPlayerProfileRepository.mjs';
import { LocalProgressRepository } from './repositories/LocalProgressRepository.mjs';
import { useShellStore } from './stores/useShellStore.mjs';
const { computed, createApp, onBeforeUnmount, onMounted, reactive, ref, watch } = Vue;
const { createRouter, createWebHashHistory, RouterView, useRoute } = VueRouter;
const { createPinia } = Pinia; const SETTINGS_KEY = 'sharing-orchard.settings.v1';

const ShotStrip = {
  props: ['cinematic', 'reducedSensory'],
  emits: ['skip', 'reflect'],
  computed: {
    shot() {
      return this.cinematic?.shot ?? null;
    },
    progressText() {
      if (!this.shot || !this.cinematic?.shotCount) return '';
      return `${this.cinematic.shotIndex + 1}/${this.cinematic.shotCount}`;
    },
  },
  template: `
    <aside v-if="shot" class="shot-strip" :class="{ 'reduced-motion': reducedSensory }" :data-shot-id="shot.id" aria-label="ลำดับฉากปัจจุบัน">
      <div>
        <p class="eyebrow">{{ cinematic.sceneTitle }} · ช็อต {{ progressText }}</p>
        <strong>{{ shot.label }}</strong>
        <p>{{ shot.copy }}</p>
      </div>
      <button v-if="cinematic.skipAllowed && shot.id !== 'reflection'" class="secondary-button compact" type="button" @click="$emit('skip')">ข้ามช็อต</button>
      <button v-if="shot.id === 'reward-bloom'" class="secondary-button compact" type="button" @click="$emit('reflect')">ดูช็อตสรุป</button>
    </aside>
  `,
};

const GuidePanel = {
  components: { MonsterSprite },
  props: ['state', 'avatarSrc', 'spriteSrc', 'frameIndex', 'expectedShare'],
  computed: {
    message() {
      if (this.state.phase === 'feedbackCorrect') return `เท่ากันทุกตะกร้า! แต่ละตะกร้ามี ${this.expectedShare} ผล ลองคูณกลับดูนะ`;
      if (this.state.phase === 'feedbackWrong') return 'ใกล้แล้ว ลองดูเลขบนตะกร้าทีละใบ — เท่ากันหรือยัง?';
      if (this.state.phase === 'remediation') return 'เราแบ่งทีละรอบได้: ให้ตะกร้าละ 1 ผล แล้ววนใหม่';
      if (this.state.remediationEnabled) return 'กด “ช่วยแบ่งทีละรอบ” เพื่อดูวิธีแบ่งอย่างยุติธรรม';
      return 'ลาก หรือแตะแอปเปิ้ล แล้วแตะตะกร้า เป้าหมายคือทุกตะกร้าได้เท่ากัน';
    },
  },
  template: `
    <aside class="guide-panel" :class="'phase-' + state.phase">
      <MonsterSprite class="guide-avatar" :src="spriteSrc" :fallback-src="avatarSrc" label="ทีโบ" :frame-index="frameIndex" aria-hidden="true" />
      <div><strong>ทีโบ</strong><p>{{ message }}</p></div>
    </aside>
  `,
};

async function bootstrap() {
  const response = await fetch('./config/game.config.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('โหลด config ไม่สำเร็จ');
  const config = await response.json();

  const PlayView = {
    components: { BasketGroup, CloudLayer, FestivalBunting, FruitPiece, GuidePanel, HallOfFameDialog, HandoffDialog, MonsterSprite, OrchardMap, PauseDialog, PhaserStage, PlayerProfileDialog, SelfCheckCard, SessionSummaryDialog, SettingsDialog, ShotStrip, StoryDialog },
    setup() {
      const profileRepository = new LocalPlayerProfileRepository();
      const repository = new LocalProgressRepository(globalThis.localStorage, profileRepository);
      const controller = new GameController(config, repository);
      const route = useRoute();
      const shell = useShellStore();
      const state = reactive(controller.store.snapshot());
      const storedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null') ?? {};
      const defaults = config.settingsDefaults;
      const settings = reactive({
        playerName: profileRepository.activeProfile().displayName ?? storedSettings.playerName ?? defaults.playerName,
        gradeLevel: storedSettings.gradeLevel ?? defaults.gradeLevel,
        soundOn: storedSettings.soundOn ?? defaults.soundOn,
        musicOn: storedSettings.musicOn ?? defaults.musicOn,
        sfxVolume: storedSettings.sfxVolume ?? storedSettings.volume ?? defaults.sfxVolume ?? defaults.volume,
        musicVolume: storedSettings.musicVolume ?? storedSettings.volume ?? defaults.musicVolume ?? defaults.volume,
        reducedSensory: storedSettings.reducedSensory ?? defaults.reducedSensory,
        largeText: storedSettings.largeText ?? defaults.largeText,
        highContrast: storedSettings.highContrast ?? defaults.highContrast,
        showStoryShots: storedSettings.showStoryShots ?? defaults.showStoryShots,
        showEquation: storedSettings.showEquation ?? config.practiceProfiles?.[storedSettings.gradeLevel ?? defaults.gradeLevel]?.showEquationDefault ?? defaults.showEquation,
        selectedFactDivisors: storedSettings.selectedFactDivisors ?? defaults.selectedFactDivisors, allowRemainderMode: storedSettings.allowRemainderMode ?? defaults.allowRemainderMode, classroomTurnSeconds: storedSettings.classroomTurnSeconds ?? defaults.classroomTurnSeconds,
      });
      const sound = new SoundEngine(settings);
      const settingsOpen = computed({ get: () => shell.settingsOpen, set: (value) => { shell.settingsOpen = value; } });
      const hallOpen = ref(false), profileOpen = ref(false), storyOpen = ref(false), collectionOpen = ref(false);
      const playerProfiles = ref(profileRepository.read()), activeProfile = ref(profileRepository.activeProfile()), profileDraftName = ref(activeProfile.value.displayName);
      const handoffOpen = computed({ get: () => shell.handoffOpen, set: (value) => { shell.handoffOpen = value; } });
      const session = new SessionDirector({ durationSeconds: settings.classroomTurnSeconds });
      const sessionState = reactive(session.snapshot());
      const sessionUnsubscribe = session.subscribe((next) => Object.assign(sessionState, next));
      const pauseOpen = ref(false), summaryOpen = ref(false);
      const progress = ref(repository.read());
      const pointerFruitId = ref(null), pointerFruitIds = ref([]);
      const pointerStart = ref(null), dragSettling = ref(false);
      const splitFlashIds = ref([]), dropFlashIds = ref([]);
      let splitFlashTimer = null, dropFlashTimer = null;
      let dragSettleTimer = null;
      let lastAudioPhase = null;
      let lastSessionRoundId = null;
      const settingsTab = ref('player');
      const selectionBox = reactive({ active: false, left: 0, top: 0, width: 0, height: 0 });
      const selectionStart = ref(null);
      const sourcePileRef = ref(null);
      const itemAssets = config.assets.items, characterAvatars = config.assets.characterAvatars;
      const characterSpritesheets = config.assets.characterSpritesheets ?? {};

      const replaceState = (snapshot) => {
        // Perf: keep reactive keys alive instead of delete+re-add. Deleting every
        // key invalidated the whole component graph on each move, which showed up
        // as ~200ms of Vue flush per fruit placement on large rounds.
        Object.assign(state, snapshot);
        controller.store.state.settings = { playerId: activeProfile.value.playerId, playerName: settings.playerName };
        controller.setPracticeSettings({ gradeLevel: settings.gradeLevel, selectedDivisors: settings.selectedFactDivisors, allowRemainder: settings.allowRemainderMode });
        if (`${state.generationId}:${state.phase}` !== lastAudioPhase) { if (state.phase === 'feedbackCorrect') sound.cue('correct'); if (state.phase === 'feedbackWrong') sound.cue('wrong'); if (state.phase === 'completed') sound.cue('unlock'); lastAudioPhase = `${state.generationId}:${state.phase}`; }
        if (state.phase === 'completed') {
          progress.value = repository.read();
          if (state.lastReward && lastSessionRoundId !== state.generationId) {
            lastSessionRoundId = state.generationId;
            session.recordRound({ score: state.lastReward.score, stars: state.lastReward.stars });
          }
        }
        sound.setAmbient(state.phase !== 'booting' && settings.musicOn);
      };
      const unsubscribe = controller.subscribe(replaceState);

      const sourceFruits = computed(() => state.fruits.filter((fruit) => fruit.ownerId === 'source'));
      const fruitsFor = (basketId) => state.fruits.filter((fruit) => fruit.ownerId === basketId);
      const locked = computed(() => ['evaluating', 'feedbackCorrect', 'feedbackWrong', 'completed'].includes(state.phase));
      const selectedFruitIds = computed(() => state.selectedFruitIds ?? (state.selectedFruitId ? [state.selectedFruitId] : []));
      const hasMovedFruit = computed(() => sourceFruits.value.length < state.dividend);
      const feedbackIcon = computed(() => state.phase === 'feedbackCorrect' ? icon('check').glyph : icon('feedbackWrong').glyph);
      const attemptsText = computed(() => state.attempts ? `ตรวจแล้ว ${state.attempts} ครั้ง` : 'ยังไม่ตรวจคำตอบ');
      const activeChapter = computed(() => config.progression.chapters.find((chapter) => chapter.id === state.activeChapterId) ?? config.progression.chapters[0]);
      const nextUnlockedChapter = computed(() => {
        const completed = new Set(progress.value.completedChapterIds ?? []);
        return config.progression.chapters.find((chapter, index, chapters) => !completed.has(chapter.id) && (index === 0 || completed.has(chapters[index - 1].id))) ?? null;
      });

      const scenario = computed(() => state.scenario ?? config.scenarios[state.scenarioId] ?? config.scenarios[config.missions[config.defaults.missionId].scenarioIds[0]]);
      const expectedShare = computed(() => Math.floor((state.dividend || scenario.value.dividend) / (state.divisor || scenario.value.divisor)));
      const previewAppleCount = computed(() => Math.min(3, state.divisor || scenario.value.divisor));
      const baskets = computed(() => Array.from({ length: state.divisor || scenario.value.divisor }, (_, index) => {
        const characterId = scenario.value.recipientCharacterIds?.[index];
        return {
          id: `basket-${index + 1}`,
          label: scenario.value.recipientNames?.[index] ?? `มอนเมล็ด ${index + 1}`,
          characterId,
          avatarSrc: characterAvatars[characterId],
        };
      }));

      function frameForRole({ role, count = 0 }) {
        if (state.phase === 'orienting') return role === 'host' ? SPRITE_FRAMES.greet : SPRITE_FRAMES.guide;
        if (state.phase === 'feedbackCorrect' || state.phase === 'completed') return role === 'recipient' ? SPRITE_FRAMES.celebrateA : SPRITE_FRAMES.celebrateB;
        if (state.phase === 'feedbackWrong') return role === 'recipient' && count !== expectedShare.value ? SPRITE_FRAMES.noticeUnequal : SPRITE_FRAMES.guide;
        if (state.phase === 'remediation') return role === 'guide' ? SPRITE_FRAMES.guide : SPRITE_FRAMES.encourageRetry;
        if (role === 'guide') return state.remediationEnabled ? SPRITE_FRAMES.guide : SPRITE_FRAMES.pointGoal;
        return count > 0 ? SPRITE_FRAMES.count : SPRITE_FRAMES.idle;
      }

      const hostFrame = computed(() => frameForRole({ role: 'host' }));
      const guideFrame = computed(() => frameForRole({ role: 'guide' }));
      const animatedBaskets = computed(() => baskets.value.map((basket) => {
        const count = fruitsFor(basket.id).length;
        return {
          ...basket,
          spriteSrc: characterSpritesheets[basket.characterId],
          frameIndex: frameForRole({ role: 'recipient', count }),
        };
      }));
      const basketCounts = computed(() => baskets.value.map((basket) => fruitsFor(basket.id).length).join(','));
      const anyBasketHasFruit = computed(() => baskets.value.some((basket) => fruitsFor(basket.id).length > 0));
      watch(anyBasketHasFruit, (back, previous) => {
        if (back !== previous && state.phase === 'manipulating') sound.cue('flow');
      });
      const expectedRemainder = computed(() => (state.dividend || scenario.value.dividend) % (state.divisor || scenario.value.divisor));
      const basketCountValues = computed(() => baskets.value.map((basket) => fruitsFor(basket.id).length));
      const selfCheck = computed(() => {
        const counts = basketCountValues.value;
        const everyBasketReady = counts.length > 0 && counts.every((count) => count === expectedShare.value);
        return {
          everyBasketReady,
          sourceReady: sourceFruits.value.length === expectedRemainder.value,
          countText: counts.length ? counts.join(' · ') : 'ยังไม่มีตะกร้า',
        };
      });
      const inverseSentence = computed(() => `${state.divisor || scenario.value.divisor} × ${expectedShare.value} + ${expectedRemainder.value} = ${state.dividend || scenario.value.dividend}`);
      const roundScore = computed(() => (state.phase === 'completed' ? state.lastReward?.score ?? null : null));
      const roundRank = computed(() => (state.phase === 'completed' ? state.lastReward?.rank ?? null : null));
      const madeTopTen = computed(() => state.phase === 'completed' && state.lastReward?.inTopTen === true);
      const displayedRoundScore = ref(null);
      let scoreCountTimer = null;
      watch([roundScore, () => settings.reducedSensory], ([score, reduced]) => {
        window.clearTimeout(scoreCountTimer);
        scoreCountTimer = null;
        if (score === null) { displayedRoundScore.value = null; return; }
        // Motion safety: reduced sensory (in-game) and prefers-reduced-motion
        // (OS) both skip the count-up and show the final score immediately.
        if (reduced || window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
          displayedRoundScore.value = score;
          return;
        }
        displayedRoundScore.value = 0;
        const started = performance.now();
        const duration = 900;
        const step = () => {
          const progress = Math.min(1, (performance.now() - started) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          displayedRoundScore.value = Math.round(score * eased);
          if (progress < 1) scoreCountTimer = window.setTimeout(step, 16);
        };
        step();
      });
      const remainderMeaning = computed(() => expectedRemainder.value === 0 ? 'ไม่มีเศษ เพราะแจกครบทุกผลพอดี' : `เศษ ${expectedRemainder.value} ผลยังอยู่กองกลาง เพราะไม่พอแจกให้ครบ ${state.divisor || scenario.value.divisor} ตะกร้าอีก 1 รอบ`);

      const sceneTitle = computed(() => {
        if (state.phase === 'completed') return 'ลานเทศกาลเริ่มผลิบาน';
        if (state.phase === 'remediation') return 'ทีโบเปิดทางแบ่งทีละรอบ';
        if (state.phase === 'feedbackWrong') return 'ลานสวนกำลังตรวจความเท่ากัน';
        return 'ลานแบ่งปันยามเช้า';
      });
      const collectionItems = computed(() => (itemAssets.collectionRewards ?? []).map((item) => ({ ...item, unlocked: Boolean(progress.value.collection?.[item.id]), note: item.meaning, effect: item.story })));
      const timerText = computed(() => {
        const minutes = Math.floor(sessionState.remainingSeconds / 60);
        const seconds = String(sessionState.remainingSeconds % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
      });
      watch(() => sessionState.ended, (ended) => {
        if (ended) { pauseOpen.value = false; summaryOpen.value = true; sound.cue('unlock'); }
      });
      watch([handoffOpen, pauseOpen], ([handoff, paused]) => {
        if (handoff || paused) session.pause();
        else session.resume();
      });
      function togglePause() {
        if (sessionState.ended) return;
        if (pauseOpen.value) { pauseOpen.value = false; session.resume(); } else { session.pause(); pauseOpen.value = true; }
      }
      function restartSession() { session.restart(); summaryOpen.value = false; dispatch({ type: 'REPLAY' }); }
      function closeSessionSummary() { summaryOpen.value = false; }

      function persistSettings() {
        activeProfile.value = profileRepository.updateActiveDisplayName(settings.playerName);
        playerProfiles.value = profileRepository.read();
        profileDraftName.value = activeProfile.value.displayName;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        controller.store.state.settings = { playerId: activeProfile.value.playerId, playerName: activeProfile.value.displayName };
        controller.setPracticeSettings({ gradeLevel: settings.gradeLevel, selectedDivisors: settings.selectedFactDivisors, allowRemainder: settings.allowRemainderMode });
        sound.setAmbient(state.phase !== 'booting');
      }

      function changeGrade() {
        const profile = config.practiceProfiles?.[settings.gradeLevel];
        if (typeof profile?.showEquationDefault === 'boolean') settings.showEquation = profile.showEquationDefault;
        persistSettings();
        dispatch({ type: 'REPLAY' });
      }

      function resetTurnSeconds() {
        session.setDuration(settings.classroomTurnSeconds);
        session.restart();
        summaryOpen.value = false;
        persistSettings();
      }

      function clearLocalProgress() {
        repository.clear();
        progress.value = repository.read();
      }

      function refreshActiveProfile() {
        playerProfiles.value = profileRepository.read();
        activeProfile.value = profileRepository.activeProfile();
        settings.playerName = activeProfile.value.displayName;
        profileDraftName.value = activeProfile.value.displayName;
        progress.value = repository.read();
        controller.store.state.settings = { playerId: activeProfile.value.playerId, playerName: activeProfile.value.displayName };
      }

      function selectPlayerProfile(playerId) { profileRepository.selectProfile(playerId); refreshActiveProfile(); dispatch({ type: 'REPLAY' }); }
      function createPlayerProfile() { profileRepository.createProfile(profileDraftName.value); refreshActiveProfile(); dispatch({ type: 'REPLAY' }); }
      function renameActiveProfile() { activeProfile.value = profileRepository.updateActiveDisplayName(profileDraftName.value); refreshActiveProfile(); persistSettings(); }

      function completeHandoff() {
        handoffOpen.value = false;
        session.restart();
        dispatch({ type: 'REPLAY' });
      }

      function continueNextRound() {
        const next = nextUnlockedChapter.value;
        dispatch(next && next.id !== state.activeChapterId ? { type: 'SELECT_CHAPTER', chapterId: next.id } : { type: 'REPLAY' });
        window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: settings.reducedSensory ? 'auto' : 'smooth' }));
      }
      function replayCurrentRound() { dispatch({ type: 'REPLAY' }); sound.cue('replay'); window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: settings.reducedSensory ? 'auto' : 'smooth' })); }
      function selectChapter(chapterId) { if (state.phase === 'completed' || !locked.value) dispatch({ type: 'SELECT_CHAPTER', chapterId }); }
      function dispatch(intent) {
        const result = controller.dispatch(intent);
        if (intent.type === 'START_ROUND') window.requestAnimationFrame(() => document.querySelector('.playfield')?.scrollIntoView({ block: 'start', behavior: settings.reducedSensory ? 'auto' : 'smooth' }));
        if (result && intent.type === 'START_ROUND') sound.cue('start');
        if (result && intent.type === 'REQUEST_HINT') sound.cue('hint');
        if (result && ['REPLAY', 'SELECT_CHAPTER'].includes(intent.type)) sound.cue('replay');
        return result;
      }

      function pickFruitBundle(fruitIds, event) {
        window.clearTimeout(dragSettleTimer); dragSettling.value = false; if (!locked.value && fruitIds?.length) dispatch({ type: 'SELECT_FRUITS', fruitIds, append: Boolean(event?.ctrlKey || event?.metaKey) });
      }
      function fruitAssetFor(fruit) { return itemAssets.fruits?.[fruit.objectType]?.src ?? itemAssets.apple; }
      function fruitLabelFor(fruit) { return itemAssets.fruits?.[fruit.objectType]?.label ?? 'ผลไม้'; }

      function placeFruit(fruitIds, basketId) {
        // A no-op placement (e.g. the click after a pointer-up placement, when
        // selection was already cleared) must not overwrite the drop flash.
        const ids = (Array.isArray(fruitIds) ? fruitIds : [fruitIds]).filter((id) => id != null);
        if (!ids.length || locked.value) return;
        dispatch({ type: 'PLACE_FRUITS', fruitIds: ids, basketId });
        if (basketId !== 'source') {
          // Flash the landed fruits so the basket re-renders with a drop-in bounce,
          // and thud the impact to match the drop animation.
          dropFlashIds.value = ids;
          window.clearTimeout(dropFlashTimer);
          dropFlashTimer = window.setTimeout(() => { dropFlashIds.value = []; }, 800);
          sound.cue('drop');
        } else {
          sound.cue('place');
        }
      }

      function splitBundle(fruitIds) {
        const ids = (Array.isArray(fruitIds) ? fruitIds : [fruitIds]).filter((id) => id != null);
        if (!ids.length || locked.value) return;
        // Flash the split tokens so the newly created bundles burst out of the
        // original one, and pop as they separate (only on a real split).
        splitFlashIds.value = ids;
        window.clearTimeout(splitFlashTimer);
        splitFlashTimer = window.setTimeout(() => { splitFlashIds.value = []; }, 720);
        if (dispatch({ type: 'SPLIT_FRUITS', fruitIds: ids })) sound.cue('split');
      }

      function placeSelectedFruits(basketId) { if (!dragSettling.value) placeFruit(selectedFruitIds.value, basketId); }
      function clearSelection() { dispatch({ type: 'CLEAR_SELECTION' }); }
      function beginFruitDrag() { dragSettling.value = true; window.clearTimeout(dragSettleTimer); }
      function finishFruitDrag() { window.clearTimeout(dragSettleTimer); dragSettleTimer = window.setTimeout(() => { clearSelection(); dragSettling.value = false; }, 320); }
      function returnFruit(fruitIds) {
        const ids = Array.isArray(fruitIds) ? fruitIds : [fruitIds];
        if (ids.length && !locked.value && dispatch({ type: 'PLACE_FRUITS', fruitIds: ids, basketId: 'source' })) sound.cue('return');
      }
      function returnDrop(event) {
        const fruitId = event.dataTransfer.getData('text/plain');
        const ids = selectedFruitIds.value.includes(fruitId) ? selectedFruitIds.value : transferFruitIds(event.dataTransfer);
        returnFruit(ids);
      }
      function returnSelectedToSource(event) { if (!dragSettling.value && !event.target.closest?.('.fruit') && selectedFruitIds.value.some((id) => state.fruits.find((fruit) => fruit.id === id)?.ownerId !== 'source')) returnFruit(selectedFruitIds.value); }
      function beginPointerFruit(fruitIds, event) {
        if (event.ctrlKey || event.metaKey) return;
        if (locked.value) return;
        pointerFruitIds.value = fruitIds; pointerFruitId.value = fruitIds[0]; pointerStart.value = { x: event.clientX, y: event.clientY };
        if (!fruitIds.every((fruitId) => selectedFruitIds.value.includes(fruitId))) pickFruitBundle(fruitIds);
        if (event.currentTarget.setPointerCapture) event.currentTarget.setPointerCapture(event.pointerId);
      }
      function beginSelectionBox(event) {
        if (locked.value || event.target.closest?.('.fruit')) return;
        const bounds = sourcePileRef.value?.getBoundingClientRect();
        if (!bounds) return;
        selectionStart.value = { x: event.clientX, y: event.clientY, bounds };
        Object.assign(selectionBox, { active: true, left: event.clientX - bounds.left, top: event.clientY - bounds.top, width: 0, height: 0 });
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }
      function updateSelectionBox(event) {
        if (selectionBox.active && selectionStart.value) updateSelectionBoxFromPointer(selectionBox, selectionStart.value, event);
      }

      function finishSelectionBox(event) {
        if (!selectionBox.active || !selectionStart.value) return;
        updateSelectionBox(event);
        const bounds = selectionStart.value.bounds;
        const selectedIds = fruitIdsInsideSelection(sourcePileRef.value, bounds, selectionBox);
        if (selectedIds.length) dispatch({ type: 'SELECT_FRUITS', fruitIds: selectedIds, append: Boolean(event.ctrlKey || event.metaKey) });
        resetSelectionBox(selectionBox); selectionStart.value = null;
      }
      function finishPointer(event) {
        if (selectionBox.active) { finishSelectionBox(event); return; }
        if (dragSettling.value) { pointerFruitId.value = null; pointerFruitIds.value = []; pointerStart.value = null; return; }
        if (!pointerFruitId.value) return;
        const moved = pointerStart.value && Math.hypot(event.clientX - pointerStart.value.x, event.clientY - pointerStart.value.y) > 8;
        if (!moved) { pointerFruitId.value = null; pointerFruitIds.value = []; pointerStart.value = null; return; }
        const target = document.elementFromPoint(event.clientX, event.clientY);
        const basket = target?.closest?.('[data-basket-id]');
        const source = target?.closest?.('[data-source-pile]');
        const ids = selectedFruitIds.value.includes(pointerFruitId.value) ? selectedFruitIds.value : pointerFruitIds.value;
        if (basket) placeFruit(ids, basket.dataset.basketId);
        else if (source) returnFruit(ids);
        pointerFruitId.value = null; pointerFruitIds.value = []; pointerStart.value = null;
      }

      function submit() { if (dispatch({ type: 'SUBMIT' })) sound.cue('submit'); }
      function guidedMove() { dispatch({ type: 'GUIDED_MOVE' }); sound.cue('guided'); }

      onMounted(() => {
        window.addEventListener('pointerup', finishPointer);
        shell.syncRoute(route);
        controller.setPracticeSettings({ gradeLevel: settings.gradeLevel, selectedDivisors: settings.selectedFactDivisors, allowRemainder: settings.allowRemainderMode });
        controller.createDefaultRound();
        persistSettings();
        session.start();
        window.__ORCHARD_DEBUG__ = { controller, sound, session, getState: () => controller.store.snapshot() };
      });

      onBeforeUnmount(() => {
        window.removeEventListener('pointerup', finishPointer);
        sessionUnsubscribe();
        session.dispose();
        window.clearTimeout(dragSettleTimer);
        window.clearTimeout(splitFlashTimer);
        window.clearTimeout(dropFlashTimer);
        window.clearTimeout(scoreCountTimer);
        unsubscribe();
        controller.dispose();
        sound.dispose();
        delete window.__ORCHARD_DEBUG__;
      });

      return {
        attemptsText, anyBasketHasFruit, basketCounts, baskets: animatedBaskets, config, dispatch, feedbackIcon, fruitsFor, guidedMove,
        activeProfile, characterAvatars, characterSpritesheets, changeGrade, clearLocalProgress, collectionItems, collectionOpen, createPlayerProfile, guideFrame, hostFrame, itemAssets,
        activeChapter, closeSessionSummary, completeHandoff, continueNextRound, displayedRoundScore, fruitAssetFor, fruitLabelFor, replayCurrentRound, hallOpen, handoffOpen, madeTopTen, pauseOpen, persistSettings, playerProfiles, profileDraftName, profileOpen, progress, renameActiveProfile, resetTurnSeconds, restartSession, roundRank, roundScore, sceneTitle, selectChapter, selectPlayerProfile, sessionState, settings, settingsOpen, settingsTab, summaryOpen, timerText, togglePause,
        fruitBundles, hasMovedFruit, locked, pickFruitBundle, placeFruit, placeSelectedFruits, beginFruitDrag, finishFruitDrag, returnDrop, returnSelectedToSource, beginPointerFruit, beginSelectionBox, updateSelectionBox,
        finishSelectionBox, scenario, selectedFruitIds, selectionBox, sourcePileRef, expectedShare, expectedRemainder, inverseSentence, previewAppleCount, remainderMeaning, selfCheck, sourceFruits, state, submit,
        storyOpen, splitBundle, splitFlashIds, dropFlashIds,
      };
    },
    template: `
      <main class="game-shell" :class="{ 'garden-complete': state.phase === 'completed', 'garden-celebrate': state.phase === 'feedbackCorrect' || state.phase === 'completed', 'garden-reflect': state.phase === 'feedbackWrong' || state.phase === 'remediation', 'large-text': settings.largeText, 'high-contrast': settings.highContrast, 'reduced-sensory': settings.reducedSensory }">
        <CloudLayer v-if="!settings.reducedSensory" :src="itemAssets.cloudSpritesheet" />
        <div v-if="state.phase === 'feedbackCorrect' || state.phase === 'completed'" class="victory-sky" aria-hidden="true"><span class="firework firework-1"></span><span class="firework firework-2"></span><span class="firework firework-3"></span></div>
        <FestivalBunting :lit-count="sessionState.completedRounds" :total="8" />
        <header class="topbar">
          <div class="brand"><span aria-hidden="true">{{ icon('brand').glyph }}</span><div><small>ลานแบ่งปัน</small><h1>สวนผลไม้แบ่งปัน</h1></div></div>
          <div class="mission-chip"><span aria-hidden="true">{{ icon('mission').glyph }}</span> {{ activeChapter.title }}</div>
          <button class="icon-button" type="button" aria-label="เปิดเรื่องราวของเกม" @click="storyOpen = true"><span aria-hidden="true">{{ icon('story').glyph }}</span> เรื่องราว</button>
          <button class="icon-button" type="button" :aria-label="'เลือกผู้เล่น ' + activeProfile.displayName" @click="profileOpen = true"><span aria-hidden="true">{{ icon('profile').glyph }}</span> {{ activeProfile.displayName }}</button>
          <button class="icon-button" type="button" aria-label="เปิด 10 อันดับในเครื่องนี้" @click="hallOpen = true">
            <span aria-hidden="true">{{ icon('rank').glyph }}</span> อันดับ
          </button>
          <button class="icon-button" type="button" aria-label="เปิดตั้งค่าเกม" @click="settingsOpen = true">
            <span aria-hidden="true">{{ icon('settings').glyph }}</span> ตั้งค่า
          </button>
        </header>

        <section v-if="state.phase === 'orienting'" class="orient-card">
          <div class="character-stage" aria-hidden="true">
            <MonsterSprite
              class="host-monster"
              :src="characterSpritesheets[scenario.hostCharacterId]"
              :fallback-src="characterAvatars[scenario.hostCharacterId]"
              label="นารา"
              :frame-index="hostFrame"
            />
            <span class="apple-crate"><img v-for="index in previewAppleCount" :key="index" :src="itemAssets.apple" alt=""></span>
            <MonsterSprite
              class="guide-monster"
              :src="characterSpritesheets[scenario.guideCharacterId]"
              :fallback-src="characterAvatars[scenario.guideCharacterId]"
              label="ทีโบ"
              :frame-index="guideFrame"
            />
          </div>
          <p class="eyebrow">{{ activeChapter.title }}</p>
          <h2>ช่วยแบ่งแอปเปิ้ล {{ state.dividend || scenario.dividend }} ผล<br>ให้มอนเมล็ด {{ state.divisor || scenario.divisor }} ตัวเท่า ๆ กัน</h2>
          <p>ทุกตะกร้าต้องได้รับส่วนแบ่งที่ยุติธรรม</p>
          <div class="quest-loop" aria-label="เป้าหมายและวงจรการเล่น">
            <div><span>1</span><strong>ช่วยนารา</strong><small>เตรียมเทศกาลในสวน</small></div>
            <div><span>2</span><strong>แบ่งให้เท่ากัน</strong><small>ลากผลไม้จนทุกตะกร้ายุติธรรม</small></div>
            <div><span>3</span><strong>ฟื้นฟูเส้นทาง</strong><small>ผ่านแล้วเปิดโจทย์ถัดไป</small></div>
          </div>
          <div v-if="settings.showEquation" class="equation-preview"><strong>{{ state.dividend || scenario.dividend }}</strong><span>÷</span><strong>{{ state.divisor || scenario.divisor }}</strong><span>=</span><strong>?</strong></div>
          <button id="start-round" class="primary-button" type="button" @click="dispatch({ type: 'START_ROUND' })"><span aria-hidden="true">{{ icon('start').glyph }}</span> เริ่มแบ่งปัน</button>
          <ShotStrip v-if="settings.showStoryShots && state.phase !== 'manipulating'" :cinematic="state.cinematic" :reduced-sensory="settings.reducedSensory" @skip="dispatch({ type: 'SKIP_SHOT' })" @reflect="dispatch({ type: 'REFLECTION_SHOT' })" />

          <OrchardMap :chapters="config.progression.chapters" :progress="progress" :active-chapter-id="state.activeChapterId" :completed="false" @select-chapter="selectChapter" />
        </section>

        <template v-else>
          <ShotStrip v-if="settings.showStoryShots" :cinematic="state.cinematic" :reduced-sensory="settings.reducedSensory" @skip="dispatch({ type: 'SKIP_SHOT' })" @reflect="dispatch({ type: 'REFLECTION_SHOT' })" />

          <section v-if="state.phase !== 'completed'" class="mission-board" aria-labelledby="mission-title">
            <div><p class="eyebrow">{{ activeChapter.title }} · ภารกิจสวน</p><h2 id="mission-title">แบ่งให้ยุติธรรมเพื่อเปิดเส้นทางถัดไป</h2></div>
            <div v-if="settings.showEquation" class="equation" :aria-label="state.dividend + ' หาร ' + state.divisor + ' เท่ากับเท่าไร'"><b>{{ state.dividend }}</b><span>÷</span><b>{{ state.divisor }}</b><span>=</span><b>?</b></div>
            <div class="mission-stats" aria-label="สถานะภารกิจ">
              <span><img :src="itemAssets[icon('gardenHeart').srcKey]" alt=""> {{ state.resources.gardenHearts }}</span>
              <span><img :src="itemAssets[icon('dewDrop').srcKey]" alt=""> {{ state.resources.dewDrops }}</span>
              <span>{{ timerText }}</span>
            </div>
            <div class="guide-bubble">
              <MonsterSprite class="guide-avatar mini" :src="characterSpritesheets[scenario.guideCharacterId]" :fallback-src="characterAvatars[scenario.guideCharacterId]" label="ทีโบ" :frame-index="guideFrame" aria-hidden="true" />
              <p>ใส่ให้ครบตะกร้าละ <strong>{{ expectedShare }}</strong> ผล</p>
            </div>
            <div class="status-pill"><span aria-hidden="true">{{ icon('statusPending').glyph }}</span> {{ attemptsText }}</div>
          </section>

          <GuidePanel
            v-if="state.phase !== 'completed' && state.phase !== 'manipulating'"
            :state="state"
            :avatar-src="characterAvatars[scenario.guideCharacterId]"
            :sprite-src="characterSpritesheets[scenario.guideCharacterId]"
            :frame-index="guideFrame"
            :expected-share="expectedShare"
          />

          <section v-if="state.phase !== 'completed' && state.phase !== 'manipulating'" class="resource-bar" aria-label="สถานะภารกิจและทรัพยากร">
            <strong>{{ sceneTitle }}</strong>
            <span><img :src="itemAssets[icon('gardenHeart').srcKey]" alt=""> {{ icon('gardenHeart').label }} {{ state.resources.gardenHearts }}</span>
            <span><img :src="itemAssets[icon('dewDrop').srcKey]" alt=""> {{ icon('dewDrop').label }} {{ state.resources.dewDrops }}</span>
            <span>เวลารอบนี้ {{ timerText }}</span>
            <button class="secondary-button compact" type="button" @click="handoffOpen = true"><span aria-hidden="true">{{ icon('handoff').glyph }}</span> ส่งต่อผู้เล่น</button>
          </section>

          <OrchardMap v-if="state.phase !== 'completed' && state.phase !== 'manipulating'" :chapters="config.progression.chapters" :progress="progress" :active-chapter-id="state.activeChapterId" :completed="false" :compact="true" @select-chapter="selectChapter" />

          <PhaserStage v-if="state.phase !== 'completed'" :apple-src="itemAssets.apple" :character-src="characterSpritesheets[scenario.guideCharacterId]" :reduced-sensory="settings.reducedSensory" :phase="state.phase" :source-count="sourceFruits.length" :basket-counts="basketCounts" />

          <section v-if="state.phase !== 'completed'" class="playfield" :class="{ 'many-recipients': baskets.length > 12 }" :aria-busy="locked">
            <section class="source-zone" aria-label="กองแอปเปิ้ลส่วนกลาง" @click="returnSelectedToSource">
              <div class="source-heading"><div><p class="eyebrow">กองกลาง</p><h2>แอปเปิ้ลที่ยังไม่แบ่ง</h2></div><div class="source-count"><b>{{ sourceFruits.length }}</b><span>ผล</span></div></div>
              <div
                ref="sourcePileRef"
                class="fruit-pile"
                data-source-pile="true"
                :class="{ empty: sourceFruits.length === 0, 'pile-active': state.phase === 'manipulating', 'selecting': selectionBox.active }"
                @pointerdown="beginSelectionBox"
                @pointermove="updateSelectionBox"
                @pointerup="finishSelectionBox"
                @dragover.prevent
                @drop.prevent="returnDrop"
              >
                <span
                  v-if="selectionBox.active"
                  class="selection-marquee"
                  :style="{ left: selectionBox.left + 'px', top: selectionBox.top + 'px', width: selectionBox.width + 'px', height: selectionBox.height + 'px' }"
                  aria-hidden="true"
                ></span>
                <FruitPiece
                  v-for="fruit in fruitBundles(sourceFruits, state.expandedFruitIds, state.fiveUnitFruitIds)"
                  :key="fruit.id"
                  :fruit="fruit"
                  :selected="fruit.ids.some((id) => selectedFruitIds.includes(id) || state.selectedFruitId === id)"
                  :transfer-ids="selectedFruitIds"
                  :timing="config.feedbackTimings.placeMs"
                  :asset-src="fruitAssetFor(fruit)"
                  :label="fruitLabelFor(fruit)"
                  :split-ids="splitFlashIds"
                  @pick-bundle="pickFruitBundle"
                  @pointer-bundle="beginPointerFruit"
                  @split-bundle="splitBundle"
                  @drag-begin="beginFruitDrag"
                  @drag-complete="finishFruitDrag"
                />
                <p v-if="sourceFruits.length === 0" class="empty-message"><span aria-hidden="true">{{ icon('check').glyph }}</span> แบ่งครบทุกผลแล้ว</p>
              </div>
              <p class="interaction-hint"><span aria-hidden="true">{{ icon('guided').glyph }}</span> เลือกผลไม้ แล้วพาไปยังตะกร้าของเพื่อนมอนสเตอร์</p>
            </section>

            <div v-if="baskets.length <= 4" class="flow-arrow" :class="{ back: anyBasketHasFruit }" :key="anyBasketHasFruit ? 'back' : 'forward'" aria-hidden="true">{{ anyBasketHasFruit ? icon('back').glyph : icon('next').glyph }}</div>

            <section class="recipient-area" :class="{ 'wide-recipients': baskets.length >= 5, 'many-recipients': baskets.length > 12 }" aria-label="ตะกร้าของมอนเมล็ดเมฆ">
              <h3 class="recipient-heading">ตะกร้าของเพื่อนมอนสเตอร์</h3>
              <BasketGroup v-for="basket in baskets" :key="basket.id" :basket="basket" :fruits="fruitsFor(basket.id)" :selected-fruit-id="state.selectedFruitId" :selected-fruit-ids="selectedFruitIds" :expanded-fruit-ids="state.expandedFruitIds" :five-unit-fruit-ids="state.fiveUnitFruitIds" :timing="config.feedbackTimings.placeMs" :locked="locked" :assets="itemAssets" :target-share="expectedShare" :split-ids="splitFlashIds" :drop-ids="dropFlashIds" @place="placeFruit" @place-selected="placeSelectedFruits" @pick-bundle="pickFruitBundle" @pointer-bundle="beginPointerFruit" @split-bundle="splitBundle" @drag-begin="beginFruitDrag" @drag-complete="finishFruitDrag" />
            </section>
          </section>

          <SelfCheckCard v-if="state.phase === 'manipulating' && hasMovedFruit" :expected-share="expectedShare" :expected-remainder="expectedRemainder" :self-check="selfCheck" />

          <section v-if="state.phase === 'feedbackCorrect' || state.phase === 'feedbackWrong'" class="feedback-banner" :class="state.phase" role="status">
            <span class="feedback-icon" aria-hidden="true">{{ feedbackIcon }}</span>
            <div><h2>{{ state.phase === 'feedbackCorrect' ? 'แบ่งเท่ากันแล้ว!' : 'ยังไม่เท่ากัน ลองอีกนิด' }}</h2><p>{{ state.phase === 'feedbackCorrect' ? 'ทุกตะกร้ามี ' + expectedShare + ' ผล; สูตรคูณย้อนกลับคือ ' + inverseSentence : 'ดูจำนวนบนตะกร้าทั้งหมด แล้วปรับให้เท่ากันก่อนตรวจอีกครั้ง' }}</p></div>
          </section>

          <section v-if="state.phase === 'remediation'" class="remediation-card" role="dialog" aria-modal="true" aria-labelledby="remediation-title">
            <span aria-hidden="true">{{ icon('remediation').glyph }}</span><div><h2 id="remediation-title">มาลองแบ่งทีละรอบ</h2><p>ให้มอนเมล็ดแต่ละตัวคนละ 1 ผล แล้วเริ่มรอบใหม่ จนแอปเปิ้ลหมด</p></div>
            <button class="primary-button compact" type="button" @click="dispatch({ type: 'ACKNOWLEDGE_SCAFFOLD' })">เข้าใจแล้ว ลองต่อ</button>
          </section>

          <section v-if="state.phase === 'completed'" class="completion-card" role="status">
            <div class="bloom" aria-hidden="true">🌼 🌸 🌼</div>
            <p class="eyebrow">งานเลี้ยงพร้อมแล้ว!</p><h2 v-if="settings.showEquation">{{ state.dividend }} ÷ {{ state.divisor }} = {{ expectedShare }} เศษ {{ expectedRemainder }}</h2><h2 v-else>ตะกร้าละ {{ expectedShare }} ผล</h2>
            <div class="reflection-card"><strong>คิดย้อนกลับด้วยสูตรคูณ</strong><p>{{ inverseSentence }} จึงแปลว่า {{ state.dividend }} ÷ {{ state.divisor }} = {{ expectedShare }} เศษ {{ expectedRemainder }}</p><small>{{ remainderMeaning }}</small></div>
            <div class="stars" :aria-label="state.reward.stars + ' ดาว'">{{ '★'.repeat(state.reward.stars) }}{{ '☆'.repeat(3 - state.reward.stars) }}</div>
            <div v-if="roundScore !== null" class="round-score" :aria-label="'คะแนนรอบนี้ ' + roundScore + (madeTopTen ? ' ติด 10 อันดับผู้ดูแลยอดเยี่ยม อันดับที่ ' + roundRank : '')">
              <span class="score-plate-label"><span aria-hidden="true">{{ icon('star').glyph }}</span> คะแนนรอบนี้</span>
              <b class="score-plate-value">{{ displayedRoundScore ?? roundScore }}</b>
              <span v-if="madeTopTen" class="hof-badge"><span aria-hidden="true">{{ icon('hofBadge').glyph }}</span> สวนบันทึกคุณแล้ว · อันดับที่ {{ roundRank }}</span>
            </div>
            <div class="reward-items" aria-label="รางวัลจากการแบ่งเท่ากันสำเร็จ">
              <figure class="reward-pop"><img :src="itemAssets[icon('seedBadge').srcKey]" alt=""><figcaption>{{ icon('seedBadge').label }}</figcaption></figure>
              <figure class="reward-pop delay"><img :src="itemAssets[icon('festivalGift').srcKey]" alt=""><figcaption>{{ icon('festivalGift').label }}</figcaption></figure>
            </div>
            <div class="completion-next">
              <strong>เส้นทางสวนฟื้นขึ้นอีกก้าว</strong>
              <p>คุณช่วยนาราแบ่งผลไม้อย่างยุติธรรมแล้ว สมุดสะสมคือหลักฐานความเข้าใจที่เปิดดูได้ทุกครั้งหลังฟื้นฟูสวน</p>
            </div>
            <div class="completion-actions">
              <button id="next-round" class="primary-button compact hero-cta" type="button" @click="continueNextRound"><span aria-hidden="true">{{ icon('next').glyph }}</span> ไปโจทย์ถัดไป</button>
              <button id="open-collection" class="secondary-button compact" type="button" @click="collectionOpen = true"><span aria-hidden="true">{{ icon('collection').glyph }}</span> เปิดสมุดสะสม</button>
              <button id="replay-round" class="secondary-button compact" type="button" @click="replayCurrentRound"><span aria-hidden="true">{{ icon('replay').glyph }}</span> ฝึกโจทย์ใหม่อีกข้อ</button>
              <button class="secondary-button compact" type="button" @click="handoffOpen = true"><span aria-hidden="true">{{ icon('handoff').glyph }}</span> ส่งต่อผู้เล่น</button>
            </div>
          </section>

          <OrchardMap v-if="state.phase === 'completed'" :chapters="config.progression.chapters" :progress="progress" :active-chapter-id="state.activeChapterId" :completed="true" next-action-label="ไปโจทย์ถัดไป" @continue="continueNextRound" @select-chapter="selectChapter" />


          <footer v-if="state.phase !== 'completed'" class="actionbar">
            <button class="secondary-button" type="button" :disabled="sessionState.ended" @click="togglePause"><span aria-hidden="true">{{ icon('pause').glyph }}</span> พัก</button>
            <button class="secondary-button" type="button" :disabled="locked" @click="dispatch({ type: 'RESET' })"><span aria-hidden="true">{{ icon('restart').glyph }}</span> เริ่มแบ่งใหม่</button>
            <button v-if="state.remediationEnabled" id="guided-move" class="hint-button" type="button" :disabled="locked || sourceFruits.length === 0" @click="guidedMove"><span aria-hidden="true">{{ icon('guided').glyph }}</span> ช่วยแบ่งทีละรอบ</button>
            <button v-else class="hint-button" type="button" :disabled="locked || state.resources.dewDrops === 0" @click="dispatch({ type: 'REQUEST_HINT' })"><span aria-hidden="true">{{ icon('hint').glyph }}</span> ขอคำใบ้</button>
            <button id="submit-answer" class="primary-button" type="button" :disabled="locked || !hasMovedFruit" @click="submit"><span aria-hidden="true">{{ icon('check').glyph }}</span> ตรวจคำตอบ</button>
          </footer>
        </template>

        <SettingsDialog
          v-if="settingsOpen"
          :settings="settings"
          :config="config"
          :tab="settingsTab"
          @update:tab="settingsTab = $event"
          @close="settingsOpen = false"
          @persist="persistSettings"
          @change-grade="changeGrade"
          @reset-turn-seconds="resetTurnSeconds"
          @clear-progress="clearLocalProgress"
        />
        <HallOfFameDialog v-if="hallOpen" :entries="progress.hallOfFame" @close="hallOpen = false" />
        <PlayerProfileDialog v-if="profileOpen" :profiles="playerProfiles.profiles" :active-profile="activeProfile" v-model:draft-name="profileDraftName" @select="selectPlayerProfile" @create="createPlayerProfile" @rename="renameActiveProfile" @close="profileOpen = false" />
        <StoryDialog v-if="storyOpen" :assets="config.assets" @close="storyOpen = false" />
        <Teleport to="body"><div v-if="collectionOpen" class="settings-modal collection-modal" role="dialog" aria-modal="true" aria-labelledby="collection-modal-title">
          <section class="collection-panel"><div class="settings-header">
              <div class="collection-title"><span aria-hidden="true">{{ icon('collection').glyph }}</span><div><p class="eyebrow">หลักฐานความเข้าใจ</p><h2 id="collection-modal-title">สมุดสะสมจากการฟื้นฟูสวน</h2></div></div>
              <button class="icon-button" type="button" aria-label="ปิดสมุดสะสม" @click="collectionOpen = false">×</button>
            </div>
            <div class="collection-scroll"><div class="collection-grid">
                <figure v-for="item in collectionItems" :key="item.id" :class="{ locked: !item.unlocked }">
                  <img :src="item.src" alt="">
                  <figcaption><strong>{{ item.unlocked ? item.label : 'ยังไม่ปลดล็อก' }}</strong>
                    <small>{{ item.unlocked ? item.note : 'ผ่านภารกิจแบ่งเท่ากันเพื่อเปิดช่องนี้' }}</small>
                    <em>{{ item.unlocked ? item.effect : 'รอการฟื้นฟู' }}</em>
                  </figcaption>
                </figure>
              </div></div>
          </section>
        </div></Teleport>
        <PauseDialog v-if="pauseOpen" :timer-text="timerText" :sprite-src="characterSpritesheets[scenario.guideCharacterId]" :avatar-src="characterAvatars[scenario.guideCharacterId]" @resume="togglePause" />
        <SessionSummaryDialog v-if="summaryOpen" :stats="sessionState" :sprite-src="characterSpritesheets[scenario.hostCharacterId]" :avatar-src="characterAvatars[scenario.hostCharacterId]" @restart="restartSession" @close="closeSessionSummary" />
        <HandoffDialog v-if="handoffOpen" :timer-text="timerText" :resources="state.resources" :assets="itemAssets" @close="handoffOpen = false" @complete="completeHandoff" />
      </main>
    `,
  };

  const router = createRouter({
    history: createWebHashHistory(),
    routes: [{ path: '/', name: 'play', component: PlayView }],
  });
  const app = createApp({ components: { RouterView }, template: '<RouterView />' });
  app.config.globalProperties.icon = icon;
  app.use(createPinia()); app.use(router);
  await router.isReady();
  app.mount('#app');
}

bootstrap().catch((error) => {
  document.querySelector('#app').innerHTML = `<main class="error-shell"><span aria-hidden="true">${icon('error').glyph}</span><h1>เปิดสวนไม่ได้</h1><p>${error.message}</p><p>ลองรีเฟรชหน้าอีกครั้ง</p></main>`;
});

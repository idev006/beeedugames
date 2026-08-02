export class HallController {
  constructor(options) {
    Object.assign(this, options);
    this.entriesByBoard = {};
  }

  async open() {
    // A Hall visit is a fresh server session. Clear the previous visit before
    // requesting one new snapshot; board changes after this stay client-side.
    this.entriesByBoard = {};
    this.hallBoards.value = [];
    this.leaderboardEntries.value = [];
    this.selectedHallBoardKey.value = "";
    this.hallSceneReady.value = false;
    this.hallSceneFailed.value = false;
    this.hallDataLoading.value = true;
    this.hallDataError.value = "";
    this.screen.value = "hall";
    await this.nextTick();
    try {
      await this.leaderboardCommit.current;
      const snapshot = await this.leaderboard.getServerHallSnapshot();
      this.hallBoards.value = snapshot.boards;
      this.entriesByBoard = snapshot.entriesByBoard;
      const currentBoardKey = this.leaderboard.buildBoardKey(this.store.settings);
      this.selectedHallBoardKey.value = this.hallBoards.value.some((board) => board.boardKey === currentBoardKey)
        ? currentBoardKey
        : (this.hallBoards.value[0]?.boardKey || currentBoardKey);
      this.loadSelected();
    } catch (error) {
      this.showError("Leaderboard read failed", error);
    } finally {
      this.hallDataLoading.value = false;
    }
  }

  loadSelected() {
    if (!this.selectedHallBoardKey.value) return;
    this.hallDataError.value = "";
    this.leaderboardEntries.value = [...(this.entriesByBoard[this.selectedHallBoardKey.value] || [])];
  }

  showError(context, error) {
    this.leaderboardEntries.value = [];
    this.hallDataError.value = "เชื่อมต่ออันดับบน server ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
    console.error(context, error);
  }
}

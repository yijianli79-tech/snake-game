(function () {
  const logic = window.SnakeLogic;
  const boardEl = document.getElementById("board");
  const scoreEl = document.getElementById("score");
  const statusEl = document.getElementById("status");
  const restartBtn = document.getElementById("restart-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const controls = document.querySelectorAll("[data-dir]");

  const TICK_MS = 140;
  let state = logic.createInitialState({ gridSize: 20 });
  const cells = [];

  function cellIndex(x, y) {
    return y * state.gridSize + x;
  }

  function statusText() {
    if (state.status === "game-over") return "Game Over";
    if (state.status === "paused") return "Paused";
    if (state.status === "won") return "You Win";
    return "Running";
  }

  function paintBoard() {
    for (const cell of cells) {
      cell.className = "cell";
    }

    for (const part of state.snake) {
      const idx = cellIndex(part.x, part.y);
      if (cells[idx]) {
        cells[idx].classList.add("snake");
      }
    }

    if (state.food) {
      const idx = cellIndex(state.food.x, state.food.y);
      if (cells[idx]) {
        cells[idx].classList.add("food");
      }
    }
  }

  function render() {
    scoreEl.textContent = String(state.score);
    statusEl.textContent = statusText();
    pauseBtn.textContent = state.status === "paused" ? "Resume" : "Pause";
    paintBoard();
  }

  function initializeBoard() {
    const totalCells = state.gridSize * state.gridSize;
    boardEl.innerHTML = "";
    boardEl.style.gridTemplateColumns = `repeat(${state.gridSize}, minmax(0, 1fr))`;
    for (let i = 0; i < totalCells; i += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cells.push(cell);
      boardEl.appendChild(cell);
    }
  }

  function queueDirection(direction) {
    state = logic.setDirection(state, direction);
    render();
  }

  function handleKey(event) {
    const key = event.key.toLowerCase();
    if (key === "arrowup" || key === "w") queueDirection("up");
    if (key === "arrowdown" || key === "s") queueDirection("down");
    if (key === "arrowleft" || key === "a") queueDirection("left");
    if (key === "arrowright" || key === "d") queueDirection("right");
    if (key === " " || key === "p") {
      event.preventDefault();
      state = logic.togglePause(state);
      render();
    }
  }

  document.addEventListener("keydown", handleKey);

  controls.forEach((button) => {
    button.addEventListener("click", () => {
      queueDirection(button.dataset.dir);
    });
  });

  pauseBtn.addEventListener("click", () => {
    state = logic.togglePause(state);
    render();
  });

  restartBtn.addEventListener("click", () => {
    state = logic.restartState(state);
    render();
  });

  initializeBoard();
  render();

  setInterval(() => {
    state = logic.advanceState(state);
    render();
  }, TICK_MS);
})();

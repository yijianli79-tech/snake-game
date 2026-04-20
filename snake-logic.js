(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.SnakeLogic = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const OPPOSITE = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };

  function keyOf(cell) {
    return `${cell.x},${cell.y}`;
  }

  function isInside(cell, gridSize) {
    return cell.x >= 0 && cell.y >= 0 && cell.x < gridSize && cell.y < gridSize;
  }

  function nextHead(head, direction) {
    const delta = DIRECTIONS[direction];
    return { x: head.x + delta.x, y: head.y + delta.y };
  }

  function isOpposite(nextDirection, currentDirection) {
    return OPPOSITE[nextDirection] === currentDirection;
  }

  function canApplyDirection(nextDirection, currentDirection) {
    return !!DIRECTIONS[nextDirection] && nextDirection !== currentDirection && !isOpposite(nextDirection, currentDirection);
  }

  function spawnFood(snake, gridSize, rng) {
    const occupied = new Set(snake.map(keyOf));
    const empty = [];
    for (let y = 0; y < gridSize; y += 1) {
      for (let x = 0; x < gridSize; x += 1) {
        const candidate = { x, y };
        if (!occupied.has(keyOf(candidate))) {
          empty.push(candidate);
        }
      }
    }

    if (empty.length === 0) {
      return null;
    }

    const idx = Math.floor(rng() * empty.length);
    return empty[idx];
  }

  function createInitialState(options) {
    const gridSize = (options && options.gridSize) || 20;
    const rng = (options && options.rng) || Math.random;
    const mid = Math.floor(gridSize / 2);
    const snake = [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];

    return {
      gridSize,
      snake,
      direction: "right",
      queuedDirection: null,
      food: spawnFood(snake, gridSize, rng),
      score: 0,
      status: "running",
    };
  }

  function setDirection(state, nextDirection) {
    if (state.status !== "running") {
      return state;
    }

    if (!canApplyDirection(nextDirection, state.direction)) {
      return state;
    }

    return { ...state, queuedDirection: nextDirection };
  }

  function togglePause(state) {
    if (state.status === "game-over" || state.status === "won") {
      return state;
    }

    return {
      ...state,
      status: state.status === "paused" ? "running" : "paused",
    };
  }

  function advanceState(state, options) {
    if (state.status !== "running") {
      return state;
    }

    const rng = (options && options.rng) || Math.random;
    const direction = state.queuedDirection || state.direction;
    const head = state.snake[0];
    const candidateHead = nextHead(head, direction);

    if (!isInside(candidateHead, state.gridSize)) {
      return {
        ...state,
        direction,
        queuedDirection: null,
        status: "game-over",
      };
    }

    const willGrow = !!state.food && candidateHead.x === state.food.x && candidateHead.y === state.food.y;
    const bodyToCheck = willGrow ? state.snake : state.snake.slice(0, -1);
    const bodySet = new Set(bodyToCheck.map(keyOf));

    if (bodySet.has(keyOf(candidateHead))) {
      return {
        ...state,
        direction,
        queuedDirection: null,
        status: "game-over",
      };
    }

    const snake = [candidateHead, ...state.snake];
    if (!willGrow) {
      snake.pop();
    }

    let food = state.food;
    let score = state.score;
    let status = state.status;

    if (willGrow) {
      score += 1;
      food = spawnFood(snake, state.gridSize, rng);
      if (!food) {
        status = "won";
      }
    }

    return {
      ...state,
      snake,
      direction,
      queuedDirection: null,
      food,
      score,
      status,
    };
  }

  function restartState(state, options) {
    const rng = (options && options.rng) || Math.random;
    return createInitialState({ gridSize: state.gridSize, rng });
  }

  return {
    DIRECTIONS,
    createInitialState,
    setDirection,
    advanceState,
    restartState,
    spawnFood,
    togglePause,
  };
});

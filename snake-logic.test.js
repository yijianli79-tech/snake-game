const test = require("node:test");
const assert = require("node:assert/strict");
const logic = require("./snake-logic.js");

test("moves one step in current direction", () => {
  const state = {
    gridSize: 6,
    snake: [{ x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 }],
    direction: "right",
    queuedDirection: null,
    food: { x: 5, y: 5 },
    score: 0,
    status: "running",
  };

  const next = logic.advanceState(state, { rng: () => 0 });
  assert.deepEqual(next.snake, [{ x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }]);
  assert.equal(next.status, "running");
});

test("ignores direct opposite direction", () => {
  const state = {
    gridSize: 6,
    snake: [{ x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 }],
    direction: "right",
    queuedDirection: null,
    food: { x: 5, y: 5 },
    score: 0,
    status: "running",
  };

  const queued = logic.setDirection(state, "left");
  assert.equal(queued.queuedDirection, null);
});

test("grows and increments score when food is eaten", () => {
  const state = {
    gridSize: 6,
    snake: [{ x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 }],
    direction: "right",
    queuedDirection: null,
    food: { x: 3, y: 2 },
    score: 0,
    status: "running",
  };

  const next = logic.advanceState(state, { rng: () => 0 });
  assert.equal(next.snake.length, 4);
  assert.equal(next.score, 1);
  assert.notDeepEqual(next.food, { x: 3, y: 2 });
});

test("collides with boundary and ends game", () => {
  const state = {
    gridSize: 4,
    snake: [{ x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }],
    direction: "right",
    queuedDirection: null,
    food: { x: 0, y: 0 },
    score: 0,
    status: "running",
  };

  const next = logic.advanceState(state, { rng: () => 0 });
  assert.equal(next.status, "game-over");
});

test("collides with self and ends game", () => {
  const state = {
    gridSize: 6,
    snake: [
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ],
    direction: "down",
    queuedDirection: null,
    food: { x: 5, y: 5 },
    score: 0,
    status: "running",
  };

  const next = logic.advanceState(state, { rng: () => 0 });
  assert.equal(next.status, "game-over");
});

test("spawnFood never returns occupied cell and is deterministic with rng", () => {
  const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
  const food = logic.spawnFood(snake, 3, () => 0);
  assert.deepEqual(food, { x: 2, y: 0 });
});

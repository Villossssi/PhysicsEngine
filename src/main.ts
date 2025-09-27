// =============================================================
//  Simulatore 2D in HTML5 Canvas - Versione TypeScript
//  • Canvas retina-aware (dpr)
//  • Loop con accumulator (timestep fisso per fisica)
//  • Funzioni di fisica/gioco lasciate intenzionalmente VUOTE
//  • Boilerplate input & resize
// =============================================================

import { GameObject } from "./GameObject";
import Ball from "./GameObjects/Ball";
import Node2D from "./Node2D";
import { RigidBody2D } from "./RigidBody2D";
import { IShapeCollisionInfo } from "./Shapes/Shape";
import ElasticCollision from "./Utils/ElasticCollision";
import gjkCollision from "./Utils/GJKCollision";

// ---------- TYPES ----------
interface MouseState {
  pos: Vec2;
  down: boolean;
}

interface AppState {
  width: number;
  height: number;
  time: number;
  frame: number;
  running: boolean;
  mouse: MouseState;
  keys: Set<string>;
}

// ---------- UTIL ----------
const clamp = (v: number, a: number, b: number): number =>
  Math.max(a, Math.min(b, v));

export class Vec2 {
  constructor(public x: number = 0, public y: number = 0) {}

  set(x: number, y: number): Vec2 {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v: Vec2): Vec2 {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  add(v: Vec2): Vec2 {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vec2): Vec2 {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mul(s: number): Vec2 {
    this.x *= s;
    this.y *= s;
    return this;
  }

  len(): number {
    return Math.hypot(this.x, this.y);
  }

  norm(): Vec2 {
    const l = this.len() || 1;
    this.x /= l;
    this.y /= l;
    return this;
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  distance(other: Vec2): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// ---------- CANVAS & STATO ----------
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

export const state: AppState = {
  width: 0,
  height: 0,
  time: 0,
  frame: 0,
  running: true,
  mouse: { pos: new Vec2(), down: false },
  keys: new Set<string>(),
};

function resize(): void {
  state.width = Math.floor(window.innerWidth);
  state.height = Math.floor(window.innerHeight);
  canvas.width = Math.floor(state.width * dpr);
  canvas.height = Math.floor(state.height * dpr);
  canvas.style.width = state.width + "px";
  canvas.style.height = state.height + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  onResize(); // hook utente (opzionale)
}

// ---------- INPUT ----------
canvas.addEventListener("mousemove", (e: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  state.mouse.pos.set(e.clientX - rect.left, e.clientY - rect.top);
  onMouseMove(state.mouse.pos);
});

canvas.addEventListener("mousedown", (e: MouseEvent) => {
  state.mouse.down = true;
  onMouseDown(state.mouse.pos, e);
});

window.addEventListener("mouseup", (e: MouseEvent) => {
  state.mouse.down = false;
  onMouseUp(state.mouse.pos, e);
});

window.addEventListener("keydown", (e: KeyboardEvent) => {
  state.keys.add(e.key);
  onKeyDown(e.key, e);
});

window.addEventListener("keyup", (e: KeyboardEvent) => {
  state.keys.delete(e.key);
  onKeyUp(e.key, e);
});

// ---------- SCENA / DATI ----------
class World {
  gravity: Vec2;
  damping: number;
  _private_objects: { [uuid: string]: Node2D };
  gridSize: number;
  friction: number;

  constructor() {
    this.gravity = new Vec2(0, 980); // px/s^2
    this.damping = 0.999;
    this._private_objects = {};
    this.gridSize = 200;
    this.friction = 0.15;
  }
  get objects() {
    return Object.values(this._private_objects);
  }

  addObj(obj: Node2D) {
    this._private_objects[obj.uuid] = obj;
  }
  cleanWorldObj() {
    this._private_objects = {};
  }
}

export const world = new World();

// ---------- GRID ----------
function getCellId(x: number, y: number) {
  return `${Math.floor(x / world.gridSize)},${Math.floor(y / world.gridSize)}`;
}

let grid: { [key: string]: Node2D[] } = {}; // { "0,0": [obj1, obj2], ... }

// ---------- HOOKS VUOTI (DA COMPLETARE) ----------
// In questi hook inserirai la tua logica.
function initScene(): void {
  world.cleanWorldObj();
  // Spawnare 100 palline con posizioni e velocità casuali
  const ballRadius = 16;
  const numBalls = 100;
  const spawnedBalls: Ball[] = [];

  for (let i = 0; i < numBalls; i++) {
    let position: Vec2,
      attempts = 0;
    const maxAttempts = 50;

    // Trova una posizione valida senza sovrapposizioni
    do {
      position = new Vec2(
        Math.random() * (state.width - ballRadius * 2) + ballRadius,
        Math.random() * (state.height - ballRadius * 2) + ballRadius
      );
      attempts++;
    } while (
      attempts < maxAttempts &&
      spawnedBalls.some(
        (ball) => position.distance(ball.pos) < ballRadius * 2 + 5 // 5px di margine extra
      )
    );

    // Velocità casuale
    const velocity = new Vec2(
      (Math.random() - 0.5) * 600, // velocità X tra -300 e 300
      (Math.random() - 0.5) * 600 // velocità Y tra -300 e 300
    );

    const ball = new Ball(position, velocity, ballRadius);
    spawnedBalls.push(ball);
    world.addObj(ball);
  }
}

function applyForces(obj: Node2D, dt: number): void {}

function integrate(obj: Node2D, dt: number): void {}

function checkCollision(shapeA: RigidBody2D, shapeB: RigidBody2D): boolean {
  const boundsA = shapeA.getBounds();
  const boundsB = shapeB.getBounds();

  if (!boundsA || !boundsB) return false;

  // Usa GJK/EPA o altri algoritmi per collisione tra forme generiche
  return gjkCollision(boundsA, boundsB);
}

function handleCollisions(dt: number): void {
  const neighborOffsets = [
    [0, 0], // current cell
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ];
  const collisionChecked: string[][] = [];
  for (const key in grid) {
    if (!Object.prototype.hasOwnProperty.call(grid, key)) continue;

    // Parse cell coordinates
    const [cellX, cellY] = key.split(",").map(Number);

    // For each neighbor (including self)
    for (const [dx, dy] of neighborOffsets) {
      const neighborKey = `${cellX + dx},${cellY + dy}`;
      if (!grid[neighborKey]) continue;

      const rigidBodyArray = grid[key].filter(
        (N2) => N2 instanceof RigidBody2D
      );
      const neighborRigidBodyArray = grid[neighborKey].filter(
        (N2) => N2 instanceof RigidBody2D
      );

      for (let i = 0; i < rigidBodyArray.length; i++) {
        const shapeA = rigidBodyArray[i];

        const startJ = neighborKey === key ? i + 1 : 0;
        for (let j = startJ; j < neighborRigidBodyArray.length; j++) {
          const shapeB = neighborRigidBodyArray[j];
          const uuids = [shapeA.uuid, shapeB.uuid].sort();

          if (
            shapeA === shapeB ||
            collisionChecked.some(
              (pair) => pair[0] === uuids[0] && pair[1] === uuids[1]
            )
          ) {
            continue;
          }
          if (checkCollision(shapeA, shapeB)) {
            collisionChecked.push(uuids);
            (shapeA as Ball).color = "#ff0055";
            (shapeB as Ball).color = "#ff0055";
            debugger;
            ElasticCollision(shapeA, shapeB, dt);
          }
        }
      }
    }
  }
}

function update(dt: number): void {
  grid = {};
  world.objects.forEach((obj: Node2D) => {
    const id = getCellId(obj.pos.x, obj.pos.y);
    if (!grid[id]) grid[id] = [];
    grid[id].push(obj);
    ///
    obj.update(dt);
  });
}

function render(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#111822";
  ctx.fillRect(0, 0, state.width, state.height);

  // Esempio disegno oggetti
  for (const o of world.objects) {
    if (o instanceof GameObject) {
      o.render(ctx);
    }
  }

  drawGrid(ctx);
}

// ---------- SUPPORTI DI DISEGNO ----------
function drawGrid(ctx: CanvasRenderingContext2D): void {
  const step = world.gridSize;
  const minor = 8;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#ffffff0a";

  for (let x = 0; x <= state.width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, state.height);
    ctx.stroke();
  }

  for (let y = 0; y <= state.height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(state.width, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.12;

  for (let x = 0; x <= state.width; x += step / minor) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, state.height);
    ctx.stroke();
  }

  for (let y = 0; y <= state.height; y += step / minor) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(state.width, y);
    ctx.stroke();
  }

  ctx.restore();
}

// ---------- LOOP PRINCIPALE (fixed timestep) ----------
const panelFPS = document.getElementById("fps") as HTMLElement;
const panelCount = document.getElementById("count") as HTMLElement;
const btnReset = document.getElementById("reset") as HTMLButtonElement;
const btnSpawnGameObject = document.getElementById(
  "spawn-object"
) as HTMLButtonElement;
const output = document.getElementById("output") as HTMLElement;
let lastTS = 0;
const fixedDt = 1 / 200; // 120 Hz fisica
const maxSteps = 10; // contro accumulo
let acc = 0;
let fpsSmoother = 0;

btnReset.addEventListener("click", () => {
  initScene();
});
btnSpawnGameObject.addEventListener("click", () => {
  output.innerHTML = "Button clicked! Now click near the target position.";

  canvas.addEventListener("click", function (event) {
    const pos = handleClick(event);
    console.log(`Clicked at X: ${pos.x}, Y: ${pos.y}`);

    spawnObject(pos);
  });
});
function handleClick(event: MouseEvent): Vec2 {
  const clickX = event.clientX;
  const clickY = event.clientY;

  output.innerHTML = `Success! Clicked near target at (${clickX}, ${clickY})`;

  return new Vec2(clickX, clickY);
}
function spawnObject(pos: Vec2) {
  world.addObj(new Ball(pos, new Vec2(0, 0), 20));
}
function frame(ts: number): void {
  if (!lastTS) lastTS = ts;
  const dt = (ts - lastTS) / 5000; // dt reale
  lastTS = ts;
  fpsSmoother = fpsSmoother * 0.93 + (1 / dt) * 0.07;
  panelFPS.textContent = (fpsSmoother || 0).toFixed(0);

  acc += Math.min(dt, 0.05); // clamp dt molto grandi
  let steps = 0;

  while (acc >= fixedDt && steps < maxSteps) {
    physicsStep(fixedDt);
    update(fixedDt);
    acc -= fixedDt;
    steps++;
  }

  render(ctx);
  panelCount.textContent = String(world.objects.length);
  state.frame++;
  state.time += dt;

  if (state.running) {
    requestAnimationFrame(frame);
  }
}

function physicsStep(dt: number): void {
  // Passo di fisica: applica forze → integra → collisioni
  for (const o of world.objects) {
    if (o instanceof GameObject) {
      o.applyForces(dt);
    }
  }
  for (const o of world.objects) {
    if (o instanceof GameObject) {
      o.integrate(dt);
    }
  }
  handleCollisions(dt);
}

// ---------- HOOK OPZIONALI (vuoti) ----------
function onResize(): void {}
function onMouseMove(pos: Vec2): void {}
function onMouseDown(pos: Vec2, e: MouseEvent): void {}
function onMouseUp(pos: Vec2, e: MouseEvent): void {}
function onKeyDown(key: string, e: KeyboardEvent): void {}
function onKeyUp(key: string, e: KeyboardEvent): void {}

// ---------- AVVIO ----------
window.addEventListener("resize", resize);
resize();
initScene();
requestAnimationFrame(frame);

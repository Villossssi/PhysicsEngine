import { Vec2, world } from "./main";
import Node2D from "./Node2D";

export interface IGameObject {
  vel: Vec2;
  acc: Vec2;
  pinned: boolean;
  applyForces(dt: number): void;
  integrate(dt: number): void;
  handleCollisions(): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export class GameObject extends Node2D implements IGameObject {
  vel: Vec2 = new Vec2();
  acc: Vec2 = new Vec2();

  _private_prev_rot: number = 0;
  rotAcc: number = 0;
  rotVel: number = 0;

  private set prevRot(v: number) {
    this._private_prev_rot = v % 360;
  }
  private get prevRot() {
    return this._private_prev_rot;
  }

  pinned: boolean = false;
  affectedByGravity = false;

  applyForces(dt: number): void {
    if (this.affectedByGravity) {
      this.acc.add(world.gravity); // gravity
    }
  }
  integrate(dt: number): void {
    if (this.pinned) {
      this.acc.set(0, 0);
      this.vel.set(0, 0);
    }

    let nx =
      this.pos.x + this.vel.x * dt * world.damping + this.acc.x * dt * dt;
    let ny =
      this.pos.y + this.vel.y * dt * world.damping + this.acc.y * dt * dt;
    let r = this.rot + this.rotVel * dt * world.damping + this.rotAcc * dt * dt;

    let prevX = this.pos.x;
    let prevY = this.pos.y;

    this.prevRot = this.rot;

    this.pos.x = nx;
    this.pos.y = ny;
    this.rot = r;

    // aggiorna velocità esplicitamente
    this.vel.x = (this.pos.x - prevX) / dt;
    this.vel.y = (this.pos.y - prevY) / dt;
    this.rotVel = (this.rot - this.prevRot) / dt; // opzionale se ti serve
  }

  handleCollisions(): void {}
  render(ctx: CanvasRenderingContext2D): void {}
}

import { ShapeType } from "../Enum/ShapeType";
import { Vec2, world } from "../main";
import { RigidBody2D } from "../RigidBody2D";
import { ICircleCollisionInfo } from "../Shapes/Shape";

export default class Ball extends RigidBody2D {
  radius: number;
  color: string;
  //////////////////////  COSTRUTTORE  //////////////////////
  constructor(
    pos: Vec2 = new Vec2(),
    vel: Vec2 = new Vec2(),
    radius: number = 14,
    pinned: boolean = false,
    color: string = "#6ea8ff",
    mass: number = 2
  ) {
    super(mass);
    this.radius = radius;
    this.color = color;
    this.pos.copy(pos);
    this.vel.copy(vel);
    this.rotAcc = 0;
    this.pinned = pinned;
  }

  //////////////////////  METODI  //////////////////////
  override applyForces(dt: number): void {
    super.applyForces(dt);
  }

  override integrate(dt: number): void {
    super.integrate(dt);
  }

  override render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.rot); // Ensure this.rot is in radians

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2); // Use (0,0) now that we translated
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.save();
    ctx.translate(-this.pos.x, -this.pos.y); // Counteract previous translation

    ctx.beginPath();
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.lineTo(this.pos.x + this.radius, this.pos.y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#0b1220";
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  override getBounds(): ICircleCollisionInfo | null {
    return {
      type: ShapeType.Circle,
      x: this.pos.x,
      y: this.pos.y,
      radius: this.radius,
    };
  }
}

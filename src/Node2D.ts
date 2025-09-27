import { Vec2 } from "./main";

export default class Node2D {
  uuid: string;
  pos: Vec2;
  private _private_rot: number = 0;

  public set rot(v: number) {
    this._private_rot = v % 360;
  }
  public get rot() {
    return this._private_rot;
  }

  constructor(pos: Vec2 = new Vec2(), rot = 0) {
    this.uuid = crypto.randomUUID();
    this.pos = pos;
    this.rot = rot;
  }

  update(dt: number): void {}
}

import { IShape, IShapeCollisionInfo } from "./Shapes/Shape";
import { GameObject, IGameObject } from "./GameObject";
import { Vec2, world } from "./main";

export interface IRigidBody2D extends IGameObject {
  mass: number;
  getBounds(): IShapeCollisionInfo | null;
}

export class RigidBody2D extends GameObject implements IRigidBody2D {
  mass: number;

  constructor(mass: number = 1) {
    super();
    this.mass = mass;
  }
  getBounds(): IShapeCollisionInfo | null {
    return null;
  }
}

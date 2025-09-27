import { ShapeType } from "../Enum/ShapeType";
import { GameObject } from "../GameObject";

export interface IShapeCollisionInfo {
  type: ShapeType;
  x: number;
  y: number;
}

export interface ICircleCollisionInfo extends IShapeCollisionInfo {
  radius: number;
}

export interface IShape {
  getBounds(x: number, y: number): IShapeCollisionInfo;
}

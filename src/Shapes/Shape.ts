import { GameObject } from "../GameObject";

export interface IShapeCollisionInfo {
  type: "circle";
  x: number;
  y: number;
}

export interface ICircleCollisionInfo extends IShapeCollisionInfo {
  radius: number;
}

export interface IShape {
  getBounds(x: number, y: number): IShapeCollisionInfo;
}

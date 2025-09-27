import {
  IShape,
  ICircleCollisionInfo,
  IShapeCollisionInfo,
} from "../Shapes/Shape";

export default function gjkCollision(
  shapeA: IShapeCollisionInfo,
  shapeB: IShapeCollisionInfo
): boolean {
  if (shapeA.type === "circle" && shapeB.type === "circle") {
    const circleA = shapeA as ICircleCollisionInfo;
    const circleB = shapeB as ICircleCollisionInfo;
    const dx = circleA.x - circleB.x;
    const dy = circleA.y - circleB.y;
    console.log(Math.sqrt(dx * dx + dy * dy) < circleA.radius + circleB.radius);

    return Math.sqrt(dx * dx + dy * dy) < circleA.radius + circleB.radius;
  }
  // Gestisci altri tipi di forme (poligoni, etc.)
  return false;
}

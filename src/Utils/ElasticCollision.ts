import { Vec2, world } from "../main";
import { RigidBody2D } from "../RigidBody2D";

export default function ElasticCollision(
  RBA: RigidBody2D,
  RBB: RigidBody2D,
  dt: number
): void {
  if (dt === 0) {
    throw new Error("dt must not be zero to avoid division by zero in getVel.");
  }
  if (RBA.pinned && RBB.pinned) {
    return;
  }
  if (RBA.pinned) {
    return ElasticCollision(RBB, RBA, dt);
  }

  const vA = RBA.vel;
  const vB = RBB.vel;
  const mA = RBA.mass;
  const mB = RBB.mass;
  const VX1F = ((mA - mB) * vA.x + 2 * mB * vB.x) / (mA + mB);
  const VX2F = vA.x + VX1F - vB.x;

  const VY1F = ((mA - mB) * vA.y + 2 * mB * vB.y) / (mA + mB);
  const VY2F = vA.y + VY1F - vB.y;

  RBA.vel.x = VX1F;
  RBA.vel.y = VY1F;
  RBB.vel.x = VX2F;
  RBB.vel.y = VY2F;

  return;
}

import { ShapeType } from "../Enum/ShapeType";
import Ball from "../GameObjects/Ball";
import { world } from "../main";
import { RigidBody2D } from "../RigidBody2D";
import { ICircleCollisionInfo } from "../Shapes/Shape";

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
  const alpha = Math.atan((RBB.pos.y - RBA.pos.y) / (RBB.pos.x - RBA.pos.x));

  // let V1XF = ((mA - mB) * vA.x + 2 * mB * vB.x) / (mA + mB);
  // let V2XF = vA.x + V1XF - vB.x;

  // let V1YF = ((mA - mB) * vA.y + 2 * mB * vB.y) / (mA + mB);
  // let V2YF = vA.y + V1YF - vB.y;
  ///////////////////////// MOM INERZIA /////////////////////////

  ///////////////////////// MOM INERZIA /////////////////////////
  const I1 = CalculateInertialMomentum(RBA);
  const I2 = CalculateInertialMomentum(RBB);
  ///////////////////////// VEL ANGOLARE IN /////////////////////////
  const w1i = (RBA.rotVel * Math.PI) / 180.0;
  const w2i = (RBB.rotVel * Math.PI) / 180.0;
  ///////////////////////// VEL NOR IN /////////////////////////
  const v1n = vA.x * Math.cos(alpha) + vA.y * Math.sin(alpha);
  const v2n = vB.x * Math.cos(alpha) + vB.y * Math.sin(alpha);
  ///////////////////////// VEL TAN  /////////////////////////
  const v1t = -vA.x * Math.sin(alpha) + vA.y * Math.cos(alpha);
  const v2t = -vB.x * Math.sin(alpha) + vB.y * Math.cos(alpha);
  ///////////////////////// VEL NOR FINALE /////////////////////////
  const V1NF = ((mA - mB) * v1n + 2 * mB * v2n) / (mA + mB);
  const V2NF = ((mB - mA) * v2n + 2 * mA * v1n) / (mA + mB);

  ///////////////////////// VEL PRIMA DELL'URTO/////////////////////////
  const Vp1 = v1t + w1i * (RBA.getBounds() as ICircleCollisionInfo).radius;
  const Vp2 = v2t + w2i * (RBB.getBounds() as ICircleCollisionInfo).radius;
  ///////////////////////// VEL REL DI SLITTAMENTO  /////////////////////////
  const Vrel = Vp1 - Vp2;
  ///////////////////////// IMPULSO NORMALE  /////////////////////////
  const J = ((mA * mB) / (mA + mB)) * (v2n - v1n) * 2;
  ///////////////////////// IMP ATTRITO TANG  /////////////////////////
  const f = world.friction * Math.abs(J);
  ///////////////////////// DELTA VEL LIN TANG  /////////////////////////
  const dV1t = f / mA;
  const dV2t = -f / mB;
  ///////////////////////// DELTA VEL ANG  /////////////////////////
  const dw1 = (-f * (RBA.getBounds() as ICircleCollisionInfo).radius) / I1;
  const dw2 = (f * (RBB.getBounds() as ICircleCollisionInfo).radius) / I2;
  ///////////////////////// VEL TANG FINALE /////////////////////////
  const V1TF = v1t + dV1t;
  const V2TF = v2t + dV2t;
  ///////////////////////// VEL ANG FINALE /////////////////////////
  const W1F = w1i + dw1;
  const W2F = w2i + dw2;

  //////////////////////////////////////////////////

  ///////////////////////// VEL 1 FINALE/////////////////////////
  const V1XF = V1NF * Math.cos(alpha) - V1TF * Math.sin(alpha);
  const V1YF = V1NF * Math.sin(alpha) + V1TF * Math.cos(alpha);
  ///////////////////////// VEL 2 FINALE/////////////////////////
  const V2XF = V2NF * Math.cos(alpha) - V2TF * Math.sin(alpha);
  const V2YF = V2NF * Math.sin(alpha) + V2TF * Math.cos(alpha);

  RBA.vel.x = V1XF;
  RBA.vel.y = V1YF;
  RBB.vel.x = V2XF;
  RBB.vel.y = V2YF;
  RBA.rotVel = W1F;
  RBB.rotVel = W2F;

  return;
}

function CalculateInertialMomentum(RB: RigidBody2D) {
  switch (RB.getBounds()?.type) {
    case ShapeType.Circle:
      return (
        (2 / 5) * RB.mass * (RB.getBounds() as ICircleCollisionInfo).radius ** 2
      );
    default:
      return 0;

    // Quadrato (lato a): I = (ma²)/6
    // Triangolo equilatero (lato a): I = (ma²)/24
    // Rettangolo (a×b): I = m(a² + b²)/12
    // Esagono regolare (lato a): I = (5ma²)/8
  }
}

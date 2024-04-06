import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { MeshBasicMaterial } from "three";
import { WEAPON_OFFSET } from "./CharacterController";

const BULLET_SPEED = 50;

const bulletMaterial = new MeshBasicMaterial({
  color: 0xff0000,
  toneMapped: false,
});

export const Bullet = ({ player, angle, position, onHit }) => {
  const rigidbody = useRef();
  useEffect(() => {
    const velocity = {
      x: Math.sin(angle) * BULLET_SPEED,
      y: 0,
      z: Math.cos(angle) * BULLET_SPEED,
    };

    rigidbody.current.setLinvel(velocity, true);
  }, []);

  return (
    <group position={[position.x, position.y, position.z]} rotation-y={angle}>
      <group
        position={[WEAPON_OFFSET.x, WEAPON_OFFSET.y, WEAPON_OFFSET.z]}
        rotation-y={angle}
      >
        <RigidBody ref={rigidbody}>
          <mesh>
            <sphereBufferGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="red" />
          </mesh>
        </RigidBody>
      </group>
    </group>
  );
};

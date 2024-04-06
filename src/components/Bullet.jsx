import { RigidBody, vec3 } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { MeshBasicMaterial } from "three";
import { WEAPON_OFFSET } from "./CharacterController";
import { isHost } from "playroomkit";

const BULLET_SPEED = 20;

const bulletMaterial = new MeshBasicMaterial({
  color: 0xffff00,
  toneMapped: false,
});

bulletMaterial.color.multiplyScalar(42);

export const Bullet = ({ player, angle, position, onHit }) => {
  const rigidbody = useRef();

  useEffect(() => {
    const audio = new Audio("/sounds/pistol.mp3");
    audio.volume = 0.2;
    audio.play();

    const velocity = {
      x: Math.sin(angle) * BULLET_SPEED,
      y: 0,
      z: Math.cos(angle) * BULLET_SPEED,
    };

    rigidbody.current.setLinvel(velocity, true);
  }, []);

  return (
    <group position={[position.x, position.y, position.z]} rotation-y={angle}>
      <group position={[WEAPON_OFFSET.x, WEAPON_OFFSET.y, WEAPON_OFFSET.z]}>
        <RigidBody
          ref={rigidbody}
          gravityScale={0}
          // Set the bullet type to be able to detect it in the
          // intersection callback
          sensor
          onIntersectionEnter={(e) => {
            if (isHost() && e.other.rigidBody.userData?.type !== "bullet") {
              // Prevent the bullet from hitting the same object multiple times
              rigidbody.current.setEnabled(false);
              onHit(vec3(rigidbody.current.translation()));
            }
          }}
          userData={{
            type: "bullet",
            player,
            damage: 10,
          }}
        >
          <mesh position-z={0.25} material={bulletMaterial} castShadow>
            <boxGeometry args={[0.05, 0.05, 0.5]} />
          </mesh>
        </RigidBody>
      </group>
    </group>
  );
};

import { useRef, useState } from "react";
import { CharacterSoldier } from "./CharacterSoldier";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useKeyPress } from "../hooks/useKeyPress";

const MOVEMENT_SPEED = 200;

export const ChracterController = ({
  state,
  joystick,
  userPlayer,
  downgradedPerformance,
  ...props
}) => {
  const group = useRef();
  const character = useRef();
  const rigidbody = useRef();
  const wPress = useKeyPress("w");
  const aPress = useKeyPress("a");
  const sPress = useKeyPress("s");
  const dPress = useKeyPress("d");
  const [animation, setAnimation] = useState("Idle");

  useFrame((_, delta) => {
    // Update player position based on joystick state or keyboard input
    const angle = joystick.angle();
    if (joystick.isJoystickPressed() && angle) {
      setAnimation("Run");
      character.current.rotation.y = angle;

      // Move the character in its own direction
      const impulse = {
        x: Math.sin(angle) * MOVEMENT_SPEED * delta,
        y: 0,
        z: Math.cos(angle) * MOVEMENT_SPEED * delta,
      };

      rigidbody.current.applyImpulse(impulse);
    } // else if keyboard input (WASD)
    else if (userPlayer && (wPress || aPress || sPress || dPress)) {
      let angle;
      if (wPress && !aPress && !dPress) angle = Math.PI;
      else if (aPress && !wPress && !sPress) angle = Math.PI * 1.5;
      else if (sPress && !aPress && !dPress) angle = 0;
      else if (dPress && !wPress && !sPress) angle = Math.PI / 2;
      else if (sPress && aPress) angle = Math.PI * 1.75; // Northwest
      else if (wPress && aPress) angle = Math.PI * 1.25; // Northeast
      else if (wPress && dPress) angle = Math.PI * 0.75; // Southwest
      else if (sPress && dPress) angle = Math.PI * 0.25; // Southeast

      setAnimation("Run");
      character.current.rotation.y = angle;

      const impulse = {
        x: Math.sin(angle) * MOVEMENT_SPEED * delta,
        y: 0,
        z: Math.cos(angle) * MOVEMENT_SPEED * delta,
      };

      rigidbody.current.applyImpulse(impulse);
    } else {
      setAnimation("Idle");
    }
  });

  return (
    <group ref={group} {...props}>
      <RigidBody
        ref={rigidbody}
        colliders={false}
        linearDamping={12}
        lockRotations
      >
        <group ref={character}>
          <CharacterSoldier
            color={state.state.profile?.color}
            animation={animation}
          />
        </group>
        {userPlayer && (
          // Add a light to follow the user player
          // This will only calculate not all shadows but
          // only the shadows that are visible to the camera
          <directionalLight
            position={[25, 18, -25]}
            intensity={0.3}
            castShadow={!downgradedPerformance} // Disable shadows on low-end devices
            shadow-camera-near={0}
            shadow-camera-far={80}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={25}
            shadow-camera-bottom={-25}
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
            shadow-bias={-0.0001}
          />
        )}
        <CapsuleCollider args={[0.7, 0.66]} position={[0, 1.28, 0]} />
      </RigidBody>
    </group>
  );
};

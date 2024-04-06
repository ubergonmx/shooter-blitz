import { useRef, useState } from "react";
import { CharacterSoldier } from "./CharacterSoldier";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useKeyPress } from "../hooks/useKeyPress";
import { isHost } from "playroomkit";

const MOVEMENT_SPEED = 200;

export const CharacterController = ({
  state,
  joystick,
  keyboard,
  userPlayer,
  downgradedPerformance,
  ...props
}) => {
  const group = useRef();
  const character = useRef();
  const rigidbody = useRef();
  const [animation, setAnimation] = useState("Idle");

  useFrame((_, delta) => {
    // Update player position based on joystick state or keyboard input
    const angle = joystick.angle();
    const kbAngle = keyboard.angle();
    if (joystick.isJoystickPressed() && angle) {
      setAnimation("Run");
      character.current.rotation.y = angle;

      // Move the character in its own direction
      const impulse = {
        x: Math.sin(angle) * MOVEMENT_SPEED * delta,
        y: 0,
        z: Math.cos(angle) * MOVEMENT_SPEED * delta,
      };
      rigidbody.current.wakeUp();
      rigidbody.current.applyImpulse(impulse);
    } // else if keyboard input (WASD)
    else if (keyboard.isAnyKeyPressed() && kbAngle) {
      setAnimation("Run");
      character.current.rotation.y = kbAngle;

      const impulse = {
        x: Math.sin(kbAngle) * MOVEMENT_SPEED * delta,
        y: 0,
        z: Math.cos(kbAngle) * MOVEMENT_SPEED * delta,
      };

      rigidbody.current.wakeUp();
      rigidbody.current.applyImpulse(impulse);
    } else {
      setAnimation("Idle");
    }

    if (isHost()) {
      // Sync player position
      state.setState("pos", rigidbody.current.translation());
    } else {
      // Update player position based on host state
      const pos = state.getState("pos");
      if (pos) rigidbody.current.setTranslation(pos);
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

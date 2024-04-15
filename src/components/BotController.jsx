import { useEffect, useRef, useState } from "react";
import { CharacterPlayer } from "./CharacterPlayer";
import { CapsuleCollider, RigidBody, vec3 } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import { isHost } from "playroomkit";
import { Billboard, Text } from "@react-three/drei";

const MOVEMENT_SPEED = 200;
const FIRE_RATE = 380;

// FOR CHARACTER PLAYER
export const WEAPON_OFFSET = {
  x: -0.4,
  y: 2.0,
  z: 1.0,
};

export const BotController = ({
  state,
  onFire,
  onKilled,
  downgradedPerformance,
  ...props
}) => {
  const group = useRef();
  const character = useRef();
  const rigidbody = useRef();
  const controls = useRef();
  const lastShoot = useRef(0);
  const directionalLight = useRef();
  const [animation, setAnimation] = useState("Idle");

  const scene = useThree((state) => state.scene);

  const spawnRandomly = () => {
    const spawns = [];
    for (let i = 0; i < 1000; i++) {
      // Search for an object in glb file with the name "spawn_<number>"
      const spawn = scene.getObjectByName(`spawn_${i}`);
      if (spawn) spawns.push(spawn);
      else break;
    }
    const randomSpawn =
      spawns[Math.floor(Math.random() * spawns.length)].position;
    rigidbody.current.setTranslation(randomSpawn);
  };

  useEffect(() => {
    if (isHost()) {
      spawnRandomly();
    }
  }, []);

  useEffect(() => {
    if (state.state.dead) {
      const audio = new Audio("/sounds/death.mp3");
      audio.volume = 0.5;
      audio.play();
    }
  }, [state.state.dead]);

  useFrame((_, delta) => {
    // If there is no rigidbody, return
    if (!rigidbody.current) return;

    // If player is dead, play death sfx & animation
    if (state.state.dead) {
      setAnimation("Death");
      return;
    }

    if (isHost()) {
      // Sync bot position
      state.setState("pos", rigidbody.current.translation());
    } else {
      // Update bot position based on host state
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
        type={isHost() ? "dynamic" : "kinematicPosition"}
        onIntersectionEnter={({ other }) => {
          if (
            isHost() &&
            other.rigidBody.userData?.type === "bullet" &&
            state.state.health > 0
          ) {
            const newHealth =
              state.state.health - other.rigidBody.userData.damage;
            if (newHealth <= 0) {
              state.setState("dead", true);
              state.setState("deaths", state.state.deaths + 1);
              state.setState("health", 0);
              rigidbody.current.setEnabled(false);
              setTimeout(() => {
                spawnRandomly();
                state.setState("dead", false);
                state.setState("health", 100);
                rigidbody.current.setEnabled(true);
              }, 2000);
              onKilled(state.id, other.rigidBody.userData.player);
            } else {
              state.setState("health", newHealth);
            }
          }
        }}
        userData={{
          type: "bot",
        }}
      >
        <PlayerInfo state={state.state} />
        <group ref={character}>
          <CharacterPlayer
            animation={animation}
            character={state.getState("character")}
          />
        </group>
        <CapsuleCollider args={[0.7, 0.66]} position={[0, 1.28, 0]} />
      </RigidBody>
    </group>
  );
};

const PlayerInfo = ({ state }) => {
  const health = state.health;
  const name = state.profile.name;
  return (
    <Billboard position-y={2.5}>
      <Text position-y={0.36} fontSize={0.4}>
        {name}
        <meshBasicMaterial color={state.profile.color} />
      </Text>
      <mesh position-z={-0.1}>
        <planeGeometry args={[1, 0.2]} />
        <meshBasicMaterial color="black" transparent opacity={0.5} />
      </mesh>
      <mesh scale-x={health / 100} position-x={-0.5 * (1 - health / 100)}>
        <planeGeometry args={[1, 0.2]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </Billboard>
  );
};

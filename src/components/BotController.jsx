import { useEffect, useRef, useState } from "react";
import { CharacterPlayer } from "./CharacterPlayer";
import { CapsuleCollider, RigidBody, vec3 } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import { isHost, Bot, usePlayersList } from "playroomkit";
import { Billboard, Text } from "@react-three/drei";

const MOVEMENT_SPEED = 200;
const FIRE_RATE = 380;
const DETECT_RADIUS = 10;

// FOR CHARACTER PLAYER
export const WEAPON_OFFSET = {
  x: -0.4,
  y: 2.0,
  z: 1.0,
};

// BOT CLASS
export class PlayerBot extends Bot {
  constructor(botParams) {
    super(botParams);
  }

  checkNearestPlayer(players) {
    const pos = this._player.state.pos;
    if (!pos) return null;
    for (const player of players) {
      if (player.id === this._player.id) continue;
      const playerPos = player.state.pos;
      if (!playerPos) continue;
      const distance = vec3(pos).distanceTo(vec3(playerPos));
      if (distance < DETECT_RADIUS && player.state.health > 0) {
        // get angle for the bot to look at the player
        const x = playerPos.x - pos.x;
        const z = playerPos.z - pos.z;
        const angle = -Math.atan2(z, x) + Math.PI / 2;
        this.setState("bot-angle", angle);
        this.setState("bot-target", true);
        return player;
      }
    }
    this.setState("bot-target", false);
  }

  hasTargetPlayer() {
    return this.getState("bot-target");
  }

  isMoving() {
    return this.getState("bot-move") || false;
  }

  changeMoveState() {
    this.setState("bot-move", !this.getState("bot-move"));
  }

  lookAngle() {
    return this.getState("bot-angle");
  }

  changeMoveAngleRandom() {
    this.setState("bot-move-angle", Math.random() * Math.PI * 2);
  }

  moveAngle() {
    return this.getState("bot-move-angle") || 0;
  }
}

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
  const lastShoot = useRef(0);
  const players = usePlayersList();
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

  useEffect(() => {
    // Generate a random delay between 1 and 10 seconds
    const delay = Math.random() * 9000 + 1000;

    // Set a timeout to change the state after the delay
    const timeoutId = setTimeout(() => {
      state.bot.changeMoveState();
    }, delay);

    // Clear the timeout if the component unmounts before the timeout fires
    return () => clearTimeout(timeoutId);
  }, [state.bot?.isMoving()]); // Rerun the effect whenever moving state changes

  useEffect(() => {
    // Generate a random delay between 1 and 3 seconds
    const delay = Math.random() * 2000 + 1000;

    // Set a timeout to change the state after the delay
    const timeoutId = setTimeout(() => {
      state.bot.changeMoveAngleRandom();
    }, delay);

    // Clear the timeout if the component unmounts before the timeout fires
    return () => clearTimeout(timeoutId);
  }, [state.bot?.moveAngle()]); // Rerun the effect whenever moving angle changes

  useFrame((_, delta) => {
    // If there is no rigidbody, return
    if (!rigidbody.current) return;

    // If bot is dead, play death sfx & animation
    if (state.state.dead) {
      setAnimation("Death");
      return;
    }

    state.bot.checkNearestPlayer(players);
    if (state.bot.hasTargetPlayer()) {
      // look at target player
      character.current.rotation.y = state.getState("bot-angle");
      if (isHost()) {
        if (Date.now() - lastShoot.current > FIRE_RATE) {
          lastShoot.current = Date.now();
          const newBullet = {
            id: state.id + "-" + +new Date() + Math.random(),
            position: vec3(rigidbody.current.translation()),
            angle: state.bot.lookAngle(),
            player: state.id,
          };
          onFire(newBullet);
        }
      }
    }

    if (state.bot.isMoving()) {
      setAnimation(state.bot.hasTargetPlayer() ? "Run_Shoot" : "Run");
      const randomAngle = state.bot.moveAngle();
      if (!state.bot.hasTargetPlayer())
        character.current.rotation.y = randomAngle;
      const impulse = {
        x: Math.sin(randomAngle) * MOVEMENT_SPEED * delta,
        y: 0,
        z: Math.cos(randomAngle) * MOVEMENT_SPEED * delta,
      };
      rigidbody.current.wakeUp();
      rigidbody.current.applyImpulse(impulse);
    } else {
      setAnimation(state.bot.hasTargetPlayer() ? "Idle_Shoot" : "Idle");
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
          type: "player",
        }}
      >
        <BotInfo state={state.state} />
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

const BotInfo = ({ state }) => {
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

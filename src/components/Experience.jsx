import { Environment } from "@react-three/drei";
import { Map } from "./Map";
import { useEffect, useState } from "react";
import {
  insertCoin,
  isHost,
  myPlayer,
  onPlayerJoin,
  useMultiplayerState,
} from "playroomkit";
import { Joystick } from "playroomkit/multiplayer.mjs";
import { CharacterController } from "./CharacterController";
import Keyboard from "./Keyboard";
import { Bullet } from "./Bullet";
import { BulletHit } from "./BulletHit";

export const Experience = ({ downgradedPerformance = false }) => {
  const [players, setPlayers] = useState([]);

  // Local bullets
  const [bullets, setBullets] = useState([]);
  // Network bullets
  const [networkBullets, setNetworkBullets] = useMultiplayerState(
    "bullets",
    []
  );

  // Local hits
  const [hits, setHits] = useState([]);
  // Network hits
  const [networkHits, setNetworkHits] = useMultiplayerState("hits", []);

  useEffect(() => {
    setNetworkBullets(bullets);
  }, [bullets]);

  useEffect(() => {
    setNetworkHits(hits);
  }, [hits]);

  const onFire = (bullet) => {
    setBullets((bullets) => [...bullets, bullet]);
  };

  const onHit = (bulletId, position, type) => {
    setBullets((bullets) => bullets.filter((bullet) => bullet.id !== bulletId));
    setHits((hits) => [...hits, { id: bulletId, position, type }]);
  };

  const onHitEnded = (hitId) => {
    setHits((hits) => hits.filter((hit) => hit.id !== hitId));
  };

  const onKilled = (_victim, killer) => {
    const killerState = players.find((p) => p.state.id === killer).state;
    killerState.setState("kills", killerState.state.kills + 1);
  };

  const start = async () => {
    // Show Playroom UI
    await insertCoin();

    // Create a joystick for each player
    onPlayerJoin((state) => {
      // Create joystick and keyboard for current player
      // Others will only sync their state
      const joystick = new Joystick(state, {
        type: "angular",
        buttons: [{ id: "fire", label: "Fire" }],
      });

      const keyboard = new Keyboard(state, state.id === myPlayer()?.id);
      const newPlayer = { state, joystick, keyboard };
      state.setState("health", 100);
      state.setState("deaths", 0);
      state.setState("kills", 0);
      setPlayers((players) => [...players, newPlayer]);
      state.onQuit(() => {
        setPlayers((players) =>
          players.filter((player) => player !== newPlayer)
        );
      });
    });
  };

  useEffect(() => {
    start();
  }, []);

  return (
    <>
      <Map />
      {players.map(({ state, joystick, keyboard }, idx) => (
        <CharacterController
          key={state.id}
          state={state}
          joystick={joystick}
          keyboard={keyboard}
          userPlayer={state.id === myPlayer()?.id}
          onFire={onFire}
          onKilled={onKilled}
          downgradedPerformance={downgradedPerformance}
        />
      ))}
      {(isHost() ? bullets : networkBullets).map((bullet) => (
        <Bullet
          key={bullet.id}
          {...bullet}
          onHit={(position, type) => onHit(bullet.id, position, type)}
        />
      ))}
      {(isHost() ? hits : networkHits).map((hit) => (
        <BulletHit key={hit.id} {...hit} onEnded={() => onHitEnded(hit.id)} />
      ))}
      <Environment preset="sunset" />
    </>
  );
};

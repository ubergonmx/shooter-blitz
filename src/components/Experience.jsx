import { Environment } from "@react-three/drei";
import { Map } from "./Map";
import { useEffect, useState } from "react";
import {
  getState,
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
import { BotController, PlayerBot } from "./BotController";

export const Experience = ({
  downgradedPerformance = false,
  useJoystick = true,
}) => {
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

  const getRandomCharacter = () => {
    const characters = ["Bond", "Bambo", "Steve", "Zombie"];
    return characters[Math.floor(Math.random() * characters.length)];
  };

  const start = async () => {
    // Show Playroom UI
    await insertCoin({
      enableBots: true,

      botOptions: {
        botClass: PlayerBot, // Specifies the bot class to be utilized by the SDK
      },
    });
    onPlayerJoin((state) => {
      // state is basically the player (bot or human)
      state.setState("health", 100);
      state.setState("deaths", 0);
      state.setState("kills", 0);
      if (state.getState("character") === undefined)
        state.setState("character", getRandomCharacter());

      const joystick = new Joystick(state, {
        type: "angular",
        buttons: [{ id: "fire", label: "Fire" }],
      });
      const userPlayer = state.id === myPlayer()?.id;
      const keyboard = new Keyboard(state, userPlayer);
      if (userPlayer) state.setState("useJoystick", useJoystick);

      let newPlayer = { state, joystick, keyboard };
      if (state.isBot()) newPlayer = { state };

      setPlayers((players) => [...players, newPlayer]);
      state.onQuit(() => {
        keyboard.removeEventListeners();
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
      {players.map(({ state, joystick, keyboard }, idx) =>
        !state.isBot() ? (
          <CharacterController
            key={state.id}
            state={state}
            joystick={joystick}
            keyboard={keyboard}
            userPlayer={state.id === myPlayer()?.id}
            onFire={onFire}
            onKilled={onKilled}
            downgradedPerformance={downgradedPerformance}
            useJoystick={useJoystick}
          />
        ) : (
          <BotController
            key={state.id}
            state={state}
            onFire={onFire}
            onKilled={onKilled}
            downgradedPerformance={downgradedPerformance}
          />
        )
      )}
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

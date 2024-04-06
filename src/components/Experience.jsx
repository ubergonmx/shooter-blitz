import { Environment, OrbitControls } from "@react-three/drei";
import { Map } from "./Map";
import { useEffect, useState } from "react";
import { insertCoin, myPlayer, onPlayerJoin } from "playroomkit";
import { Joystick } from "playroomkit/multiplayer.mjs";
import { CharacterController } from "./CharacterController";
import Keyboard from "./Keyboard";

export const Experience = ({ downgradedPerformance = false }) => {
  const [players, setPlayers] = useState([]);

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
      <OrbitControls />
      <Map />
      {players.map(({ state, joystick, keyboard }, idx) => (
        <CharacterController
          key={state.id}
          state={state}
          joystick={joystick}
          keyboard={keyboard}
          userPlayer={state.id === myPlayer()?.id}
          position-x={idx * 2}
          downgradedPerformance={downgradedPerformance}
        />
      ))}
      <Environment preset="sunset" />
    </>
  );
};

import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Loader, PerformanceMonitor, SoftShadows } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { Physics } from "@react-three/rapier";
import { Leaderboard } from "./components/Leaderboard";

function App() {
  const [downgradedPerformance, setDowngradedPerformance] = useState(false);
  const [useJoystick, setUseJoystick] = useState(true);

  useEffect(() => {
    // Check if the device supports touch events
    setUseJoystick("ontouchstart" in window);
  }, []);

  return (
    <>
      <Loader />
      <Leaderboard />
      <button
        className="fixed top-4 right-20 z-10 text-white"
        onClick={(event) => {
          setUseJoystick((prev) => !prev);
          event.currentTarget.blur();
        }}
      >
        {useJoystick ? "Using Joystick 🕹️" : "Using Mouse 🖱️"}
      </button>
      <Canvas shadows camera={{ position: [0, 30, 0], fov: 30, near: 2 }}>
        <color attach="background" args={["#242424"]} />

        <SoftShadows
          // Smoothen the shadow to make them less harsh
          size={42}
        />

        <PerformanceMonitor
          // Detect low-end devices
          onDecline={(fps) => setDowngradedPerformance(true)}
        />

        <Suspense>
          <Physics>
            <Experience
              downgradedPerformance={downgradedPerformance}
              useJoystick={useJoystick}
            />
          </Physics>
        </Suspense>

        {!downgradedPerformance && (
          // Disable postprocessing on low-end devices
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} intensity={1} mipmapBlur />
          </EffectComposer>
        )}
      </Canvas>
    </>
  );
}

export default App;

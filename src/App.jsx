import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Loader, PerformanceMonitor, SoftShadows } from "@react-three/drei";
import { Suspense, useState } from "react";
import { Physics } from "@react-three/rapier";
import { Leaderboard } from "./components/Leaderboard";

function App() {
  const [downgradedPerformance, setDowngradedPerformance] = useState(false);

  return (
    <>
      <Loader />
      <Leaderboard />

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
            <Experience />
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

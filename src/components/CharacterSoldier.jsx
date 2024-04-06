/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 public/models/Character_Soldier.gltf -o src/components/CharacterSoldier2.jsx -r public 
*/

import React, { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import { Color, LoopOnce, MeshStandardMaterial } from "three";
import { SkeletonUtils } from "three-stdlib";

const WEAPONS = [
  "GrenadeLauncher",
  "AK",
  "Knife_1",
  "Knife_2",
  "Pistol",
  "Revolver",
  "Revolver_Small",
  "RocketLauncher",
  "ShortCannon",
  "SMG",
  "Shotgun",
  "Shovel",
  "Sniper",
  "Sniper_2",
];

export function CharacterSoldier({
  color = "black",
  animation = "Idle",
  weapon = "AK",
  ...props
}) {
  const group = useRef();

  const { scene, materials, animations } = useGLTF(
    "/models/Character_Soldier.gltf"
  );
  // Skinned meshes cannot be re-used in threejs without cloning them
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  // useGraph creates two flat object collections for nodes and materials
  const { nodes } = useGraph(clone);

  const { actions } = useAnimations(animations, group);
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="CharacterArmature">
          <primitive object={nodes.Root} />
          <group name="Body_1">
            <skinnedMesh
              name="Cube004"
              geometry={nodes.Cube004.geometry}
              material={materials.Skin}
              skeleton={nodes.Cube004.skeleton}
            />
            <skinnedMesh
              name="Cube004_1"
              geometry={nodes.Cube004_1.geometry}
              material={materials.DarkGrey}
              skeleton={nodes.Cube004_1.skeleton}
            />
            <skinnedMesh
              name="Cube004_2"
              geometry={nodes.Cube004_2.geometry}
              material={materials.Pants}
              skeleton={nodes.Cube004_2.skeleton}
            />
            <skinnedMesh
              name="Cube004_3"
              geometry={nodes.Cube004_3.geometry}
              material={materials.Character_Main}
              skeleton={nodes.Cube004_3.skeleton}
            />
            <skinnedMesh
              name="Cube004_4"
              geometry={nodes.Cube004_4.geometry}
              material={materials.Black}
              skeleton={nodes.Cube004_4.skeleton}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/Character_Soldier.gltf");

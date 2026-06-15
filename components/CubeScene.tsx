"use client";

import { Edges, Float, RoundedBox, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

const cubePositions: [number, number, number][] = [
  [-0.64, 0.64, 0.64],
  [0.64, 0.64, 0.64],
  [-0.64, -0.64, 0.64],
  [0.64, -0.64, 0.64],
  [-0.64, 0.64, -0.64],
  [0.64, 0.64, -0.64],
  [-0.64, -0.64, -0.64],
  [0.64, -0.64, -0.64],
];

function CubeCluster() {
  const group = useRef<Group>(null);
  const { viewport } = useThree();
  const responsiveScale = Math.min(1, viewport.width / 6.4);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.18;
    group.current.rotation.x +=
      (state.pointer.y * 0.12 - group.current.rotation.x) * 0.018;
    group.current.rotation.z +=
      (-state.pointer.x * 0.08 - group.current.rotation.z) * 0.018;
  });

  return (
    <Float speed={1.25} rotationIntensity={0.18} floatIntensity={0.48}>
      <group
        ref={group}
        scale={responsiveScale}
        rotation={[-0.18, -0.5, 0.08]}
      >
        <group>
          {cubePositions.map((position, index) => (
            <RoundedBox
              key={position.join("-")}
              args={[1.17, 1.17, 1.17]}
              radius={0.13}
              smoothness={5}
              position={position}
            >
              {index === 3 ? (
                <meshPhysicalMaterial
                  color="#8b5cf6"
                  emissive="#6d28d9"
                  emissiveIntensity={0.85}
                  metalness={0.18}
                  roughness={0.06}
                  transmission={0.38}
                  thickness={0.9}
                  transparent
                  opacity={0.92}
                />
              ) : (
                <meshStandardMaterial
                  color={index % 3 === 0 ? "#241345" : "#0b0914"}
                  emissive={index % 2 === 0 ? "#2e1065" : "#13052f"}
                  emissiveIntensity={0.5}
                  metalness={0.76}
                  roughness={0.2}
                />
              )}
              <Edges
                threshold={20}
                color={index === 3 ? "#d8b4fe" : "#6d3eac"}
              />
            </RoundedBox>
          ))}
        </group>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.45, 0.015, 14, 160]} />
          <meshBasicMaterial color="#c084fc" transparent opacity={0.7} />
        </mesh>
        <mesh rotation={[Math.PI / 2.45, 0.45, 0.28]}>
          <torusGeometry args={[2.78, 0.009, 12, 160]} />
          <meshBasicMaterial color="#7c3aed" transparent opacity={0.48} />
        </mesh>
        <mesh rotation={[0.55, Math.PI / 2.3, 0.25]}>
          <torusGeometry args={[3.02, 0.006, 10, 160]} />
          <meshBasicMaterial color="#4f46e5" transparent opacity={0.3} />
        </mesh>

        <mesh position={[2.42, 0.28, 0.35]}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial
            color="#e9d5ff"
            emissive="#a855f7"
            emissiveIntensity={2.4}
          />
        </mesh>
        <mesh position={[-2.2, -0.85, 0.22]}>
          <sphereGeometry args={[0.075, 20, 20]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#7c3aed"
            emissiveIntensity={2.2}
          />
        </mesh>
      </group>
    </Float>
  );
}

export function CubeScene() {
  return (
    <div className="cube-scene">
      <div className="cube-aura" />
      <Canvas
        dpr={[1, 1.65]}
        camera={{ position: [0, 0, 8.4], fov: 39 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 5, 6]} intensity={2.8} color="#e9d5ff" />
        <pointLight position={[-4, -2, 4]} intensity={42} color="#6d28d9" />
        <pointLight position={[3, -3, 3]} intensity={25} color="#a855f7" />
        <Sparkles
          count={34}
          scale={[5.2, 4.8, 3]}
          size={1.35}
          speed={0.22}
          opacity={0.42}
          color="#c4b5fd"
        />
        <CubeCluster />
      </Canvas>
    </div>
  );
}

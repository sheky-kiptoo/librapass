import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment, RoundedBox } from "@react-three/drei";

function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 3]} intensity={1.4} />
      <Float speed={1.4} rotationIntensity={0.7} floatIntensity={1.4}>
        <mesh position={[0, 0.2, 0]}>
          <icosahedronGeometry args={[1.35, 24]} />
          <MeshDistortMaterial color="#006B3F" distort={0.35} speed={1.4} roughness={0.25} metalness={0.35} />
        </mesh>
      </Float>
      <Float speed={2} rotationIntensity={1.2} floatIntensity={2}>
        <RoundedBox args={[1.1, 0.75, 0.08]} radius={0.05} position={[1.9, -0.9, 0.4]} rotation={[0.3, -0.5, 0.2]}>
          <meshStandardMaterial color="#7fd7ac" roughness={0.2} metalness={0.4} />
        </RoundedBox>
      </Float>
      <Float speed={1.7} rotationIntensity={1} floatIntensity={1.8}>
        <RoundedBox args={[0.9, 0.62, 0.07]} radius={0.05} position={[-1.9, 1.1, -0.3]} rotation={[-0.2, 0.6, -0.25]}>
          <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.2} />
        </RoundedBox>
      </Float>
      <Environment preset="city" />
    </>
  );
}

export default function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }}>
      <Scene />
    </Canvas>
  );
}
'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

function Chao() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#3a7d44" />
    </mesh>
  );
}

function Controles() {
  const { camera } = useThree();
  const teclas = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const aoPressionar = (e: KeyboardEvent) => {
      teclas.current[e.key.toLowerCase()] = true;
    };
    const aoSoltar = (e: KeyboardEvent) => {
      teclas.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', aoPressionar);
    window.addEventListener('keyup', aoSoltar);

    return () => {
      window.removeEventListener('keydown', aoPressionar);
      window.removeEventListener('keyup', aoSoltar);
    };
  }, []);

  useFrame((_, delta) => {
    const velocidade = 5;

    const direcaoCamera = new THREE.Vector3();
    camera.getWorldDirection(direcaoCamera);
    direcaoCamera.y = 0;
    direcaoCamera.normalize();

    const direita = new THREE.Vector3();
    direita.crossVectors(direcaoCamera, new THREE.Vector3(0, 1, 0));

    if (teclas.current['w']) camera.position.addScaledVector(direcaoCamera, velocidade * delta);
    if (teclas.current['s']) camera.position.addScaledVector(direcaoCamera, -velocidade * delta);
    if (teclas.current['a']) camera.position.addScaledVector(direita, -velocidade * delta);
    if (teclas.current['d']) camera.position.addScaledVector(direita, velocidade * delta);

    camera.position.y = 1.7;
  });

  return null;
}

export default function Home() {
  const [iniciado, setIniciado] = useState(false);

  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      {!iniciado && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            zIndex: 10,
            cursor: 'pointer',
            fontFamily: 'sans-serif',
          }}
          onClick={() => setIniciado(true)}
        >
          <div style={{ textAlign: 'center' }}>
            <h1>Clique para entrar</h1>
            <p>WASD para andar · Mouse para olhar · ESC para sair</p>
          </div>
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 1.7, 5], fov: 75 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Chao />
        {iniciado && <PointerLockControls />}
        <Controles />
      </Canvas>
    </main>
  );
}
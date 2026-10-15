'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

const TAMANHO = 20;
const ALTURA = 4;
const ESPESSURA = 0.3;
const PORTA_LARGURA = 3;

function Chao() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[TAMANHO, TAMANHO]} />
      {/* 🔽 MUDANÇA 1: grade visual no chão */}
      <meshStandardMaterial color="#3a7d44" wireframe={false} />
      <gridHelper args={[TAMANHO, TAMANHO, '#000000', '#000000']} position={[0, 0.01, 0]} />
    </mesh>
  );
}

function Parede({
  position,
  rotation = [0, 0, 0],
  largura,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  largura: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[largura, ALTURA, ESPESSURA]} />
      <meshStandardMaterial color="#d4d4d4" />
    </mesh>
  );
}

function Sala() {
  const meia = TAMANHO / 2;
  const y = ALTURA / 2;
  const tamanhoPorta = PORTA_LARGURA;
  const paredeLado = (TAMANHO - tamanhoPorta) / 2;

  return (
    <>
      <Parede position={[0, y, -meia]} largura={TAMANHO} />
      <Parede position={[-meia, y, 0]} rotation={[0, Math.PI / 2, 0]} largura={TAMANHO} />
      <Parede position={[meia, y, 0]} rotation={[0, Math.PI / 2, 0]} largura={TAMANHO} />
      <Parede position={[-(tamanhoPorta / 2 + paredeLado / 2), y, meia]} largura={paredeLado} />
      <Parede position={[tamanhoPorta / 2 + paredeLado / 2, y, meia]} largura={paredeLado} />

      {/* 🔽 MUDANÇA 2: teto */}
      <mesh position={[0, ALTURA, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[TAMANHO, TAMANHO]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* 🔽 MUDANÇA 3: cubos de referência nos 4 cantos */}
      <mesh position={[-meia + 1, 0.5, -meia + 1]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh position={[meia - 1, 0.5, -meia + 1]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={[-meia + 1, 0.5, meia - 1]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
      <mesh position={[meia - 1, 0.5, meia - 1]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="purple" />
      </mesh>
    </>
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
    const raioCamera = 0.4;

    const direcaoCamera = new THREE.Vector3();
    camera.getWorldDirection(direcaoCamera);
    direcaoCamera.y = 0;
    direcaoCamera.normalize();

    const direita = new THREE.Vector3();
    direita.crossVectors(direcaoCamera, new THREE.Vector3(0, 1, 0));

    const movimento = new THREE.Vector3();
    if (teclas.current['w']) movimento.add(direcaoCamera);
    if (teclas.current['s']) movimento.sub(direcaoCamera);
    if (teclas.current['a']) movimento.sub(direita);
    if (teclas.current['d']) movimento.add(direita);

    if (movimento.length() > 0) {
      movimento.normalize();
      movimento.multiplyScalar(velocidade * delta);

      const novaPosicao = camera.position.clone().add(movimento);

      const limite = TAMANHO / 2 - raioCamera;
      const limitePorta = PORTA_LARGURA / 2 - raioCamera;

      const dentroNorteSul = Math.abs(novaPosicao.z) < limite;
      const dentroLesteOeste = Math.abs(novaPosicao.x) < limite;

      const podeIrX =
        dentroNorteSul ||
        (novaPosicao.z > TAMANHO / 2 - raioCamera &&
          Math.abs(novaPosicao.x) < limitePorta) ||
        (novaPosicao.z < -TAMANHO / 2 + raioCamera);

      if (podeIrX) camera.position.x = novaPosicao.x;
      if (dentroLesteOeste) camera.position.z = novaPosicao.z;
    }

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
        <directionalLight position={[10, 15, 5]} intensity={1} castShadow />
        <Chao />
        <Sala />
        {iniciado && <PointerLockControls />}
        <Controles />
      </Canvas>
    </main>
  );
}
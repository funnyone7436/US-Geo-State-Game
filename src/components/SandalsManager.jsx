import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_CONFIG = {
  USBall: { path: './glb/USBall1.glb', scale: [0.1, 0.24, 0.1], rotation: [0, 0, 0] }
};
const ACTIVE_MODEL = 'USBall';

// 💡 Accept the new gameStarted prop
export default function SandalsManager({ remainingCount, gameStarted }) {
  const [items, setItems] = useState([]);
  const lastCount = useRef(remainingCount);
  const config = MODEL_CONFIG[ACTIVE_MODEL];
  const { scene } = useGLTF(config.path);

  useEffect(() => {
    // 💡 FOOLPROOF FIX: If the game is toggled/reset, vaporize everything safely!
    if (!gameStarted) {
      setItems([]); 
      lastCount.current = remainingCount; 
      return; 
    } 
    
    // Normal gameplay: If the count goes down, spawn a new ball
    if (remainingCount < lastCount.current) {
      setItems(prev => [{ id: Date.now() + Math.random(), phase: 'jumping' }, ...prev]);
    }
    lastCount.current = remainingCount;
  }, [remainingCount, gameStarted]);

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 10]} left={-5} right={5} top={5} bottom={-5} far={20} near={0.1} />
      <ambientLight intensity={2.5} />
      <pointLight position={[5, 5, 5]} />
      <group>
        {items.map((item, index) => (
          <SandalItem key={item.id} index={index} model={scene} phase={item.phase}
            onJumpComplete={() => setItems(current => current.map(i => i.id === item.id ? {...i, phase: 'orbit'} : i))}
          />
        ))}
      </group>
    </>
  );
}

function SandalItem({ index, model, phase, onJumpComplete }) {
  const meshRef = useRef();
  const config = MODEL_CONFIG[ACTIVE_MODEL];
  
  // Dimensions
  const W = 10, H = 10, padding = 0.5;
  const edgeW = (W / 2) - padding; 
  const edgeH = (H / 2) - padding; 

  // Exact Path Segment Lengths
  const seg1 = edgeW;               
  const seg2 = seg1 + (edgeH * 2);  
  const seg3 = seg2 + (edgeW * 2);  
  const seg4 = seg3 + (edgeH * 2);  
  const totalPath = seg4 + edgeW;   

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    let targetX = 0, targetY = 0;

    if (phase === 'jumping') {
      targetX = 0; 
      targetY = edgeH; 
      // Switch to orbit when it reaches the top
      if (meshRef.current.position.y > (edgeH - 0.2)) onJumpComplete(); 
    } else {
      const spacing = 0.8;
      const rawDistance = index * spacing;
      
      const lap = Math.floor(rawDistance / totalPath);
      const offset = lap * (spacing / 2);
      const d = (rawDistance + offset) % totalPath;

      if (d < seg1) { 
        targetX = d; 
        targetY = edgeH; 
      }
      else if (d < seg2) { 
        targetX = edgeW; 
        targetY = edgeH - (d - seg1); 
      }
      else if (d < seg3) { 
        targetX = edgeW - (d - seg2); 
        targetY = -edgeH; 
      }
      else if (d < seg4) { 
        targetX = -edgeW; 
        targetY = -edgeH + (d - seg3); 
      }
      else { 
        targetX = -edgeW + (d - seg4); 
        targetY = edgeH; 
      }
    }

    const lerpSpeed = (phase === 'jumping') ? 0.12 : 0.05;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, lerpSpeed);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, lerpSpeed);
    meshRef.current.rotation.set(...config.rotation);
  });

  const clonedScene = useMemo(() => model.clone(), [model]);
  return <primitive ref={meshRef} object={clonedScene} scale={config.scale} position={[0, -5, 0]} />; 
}
useGLTF.preload(MODEL_CONFIG[ACTIVE_MODEL].path);
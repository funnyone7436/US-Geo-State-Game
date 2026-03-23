import React, { Suspense, useState, useRef, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Leva } from 'leva'
import SandalsManager from './components/SandalsManager';
import Confetti from 'react-confetti';

import AppUI from './components/AppUI'
import SpeechController from './components/SpeechController'
import WorldModel from './components/WorldModel'
import SceneBackground from './components/SceneBackground'

import { US_STATES, CAPITALS, PRONUNCIATION_ALIASES, RECOGNITION_LIST } from './constants';

export default function App() {
  const [gameMode, setGameMode] = useState('erase'); 

  const [targetRegion, setTargetRegion] = useState(null);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const timerRef = useRef(null);
  const [remainingItems, setRemainingItems] = useState(new Set(RECOGNITION_LIST));
  const [micStatus, setMicStatus] = useState("Initializing Mic...");
  const [micResetKey, setMicResetKey] = useState(0);

  const toggleGameMode = () => {
    const newMode = gameMode === 'erase' ? 'populate' : 'erase';
    setGameMode(newMode);
    
    // 💡 Setting this to false is our ultimate reset trigger for the balls
    setGameStarted(false); 
    
    setTime(0);
    setTargetRegion(null);
    setMicStatus(`Play Style: ${newMode.toUpperCase()}! Say any state to start.`);
    setRemainingItems(newMode === 'erase' ? new Set(RECOGNITION_LIST) : new Set());
  };

  const forceMicReset = useCallback(() => {
    setMicResetKey(prev => prev + 1); 
    setMicStatus("🔄 Restarting Mic...");
  }, []);

  const handleVoiceCommand = useCallback((command) => {
    let cleanCommand = command.trim().toLowerCase()
      .replace(/^saint\s/g, 'st. ')
      .replace(/^st\s/g, 'st. ');
    
    let finalMatch = "";

    if (PRONUNCIATION_ALIASES[cleanCommand]) {
      finalMatch = PRONUNCIATION_ALIASES[cleanCommand];
    } else {
      const capitalized = cleanCommand.split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      finalMatch = capitalized.startsWith("St ") ? capitalized.replace("St ", "St. ") : capitalized;
    }

    if (RECOGNITION_LIST.includes(finalMatch)) {
      if (!gameStarted) setGameStarted(true); 
      const meshName = finalMatch.replace(/\s+/g, '_');

      const isAlreadyFound = gameMode === 'populate' ? remainingItems.has(finalMatch) : !remainingItems.has(finalMatch);

      if (!isAlreadyFound) {
        setTargetRegion(meshName);
        setMicStatus(`✅ Found: ${finalMatch}!`);
        setRemainingItems((prev) => {
          const next = new Set(prev);
          if (gameMode === 'erase') next.delete(finalMatch);
          else next.add(finalMatch); 
          return next;
        });
      } else {
        setMicStatus(`Already found ${finalMatch}!`);
      }
    } else {
      setMicStatus(`❌ Unrecognized: "${cleanCommand}"`);
    }
  }, [gameStarted, gameMode, remainingItems]);
  
  useEffect(() => {
    if (gameStarted && remainingItems.size > 0 && remainingItems.size < RECOGNITION_LIST.length) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameStarted, remainingItems.size]);
  
// 🚀 BULLETPROOF TESTING HACK 🚀
  
  // 1. Secretly store the newest version of the command function in a Ref
 /*  const latestCommandRef = useRef(handleVoiceCommand);
  useEffect(() => {
    latestCommandRef.current = handleVoiceCommand;
  }, [handleVoiceCommand]);

  // 2. Run the timer exactly ONE time so it never restarts
  useEffect(() => {
    let index = 0; 
    const hackInterval = setInterval(() => {
      if (index < RECOGNITION_LIST.length) {
        // Use the ref instead of the raw function!
        latestCommandRef.current(RECOGNITION_LIST[index]);
        index++;
      } else {
        clearInterval(hackInterval);
      }
    }, 200); 
    
    return () => clearInterval(hackInterval);
  }, []); */

  const statesCount = US_STATES.filter(state => remainingItems.has(state)).length;
  const capitalsCount = CAPITALS.filter(cap => remainingItems.has(cap)).length;
  
  const itemsLeftToFind = gameMode === 'erase' 
    ? remainingItems.size 
    : RECOGNITION_LIST.length - remainingItems.size;

  const isGameOver = gameStarted && itemsLeftToFind === 0;
  
  useEffect(() => {
    let fireworksSound;
    let cheersSound;

    if (isGameOver) {
		fireworksSound = new Audio(`${import.meta.env.BASE_URL}r3f/music/fireworks.mp3`);
		cheersSound = new Audio(`${import.meta.env.BASE_URL}r3f/music/cheers.mp3`);

      fireworksSound.loop = true;
      cheersSound.loop = true;
      fireworksSound.volume = 0.7; 
      cheersSound.volume = 0.5;

      fireworksSound.play().catch(err => console.log("Browser blocked auto-play:", err));
      cheersSound.play().catch(err => console.log("Browser blocked auto-play:", err));
    }

    return () => {
      if (fireworksSound) {
        fireworksSound.pause();
        fireworksSound.currentTime = 0;
      }
      if (cheersSound) {
        cheersSound.pause();
        cheersSound.currentTime = 0;
      }
    };
  }, [isGameOver]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {isGameOver && (
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 99999, pointerEvents: 'none' }}>
          <Confetti 
            width={window.innerWidth} 
            height={window.innerHeight} 
            numberOfPieces={800} 
            recycle={false}      
            gravity={0.15}       
            initialVelocityY={20} 
          />
        </div>
      )}
      <Leva hidden />
      
      <AppUI 
        isGameActive={gameStarted && itemsLeftToFind > 0} 
        time={time} 
        statesCount={statesCount}
        capitalsCount={capitalsCount}
        totalStates={US_STATES.length}
        totalCapitals={CAPITALS.length}
        feedbackText={isGameOver ? "✨ EXPLORER COMPLETE! ✨" : micStatus}
        gameMode={gameMode}             
        onToggleMode={toggleGameMode}   
        onResetMic={forceMicReset}
        remainingItems={remainingItems} 
        allStates={US_STATES}
        allCapitals={CAPITALS}
      />
      
      <SpeechController 
        key={micResetKey} 
        onCommandDetected={handleVoiceCommand} 
        onStatusChange={setMicStatus} 
      />

      <Canvas style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <PerspectiveCamera makeDefault fov={35} position={[0, 0, 1]} far={2000} />
        <ambientLight intensity={1.5} />       
        <directionalLight position={[0, 0, 1]} intensity={2.5} />
        <SceneBackground />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Suspense fallback={null}>
          <WorldModel 
            targetRegion={targetRegion} 
            setTargetRegion={setTargetRegion} 
            remainingItems={remainingItems} 
            usStatesList={US_STATES} 
          />
        </Suspense>
      </Canvas>
      
      <Canvas style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, pointerEvents: 'none' }}>
        {/* 💡 Pass down gameStarted to control the reset naturally */}
        <SandalsManager remainingCount={itemsLeftToFind} gameStarted={gameStarted} />
      </Canvas>
      
    </div>
  );
}
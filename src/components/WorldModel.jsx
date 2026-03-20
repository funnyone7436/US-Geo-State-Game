import React, { useMemo, useRef, useEffect, useState } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { useControls, button } from 'leva'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import StateLabels from './StateLabels';

const DEFAULT_ROT = { x: -34.3, y: 171.9, z: -5.7 };

const MAP_PALETTE = [
  '#1E6F9F', '#0097B2', '#21ADD1', '#54C8C6', '#ADC753', 
  '#E6D661', '#FBE570', '#F3936F', '#E63D80', '#AC1C9D',
  '#3E3F92', '#2A5296', '#0F7BA2', '#00A89C', '#64B248', 
  '#9EAB43', '#CDA656', '#CC704F', '#DD546E', '#C21D8F',
  '#7A2E8B', '#5A3386', '#1F4776', '#148177', '#469168', 
  '#769C3E', '#BC9C34', '#C19358', '#C35A55', '#B52857'
]

function Explosion({ position, onComplete }) {
  const groupRef = useRef();
  const particleCount = 100; 
  const [life, setLife] = useState(1.0);

  const velocities = useMemo(() => {
    return Array.from({ length: particleCount }, () => ({
      direction: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize(),
      speed: Math.random() * 0.15 + 0.04,
      color: ['#ffffff', '#ffeb3b', '#ff9800'][Math.floor(Math.random() * 3)]
    }));
  }, []);

  useFrame((state, delta) => {
    setLife((prev) => prev - delta * 0.4); 
    if (life <= 0) {
      onComplete();
    } else if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const { direction, speed } = velocities[i];
        child.position.addScaledVector(direction, speed);
        child.scale.setScalar(life * 0.15); 
        if (child.material) child.material.opacity = life;
      });
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: particleCount }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 8, 8]} /> 
          <meshStandardMaterial 
            color={velocities[i].color} 
            emissive={velocities[i].color}
            emissiveIntensity={2}
            transparent 
            depthTest={false} 
          />
        </mesh>
      ))}
    </group>
  );
}

export default function WorldModel({ targetRegion, setTargetRegion, remainingItems, usStatesList }) {
  const baseUrl = import.meta.env?.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}`;
  const objPath = `${cleanBase}glb/earth_named_features.obj`;
  const colorsFilePath = `${cleanBase}r3f/map_colors.txt`;
  
  const obj = useLoader(OBJLoader, objPath)
  const groupRef = useRef()
  const selectedMeshRef = useRef(null)
  const customColorsRef = useRef({}) 
  const [explosions, setExplosions] = useState([]); 
  const sweepTimer = useRef(0);

  const [{ rotX, rotY, rotZ }, setRotation] = useControls('Map Orientation', () => ({
    rotX: { value: -34.3, min: -360, max: 360, step: 0.1, label: 'X (Tilt)' },
    rotY: { value: 171.9, min: -360, max: 360, step: 0.1, label: 'Y (Spin)' },
    rotZ: { value: -5.7, min: -360, max: 360, step: 0.1, label: 'Z (Roll)' },
    'Reset Default': button(() => setRotation({ rotX: -34.3, rotY: 171.9, rotZ: -5.7 }))
  }))

  const [, setRegionControls] = useControls('Region Editor', () => ({
    'Selected Area': { value: 'None', editable: false },
    'Area Color': {
      value: '#ffffff',
      onChange: (color) => {
        if (selectedMeshRef.current) {
          selectedMeshRef.current.material.color.set(color);
          customColorsRef.current[selectedMeshRef.current.name] = color;
        }
      }
    },
    'Save Colors (TXT)': button(() => {
      const data = JSON.stringify(customColorsRef.current, null, 2);
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'map_colors.txt';
      link.click();
      URL.revokeObjectURL(url);
    })
  }))

  useEffect(() => {
    if (!targetRegion) return;
    const regions = {
      CA: ['California', 'Sacramento'], OR: ['Oregon', 'Salem'], WA: ['Washington', 'Olympia'],
      NV: ['Nevada', 'Carson_City'], UT: ['Utah', 'Salt_Lake_City'], AZ: ['Arizona', 'Phoenix'],
      MT: ['Montana', 'Helena'], WY: ['Wyoming', 'Cheyenne'], ID: ['Idaho', 'Boise'],
      CO: ['Colorado', 'Denver'], NM: ['New_Mexico', 'Santa_Fe'], TX: ['Texas', 'Austin'],
      OK: ['Oklahoma', 'Oklahoma_City'], SD: ['South_Dakota', 'Pierre'], ND: ['North_Dakota', 'Bismarck'],
      MN: ['Minnesota', 'St._Paul'], MO: ['Missouri', 'Jefferson_City'], NE: ['Nebraska', 'Lincoln'],
      IA: ['Iowa', 'Des_Moines'], KS: ['Kansas', 'Topeka'], IL: ['Illinois', 'Springfield'],
      AR: ['Arkansas', 'Little_Rock'], LA: ['Louisiana', 'Baton_Rouge'], MS: ['Mississippi', 'Jackson'],
      AL: ['Alabama', 'Montgomery'], TN: ['Tennessee', 'Nashville'], KY: ['Kentucky', 'Frankfort'],
      NC: ['North_Carolina', 'Raleigh'], SC: ['South_Carolina', 'Columbia'], GA: ['Georgia', 'Atlanta'],
      FL: ['Florida', 'Tallahassee'], WI: ['Wisconsin', 'Madison'], IN: ['Indiana', 'Indianapolis'],
      MI: ['Michigan', 'Lansing'], OH: ['Ohio', 'Columbus'], NJ: ['New_Jersey', 'Trenton'],
      VA: ['Virginia', 'Richmond'], WV: ['West_Virginia', 'Charleston'], MD: ['Maryland', 'Annapolis'],
      DC: ['Washington_DC'], DE: ['Delaware', 'Dover'], PA: ['Pennsylvania', 'Harrisburg'],
      NY: ['New_York', 'Albany'], VT: ['Vermont', 'Montpelier'], CT: ['Connecticut', 'Hartford'],
      RI: ['Rhode_Island', 'Providence'], MA: ['Massachusetts', 'Boston'], NH: ['New_Hampshire', 'Concord'],
      ME: ['Maine', 'Augusta'], AK: ['Alaska', 'Juneau'], HI: ['Hawaii', 'Honolulu']
    };

    const is = (key) => regions[key].some(r => r.toLowerCase() === targetRegion.toLowerCase()); 

    if (is('CA')) setRotation({ rotX: -36.5, rotY: 151.7, rotZ: -5.7 });
    else if (is('OR')) setRotation({ rotX: -38.5, rotY: 151.7, rotZ: -5.7 });
    else if (is('WA')) setRotation({ rotX: -40.5, rotY: 151.7, rotZ: -5.7 });
    else if (is('NV')) setRotation({ rotX: -36.5, rotY: 156.7, rotZ: -5.7 });
    else if (is('UT')) setRotation({ rotX: -36.5, rotY: 160.7, rotZ: -5.7 });
    else if (is('AZ')) setRotation({ rotX: -36.5, rotY: 162.7, rotZ: -5.7 });
    else if (is('MT')) setRotation({ rotX: -40.8, rotY: 164.7, rotZ: -5.7 });
    else if (is('WY')) setRotation({ rotX: -40.8, rotY: 166.7, rotZ: -5.7 });
    else if (is('ID')) setRotation({ rotX: -40.8, rotY: 162.7, rotZ: -5.7 });
    else if (is('CO')) setRotation({ rotX: -34.8, rotY: 168.7, rotZ: -5.7 });
    else if (is('NM')) setRotation({ rotX: -32.8, rotY: 170.7, rotZ: -5.7 });
    else if (is('TX')) setRotation({ rotX: -29.8, rotY: 172.7, rotZ: -5.7 });
    else if (is('OK')) setRotation({ rotX: -34.8, rotY: 174.7, rotZ: -5.7 });
    else if (is('SD')) setRotation({ rotX: -40.8, rotY: 176.7, rotZ: -5.7 });
    else if (is('ND')) setRotation({ rotX: -44.8, rotY: 175.7, rotZ: -5.7 });
    else if (is('MN')) setRotation({ rotX: -42.8, rotY: 183.7, rotZ: -5.7 });
    else if (is('IA')) setRotation({ rotX: -38.3, rotY: 183.7, rotZ: -5.7 });
    else if (is('MO')) setRotation({ rotX: -36.3, rotY: 183.7, rotZ: -5.7 });
    else if (is('NE')) setRotation({ rotX: -39.3, rotY: 176.7, rotZ: -5.7 });
    else if (is('KS')) setRotation({ rotX: -34.3, rotY: 178.7, rotZ: -5.7 });
    else if (is('IL')) setRotation({ rotX: -38.3, rotY: 183.7, rotZ: -5.7 });
    else if (is('AR')) setRotation({ rotX: -35.3, rotY: 183.9, rotZ: -5.7 });
    else if (is('LA')) setRotation({ rotX: -31.3, rotY: 183.9, rotZ: -5.7 });
    else if (is('MS')) setRotation({ rotX: -33.3, rotY: 183.9, rotZ: -5.7 });
    else if (is('AL')) setRotation({ rotX: -33.3, rotY: 187.9, rotZ: -5.7 });
    else if (is('TN')) setRotation({ rotX: -37.3, rotY: 183.9, rotZ: -5.7 });
    else if (is('KY')) setRotation({ rotX: -38.3, rotY: 184.9, rotZ: -5.7 });
    else if (is('NC')) setRotation({ rotX: -36.3, rotY: 194.0, rotZ: -5.7 });
    else if (is('SC')) setRotation({ rotX: -34.3, rotY: 193.0, rotZ: -5.7 });
    else if (is('GA')) setRotation({ rotX: -32.3, rotY: 192.0, rotZ: -5.7 });
    else if (is('FL')) setRotation({ rotX: -30.3, rotY: 192.0, rotZ: -5.7 });
    else if (is('WI')) setRotation({ rotX: -42.3, rotY: 182.9, rotZ: -5.7 });
    else if (is('IN')) setRotation({ rotX: -39.3, rotY: 184.9, rotZ: -5.7 });
    else if (is('MI')) setRotation({ rotX: -40.3, rotY: 184.9, rotZ: -5.7 });
    else if (is('OH')) setRotation({ rotX: -39.3, rotY: 186.9, rotZ: -5.7 });
    else if (is('NJ')) setRotation({ rotX: -40.3, rotY: 200.0, rotZ: -5.7 });
    else if (is('VA')) setRotation({ rotX: -38.3, rotY: 194.0, rotZ: -5.7 });
    else if (is('WV')) setRotation({ rotX: -38.3, rotY: 188.0, rotZ: -5.7 });
    else if (is('MD')) setRotation({ rotX: -38.3, rotY: 195.0, rotZ: -5.7 });
    else if (is('DE')) setRotation({ rotX: -38.3, rotY: 198.0, rotZ: -5.7 });
    else if (is('DC')) setRotation({ rotX: -38.3, rotY: 196.5, rotZ: -5.7 }); 
    else if (is('PA')) setRotation({ rotX: -40.3, rotY: 196.0, rotZ: -5.7 });
    else if (is('NY')) setRotation({ rotX: -43.3, rotY: 198.0, rotZ: -5.7 });
    else if (is('VT')) setRotation({ rotX: -45.3, rotY: 199.0, rotZ: -5.7 });
    else if (is('CT')) setRotation({ rotX: -43.3, rotY: 199.0, rotZ: -5.7 });
    else if (is('RI')) setRotation({ rotX: -42.3, rotY: 196.0, rotZ: -5.7 });
    else if (is('MA')) setRotation({ rotX: -44.3, rotY: 200.0, rotZ: -5.7 });
    else if (is('NH')) setRotation({ rotX: -45.3, rotY: 200.0, rotZ: -5.7 });
    else if (is('ME')) setRotation({ rotX: -45.3, rotY: 202.0, rotZ: -5.7 });
    else if (is('AK')) setRotation({ rotX: -56.7, rotY: 120.3, rotZ: -5.7 });
    else if (is('HI')) setRotation({ rotX: -34.9, rotY: 120.3, rotZ: 19.0 });
    else setRotation({ rotX: -34.3, rotY: 171.9, rotZ: -5.7 });
  }, [targetRegion, setRotation]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, THREE.MathUtils.degToRad(rotX), 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, THREE.MathUtils.degToRad(rotY), 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, THREE.MathUtils.degToRad(rotZ), 0.1);
    }

    if (selectedMeshRef.current) {
      sweepTimer.current += delta * 3;
      const intensity = Math.sin(sweepTimer.current) * 1.2 + 1.3; 
      selectedMeshRef.current.material.emissiveIntensity = intensity;
    }
  });

  useEffect(() => {
    const fetchSavedColors = async () => {
      try {
        const response = await fetch(colorsFilePath);
        if (response.ok) {
          const parsedData = await response.json();
          customColorsRef.current = parsedData;
          obj.traverse((child) => {
            if (child.isMesh && parsedData[child.name]) {
              child.material.color.set(parsedData[child.name]);
              child.userData.originalHex = parsedData[child.name];
            }
          });
        }
      } catch (e) { console.error("Could not load map_colors.txt", e); }
    };
    fetchSavedColors();
  }, [obj, colorsFilePath]);

  useMemo(() => {
    obj.traverse((child) => {
      if (child.isMesh) {
        if (!child.name) child.name = `Region_${Math.random()}`;
        if (!child.userData.initialized) {
          child.geometry.computeBoundingBox();
          const box = child.geometry.boundingBox;
          const seed = Math.abs(Math.sin((box.min.x * 12.98) + (child.id * 1.618)) * 43758.54);
          const baseColorHex = MAP_PALETTE[Math.floor(seed) % MAP_PALETTE.length];
          child.userData.originalHex = baseColorHex;
          child.userData.initialized = true;
          child.material = new THREE.MeshStandardMaterial({
            color: baseColorHex, 
			roughness: 0.9, 
			metalness: 0.05, 
			side: THREE.DoubleSide
          });
        }
      }
    })
  }, [obj])

  useEffect(() => {
    if (!targetRegion || !obj) return;
    let targetMesh = null;
    obj.traverse((child) => {
      if (child.isMesh && child.name.toLowerCase() === targetRegion.toLowerCase()) {
        targetMesh = child;
      }
    });

    if (targetMesh && groupRef.current) {
      if (selectedMeshRef.current) {
        selectedMeshRef.current.material.emissive.setHex(0x000000);
        selectedMeshRef.current.material.emissiveIntensity = 1;
      }
      targetMesh.material.emissive.setHex(0xffffff); 
      selectedMeshRef.current = targetMesh;

      setRegionControls({ 
        'Selected Area': targetMesh.name,
        'Area Color': '#' + targetMesh.material.color.getHexString() 
      });

      targetMesh.geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      targetMesh.geometry.boundingBox.getCenter(center);
      obj.updateMatrixWorld(true);
      center.applyMatrix4(targetMesh.matrixWorld);
      groupRef.current.worldToLocal(center);
      
      setExplosions((prev) => [...prev, { id: Date.now(), pos: center }]);
    }
  }, [targetRegion, obj, setRegionControls]);

  const onClick = (e) => {
    e.stopPropagation();
    setTargetRegion(e.object.name);
  }

	return (
	  <group 
		ref={groupRef} 
		rotation={[
		  THREE.MathUtils.degToRad(DEFAULT_ROT.x),
		  THREE.MathUtils.degToRad(DEFAULT_ROT.y),
		  THREE.MathUtils.degToRad(DEFAULT_ROT.z)
		]}
	  >			 
		<primitive object={obj} scale={0.5} onClick={onClick} onPointerMissed={() => setTargetRegion(null)} />
		
		{/* Clean, efficient labels component */}
		<StateLabels 
		  obj={obj} 
		  remainingItems={remainingItems} 
		  targetRegion={targetRegion} 
		  setTargetRegion={setTargetRegion}
		  usStatesList={usStatesList}
		/>

		{explosions.map((ex) => (
		  <Explosion 
			key={ex.id} 
			position={ex.pos} 
			onComplete={() => setExplosions(prev => prev.filter(e => e.id !== ex.id))} 
		  />
		))}
	  </group>
	);
}
import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function NodesAndLines({ count = 80 }) {
  const points = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015
      )
    }));
  }, [count]);

  const linesGeometry = useRef();
  const nodesRef = useRef();

  useFrame(() => {
    // Update positions
    points.forEach(p => {
      p.position.add(p.velocity);
      // Boundary check
      if (Math.abs(p.position.x) > 9) p.velocity.x *= -1;
      if (Math.abs(p.position.y) > 9) p.velocity.y *= -1;
      if (Math.abs(p.position.z) > 9) p.velocity.z *= -1;
    });

    // Update lines
    const positions = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = points[i].position.distanceTo(points[j].position);
        if (dist < 4.5) {
          positions.push(
            points[i].position.x, points[i].position.y, points[i].position.z,
            points[j].position.x, points[j].position.y, points[j].position.z
          );
        }
      }
    }
    
    if (linesGeometry.current) {
        linesGeometry.current.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        );
        linesGeometry.current.attributes.position.needsUpdate = true;
    }
    
    // Update nodes
    if (nodesRef.current) {
        const dummy = new THREE.Object3D();
        points.forEach((p, i) => {
            dummy.position.copy(p.position);
            dummy.updateMatrix();
            nodesRef.current.setMatrixAt(i, dummy.matrix);
        });
        nodesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={nodesRef} args={[null, null, count]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#C5A028" emissive="#C5A028" emissiveIntensity={0.25} roughness={0.2} metalness={0.8} />
      </instancedMesh>
      <lineSegments>
        <bufferGeometry ref={linesGeometry} />
        <lineBasicMaterial color="#222222" transparent opacity={0.2} linewidth={1} />
      </lineSegments>
    </>
  );
}

export default function NetworkVisualization() {
  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
        <NodesAndLines />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.4} enablePan={false} />
        <fog attach="fog" args={['#FDFBF7', 12, 30]} />
      </Canvas>
    </div>
  );
}

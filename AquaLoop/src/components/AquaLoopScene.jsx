import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAquaLoopData } from '../hooks/useAquaLoopData';

// Generate curved paths for pipes
const pipeHigh = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(1, -1, -2),
    new THREE.Vector3(3, -1, -3)
]);

const pipeUtility = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(2, -1, 0),
    new THREE.Vector3(4, -1, 0)
]);

const pipeDischarge = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(1, -1, 2),
    new THREE.Vector3(3, -1, 3)
]);

function PathPipe({ curve, active, color }) {
    const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 20, 0.08, 8, false), [curve]);
    return (
        <mesh geometry={tubeGeo} castShadow receiveShadow>
            <meshStandardMaterial
                color={color}
                opacity={active ? 0.9 : 0.2}
                transparent
                metalness={0.2}
                roughness={0.4}
            />
        </mesh>
    );
}

function FlowDroplets({ curve, active, speed = 1, color }) {
    const drops = useRef([...Array(3)].map(() => ({ t: Math.random() })));
    const groupRef = useRef();

    useFrame((state, delta) => {
        if (!active) {
            groupRef.current.visible = false;
            return;
        }
        groupRef.current.visible = true;
        drops.current.forEach((drop, i) => {
            drop.t = (drop.t + delta * speed * 0.5) % 1;
            const pos = curve.getPointAt(drop.t);
            const child = groupRef.current.children[i];
            if (child) {
                child.position.copy(pos);
            }
        });
    });

    return (
        <group ref={groupRef}>
            {drops.current.map((_, i) => (
                <mesh key={i} castShadow>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                </mesh>
            ))}
        </group>
    );
}

function SensingTank({ reading }) {
    const waterRef = useRef();
    const materialRef = useRef();
    const targetHeight = useRef(0.5);

    // Target color based on class
    const getTargetColor = () => {
        if (!reading) return new THREE.Color("#60A5FA"); // Default blue
        if (reading.class === 'min') return new THREE.Color("#60A5FA"); // blue-400
        if (reading.class === 'med') return new THREE.Color("#F59E0B"); // amber-500
        return new THREE.Color("#EF4444"); // red-500
    };

    useFrame((state, delta) => {
        if (reading) {
            // Animate pseudo-volume slightly fluctuating
            const noise = Math.sin(state.clock.elapsedTime * 2) * 0.05;
            targetHeight.current = Math.min(Math.max(0.2, 0.5 + noise + (reading.inFlowLpm - reading.outFlowLpm)), 0.9);
        }

        // Lerp water scale and position
        if (waterRef.current) {
            waterRef.current.scale.y = THREE.MathUtils.lerp(waterRef.current.scale.y, targetHeight.current, 0.1);
            waterRef.current.position.y = (waterRef.current.scale.y - 1) / 2; // Keep base at bottom
        }

        // Lerp water color
        if (materialRef.current) {
            materialRef.current.color.lerp(getTargetColor(), 0.05);
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* Outer Glass Tank */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1, 1, 2, 32]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.15}
                    roughness={0.05}
                    metalness={0.1}
                    transmission={0.9}
                    thickness={0.2}
                    depthWrite={false}
                />
            </mesh>

            {/* Inner Water Volume */}
            <mesh ref={waterRef} position={[0, -0.5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.95, 0.95, 2, 32]} />
                <meshStandardMaterial ref={materialRef} transparent opacity={0.6} roughness={0.1} />
            </mesh>

            {/* Inflow Pipe */}
            <mesh position={[-1.5, 0.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
                <meshStandardMaterial color="#888" metalness={0.4} roughness={0.4} />
            </mesh>
        </group>
    );
}

function DestinationTank({ position, label, color, active, reading }) {
    const materialRef = useRef();
    const waterRef = useRef();
    const currentVolume = useRef(0);
    const lastBatch = useRef(null);

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
                materialRef.current.emissiveIntensity,
                active ? 0.6 : 0.2, // increased base glow so it's always slightly visible
                0.1
            );
        }

        // Reset if batch changes
        if (reading && reading.batchNo !== lastBatch.current) {
            lastBatch.current = reading.batchNo;
            currentVolume.current = 0;
        }

        if (active && reading) {
            // Accelerate volume continuously at 60fps (Liters per sec * delta * 60x multiplier)
            // This ensures a 5L batch fills up visually in roughly 5-6 seconds when mock data is ~0.8 LPM
            currentVolume.current += (reading.inFlowLpm / 60) * delta * 60.0;

            // Visual Fill Threshold: Full Tank reached, reset flush!
            if (currentVolume.current >= 5.0) {
                currentVolume.current = 0;
            }
        }

        if (waterRef.current) {
            // Raise minimum scale to 0.05 to avoid three.js degenerate normal black-artifacting
            const fillRatio = Math.min(Math.max(currentVolume.current / 5.0, 0.05), 1.0);
            waterRef.current.scale.y = THREE.MathUtils.lerp(waterRef.current.scale.y, fillRatio, 0.1);

            // Base cylinder is height 1.4, centered at 0. Bottom is -0.7.
            // Map the position so that the bottom stays fixed at -0.7
            waterRef.current.position.y = -0.7 + (1.4 * waterRef.current.scale.y) / 2;
        }
    });

    return (
        <group position={position}>
            {/* Glass Tank Shell */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.8, 0.8, 1.5, 32]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.15}
                    roughness={0.05}
                    metalness={0.1}
                    transmission={0.9}
                    thickness={0.2}
                    depthWrite={false}
                />
            </mesh>

            {/* Inner Water Volume */}
            <mesh ref={waterRef} position={[0, -0.7, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.78, 0.78, 1.4, 32]} />
                <meshStandardMaterial
                    ref={materialRef}
                    color={color}
                    emissive={color}
                    transparent
                    opacity={0.85} // Boosted to make water highly visible
                />
            </mesh>

            <Html position={[0, 1.2, 0]} center zIndexRange={[100, 0]}>
                <div className={`font-heading text-xs font-bold uppercase tracking-widest px-2 py-1 rounded backdrop-blur border transition-colors ${active ? 'bg-primary/5 text-primary border-primary/20' : 'bg-transparent text-text-dark/40 border-transparent'}`}>
                    {label}
                </div>
            </Html>
        </group>
    );
}

export default function AquaLoopScene() {
    const { latestByProcess } = useAquaLoopData();
    const reading = latestByProcess['processA'];

    const activeMin = reading?.class === 'min';
    const activeMed = reading?.class === 'med';
    const activeMax = reading?.class === 'max';
    const flowSpeed = reading ? reading.inFlowLpm * 2 : 1;

    return (
        <div className="w-full h-full bg-white relative rounded-[2rem] overflow-hidden border border-text-dark/20 shadow-sm">
            <Canvas camera={{ position: [5, 4, 8], fov: 45 }} shadows>
                <color attach="background" args={['#ffffff']} />

                <ambientLight intensity={0.6} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1.0}
                    color="#ffffff"
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <pointLight position={[-5, 5, -5]} intensity={0.4} color="#60A5FA" />

                {/* Ground Plane to receive shadows */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                    <planeGeometry args={[50, 50]} />
                    <shadowMaterial opacity={0.06} />
                </mesh>

                <SensingTank reading={reading} />

                {/* Pipes */}
                <PathPipe curve={pipeHigh} active={activeMin} color="#60A5FA" />
                <PathPipe curve={pipeUtility} active={activeMed} color="#F59E0B" />
                <PathPipe curve={pipeDischarge} active={activeMax} color="#EF4444" />

                {/* Animated Drop Flow */}
                <FlowDroplets curve={pipeHigh} active={activeMin} speed={flowSpeed} color="#60A5FA" />
                <FlowDroplets curve={pipeUtility} active={activeMed} speed={flowSpeed} color="#F59E0B" />
                <FlowDroplets curve={pipeDischarge} active={activeMax} speed={flowSpeed} color="#EF4444" />

                {/* Destination Tanks */}
                <DestinationTank position={[3, -1.25, -3]} label="High-grade Reuse" color="#60A5FA" active={activeMin} reading={reading} />
                <DestinationTank position={[4, -1.25, 0]} label="Utility Loop" color="#F59E0B" active={activeMed} reading={reading} />
                <DestinationTank position={[3, -1.25, 3]} label="Treatment / Discharge" color="#EF4444" active={activeMax} reading={reading} />

                <OrbitControls
                    enableZoom={true}
                    minDistance={3}
                    maxDistance={15}
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2 + 0.1}
                />
            </Canvas>

            {/* 2D Overlay Elements */}
            <div className="absolute top-6 left-8 pointer-events-none">
                <h2 className="font-heading font-bold text-2xl text-primary tracking-tight">Real-Time Routing Engine</h2>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                    <span className="font-data text-xs text-text-dark/60 uppercase tracking-widest">Live 3D telemetry</span>
                </div>
            </div>

            {/* Sensor Data Overlay (Moved to side) */}
            <div className="absolute top-6 right-8 pointer-events-none">
                {reading ? (
                    <div className="bg-white/80 backdrop-blur-md border border-text-dark/10 text-text-dark p-6 rounded-[1.5rem] shadow-lg min-w-[240px]">
                        <h4 className="font-heading font-bold text-sm tracking-widest text-primary/80 mb-5 uppercase">Sensor Telemetry</h4>
                        <div className="space-y-4 font-data text-sm">
                            <div className="flex justify-between items-center border-b border-text-dark/5 pb-3">
                                <span className="opacity-60 text-xs uppercase tracking-wider">Turbidity</span>
                                <span className="font-bold text-lg text-accent">{reading.turbidity} <span className="text-xs opacity-50">NTU</span></span>
                            </div>
                            <div className="flex justify-between items-center border-b border-text-dark/5 pb-3">
                                <span className="opacity-60 text-xs uppercase tracking-wider">TDS</span>
                                <span className="font-bold text-lg text-accent">{reading.tds} <span className="text-xs opacity-50">ppm</span></span>
                            </div>
                            <div className="flex justify-between items-center border-b border-text-dark/5 pb-3">
                                <span className="opacity-60 text-xs uppercase tracking-wider">Temp</span>
                                <span className="font-bold text-lg">{reading.temp} <span className="text-xs opacity-50">°C</span></span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="opacity-60 text-xs uppercase tracking-wider">pH</span>
                                <span className="font-bold text-lg">{reading.ph}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-md border border-text-dark/10 p-4 rounded-[1.5rem] shadow-lg text-xs text-text-dark/60 font-heading">
                        Connecting to sensors...
                    </div>
                )}
            </div>

            <div className="absolute bottom-6 left-8 right-8 pointer-events-none flex justify-between items-end">
                <p className="font-heading text-sm text-text-dark/60 w-1/2">
                    Visualizing Lithography Rinse flows (processA). Drag to rotate camera. Scroll to zoom.
                </p>
                <div className="flex gap-4">
                    <div className={`w-8 h-2 rounded transition-colors ${activeMin ? 'bg-blue-400' : 'bg-text-dark/10'}`}></div>
                    <div className={`w-8 h-2 rounded transition-colors ${activeMed ? 'bg-amber-500' : 'bg-text-dark/10'}`}></div>
                    <div className={`w-8 h-2 rounded transition-colors ${activeMax ? 'bg-red-500' : 'bg-text-dark/10'}`}></div>
                </div>
            </div>
        </div>
    );
}

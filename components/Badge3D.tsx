'use client';

import * as THREE from 'three'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'

extend({ MeshLineGeometry, MeshLineMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: any;
    meshLineMaterial: any;
  }
}

useGLTF.preload('https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb')
useTexture.preload('https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/SOT1hmCesOHxEYxL7vkoZ/c57b29c85912047c414311723320c16b/band.jpg')

function Band({ badgeTextureUrl, format, maxSpeed = 50, minSpeed = 10 }: { badgeTextureUrl: string; format: 'formatA' | 'formatB'; maxSpeed?: number; minSpeed?: number }) {
  const band = useRef<any>(null), fixed = useRef<any>(null), j1 = useRef<any>(null), j2 = useRef<any>(null), j3 = useRef<any>(null), card = useRef<any>(null) // prettier-ignore
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3() // prettier-ignore
  const segmentProps = { type: 'dynamic' as const, canSleep: true, colliders: false as const, angularDamping: 2, linearDamping: 2 }

  const badgeTexture = useTexture(badgeTextureUrl || 'https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/SOT1hmCesOHxEYxL7vkoZ/c57b29c85912047c414311723320c16b/band.jpg')
  const { nodes, materials } = useGLTF('https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb') as any
  const texture = useTexture('images/Hacker-house.png')
  const { width, height } = useThree((state) => state.size)
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]))
  const [dragged, drag] = useState<any>(false)
  const [hovered, hover] = useState(false)

  // Fix the UV cropping and aspect ratio mapping based on the chosen format
  useEffect(() => {
    badgeTexture.colorSpace = THREE.SRGBColorSpace
    badgeTexture.matrixAutoUpdate = false
    badgeTexture.flipY = false

    if (format === 'formatA') {
      // Portrait format: map upright exactly
      badgeTexture.matrix.set(
        0, -1 / 0.7572, 1,
        -1, 0, 1,
        0, 0, 1
      )
    } else {
      // Landscape format: map sideways exactly
      badgeTexture.matrix.set(
        1, 0, 0,
        0, 1 / 0.7572, 0,
        0, 0, 1
      )
    }

    badgeTexture.wrapS = badgeTexture.wrapT = THREE.ClampToEdgeWrapping
    badgeTexture.needsUpdate = true
  }, [badgeTexture, format])

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 4]) // prettier-ignore
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 2.3, 0]]) // prettier-ignore

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => void (document.body.style.cursor = 'auto')
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    console.log("useFrame dragged:", dragged ? "active" : "inactive");
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
        ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z })
    }
    if (fixed.current) {
      // Fix most of the jitter when over pulling the card
      ;[j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
      })
      // Calculate catmul curve
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.lerped)
      curve.points[2].copy(j1.current.lerped)
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(32))
      // Tilt it back towards the screen
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
    }
  })

  curve.curveType = 'chordal'
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody position={[0, 4, 0]} ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type="dynamic">
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={[2.25, 2.25 * 1.273, 2.25]}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: any) => {
              try { (e.target as any).releasePointerCapture(e.pointerId); } catch (err) { }
              card.current?.setBodyType(0, true);
              drag(false);
            }}
            onPointerCancel={(e: any) => {
              try { (e.target as any).releasePointerCapture(e.pointerId); } catch (err) { }
              card.current?.setBodyType(0, true);
              drag(false);
            }}
            onPointerDown={(e: any) => {
              try { (e.target as any).setPointerCapture(e.pointerId); } catch (err) { }
              card.current?.setBodyType(2, true);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}>
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial map={badgeTexture} map-anisotropy={16} clearcoat={1} clearcoatRoughness={0.15} roughness={0.3} metalness={0.5} />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="white" depthTest={false} resolution={[width, height]} useMap map={texture} repeat={[-3, 1]} lineWidth={1} />
      </mesh>
    </>
  )
}

function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
      <div className="w-12 h-12 border-2 border-[#ffe500] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="font-mono-tech text-[10px] text-[#ffe500] uppercase tracking-widest font-bold">
        Loading 3D Badge…
      </p>
    </div>
  );
}

export default function Badge3D({
  textureUrl,
  format,
  onClose,
}: {
  textureUrl: string;
  format: 'formatA' | 'formatB';
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 w-full h-full bg-[#080808] touch-none">
      <Suspense fallback={<CanvasLoader />}>
        <Canvas camera={{ position: [0, 0, 9.4], fov: 25 }}>
          <ambientLight intensity={Math.PI} />
          <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
            <Band badgeTextureUrl={textureUrl} format={format} />
          </Physics>
          <Environment background blur={0.75}>
            <color attach="background" args={['#15151a']} />
            <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
          </Environment>
        </Canvas>
      </Suspense>

      <div className="absolute top-5 left-0 right-0 flex justify-center pointer-events-none z-50">
        <div className="bg-black/55 border border-[#148048]/50 px-4 py-1.5 rounded-full backdrop-blur-md">
          <p className="font-mono-tech text-[10px] text-[#ffe500] uppercase tracking-widest font-bold">
            🌴 Drag &amp; Swing Badge
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="absolute top-5 right-5 bg-[#ffe500] text-[#042616] font-mono-tech text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-full hover:scale-105 active:scale-95 transition cursor-pointer z-50 shadow-lg"
      >
        Share →
      </button>
    </div>
  );
}

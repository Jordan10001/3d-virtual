'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LoFiAudioSystem } from '@/lib/audio';
import { AgentRecord } from '@/lib/state';

interface OfficeCanvasProps {
  viewMode: 'iso' | 'step';
  activeRoom: string | null;
  onSelectEntity: (entityId: string) => void;
  audio: LoFiAudioSystem;
  onStatusChange: (statusText: string, isLive: boolean) => void;
  stepKeys?: { forward: boolean; backward: boolean; left: boolean; right: boolean };
}

export default function OfficeCanvas({
  viewMode,
  activeRoom,
  onSelectEntity,
  audio,
  onStatusChange,
}: OfficeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const charactersRef = useRef<Record<string, {
    group: THREE.Group;
    halo: THREE.Mesh;
    toolBadge: THREE.Mesh;
    armL: THREE.Mesh;
    armR: THREE.Mesh;
    waypoints: THREE.Vector3[];
    currentWpIdx: number;
    initialPos: THREE.Vector3;
    verifiedActive: boolean;
    activeTool: string | null;
    isNPC?: boolean;
  }>>({});

  const serverRoomLightRef = useRef<THREE.PointLight | null>(null);
  const holoRadarLightRef = useRef<THREE.PointLight | null>(null);
  const roomsRef = useRef<Record<string, { name: string; center: THREE.Vector3; camPos: THREE.Vector3 }>>({});
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    viewModeRef.current = viewMode;
    if (!controlsRef.current || !cameraRef.current) return;

    if (viewMode === 'step') {
      controlsRef.current.enabled = false;
      if (charactersRef.current.aaron) {
        const player = charactersRef.current.aaron.group;
        player.position.set(-14, 0, -7.5);
        player.rotation.set(0, 0, 0);
        const camOffset = new THREE.Vector3(0, 2.5, -4.5);
        cameraRef.current.position.copy(player.position.clone().add(camOffset));
        cameraRef.current.lookAt(player.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
      }
    } else {
      controlsRef.current.enabled = true;
      controlsRef.current.target.set(0, 0, 0);
      cameraRef.current.position.set(28, 28, 34);
      controlsRef.current.update();
    }
  }, [viewMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf2efe9);
    scene.fog = new THREE.FogExp2(0xf2efe9, 0.012);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.5, 200);
    cameraRef.current = camera;
    camera.position.set(28, 28, 34);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 2. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 10;
    controls.maxDistance = 75;
    controls.screenSpacePanning = true;
    controls.target.set(0, 0, 0);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.35);
    dirLight.position.set(35, 45, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -35;
    dirLight.shadow.camera.right = 35;
    dirLight.shadow.camera.top = 35;
    dirLight.shadow.camera.bottom = -35;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // High-Tech Server Room Lights (On the same floor!)
    const serverLight = new THREE.PointLight(0x00bbf9, 1.2, 16);
    serverLight.position.set(0, 2.5, -9);
    scene.add(serverLight);
    serverRoomLightRef.current = serverLight;

    const holoRadarLight = new THREE.PointLight(0x00f5d4, 1.4, 10);
    holoRadarLight.position.set(0, 1.5, -9);
    scene.add(holoRadarLight);
    holoRadarLightRef.current = holoRadarLight;

    // 4. Materials
    const M = {
      platformBase: new THREE.MeshStandardMaterial({ color: 0xd9d2c5, roughness: 0.7 }),
      floorSup: new THREE.MeshStandardMaterial({ color: 0xf5ded7, roughness: 0.5 }),
      floorLib: new THREE.MeshStandardMaterial({ color: 0xe2e6db, roughness: 0.6 }),
      floorServer: new THREE.MeshStandardMaterial({ color: 0x1e232d, roughness: 0.3, metalness: 0.4 }),
      floorEng: new THREE.MeshStandardMaterial({ color: 0xdde5ed, roughness: 0.55 }),
      floorCafe: new THREE.MeshStandardMaterial({ color: 0xf7e8d3, roughness: 0.5 }),
      floorGarden: new THREE.MeshStandardMaterial({ color: 0xdfdad0, roughness: 0.7 }),
      floorPlaza: new THREE.MeshStandardMaterial({ color: 0xeee7db, roughness: 0.5 }),

      wallInner: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }),
      wallGlass: new THREE.MeshPhysicalMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.25, roughness: 0.1, transmission: 0.85 }),
      woodDesk: new THREE.MeshStandardMaterial({ color: 0xc49a6c, roughness: 0.45 }),
      woodDark: new THREE.MeshStandardMaterial({ color: 0x5a3e2b, roughness: 0.5 }),
      metalTrim: new THREE.MeshStandardMaterial({ color: 0x8a929a, metalness: 0.7, roughness: 0.3 }),
      cushionPeach: new THREE.MeshStandardMaterial({ color: 0xf4a261, roughness: 0.9 }),
      cushionTeal: new THREE.MeshStandardMaterial({ color: 0x2a9d8f, roughness: 0.9 }),
      plantGreen: new THREE.MeshStandardMaterial({ color: 0x40916c, roughness: 0.6 }),
      potClay: new THREE.MeshStandardMaterial({ color: 0xd97757, roughness: 0.7 }),

      redPandaFur: new THREE.MeshStandardMaterial({ color: 0xc84c30, roughness: 0.6 }),
      bearFur: new THREE.MeshStandardMaterial({ color: 0x6f4e37, roughness: 0.7 }),
      beaverFur: new THREE.MeshStandardMaterial({ color: 0x7c5035, roughness: 0.6 }),
      foxFur: new THREE.MeshStandardMaterial({ color: 0xe07a5f, roughness: 0.6 }),
      owlFeather: new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.6 }),
      bunnyFur: new THREE.MeshStandardMaterial({ color: 0xfaf0ca, roughness: 0.5 }),
      catFur: new THREE.MeshStandardMaterial({ color: 0xe8d8c8, roughness: 0.5 }),
      otterFur: new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.6 }),
      whiteFur: new THREE.MeshStandardMaterial({ color: 0xfdfdfd, roughness: 0.5 }),
      darkNose: new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.3 }),

      clothesVest: new THREE.MeshStandardMaterial({ color: 0x3d5a80, roughness: 0.7 }),
      clothesYellow: new THREE.MeshStandardMaterial({ color: 0xf4d35e, roughness: 0.5 }),
      clothesLavender: new THREE.MeshStandardMaterial({ color: 0x9b5de5, roughness: 0.6 }),
      clothesApron: new THREE.MeshStandardMaterial({ color: 0x2ec4b6, roughness: 0.6 }),
      clothesScribe: new THREE.MeshStandardMaterial({ color: 0x457b9d, roughness: 0.7 }),
      holoCyan: new THREE.MeshBasicMaterial({ color: 0x00f5d4, wireframe: true }),
      serverNeon: new THREE.MeshBasicMaterial({ color: 0x00bbf9 }),
    };

    const createBox = (w: number, h: number, d: number, mat: THREE.Material, shadow = true) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.castShadow = shadow;
      mesh.receiveShadow = shadow;
      return mesh;
    };

    const buildPlant = (x: number, y: number, z: number, scale = 1.0) => {
      const pot = createBox(0.7 * scale, 0.7 * scale, 0.7 * scale, M.potClay);
      pot.position.set(x, y + 0.35 * scale, z);
      scene.add(pot);
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65 * scale, 1), M.plantGreen);
      foliage.castShadow = true;
      foliage.position.set(x, y + 0.95 * scale, z);
      scene.add(foliage);
    };

    // ============================================================
    // 5. SINGLE UNIFIED MAIN FLOOR PLATFORM (y = 0)
    // ============================================================
    const mainCampus = createBox(42, 0.8, 34, M.platformBase);
    mainCampus.position.set(0, -0.4, 0);
    scene.add(mainCampus);

    // Central Open Plaza Floor
    const plazaFloor = createBox(16, 0.81, 14, M.floorPlaza);
    plazaFloor.position.set(0, -0.39, 0);
    scene.add(plazaFloor);

    // Central Decorative Floor Medallion
    const centerMedallion = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.06, 32), M.floorSup);
    centerMedallion.position.set(0, 0.03, 0);
    scene.add(centerMedallion);

    const centerRing = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.1, 32), new THREE.MeshBasicMaterial({ color: 0xd4a373, side: THREE.DoubleSide }));
    centerRing.rotation.x = -Math.PI / 2;
    centerRing.position.set(0, 0.07, 0);
    scene.add(centerRing);

    // ROOM 1: SUPERVISOR SUITE (North-West Wing)
    const supFloor = createBox(12, 0.82, 12, M.floorSup);
    supFloor.position.set(-14, -0.39, -10);
    scene.add(supFloor);
    roomsRef.current.supervisor = { name: 'Supervisor Suite', center: new THREE.Vector3(-14, 0, -10), camPos: new THREE.Vector3(-14, 10, 2) };

    const supWallN = createBox(12.2, 3.8, 0.4, M.wallInner);
    supWallN.position.set(-14, 1.5, -16);
    const supWallW = createBox(0.4, 3.8, 12.2, M.wallInner);
    supWallW.position.set(-20, 1.5, -10);
    scene.add(supWallN, supWallW);

    const execDesk = createBox(3.4, 0.9, 1.8, M.woodDark);
    execDesk.position.set(-14, 0.45, -10);
    scene.add(execDesk);

    const mon1 = createBox(1.2, 0.7, 0.1, M.metalTrim);
    mon1.position.set(-14.4, 1.25, -10.3);
    mon1.rotation.y = 0.2;
    const mon2 = createBox(1.2, 0.7, 0.1, M.metalTrim);
    mon2.position.set(-13.2, 1.25, -10.3);
    mon2.rotation.y = -0.2;
    scene.add(mon1, mon2);

    buildPlant(-18.5, 0, -14, 1.2);

    // ROOM 2: SERVER ROOM & COORDINATION HUB (North Center Wing - SAME FLOOR!)
    const serverFloor = createBox(12, 0.82, 12, M.floorServer);
    serverFloor.position.set(0, -0.39, -10);
    scene.add(serverFloor);
    roomsRef.current.server = { name: 'Server Room & Coordination Hub', center: new THREE.Vector3(0, 0, -10), camPos: new THREE.Vector3(0, 10, 2) };

    const serverWallN = createBox(12.2, 3.8, 0.4, M.wallInner);
    serverWallN.position.set(0, 1.5, -16);
    scene.add(serverWallN);

    // Glass partitions on left and right of Server Room
    const glassL = createBox(0.2, 2.8, 12, M.wallGlass, false);
    glassL.position.set(-6, 1.4, -10);
    const glassR = createBox(0.2, 2.8, 12, M.wallGlass, false);
    glassR.position.set(6, 1.4, -10);
    scene.add(glassL, glassR);

    // Server Mainframe Racks on North Wall
    for (let x = -4; x <= 4; x += 2.6) {
      const rack = createBox(1.8, 3.2, 1.2, M.floorServer);
      rack.position.set(x, 1.6, -14.8);
      scene.add(rack);

      const neon = createBox(1.4, 2.4, 0.08, M.serverNeon);
      neon.position.set(x, 1.6, -14.15);
      scene.add(neon);
    }

    // Central Tactical Holographic Radar Table
    const tablePedestal = createBox(2.4, 0.85, 2.4, M.metalTrim);
    tablePedestal.position.set(0, 0.42, -9);
    scene.add(tablePedestal);

    const holoRings = new THREE.Mesh(new THREE.RingGeometry(0.8, 2.2, 32), M.holoCyan);
    holoRings.rotation.x = -Math.PI / 2;
    holoRings.position.set(0, 0.9, -9);
    scene.add(holoRings);

    // ROOM 3: ENGINEERING HUB & SPRINT INCUBATORS (North-East Wing)
    const engFloor = createBox(14, 0.82, 12, M.floorEng);
    engFloor.position.set(14, -0.39, -10);
    scene.add(engFloor);
    roomsRef.current.engineering = { name: 'Engineering Hub', center: new THREE.Vector3(14, 0, -10), camPos: new THREE.Vector3(14, 10, 2) };

    const engWallN = createBox(14.2, 3.8, 0.4, M.wallInner);
    engWallN.position.set(14, 1.5, -16);
    const engWallE = createBox(0.4, 3.8, 12.2, M.wallInner);
    engWallE.position.set(21, 1.5, -10);
    scene.add(engWallN, engWallE);

    // Desks for Jordan, Michael, Michelle
    const deskJordan = createBox(2.6, 0.85, 1.4, M.woodDesk);
    deskJordan.position.set(9.5, 0.42, -12);
    const deskMichael = createBox(2.6, 0.85, 1.4, M.woodDesk);
    deskMichael.position.set(14, 0.42, -12);
    const deskMichelle = createBox(2.6, 0.85, 1.4, M.woodDesk);
    deskMichelle.position.set(18.5, 0.42, -12);
    scene.add(deskJordan, deskMichael, deskMichelle);

    // Sprint Genesis Monitor (Bay Alpha)
    const incuDesk = createBox(2.8, 0.85, 1.4, M.woodDesk);
    incuDesk.position.set(18.5, 0.42, -6.5);
    scene.add(incuDesk);
    const incuScreen = createBox(1.6, 1.0, 0.1, M.serverNeon);
    incuScreen.position.set(18.5, 1.4, -6.8);
    scene.add(incuScreen);
    roomsRef.current.genesis = { name: 'Sprint Genesis Bay', center: new THREE.Vector3(18.5, 0, -6.5), camPos: new THREE.Vector3(18.5, 8, 3) };

    // Architecture Whiteboard
    const whiteboard = createBox(4.5, 2.2, 0.2, M.wallInner);
    whiteboard.position.set(13.5, 1.6, -15.7);
    scene.add(whiteboard);

    // Spinning 3D Wireframe Cube on Michelle's desk
    const holoCube = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), M.holoCyan);
    holoCube.position.set(18.5, 1.4, -12);
    scene.add(holoCube);

    // ROOM 4: KNOWLEDGE LIBRARY & ARCHIVES (South-West Wing)
    const libFloor = createBox(12, 0.82, 14, M.floorLib);
    libFloor.position.set(-14, -0.39, 6);
    scene.add(libFloor);
    roomsRef.current.library = { name: 'Knowledge Library', center: new THREE.Vector3(-14, 0, 6), camPos: new THREE.Vector3(-14, 10, 18) };

    const libWallW = createBox(0.4, 3.8, 14.2, M.wallInner);
    libWallW.position.set(-20, 1.5, 6);
    scene.add(libWallW);

    for (let z = 1; z <= 11; z += 2.5) {
      const shelf = createBox(1.2, 3.5, 2.2, M.woodDark);
      shelf.position.set(-19.2, 1.75, z);
      scene.add(shelf);
      const books = createBox(0.8, 0.45, 1.8, M.cushionPeach);
      books.position.set(-18.8, 1.5, z);
      scene.add(books);
    }

    const studyTable = createBox(4.5, 0.85, 2, M.woodDesk);
    studyTable.position.set(-13.5, 0.42, 6);
    scene.add(studyTable);

    // ROOM 5: CAFÉ LOUNGE (South Center Wing)
    const cafeFloor = createBox(14, 0.82, 14, M.floorCafe);
    cafeFloor.position.set(0, -0.39, 6);
    scene.add(cafeFloor);
    roomsRef.current.cafe = { name: 'Café Lounge', center: new THREE.Vector3(0, 0, 6), camPos: new THREE.Vector3(0, 10, 18) };

    const cafeBar = createBox(5.4, 1.1, 1.6, M.woodDark);
    cafeBar.position.set(0, 0.55, 4.5);
    scene.add(cafeBar);

    const espressoMachine = createBox(1.2, 0.8, 0.8, M.metalTrim);
    espressoMachine.position.set(-1.2, 1.3, 4.5);
    scene.add(espressoMachine);

    for (let x = -1.8; x <= 1.8; x += 1.2) {
      const stool = createBox(0.6, 0.65, 0.6, M.cushionPeach);
      stool.position.set(x, 0.32, 2.9);
      scene.add(stool);
    }

    // ROOM 6: ZEN GARDEN & ARCADE (South-East Wing)
    const gardenFloor = createBox(12, 0.82, 14, M.floorGarden);
    gardenFloor.position.set(14, -0.39, 6);
    scene.add(gardenFloor);
    roomsRef.current.garden = { name: 'Zen Garden & Arcade', center: new THREE.Vector3(14, 0, 6), camPos: new THREE.Vector3(14, 10, 18) };

    const arcade = createBox(1.3, 2.8, 1.3, M.clothesVest);
    arcade.position.set(18, 1.4, 2.5);
    scene.add(arcade);

    buildPlant(12, 0, 8, 1.5);
    buildPlant(16, 0, 9.5, 1.2);

    const bean1 = createBox(1.4, 0.5, 1.4, M.cushionTeal);
    bean1.position.set(11, 0.25, 5);
    const bean2 = createBox(1.4, 0.5, 1.4, M.cushionPeach);
    bean2.position.set(13.5, 0.25, 4.5);
    scene.add(bean1, bean2);

    // ============================================================
    // 6. CHARACTERS & NPCS (ALL ON THE SAME GROUND LEVEL y = 0)
    // ============================================================
    const interactables: THREE.Object3D[] = [];

    const buildChar = (config: {
      id: string;
      species: string;
      furMat: THREE.Material;
      clothMat: THREE.Material;
      initialPos: THREE.Vector3;
      waypoints: THREE.Vector3[];
      glasses?: boolean;
      hardhat?: boolean;
      monocle?: boolean;
      isNPC?: boolean;
    }) => {
      const root = new THREE.Group();
      root.userData = { id: config.id };

      const torso = createBox(0.9, 1.1, 0.7, config.clothMat);
      torso.position.y = 1.05;
      root.add(torso);

      const head = createBox(0.85, 0.8, 0.8, config.furMat);
      head.position.y = 1.95;
      root.add(head);

      const snout = createBox(0.4, 0.3, 0.25, M.whiteFur);
      snout.position.set(0, 1.85, 0.45);
      root.add(snout);

      const nose = createBox(0.15, 0.1, 0.1, M.darkNose);
      nose.position.set(0, 1.95, 0.55);
      root.add(nose);

      if (config.species === 'bunny') {
        const earL = createBox(0.2, 0.9, 0.15, config.furMat);
        earL.position.set(-0.25, 2.7, 0);
        const earR = createBox(0.2, 0.9, 0.15, config.furMat);
        earR.position.set(0.25, 2.7, 0);
        root.add(earL, earR);
      } else if (config.species === 'fox' || config.species === 'redpanda' || config.species === 'cat') {
        const earL = createBox(0.25, 0.35, 0.15, config.furMat);
        earL.position.set(-0.35, 2.4, 0);
        earL.rotation.z = -0.3;
        const earR = createBox(0.25, 0.35, 0.15, config.furMat);
        earR.position.set(0.35, 2.4, 0);
        earR.rotation.z = 0.3;
        root.add(earL, earR);
      } else {
        const earL = createBox(0.25, 0.25, 0.15, config.furMat);
        earL.position.set(-0.35, 2.35, 0);
        const earR = createBox(0.25, 0.25, 0.15, config.furMat);
        earR.position.set(0.35, 2.35, 0);
        root.add(earL, earR);
      }

      if (config.glasses) {
        const glasses = createBox(0.65, 0.15, 0.1, M.metalTrim);
        glasses.position.set(0, 2.0, 0.46);
        root.add(glasses);
      }
      if (config.hardhat) {
        const hat = createBox(0.95, 0.25, 0.95, M.clothesYellow);
        hat.position.set(0, 2.4, 0);
        root.add(hat);
      }
      if (config.monocle) {
        const mono = createBox(0.2, 0.2, 0.08, M.holoCyan);
        mono.position.set(0.2, 2.05, 0.46);
        root.add(mono);
      }

      const armL = createBox(0.28, 0.75, 0.28, config.furMat);
      armL.position.set(-0.6, 1.05, 0);
      const armR = createBox(0.28, 0.75, 0.28, config.furMat);
      armR.position.set(0.6, 1.05, 0);
      root.add(armL, armR);

      const legL = createBox(0.32, 0.5, 0.32, config.furMat);
      legL.position.set(-0.25, 0.25, 0);
      const legR = createBox(0.32, 0.5, 0.32, config.furMat);
      legR.position.set(0.25, 0.25, 0);
      root.add(legL, legR);

      const haloGeo = new THREE.RingGeometry(0.8, 1.05, 32);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0x2ec4b6, side: THREE.DoubleSide, transparent: true, opacity: 0 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = 0.05;
      root.add(halo);

      const toolBadgeGeo = new THREE.PlaneGeometry(1.6, 0.45);
      const toolBadgeMat = new THREE.MeshBasicMaterial({ color: 0x2ec4b6, transparent: true, opacity: 0 });
      const toolBadge = new THREE.Mesh(toolBadgeGeo, toolBadgeMat);
      toolBadge.position.y = 2.9;
      root.add(toolBadge);

      root.position.copy(config.initialPos);
      scene.add(root);
      interactables.push(root);

      charactersRef.current[config.id] = {
        group: root,
        halo,
        toolBadge,
        armL,
        armR,
        waypoints: config.waypoints,
        currentWpIdx: 0,
        initialPos: config.initialPos,
        verifiedActive: false,
        activeTool: null,
        isNPC: config.isNPC,
      };
    };

    // 1. Aaron (Supervisor)
    buildChar({
      id: 'aaron',
      species: 'redpanda',
      furMat: M.redPandaFur,
      clothMat: M.clothesVest,
      glasses: true,
      initialPos: new THREE.Vector3(-14, 0, -11.5),
      waypoints: [
        new THREE.Vector3(-14, 0, -11.5),
        new THREE.Vector3(-14, 0, -8),
        new THREE.Vector3(-7, 0, -5),
        new THREE.Vector3(0, 0, 0), // Walks to central plaza
        new THREE.Vector3(-14, 0, -11.5),
      ],
    });

    // 2. The Coordinator (Server Room & Coordination Hub - SAME FLOOR!)
    buildChar({
      id: 'coordinator',
      species: 'owl',
      furMat: M.owlFeather,
      clothMat: M.floorServer,
      monocle: true,
      initialPos: new THREE.Vector3(0, 0, -11.2),
      waypoints: [
        new THREE.Vector3(0, 0, -11.2),  // Behind tactical radar console
        new THREE.Vector3(-3.2, 0, -9.0), // Left server mainframe
        new THREE.Vector3(0, 0, -6.8),   // Front of holographic radar table
        new THREE.Vector3(3.2, 0, -9.0),  // Right server mainframe
        new THREE.Vector3(0, 0, -5.2),   // Near glass sliding entrance
        new THREE.Vector3(0, 0, -11.2),  // Return to console
      ],
    });

    // 3. Jordan (Backend Bear)
    buildChar({
      id: 'jordan',
      species: 'bear',
      furMat: M.bearFur,
      clothMat: M.cushionTeal,
      initialPos: new THREE.Vector3(9.5, 0, -13),
      waypoints: [
        new THREE.Vector3(9.5, 0, -13),
        new THREE.Vector3(13.5, 0, -14),
        new THREE.Vector3(0, 0, 2), // Walk to café
        new THREE.Vector3(9.5, 0, -13),
      ],
    });

    // 4. Michael (Database Beaver)
    buildChar({
      id: 'michael',
      species: 'beaver',
      furMat: M.beaverFur,
      clothMat: M.clothesVest,
      hardhat: true,
      initialPos: new THREE.Vector3(14, 0, -13),
      waypoints: [
        new THREE.Vector3(14, 0, -13),
        new THREE.Vector3(13.5, 0, -14),
        new THREE.Vector3(-13.5, 0, 6), // Walk to library
        new THREE.Vector3(14, 0, -13),
      ],
    });

    // 5. Michelle (Frontend Calico Fox)
    buildChar({
      id: 'michelle',
      species: 'fox',
      furMat: M.foxFur,
      clothMat: M.clothesLavender,
      initialPos: new THREE.Vector3(18.5, 0, -13),
      waypoints: [
        new THREE.Vector3(18.5, 0, -13),
        new THREE.Vector3(18.5, 0, -6.5),
        new THREE.Vector3(11, 0, 5), // Zen garden break
        new THREE.Vector3(18.5, 0, -13),
      ],
    });

    // NPC 1: Bunny Barista (Café)
    buildChar({
      id: 'barista',
      species: 'bunny',
      furMat: M.bunnyFur,
      clothMat: M.clothesApron,
      initialPos: new THREE.Vector3(0, 0, 5.8),
      waypoints: [
        new THREE.Vector3(0, 0, 5.8),
        new THREE.Vector3(1.8, 0, 5.8),
        new THREE.Vector3(-1.8, 0, 5.8),
      ],
      isNPC: true,
    });

    // NPC 2: Cat Scribe (Library)
    buildChar({
      id: 'scribe',
      species: 'cat',
      furMat: M.catFur,
      clothMat: M.clothesScribe,
      initialPos: new THREE.Vector3(-13.5, 0, 7),
      waypoints: [
        new THREE.Vector3(-13.5, 0, 7),
        new THREE.Vector3(-18, 0, 4),
        new THREE.Vector3(-18, 0, 9),
      ],
      isNPC: true,
    });

    // NPC 3: Otter Caretaker (Zen Garden)
    buildChar({
      id: 'caretaker',
      species: 'otter',
      furMat: M.otterFur,
      clothMat: M.cushionTeal,
      initialPos: new THREE.Vector3(14, 0, 8),
      waypoints: [
        new THREE.Vector3(14, 0, 8),
        new THREE.Vector3(16, 0, 9.5),
        new THREE.Vector3(12, 0, 8),
      ],
      isNPC: true,
    });

    // 7. Raycasting for Clicking Characters
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName !== 'CANVAS') return;
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactables, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData?.id && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.id) {
          onSelectEntity(obj.userData.id as string);
          audio.playChime(true);
        }
      }
    };

    window.addEventListener('click', handleClick);

    const onKeyDown = (e: KeyboardEvent) => {
      if (viewModeRef.current !== 'step') return;
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keysRef.current.forward = true;
      if (k === 's' || k === 'arrowdown') keysRef.current.backward = true;
      if (k === 'a' || k === 'arrowleft') keysRef.current.left = true;
      if (k === 'd' || k === 'arrowright') keysRef.current.right = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keysRef.current.forward = false;
      if (k === 's' || k === 'arrowdown') keysRef.current.backward = false;
      if (k === 'a' || k === 'arrowleft') keysRef.current.left = false;
      if (k === 'd' || k === 'arrowright') keysRef.current.right = false;
    };

    let isMouseDown = false;
    let prevMouseX = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (viewModeRef.current === 'step') {
        isMouseDown = true;
        prevMouseX = e.clientX;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (viewModeRef.current === 'step' && isMouseDown && charactersRef.current.aaron) {
        const deltaX = e.clientX - prevMouseX;
        prevMouseX = e.clientX;
        charactersRef.current.aaron.group.rotation.y -= deltaX * 0.006;
      }
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Register global mover for UI buttons / D-Pad
    const winWithMove = window as unknown as { __moveAaron?: (dir: 'forward' | 'backward' | 'left' | 'right', active: boolean) => void };
    winWithMove.__moveAaron = (dir, active) => {
      keysRef.current[dir] = active;
    };

    // 8. SSE Telemetry Stream Listener
    const evtSource = new EventSource('/api/events/stream');

    evtSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'init' && data.agentStates) {
          syncStates(data.agentStates);
        } else if (data.record) {
          const rec = data.record;
          onStatusChange(`Live: ${rec.agentDisplayName} -> ${rec.event} (${rec.toolName || ''})`, true);
          audio.playKeyClick();
          syncStates(data.agentStates);
          setTimeout(() => {
            onStatusChange('Status: Listening on POST /api/events', false);
          }, 4500);
        }
      } catch (err) {
        console.warn('SSE parse error:', err);
      }
    };

    function syncStates(states: Record<string, AgentRecord>) {
      for (const k in states) {
        const ag = states[k];
        const char = charactersRef.current[k];
        if (char) {
          char.verifiedActive = ag.verifiedActive;
          char.activeTool = ag.activeTool;
        }
      }
    }

    // 9. Animation Loop
    let lastTime = performance.now();
    let animId: number;

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const elapsedTime = currentTime / 1000;

      holoCube.rotation.x = elapsedTime;
      holoCube.rotation.y = elapsedTime * 1.3;
      holoRings.rotation.z = elapsedTime * 0.6;

      for (const key in charactersRef.current) {
        // Skip Aaron in Step Inside mode: he is controlled directly by the player!
        if (key === 'aaron' && viewModeRef.current === 'step') {
          continue;
        }

        const char = charactersRef.current[key];
        const group = char.group;

        if (char.verifiedActive) {
          (char.halo.material as THREE.MeshBasicMaterial).opacity = 0.8 + Math.sin(elapsedTime * 6) * 0.2;
          char.armL.rotation.x = Math.sin(elapsedTime * 12) * 0.35 + 0.5;
          char.armR.rotation.x = -Math.sin(elapsedTime * 12) * 0.35 + 0.5;
          continue;
        }

        (char.halo.material as THREE.MeshBasicMaterial).opacity = 0;
        group.position.y = char.initialPos.y + Math.sin(elapsedTime * 2.5 + group.position.x) * 0.03;
        char.armL.rotation.x = Math.sin(elapsedTime * 2) * 0.1;
        char.armR.rotation.x = -Math.sin(elapsedTime * 2) * 0.1;

        const targetWp = char.waypoints[char.currentWpIdx];
        const dx = targetWp.x - group.position.x;
        const dz = targetWp.z - group.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 0.15) {
          const dir = new THREE.Vector3(dx, 0, dz).normalize();
          group.position.x += dir.x * delta * 1.6;
          group.position.z += dir.z * delta * 1.6;
          group.lookAt(targetWp.x, group.position.y, targetWp.z);
          char.armL.rotation.x = Math.sin(elapsedTime * 8) * 0.45;
          char.armR.rotation.x = -Math.sin(elapsedTime * 8) * 0.45;
        } else if (Math.random() < 0.012) {
          char.currentWpIdx = (char.currentWpIdx + 1) % char.waypoints.length;
        }
      }

      // Step Inside Mode (WASD First/Third-Person Walking)
      if (viewModeRef.current === 'step' && charactersRef.current.aaron) {
        const player = charactersRef.current.aaron.group;
        const moveSpeed = 6.0 * delta;
        const rotSpeed = 3.0 * delta;

        if (keysRef.current.left) player.rotation.y += rotSpeed;
        if (keysRef.current.right) player.rotation.y -= rotSpeed;

        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
        const isMoving = keysRef.current.forward || keysRef.current.backward;

        if (keysRef.current.forward) player.position.addScaledVector(forward, moveSpeed);
        if (keysRef.current.backward) player.position.addScaledVector(forward, -moveSpeed * 0.65);

        player.position.x = Math.max(-19, Math.min(19, player.position.x));
        player.position.z = Math.max(-15, Math.min(15, player.position.z));

        if (isMoving) {
          charactersRef.current.aaron.armL.rotation.x = Math.sin(elapsedTime * 10) * 0.6;
          charactersRef.current.aaron.armR.rotation.x = -Math.sin(elapsedTime * 10) * 0.6;
        }

        const camOffset = new THREE.Vector3(0, 2.5, -4.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
        camera.position.lerp(player.position.clone().add(camOffset), 0.15);
        camera.lookAt(player.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
      } else {
        controls.update();
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      evtSource.close();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Room Camera Focuses
  useEffect(() => {
    if (!activeRoom || !roomsRef.current[activeRoom] || !controlsRef.current || !cameraRef.current) return;
    const room = roomsRef.current[activeRoom];

    const startTarget = controlsRef.current.target.clone();
    const startPos = cameraRef.current.position.clone();
    const endTarget = room.center.clone();
    const endPos = room.camPos.clone();

    let t = 0;
    const anim = () => {
      t += 0.05;
      controlsRef.current?.target.lerpVectors(startTarget, endTarget, Math.min(t, 1));
      cameraRef.current?.position.lerpVectors(startPos, endPos, Math.min(t, 1));
      controlsRef.current?.update();
      if (t < 1) requestAnimationFrame(anim);
    };
    anim();

    // Server Room Lighting Boost on select
    if (activeRoom === 'server' && serverRoomLightRef.current && holoRadarLightRef.current) {
      serverRoomLightRef.current.intensity = 2.4;
      holoRadarLightRef.current.intensity = 2.8;
    } else if (serverRoomLightRef.current && holoRadarLightRef.current) {
      serverRoomLightRef.current.intensity = 1.2;
      holoRadarLightRef.current.intensity = 1.4;
    }
  }, [activeRoom]);

  return (
    <div
      ref={mountRef}
      className="canvas-wrapper"
      style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }}
    />
  );
}

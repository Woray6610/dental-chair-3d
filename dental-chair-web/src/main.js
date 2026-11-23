import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { buildChair } from './model.js';
import { parts } from './parts.js';

const byId = id => document.getElementById(id);
const stage = byId('stage');
const canvas = stage.querySelector('canvas');
const notice = byId('notice');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const detached = new Set();
let selected = parts[0];
let headDetached = false;
let renderer;

try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
} catch {
  notice.textContent = 'เบราว์เซอร์เปิด WebGL ไม่ได้ ลองเปิดไฟล์ด้วย Chrome หรือ Edge ที่เปิดการเร่งกราฟิกไว้';
  notice.hidden = false;
}

if (renderer) start();

function start() {
  const { model, groups, lampHead } = buildChair();
  const homeHead = lampHead.position.clone();
  const removedHead = homeHead.clone().add(new THREE.Vector3(-.65, -.15, .75));
  const scene = new THREE.Scene();
  scene.add(model);
  const camera = new THREE.PerspectiveCamera(33, 1, .1, 55);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = !motionPreference.matches;
  controls.minPolarAngle = .24;
  controls.maxPolarAngle = Math.PI * .49;
  controls.minDistance = 3;
  controls.maxDistance = 22;

  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  scene.add(new THREE.HemisphereLight(0xf9fdff, 0x778d9b, 2.2));
  const key = new THREE.DirectionalLight(0xfff5e7, 2.55);
  key.position.set(-4, 7, 4);
  key.castShadow = true;
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 18 });
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.normalBias = .018;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xb5dfff, 2);
  rim.position.set(2, 4, -5);
  scene.add(rim);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.ShadowMaterial({ opacity: .19 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(28, 56, 0x9fbad0, 0x9fbad0);
  grid.material.transparent = true;
  grid.material.opacity = .23;
  grid.material.depthWrite = false;
  grid.position.y = .004;
  scene.add(grid);

  const rows = new Map();
  const markers = new Map();
  const offsets = new Map();
  const lines = new Map();
  for (const part of parts) {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'marker';
    marker.textContent = part.number;
    marker.setAttribute('aria-label', 'ดู' + part.name);
    marker.title = part.name;
    marker.addEventListener('click', () => select(part));
    byId('markers').append(marker);
    markers.set(part.id, marker);

    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'part-row';
    const number = document.createElement('span');
    number.className = 'part-number';
    number.textContent = part.number;
    const label = document.createElement('span');
    label.textContent = part.name;
    const status = document.createElement('span');
    status.className = 'part-status';
    row.append(number, label, status);
    row.addEventListener('click', () => select(part));
    byId('part-list').append(row);
    rows.set(part.id, { row, status });

    offsets.set(part.id, new THREE.Vector3(...part.offset));
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...part.anchor), new THREE.Vector3(...part.anchor),
    ]);
    const line = new THREE.Line(lineGeometry,
      new THREE.LineDashedMaterial({ color: 0x32739e, opacity: .57, transparent: true, dashSize: .065, gapSize: .048 }));
    line.frustumCulled = false;
    line.visible = false;
    scene.add(line);
    lines.set(part.id, line);
  }
  const standOffset = new THREE.Vector3(.30, 0, -.22);
  const separatedStand = new THREE.Vector3(.87, 0, -.98);
  const zero = new THREE.Vector3();
  const point = new THREE.Vector3();
  const orbit = new THREE.Spherical();
  const offset = new THREE.Vector3();
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const tappedPointers = new Map();
  const viewport = { width: 1, height: 1 };
  let fitScale = 1;
  let needsPaint = true;
  controls.addEventListener('change', () => { needsPaint = true; });
  let previousTime = performance.now();
  let noticeTimer;

  const setMode = explode => {
    detached.clear();
    if (explode) {
      for (const part of parts) detached.add(part.id);
    } else {
      headDetached = false;
    }
    if (explode) frame(true, false);
    refresh();
  };
  const rotate = radians => {
    orbit.setFromVector3(offset.copy(camera.position).sub(controls.target));
    orbit.theta += radians;
    camera.position.copy(offset.setFromSpherical(orbit).add(controls.target));
    controls.update();
  };
  const zoom = factor => {
    offset.copy(camera.position).sub(controls.target);
    const distance = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance);
    camera.position.copy(offset.setLength(distance).add(controls.target));
    controls.update();
  };
  function frame(expanded, resetAngle) {
    if (resetAngle) orbit.set(1, 1.24, .31);
    else orbit.setFromVector3(offset.copy(camera.position).sub(controls.target));
    controls.target.set(expanded ? .095 : -.02, expanded ? 1.70 : 1.34, expanded ? -.05 : .10);
    orbit.radius = (expanded ? 8.50 : 6.35) * fitScale;
    camera.position.copy(offset.setFromSpherical(orbit).add(controls.target));
    controls.update();
    needsPaint = true;
  }
  function refresh() {
    byId('assembled').setAttribute('aria-pressed', detached.size === 0 && !headDetached);
    byId('exploded').setAttribute('aria-pressed', detached.size === parts.length);
    for (const part of parts) {
      const isSelected = part === selected;
      const { row, status } = rows.get(part.id);
      row.setAttribute('aria-pressed', isSelected);
      markers.get(part.id).setAttribute('aria-pressed', isSelected);
      status.textContent = detached.has(part.id) || (part.id === 'lamp' && headDetached) ? 'แยกแล้ว' : 'ติดตั้งอยู่';
    }
    const lamp = selected.id === 'lamp';
    byId('part-meta').textContent = selected.number + '  /  PDF หน้า ' + selected.pages;
    byId('part-title').textContent = lamp && headDetached ? 'หัวโคม COB LED' : selected.name;
    byId('part-summary').textContent = lamp && headDetached ? 'หัวโคมที่ถอดออกจากแขนรองรับ' : selected.summary;
    byId('part-feature').textContent = lamp && headDetached
      ? 'แผง COB LED ให้แสงผ่านเลนส์ฝ้าเพื่อกระจายแสงบริเวณทำงาน' : selected.feature;
    byId('part-material').textContent = lamp && headDetached
      ? 'เรือนโพลีคาร์บอเนต (PC) และเลนส์อะคริลิกฝ้า (PMMA)' : selected.material;
    byId('detach').textContent = detached.has(selected.id) ? 'ประกอบชิ้นนี้กลับ' : 'ถอดชิ้นนี้';
    byId('lamp-head').hidden = !lamp;
    byId('lamp-head').textContent = headDetached ? 'ประกอบหัว LED กลับ' : 'แยกหัว LED';
    byId('lamp-head').setAttribute('aria-pressed', headDetached);
    needsPaint = true;
  }
  function select(part) {
    selected = part;
    refresh();
  }
  function showNotice(message) {
    clearTimeout(noticeTimer);
    notice.classList.add('toast');
    notice.textContent = message;
    notice.hidden = false;
    noticeTimer = setTimeout(() => { notice.hidden = true; }, 3500);
  }

  byId('assembled').addEventListener('click', () => { setMode(false); frame(false, false); });
  byId('exploded').addEventListener('click', () => setMode(true));
  byId('reset').addEventListener('click', () => { setMode(false); select(parts[0]); frame(false, true); });
  byId('left').addEventListener('click', () => rotate(-.29));
  byId('right').addEventListener('click', () => rotate(.29));
  byId('zoom-out').addEventListener('click', () => zoom(1.17));
  byId('zoom-in').addEventListener('click', () => zoom(.85));
  byId('detach').addEventListener('click', () => {
    if (detached.has(selected.id)) detached.delete(selected.id);
    else { detached.add(selected.id); frame(true, false); }
    refresh();
  });
  byId('lamp-head').addEventListener('click', () => {
    headDetached = !headDetached;
    if (headDetached) frame(true, false);
    refresh();
  });
  byId('export').disabled = false;
  byId('export').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const assembled = model.clone(true);
      for (const group of assembled.children) group.position.set(0, 0, 0);
      assembled.getObjectByName(lampHead.name).position.copy(homeHead);
      const file = await new GLTFExporter().parseAsync(assembled, { binary: true, trs: true });
      const url = URL.createObjectURL(new Blob([file], { type: 'model/gltf-binary' }));
      const link = document.createElement('a');
      link.download = 'field-dental-chair.glb';
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch {
      showNotice('ส่งออก GLB ไม่สำเร็จ ลองดาวน์โหลดอีกครั้ง');
    } finally {
      button.disabled = false;
    }
  });

  canvas.addEventListener('keydown', event => {
    const action = {
      ArrowLeft: () => rotate(-.19), ArrowRight: () => rotate(.19),
      '+': () => zoom(.85), '=': () => zoom(.85), '-': () => zoom(1.17),
    }[event.key];
    if (typeof action === 'function') { event.preventDefault(); action(); }
  });
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    if (tappedPointers.size) {
      for (const value of tappedPointers.values()) value.moved = true;
    }
    tappedPointers.set(event.pointerId, { x: event.clientX, y: event.clientY, moved: tappedPointers.size > 0 });
  });
  canvas.addEventListener('pointermove', event => {
    const tap = tappedPointers.get(event.pointerId);
    if (tap && Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 5) tap.moved = true;
  });
  canvas.addEventListener('pointercancel', event => tappedPointers.delete(event.pointerId));
  canvas.addEventListener('pointerup', event => {
    const tap = tappedPointers.get(event.pointerId);
    tappedPointers.delete(event.pointerId);
    if (!tap || tap.moved || Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 5) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set(2 * (event.clientX - rect.left) / rect.width - 1, 1 - 2 * (event.clientY - rect.top) / rect.height);
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObject(model, true)[0];
    if (!hit) return;
    let group = hit.object;
    while (group.parent !== model) group = group.parent;
    const part = parts.find(item => item.id === group.name);
    if (part) select(part);
  });

  let initialized = false;
  function resize() {
    viewport.width = stage.clientWidth;
    viewport.height = stage.clientHeight;
    if (!viewport.width || !viewport.height) return;
    camera.aspect = viewport.width / viewport.height;
    camera.updateProjectionMatrix();
    renderer.setSize(viewport.width, viewport.height, false);
    const nextScale = Math.max(1, 1.23 / camera.aspect);
    if (initialized && nextScale !== fitScale) zoom(nextScale / fitScale);
    fitScale = nextScale;
    needsPaint = true;
  }
  new ResizeObserver(resize).observe(stage);
  resize();
  frame(false, true);
  initialized = true;
  refresh();
  motionPreference.addEventListener('change', () => { controls.enableDamping = !motionPreference.matches; });

  renderer.setAnimationLoop(time => {
    const dt = Math.min((time - previousTime) / 1000, .08);
    const blend = motionPreference.matches ? 1 : 1 - Math.exp(-dt * 11);
    previousTime = time;
    let changed = controls.update();
    for (const part of parts) {
      const group = groups[part.id];
      const destination = detached.has(part.id)
        ? (part.id === 'base' ? (detached.size === parts.length ? standOffset : separatedStand) : offsets.get(part.id))
        : zero;
      if (!group.position.equals(destination)) {
        if (group.position.distanceToSquared(destination) < .0000005) group.position.copy(destination);
        else group.position.lerp(destination, blend);
        changed = true;
      }
    }
    const headDestination = headDetached ? removedHead : homeHead;
    if (!lampHead.position.equals(headDestination)) {
      if (lampHead.position.distanceToSquared(headDestination) < .0000005) lampHead.position.copy(headDestination);
      else lampHead.position.lerp(headDestination, blend);
      changed = true;
    }
    if (!changed && !needsPaint) return;
    needsPaint = false;
    for (const part of parts) {
      const [x, y, z] = part.anchor;
      const group = groups[part.id];
      const line = lines.get(part.id);
      line.visible = group.position.lengthSq() > .0002;
      if (line.visible) {
        const position = line.geometry.attributes.position;
        point.set(x, y, z).add(group.position);
        position.setXYZ(1, point.x, point.y, point.z);
        position.needsUpdate = true;
        line.computeLineDistances();
      }
    }
    renderer.render(scene, camera);
    for (const part of parts) {
      const marker = markers.get(part.id);
      if (part.id === 'lamp' && headDetached) {
        lampHead.getWorldPosition(point);
        point.y += .26;
      } else {
        point.set(...part.anchor).add(groups[part.id].position);
      }
      point.project(camera);
      const x = (point.x + 1) * viewport.width / 2;
      const y = (1 - point.y) * viewport.height / 2;
      marker.hidden = point.z < -1 || point.z > 1 || x < 20 || x > viewport.width - 20 || y < 54 || y > viewport.height - 58;
      if (!marker.hidden) {
        marker.style.left = x + 'px';
        marker.style.top = y + 'px';
      }
    }
  });
}

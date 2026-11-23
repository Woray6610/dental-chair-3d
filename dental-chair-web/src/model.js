import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const surface = (color, metalness = 0, roughness = .43) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness });

const white = surface(0xe7eef1, .12);
const alloy = surface(0xa6b8c3, .48, .34);
const steel = surface(0xcee1eb, .52, .26);
const joint = surface(0x627783, .35);
const rubber = surface(0x24343d, 0, .84);
const navy = surface(0x223e60, .015, .56);
const trim = surface(0x41698e, .08, .48);
const accent = surface(0x438eb8, .18);
const brass = surface(0xba9a65, .47);
const lens = surface(0xdce8ed, .09, .25);
const emitter = new THREE.MeshStandardMaterial({
  color: 0xffe0a0, emissive: 0xffb954, emissiveIntensity: .40, roughness: .32,
});
const cable = surface(0x8699a4, .04, .69);

function mesh(parent, geometry, material, x, y, z) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}
function box(parent, w, h, d, radius, material, x, y, z) {
  return mesh(parent, new RoundedBoxGeometry(w, h, d, 4, radius), material, x, y, z);
}
function disk(parent, radius, height, material, x, y, z) {
  return mesh(parent, new THREE.CylinderGeometry(radius, radius, height, 36), material, x, y, z);
}
function beam(parent, start, finish, width, depth, material) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...finish);
  const mid = from.clone().lerp(to, .5);
  const bar = box(parent, width, from.distanceTo(to), depth, Math.min(width, depth) * .38, material, mid.x, mid.y, mid.z);
  bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.sub(from).normalize());
  return bar;
}
function tube(parent, path, radius, material) {
  const curve = new THREE.CatmullRomCurve3(path.map(point => new THREE.Vector3(...point)));
  return mesh(parent, new THREE.TubeGeometry(curve, 28, radius, 9), material, 0, 0, 0);
}
function hinge(parent, x, y, z, material = steel) {
  const pin = disk(parent, .082, .041, material, x, y, z);
  pin.rotation.x = Math.PI / 2;
  return pin;
}
function cushion(parent, x, y, length, width, angle) {
  const pivot = new THREE.Group();
  pivot.position.set(x, y, 0);
  pivot.rotation.z = angle;
  parent.add(pivot);
  box(pivot, length, .115, width, .054, white, 0, -.074, 0);
  box(pivot, length - .025, .187, width + .015, .082, trim, 0, -.014, 0);
  box(pivot, length - .038, .174, width + .024, .085, navy, 0, .043, 0);
}

export function buildChair() {
  const model = new THREE.Group();
  model.name = 'Field dental chair concept';
  const groups = Object.fromEntries(
    ['base', 'chair', 'tray', 'lamp'].map(id => {
      const part = new THREE.Group();
      part.name = id;
      model.add(part);
      return [id, part];
    }),
  );
  const { base, chair, tray, lamp } = groups;

  box(base, 2.12, .069, 1.12, .033, rubber, -.04, .045, 0);
  box(base, 2.18, .145, 1.17, .071, alloy, -.04, .126, 0);
  box(base, 1.64, .164, .93, .080, white, -.13, .228, 0);
  box(base, .91, .252, .72, .12, white, -.37, .31, 0);
  for (const z of [-.23, .23]) {
    beam(base, [-.56, .285, z], [.15, .95, z], .243, .19, alloy);
    beam(base, [-.46, .41, z], [.225, 1.02, z], .135, .113, steel);
  }
  beam(base, [.44, .30, 0], [.04, .96, 0], .20, .25, joint);
  box(base, .82, .14, .76, .062, white, .10, 1.015, 0);
  box(base, .51, .046, .49, .022, trim, .12, 1.101, 0);
  box(base, .24, .19, .21, .041, steel, .16, .31, -.59);
  disk(base, .066, .06, joint, .16, .42, -.59);
  box(base, .19, .12, .17, .044, steel, .52, .57, .48);

  cushion(chair, -.08, 1.235, .92, 1.0, .018);
  cushion(chair, -.957, 1.578, 1.0, .98, -.59);
  cushion(chair, 1.07, 1.085, 1.41, .90, -.20);
  beam(chair, [-1.32, 1.82, 0], [-1.57, 2.012, 0], .09, .28, alloy);
  cushion(chair, -1.625, 2.05, .43, .55, -.65);
  for (const z of [-.505, .505]) {
    for (const x of [-.50, .38]) {
      box(chair, .22, .13, .055, .027, alloy, x, 1.205, z);
      hinge(chair, x, 1.222, z + Math.sign(z) * .027);
    }
    tube(chair, [[-.47, 1.26, z], [-.44, 1.51, z * 1.11], [-.24, 1.58, z * 1.14], [.25, 1.57, z * 1.14]], .031, steel);
    box(chair, .50, .077, .115, .037, navy, -.045, 1.575, z * 1.14);
  }

  beam(tray, [.52, .62, .51], [.68, .67, .82], .12, .12, alloy);
  beam(tray, [.68, .66, .82], [.87, 1.49, .91], .135, .14, white);
  hinge(tray, .68, .69, .89, joint);
  box(tray, .73, .17, .54, .081, white, 1.02, 1.53, .99);
  box(tray, .70, .047, .49, .023, alloy, 1.02, 1.626, .99);
  box(tray, .58, .023, .374, .011, lens, 1.02, 1.654, .975);
  box(tray, .095, .028, .07, .014, accent, 1.265, 1.654, 1.15);
  for (let i = 0; i < 4; i++) {
    const x = .75 + i * .158;
    box(tray, .084, .083, .10, .040, joint, x, 1.522, 1.265);
    const tool = disk(tray, .032, .22, steel, x, 1.535, 1.30);
    tool.rotation.x = -.38;
    tube(tray, [[x, 1.46, 1.34], [x + .05, .99, 1.44], [x + .10, .53 + i * .045, 1.44],
      [x + .15, .59 + i * .04, 1.21], [x + .06, 1.13, 1.10], [x + .033, 1.48, 1.12]], .013, cable);
  }

  disk(lamp, .056, 1.90, steel, .16, 1.36, -.59);
  disk(lamp, .082, .21, white, .16, .51, -.59);
  disk(lamp, .096, .12, alloy, .16, 2.31, -.59);
  beam(lamp, [.16, 2.32, -.59], [-.63, 2.77, -.63], .13, .129, white);
  beam(lamp, [-.63, 2.77, -.63], [-1.37, 2.68, -.60], .133, .13, alloy);
  hinge(lamp, -.63, 2.77, -.545, brass);
  hinge(lamp, .16, 2.33, -.514, brass);
  tube(lamp, [[-1.36, 2.69, -.60], [-1.47, 2.62, -.54], [-1.46, 2.53, -.40]], .052, steel);

  const lampHead = new THREE.Group();
  lampHead.name = 'COB LED head';
  lampHead.position.set(-1.46, 2.51, -.36);
  lampHead.rotation.x = -1.14;
  lamp.add(lampHead);
  for (const [radius, height, material, y] of [
    [.32, .13, white, 0], [.325, .039, alloy, -.062], [.273, .028, joint, -.087],
  ]) {
    disk(lampHead, radius, height, material, 0, y, 0).scale.z = .73;
  }
  for (const [x, z] of [[-.13, -.058], [.13, -.058], [-.13, .058], [.13, .058]]) {
    disk(lampHead, .075, .024, lens, x, -.104, z);
    disk(lampHead, .042, .027, emitter, x, -.116, z);
  }
  for (const side of [-1, 1]) {
    tube(lampHead, [[side * .264, .006, 0], [side * .386, -.034, 0], [side * .396, -.069, .118],
      [side * .291, -.028, .147]], .026, steel);
  }
  return { model, groups, lampHead };
}

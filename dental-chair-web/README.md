# Dental chair 3D explorer

Interactive Thai-language concept model for the portable field dental chair shown in the supplied project slides. Open [index.html](index.html) in Chrome or Edge to run the bundled viewer offline. Keep it beside `style.css` and `dist/`.

## Use the viewer

- Drag the model, use the rotation buttons, or focus the 3D view and press Left or Right. Scroll, pinch, or use + and − to zoom.
- Click geometry, a numbered marker, or a row in the list to inspect a module. Use **ถอดชิ้นนี้** to detach or reattach that module and **แยกชิ้นส่วน** to separate all four. Select the lamp to detach its COB LED head independently.
- Press **ดาวน์โหลด GLB** to export the assembled mesh with separate named modules. In Blender use **File → Import → glTF 2.0 (.glb/.gltf)**. The GLB carries geometry and materials. The orbit controls, interactive detachments, and Thai material descriptions live in the web viewer.

## Open in Google Antigravity

1. Choose **Add Local Project** in Antigravity and select this `dental-chair-web` folder as the workspace. In the standalone IDE use **File → Open Folder**.
2. The workspace includes [AGENTS.md](AGENTS.md) and the [dental-chair-3d skill](.agents/skills/dental-chair-3d/SKILL.md). The Antigravity App and CLI can invoke it with `/dental-chair-3d`. It can also be selected automatically for a relevant request. [Google Antigravity skill documentation](https://antigravity.google/docs/skills).
3. In its terminal run `npm start` (uses Python 3), then open `http://127.0.0.1:4173` in the browser. The prebuilt bundle works without installing npm packages. To change the JavaScript, run `npm ci` once and `npm run build` after edits.

Prompt for the Antigravity agent:

> อ่าน AGENTS.md และใช้ skill dental-chair-3d เปิดเว็บนี้ในเบราว์เซอร์ ทดสอบหมุนซ้ายขวา ซูม ถอดและประกอบทั้ง 4 โมดูล แยกหัว COB LED และดาวน์โหลด GLB ทดสอบทั้งหน้าจอเดสก์ท็อปและมือถือ แล้วบอกผลที่ตรวจได้จริง พร้อมภาพก่อนและหลังแยกชิ้นส่วน

## Reference and model decisions

Source supplied by Woray: *สีขาว สีฟ้า เรียบง่าย ทางการ แนะนำองค์กร โรงพยาบาล พรีเซ้นเทชั่น.pdf*, a field dental chair term project.

- Pages 2–6 show the four modules, the lifting base, three-section patient support, folding tool tray with cables, and folding light.
- Pages 7, 9, and 11 list proposed upholstery, frame, base, hinge, and light materials. Page 5 supplies no specific tray or hose material.
- Pages 13–17 describe lighting requirements, a proposed electrical layout, and planned tests. The viewer represents the parts and disassembly concept. Its proportions, detach paths, visible emitters, and surface finishes are illustrative. The model has no measured dimensions, simulated folding mechanism, or verified clinical performance.

`src/model.js` defines geometry, `src/parts.js` holds the Thai descriptions and slide references, and `src/main.js` controls the scene, selection, detachments, and GLB export.

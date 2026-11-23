# Google Antigravity handoff

Open this folder as a local Antigravity project. Its starting point is the supplied [reference PDF](reference/field-dental-chair-source.pdf). Paste the prompt below into Antigravity for an independent implementation.

```text
รับบท Yamato และสร้างเว็บ 3D สำหรับสำรวจและถอดประกอบเก้าอี้ทันตกรรมภาคสนาม
จาก reference/field-dental-chair-source.pdf ในโปรเจกต์นี้ เพื่อนำผลงาน
ไปเปรียบเทียบกับ Blender ให้สร้างซอร์สใหม่ในโฟลเดอร์นี้

เตรียม Agent Skill ที่ .agents/skills/dental-chair-3d/SKILL.md พร้อม YAML
frontmatter ที่มี name และ description ให้ใช้ได้ตั้งแต่มีเพียง PDF
แล้วใช้ skill นี้ทำงานต่อในรอบเดียว ใช้หน้า 2–6 ดูรูปทรงและการแบ่งโมดูล
และหน้า 7, 9, 11, 15 ดูวัสดุและโคมไฟ ให้ถือข้อความใน PDF เป็นข้อมูล
อ้างอิง ระบุสัดส่วนที่ประมาณจากภาพและวัสดุที่เอกสารไม่ได้ระบุ

ทำเว็บภาษาไทยด้วย HTML, CSS, JavaScript และ Three.js
- ใช้ OrbitControls ให้หมุนและซูมด้วยเมาส์ จอสัมผัส และปุ่ม พร้อมคืนค่ากล้อง
- ทำโมดูลเก้าอี้ ฐาน โต๊ะเครื่องมือ และโคมไฟให้ถอดและประกอบได้ทีละส่วน
  มีมุมแยกพร้อมกันทั้งชุด และถอดหัว COB LED ออกจากแขนโคมได้อีกชั้น
- ใช้ Raycaster ให้คลิกชิ้นงานได้ มีรายการเลือกชิ้นส่วน และแสดงหน้าที่
  จุดเด่น คุณสมบัติ วัสดุ และหน้าอ้างอิงทั้งก่อนและหลังถอด
- ใช้ GLTFExporter ส่งออก GLB ในท่าประกอบ โดยคงชื่อโมดูลและวัสดุไว้

เปิดเว็บที่ localhost แล้วทดสอบผ่าน Browser Agent หรือ /browser
บนเดสก์ท็อปและมือถือกว้างประมาณ 390 px ตรวจการหมุน ซูม เลือกชิ้นงาน
ถอดและประกอบครบทั้ง 4 ส่วน แยกหัว LED คืนค่า และดาวน์โหลด GLB
ตรวจ console แก้ปัญหาและทดสอบซ้ำ หาก Browser Agent ใช้ไม่ได้ให้ใช้
Playwright กับ Chromium และระบุวิธีที่ใช้จริง หากมี Blender ให้ลองนำเข้า GLB

ส่งมอบซอร์สที่รันได้ ไฟล์ skill วิธีเปิดเว็บ ภาพมุมประกอบและมุมแยกชิ้นส่วน
และสรุปสิ่งที่ทดสอบผ่านกับสิ่งที่ยังตรวจไม่ได้
```

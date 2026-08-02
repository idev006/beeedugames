# ADR-001: เลือก Phaser 3 เป็น 2D Runtime

## สถานะ

Accepted

## การตัดสินใจ

ใช้ Phaser 3 สำหรับฉาก 2D และใช้ Vue 3 เป็น application shell/UI

## เหตุผล

เกมมี sprite, tween, hit test, particles, camera และ state ของฉากจำนวนมาก Phaser ให้ abstraction เหล่านี้พร้อมใช้ ขณะที่ Vue เหมาะกับเมนูและข้อมูลที่ต้อง reactive

## ทางเลือกที่ไม่เลือกใน MVP

Canvas API ล้วนทำได้แต่ต้องสร้างระบบ animation/input เอง PixiJS เหมาะกับ rendering แต่ต้องประกอบระบบเกมเพิ่ม Three.js เหมาะเมื่อมี 3D จริง ไม่ใช่เป้าหมายของ vertical slice


# Ferma Hayvonlari Boshqaruv Ilovasi

## Current State
Yangi loyiha. Hech qanday mavjud kod yo'q.

## Requested Changes (Diff)

### Add
- Hayvon qo'shish funksiyasi (raqam, turi, tug'ilgan sana, olib ketilgan sana)
- Barcha hayvonlarni ro'yxatini ko'rish
- Hayvon ma'lumotlarini tahrirlash
- Hayvonni o'chirish
- Hayvon holati: fermada yoki olib ketilgan
- O'zbek tili interfeysi

### Modify
- Hech narsa

### Remove
- Hech narsa

## Implementation Plan

### Backend (Motoko)
- `Animal` turi: id, raqam (nomer), turi (sigir, qo'y, echki, ot va h.k.), tug'ilgan_sana, olib_ketilgan_sana (optional), yaratilgan_vaqt
- `addAnimal(raqam, turi, tugilgan_sana)` -> hayvon qo'shish
- `getAnimals()` -> barcha hayvonlar ro'yxati
- `updateAnimal(id, ...)` -> hayvon ma'lumotlarini yangilash
- `removeAnimal(id, olib_ketilgan_sana)` -> hayvonni olib ketilgan deb belgilash
- `deleteAnimal(id)` -> hayvonni butunlay o'chirish

### Frontend (React + TypeScript, O'zbekcha)
- Sarlavha: "Ferma Hayvonlari"
- Hayvon qo'shish formasi: raqam, turi, tug'ilgan sana
- Hayvonlar ro'yxati: jadval ko'rinishida
- Har bir satrda: raqam, turi, tug'ilgan sana, olib ketilgan sana, tahrirlash/o'chirish tugmalari
- Hayvon holatiga qarab rang: yashil (fermada), kulrang (olib ketilgan)
- Filtr: barchasi / fermada / olib ketilgan
- Modal: hayvon qo'shish/tahrirlash va olib ketilgan deb belgilash

# Huong Dan Chay Du An (Ban Chuan)

Tai lieu nay huong dan chay du an `Health Fitness Monorepo` ro rang theo tung buoc, co ghi cu the khi nao can mo them terminal.

## 1) Yeu Cau He Thong

- Node.js `>= 20`
- npm (di kem Node.js)
- Docker Desktop (khuyen nghi de chay MySQL bang container)
- He dieu hanh: Windows/macOS/Linux

## 2) Cau Truc Du An

- `mobile/`: Expo app (Android/iOS/Web)
- `backend/`: Express API + TypeScript + Prisma
- `shared/`: kieu du lieu dung chung (`@health-fitness/shared`)
- `worker/`: du phong cho background jobs

## 3) Quy Tac Ve Terminal (Quan Trong)

- Ban co the dung **1 terminal duy nhat** de cai dat va khoi tao ban dau.
- Khi chay dev, nen dung **it nhat 2 terminal**:
  - **Terminal 1**: chay backend (`npm run dev:backend`)
  - **Terminal 2**: chay mobile hoac web (`npm run dev:mobile` hoac `npm run web -w mobile`)
- Neu can chay them lenh khac trong luc dev (vi du migration/test), mo **Terminal 3** de khong dung server dang chay.

## 4) Cai Dat Lan Dau (Chi can 1 terminal)

Mo terminal tai thu muc goc du an `d:\ReactPjApp`, sau do chay:

```bash
npm install
```

Neu chua co file moi truong thi tao:

```bash
copy backend\.env.example backend\.env
copy mobile\.env.example mobile\.env
```

## 5) Khoi Dong Database MySQL (Terminal 1)

Tu thu muc goc du an:

```bash
docker compose up -d mysql
docker compose ps
```

Neu thay service `mysql` dang running la OK.

## 6) Chay Migration (Van dung Terminal 1)

```bash
cd backend
npx prisma migrate deploy
cd ..
```

## 7) Chay Backend API (Terminal 1)

```bash
npm run dev:backend
```

Sau lenh nay, **giu nguyen Terminal 1** cho backend chay lien tuc.

Thong tin mac dinh:

- Base URL: `http://127.0.0.1:3000`
- Health check: `http://127.0.0.1:3000/api/v1/health`

## 8) Chay Mobile Hoac Web (Terminal 2)

Mo **Terminal 2** moi tai `d:\ReactPjApp`, chon 1 trong 2 cach:

### Cach A - Mobile (Expo)

```bash
npm run dev:mobile
```

### Cach B - Web (Expo Web)

```bash
npm run web -w mobile
```

Neu port `8081` da bi chiem:

```bash
cd mobile
npx expo start --web --port 8082
```

## 9) Neu Web Bao Thieu Dependency

Chay trong `mobile/`:

```bash
npx expo install react-dom react-native-web
npx expo install expo-secure-store react-native-safe-area-context react-native-screens
```

## 10) Cau Hinh API URL Khi Chay Mobile

File `mobile/.env`:

```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000
```

Luu y cho Android emulator:

- `127.0.0.1` la chinh emulator, khong phai may host
- dung `10.0.2.2` de tro ve may host

## 11) Cac Lenh Thuong Dung

- `npm run build:shared`: build package `shared`
- `npm run dev:backend`: chay backend watch mode
- `npm run dev:mobile`: chay Expo mobile
- `npm run web -w mobile`: chay Expo web
- `npm run test:backend`: chay test backend

## 12) Kiem Tra Nhanh Sau Khi Chay

- MySQL running (`docker compose ps`)
- Backend health check tra ve status 200
- Expo mo duoc app tren mobile hoac web
- Da co `backend/.env` va `mobile/.env`

## 13) Loi Thuong Gap Va Cach Xu Ly

- **Port 3000 dang duoc su dung**: doi `PORT` trong `backend/.env`, sau do chay lai backend
- **Port 8081 bi chiem**: chay web voi `--port 8082`
- **Khong ket noi duoc MySQL**: kiem tra `DATABASE_URL` trong `backend/.env`
- **Prisma migrate loi**: dam bao MySQL da running truoc khi migrate
- **Expo can dung version package khac**: chay `npx expo install <package>`

## 14) Quy Trinh De Xuat Moi Ngay

1. **Terminal 1**:
   - `docker compose up -d mysql`
   - `npm run dev:backend`
2. **Terminal 2**:
   - `npm run dev:mobile` hoac `npm run web -w mobile`
3. **Terminal 3 (neu can)**:
   - chay migration/test/lenh phu khac

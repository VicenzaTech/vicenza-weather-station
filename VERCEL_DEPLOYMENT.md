# Vercel Deployment Guide

## Tình trạng hiện tại

### Đã sẵn sàng

1. **MQTT Integration với HiveMQ**
   - Code đã tự động detect và sử dụng HiveMQ khi có biến môi trường `HIVEMQ_HOST`
   - Logic trong `lib/mqttService.ts` sẽ tự động:
     - Kết nối đến HiveMQ nếu `HIVEMQ_HOST` được set
     - Sử dụng protocol phù hợp (mqtts cho port 8883)
     - Tự động reconnect khi mất kết nối

2. **API Endpoints**
   - `/api/sensor-data`: SSE stream cho real-time sensor data
   - `/api/sensor-history`: Historical data (cần database)
   - `/api/weather`: Weather forecast data

### Cần lưu ý

1. **Database trên Vercel**
   - **Vấn đề**: SQLite file-based (`file:./dev.db`) KHÔNG hoạt động trên Vercel vì:
     - Vercel serverless functions có read-only filesystem
     - Không thể ghi file database
   
   - **Giải pháp**:
     - **Option 1**: Sử dụng cloud database (khuyến nghị)
       - PostgreSQL (Vercel Postgres, Supabase, Neon, etc.)
       - MySQL (PlanetScale, Railway, etc.)
     - **Option 2**: Tắt tính năng lưu database (chỉ dùng real-time data từ MQTT)
       - Code đã được cập nhật để skip database operations trên Vercel nếu dùng file-based SQLite

## Cấu hình Environment Variables trên Vercel

### Bắt buộc cho HiveMQ

```env
HIVEMQ_HOST=your-hivemq-broker.hivemq.cloud
HIVEMQ_PORT=8883
HIVEMQ_USERNAME=your-username
HIVEMQ_PASSWORD=your-password
HIVEMQ_TOPIC=vicenza/weather/data
HIVEMQ_CLIENT_ID=vicenza-client
```

### Tùy chọn

```env
WEATHER_API_KEY=your-openweathermap-api-key
```

### Database (nếu muốn lưu historical data)

**Option 1: Vercel Postgres (khuyến nghị)**

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

Sau đó cập nhật `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Option 2: Tắt database (chỉ dùng real-time)**

Không cần set `DATABASE_URL`, code sẽ tự động skip database operations.

## Các bước deploy

1. **Push code lên GitHub**

2. **Import project vào Vercel**
   - Vào [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import repository từ GitHub

3. **Cấu hình Environment Variables**
   - Vào Settings > Environment Variables
   - Thêm tất cả các biến môi trường HiveMQ (bắt buộc)
   - Thêm `WEATHER_API_KEY` (tùy chọn)
   - Thêm `DATABASE_URL` nếu dùng cloud database

4. **Deploy**
   - Vercel sẽ tự động build và deploy
   - Kiểm tra logs để xem MQTT connection status

## Kiểm tra sau khi deploy

1. **Kiểm tra logs**
   - Vào Vercel Dashboard > Deployments > [Latest] > Functions
   - Xem logs của `/api/sensor-data`
   - Tìm log: `[MQTT] Connected to HiveMQ at ...`

2. **Test API**
   - Mở `/api/sensor-data` trong browser
   - Nên thấy SSE stream với sensor data

3. **Kiểm tra frontend**
   - Mở website đã deploy
   - Sensor data nên hiển thị real-time

## Troubleshooting

### MQTT không kết nối được

- Kiểm tra `HIVEMQ_HOST` đã được set đúng chưa
- Kiểm tra `HIVEMQ_USERNAME` và `HIVEMQ_PASSWORD`
- Xem logs trong Vercel để biết lỗi cụ thể

### Database errors

- Nếu dùng file-based SQLite: Code đã tự động skip, không cần lo
- Nếu dùng cloud database: Kiểm tra `DATABASE_URL` và connection string

### Không có data

- Đảm bảo Docker bridge service đang chạy và publish lên HiveMQ
- Kiểm tra topic name có đúng không (`vicenza/weather/data`)
- Xem logs của bridge service để đảm bảo đang publish

## Lưu ý quan trọng

1. **Docker Bridge Service phải chạy**
   - Service này phải chạy trên máy local hoặc server có thể truy cập local MQTT broker
   - Service sẽ publish data lên HiveMQ mỗi 5 phút

2. **Vercel chỉ đọc từ HiveMQ**
   - Vercel backend KHÔNG thể kết nối trực tiếp đến local MQTT broker (192.168.221.4)
   - Phải dùng HiveMQ làm trung gian

3. **Database là tùy chọn**
   - Nếu không cần lưu historical data, có thể bỏ qua database
   - Real-time data vẫn hoạt động bình thường qua SSE


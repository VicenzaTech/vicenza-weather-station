# MQTT Bridge Service

Service độc lập chạy trong Docker để bridge dữ liệu từ local MQTT broker lên HiveMQ.

## Chức năng

- Subscribe dữ liệu từ local MQTT broker (192.168.221.4)
- Publish dữ liệu lên HiveMQ mỗi 5 phút
- Tự động reconnect khi mất kết nối
- Chạy độc lập với network_mode: host để truy cập local MQTT broker

## Cấu hình

### Cách 1: Dùng Docker Compose (Khuyến nghị)

**File cấu hình**: Tạo file `.env` ở **thư mục root** của project (cùng cấp với `docker-compose.yml`)

```bash
# Tạo file .env từ example
cp .env.example .env

# Hoặc tạo file .env mới
nano .env
```

Nội dung file `.env`:

```env
# Local MQTT Broker Configuration
LOCAL_MQTT_HOST=192.168.221.4
LOCAL_MQTT_PORT=1883
LOCAL_MQTT_TOPIC=vicenza/weather/data
# LOCAL_MQTT_USERNAME=
# LOCAL_MQTT_PASSWORD=

# HiveMQ Configuration (Required)
HIVEMQ_HOST=your-hivemq-broker.hivemq.cloud
HIVEMQ_PORT=8883
HIVEMQ_TOPIC=vicenza/weather/data
HIVEMQ_USERNAME=your-username
HIVEMQ_PASSWORD=your-password
HIVEMQ_CLIENT_ID=vicenza-bridge
```

Sau đó chạy:

```bash
docker-compose up mqtt-bridge
```

Docker Compose sẽ tự động đọc các biến môi trường từ file `.env` ở thư mục root.

### Cách 2: Chạy Docker trực tiếp

Truyền environment variables qua command line hoặc file `.env`:

**Option A: Truyền qua command line**

```bash
docker run -d \
  --name mqtt-bridge \
  --network host \
  -e LOCAL_MQTT_HOST=192.168.221.4 \
  -e HIVEMQ_HOST=your-hivemq-broker.hivemq.cloud \
  -e HIVEMQ_USERNAME=your-username \
  -e HIVEMQ_PASSWORD=your-password \
  mqtt-bridge
```

**Option B: Dùng file `.env` trong thư mục mqtt-bridge**

Tạo file `mqtt-bridge/.env`:

```env
LOCAL_MQTT_HOST=192.168.221.4
LOCAL_MQTT_PORT=1883
LOCAL_MQTT_TOPIC=vicenza/weather/data
HIVEMQ_HOST=your-hivemq-broker.hivemq.cloud
HIVEMQ_PORT=8883
HIVEMQ_TOPIC=vicenza/weather/data
HIVEMQ_USERNAME=your-username
HIVEMQ_PASSWORD=your-password
HIVEMQ_CLIENT_ID=vicenza-bridge
```

Sau đó mount file vào container:

```bash
docker run -d \
  --name mqtt-bridge \
  --network host \
  --env-file ./mqtt-bridge/.env \
  mqtt-bridge
```

### Environment Variables

- `LOCAL_MQTT_HOST`: Địa chỉ local MQTT broker (mặc định: 192.168.221.4)
- `LOCAL_MQTT_PORT`: Port local MQTT broker (mặc định: 1883)
- `LOCAL_MQTT_TOPIC`: Topic để subscribe (mặc định: vicenza/weather/data)
- `LOCAL_MQTT_USERNAME`: Username cho local MQTT (optional)
- `LOCAL_MQTT_PASSWORD`: Password cho local MQTT (optional)
- `HIVEMQ_HOST`: Địa chỉ HiveMQ broker (**required**)
- `HIVEMQ_PORT`: Port HiveMQ broker (mặc định: 8883)
- `HIVEMQ_TOPIC`: Topic để publish lên HiveMQ (mặc định: vicenza/weather/data)
- `HIVEMQ_USERNAME`: Username cho HiveMQ (**required**)
- `HIVEMQ_PASSWORD`: Password cho HiveMQ (**required**)
- `HIVEMQ_CLIENT_ID`: Client ID cho HiveMQ (mặc định: vicenza-bridge)

## Chạy với Docker

### Build image

```bash
docker build -t mqtt-bridge ./mqtt-bridge
```

### Chạy container

```bash
docker run -d \
  --name mqtt-bridge \
  --network host \
  -e LOCAL_MQTT_HOST=192.168.221.4 \
  -e HIVEMQ_HOST=your-hivemq-broker.hivemq.cloud \
  -e HIVEMQ_USERNAME=your-username \
  -e HIVEMQ_PASSWORD=your-password \
  mqtt-bridge
```

### Hoặc dùng Docker Compose

1. Tạo file `.env` ở thư mục root với các biến môi trường cần thiết
2. Chạy: `docker-compose up mqtt-bridge`

Xem file `docker-compose.yml` ở thư mục root để biết cách cấu hình.

## Logs

Xem logs của service:

```bash
docker logs -f mqtt-bridge
```

## Format dữ liệu

Service expect và publish dữ liệu theo format:

```json
{
  "temp_room": 26.0,
  "hum_room": 77.0,
  "temp_out": 28.2,
  "lux": 129.6,
  "ldr_raw": 1574,
  "timestamp": 1766479802
}
```


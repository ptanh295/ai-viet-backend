# AI Văn Hóa Backend

Backend tạo nội dung văn hóa từ prompt + ảnh minh hoạ, dùng OpenAI GPT và DALL·E.

## API chính
- `POST /generate-content` với `prompt` và `category`
- `GET /history`
- `GET /dashboard-summary`

## Cài đặt
```
npm install
cp .env.example .env
node index.js
```
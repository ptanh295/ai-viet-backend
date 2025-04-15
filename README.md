# 🇻🇳 AI Văn Hóa - Backend Generator

Một API backend giúp tạo nội dung mô tả và hình ảnh minh họa văn hóa Việt Nam bằng trí tuệ nhân tạo, sử dụng OpenAI GPT + DALL·E.

## 🚀 Tính năng chính

- 🧠 Tạo đoạn mô tả truyền thông từ một prompt văn hóa
- 🎨 Sinh ảnh minh họa tương ứng từ DALL·E
- 🕓 Ghi lại lịch sử các prompt đã tạo
- 📊 API tổng hợp thống kê: tổng số prompt, từ khóa trending

## 📦 Cài đặt local

```bash
git clone <repo-url>
cd ai-viet-backend
npm install
cp .env.example .env
# chỉnh sửa .env để thêm API key
npm start
```

## 🔐 Môi trường `.env`
```env
OPENAI_API_KEY=your-api-key-here
```

## 📡 API Endpoint

### POST /generate-content
Input:
```json
{ "prompt": "Hoàng hôn ở làng chài Cửa Đại" }
```

Output:
```json
{ "text": "...", "image_url": "..." }
```

### GET /history
Lịch sử nội dung đã tạo

### GET /dashboard-summary
Thống kê tổng số nội dung + từ khóa trending

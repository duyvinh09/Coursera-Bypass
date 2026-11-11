# Coursera-Bypass

**A Chrome Extension for Coursera Interface Customization & Experimentation**

Coursera-Bypass là một tiện ích mở rộng dành cho trình duyệt Chromium, được phát triển nhằm hỗ trợ nghiên cứu, thử nghiệm và tùy chỉnh hành vi giao diện trên nền tảng Coursera thông qua JavaScript.

Dự án sử dụng Chrome Extension APIs kết hợp với cơ chế Content Scripts để tương tác với DOM, xử lý sự kiện và thử nghiệm các thay đổi trên giao diện người dùng.

## ✨ Tính năng nổi bật

- **DOM Manipulation:** Tương tác và tùy chỉnh các thành phần giao diện Coursera bằng JavaScript.
- **Content Script Injection:** Tự động thực thi mã JavaScript trên các trang được cấu hình.
- **Background Processing:** Xử lý sự kiện và các tác vụ nền thông qua `background.js`.
- **Browser Integration:** Tích hợp trực tiếp với Chrome và các trình duyệt Chromium.
- **Lightweight Architecture:** Cấu trúc đơn giản, dễ dàng chỉnh sửa, mở rộng và bảo trì.
- **Developer-Friendly:** Hỗ trợ kiểm tra và gỡ lỗi thông qua Chrome DevTools.

## 🛠️ Công nghệ sử dụng

| Công nghệ | Vai trò |
|---|---|
| JavaScript | Xử lý logic và tương tác DOM |
| Chrome Extension APIs | Tích hợp các tính năng của trình duyệt |
| HTML DOM | Truy cập và tùy chỉnh giao diện trang web |
| JSON | Cấu hình tiện ích mở rộng |
| Chrome DevTools | Kiểm tra và gỡ lỗi |

## 📁 Cấu trúc dự án

```text
Coursera-Bypass/
├── manifest.json       # Cấu hình Chrome Extension
├── background.js       # Xử lý các sự kiện nền
├── content.js          # Tương tác và tùy chỉnh DOM
└── README.md           # Tài liệu dự án
```

### Thành phần chính

**`manifest.json`**

Định nghĩa thông tin tiện ích, quyền truy cập, các script và phạm vi hoạt động trên trình duyệt.

**`background.js`**

Quản lý các sự kiện nền và thực hiện những tác vụ không phụ thuộc trực tiếp vào giao diện trang web.

**`content.js`**

Thực thi JavaScript trong ngữ cảnh trang Coursera, cho phép truy cập DOM, theo dõi sự kiện và tùy chỉnh cách hiển thị nội dung.

## 🚀 Cài đặt

### Yêu cầu

- Google Chrome, Microsoft Edge hoặc trình duyệt dựa trên Chromium.
- Quyền sử dụng chế độ Developer Mode.
- Mã nguồn dự án được tải về máy.

### Hướng dẫn cài đặt

**Bước 1: Tải mã nguồn**

Clone repository về máy:

```bash
git clone https://github.com/<username>/Coursera-Bypass.git
```

Hoặc tải trực tiếp mã nguồn dưới dạng ZIP và giải nén.

**Bước 2: Truy cập trang quản lý tiện ích**

Mở trình duyệt và nhập:

```text
chrome://extensions/
```

**Bước 3: Kích hoạt Developer Mode**

Bật **Developer mode** ở góc trên bên phải trang quản lý tiện ích.

**Bước 4: Cài đặt Extension**

1. Nhấn **Load unpacked**.
2. Chọn thư mục chứa mã nguồn dự án.
3. Đảm bảo thư mục có tệp `manifest.json`.
4. Xác nhận tiện ích xuất hiện trong danh sách Extensions.

**Bước 5: Kiểm tra hoạt động**

Truy cập Coursera và tải lại trang để các Content Scripts được áp dụng theo cấu hình.

## 📖 Hướng dẫn sử dụng

Sau khi cài đặt thành công, tiện ích sẽ tự động thực thi trên những trang web được khai báo trong `manifest.json`.

Để kiểm tra hoặc tùy chỉnh hoạt động:

1. Mở trang Coursera trong trình duyệt.
2. Nhấn `F12` để mở Chrome DevTools.
3. Chuyển đến tab **Console** để theo dõi thông tin từ `content.js`.
4. Truy cập phần **Service worker** trong trang quản lý Extensions để kiểm tra `background.js` nếu dự án sử dụng Manifest V3.
5. Chỉnh sửa mã nguồn và tải lại tiện ích để áp dụng thay đổi.

## 🔐 Quyền truy cập và bảo mật

Tiện ích có thể yêu cầu một số quyền truy cập trình duyệt tùy theo cấu hình trong `manifest.json`.

Trước khi sử dụng, người dùng nên:

- Kiểm tra các quyền truy cập được khai báo.
- Chỉ cài đặt mã nguồn từ nguồn đáng tin cậy.
- Hạn chế sử dụng quyền truy cập rộng khi không cần thiết.
- Không đưa thông tin đăng nhập, token hoặc dữ liệu nhạy cảm vào mã nguồn.

## ⚠️ Tuyên bố miễn trừ trách nhiệm

Dự án được xây dựng nhằm phục vụ mục đích **nghiên cứu, học tập và thử nghiệm kỹ thuật phát triển Chrome Extension**.

Coursera-Bypass không liên kết, tài trợ hoặc được xác nhận bởi Coursera.

Người sử dụng chịu trách nhiệm đảm bảo việc triển khai và sử dụng tiện ích tuân thủ pháp luật, quyền sở hữu trí tuệ và điều khoản dịch vụ của nền tảng.

Dự án không nhằm hỗ trợ truy cập trái phép, vượt qua cơ chế bảo mật hoặc gian lận trong các hoạt động đánh giá học tập.

## 🤝 Đóng góp

Mọi ý tưởng cải tiến và đóng góp đều được hoan nghênh.

Quy trình đóng góp:

1. Fork repository.
2. Tạo branch mới cho tính năng hoặc bản sửa lỗi.
3. Thực hiện thay đổi và kiểm tra.
4. Commit với nội dung rõ ràng.
5. Tạo Pull Request để đề xuất hợp nhất thay đổi.

## 📄 Giấy phép

Vui lòng tham khảo tệp `LICENSE` nếu repository có cung cấp để biết điều kiện sử dụng, chỉnh sửa và phân phối mã nguồn.

---

**Coursera-Bypass** — A lightweight browser extension project for learning, exploring, and experimenting with web technologies.

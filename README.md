# Coursera-Bypass

Một tiện ích mở rộng (Chrome Extension) đơn giản để thử nghiệm/tuỳ chỉnh hành vi hiển thị trên Coursera cho mục đích học tập cá nhân.

## Mô tả

- Tên dự án: Coursera-Bypass
- Mục tiêu: Hỗ trợ thử nghiệm giao diện và hành vi trang Coursera bằng cách chèn/sửa script nội bộ (chỉ dùng cho mục đích cá nhân và nghiên cứu).

## Tính năng

- Chèn mã nền (`background.js`) để xử lý sự kiện toàn cục.
- Chèn mã nội dung (`content.js`) để tương tác/tuỳ chỉnh DOM trên trang Coursera.
- Cài đặt dễ dàng bằng chế độ `Load unpacked` trong Chrome/Chromium.

## Cấu trúc dự án

- `manifest.json` — cấu hình extension.
- `background.js` — script nền (background).
- `content.js` — script chèn vào trang web (content script).

## Cài đặt

1. Mở Chrome/Edge/Chromium.
2. Chuyển tới `chrome://extensions`.
3. Bật `Developer mode` (Chế độ dành cho nhà phát triển).
4. Chọn `Load unpacked` và trỏ tới thư mục dự án (thư mục chứa `manifest.json`).

## Cách sử dụng

- Sau khi load, extension sẽ tự động chạy trên các trang phù hợp (được định nghĩa trong `manifest.json`).
- Mở công cụ DevTools (F12) để xem log hoặc debug `content.js`/`background.js`.

## Quyền hạn (Permissions)

- Kiểm tra `manifest.json` để biết danh sách quyền mà extension yêu cầu. Cẩn trọng khi cấp quyền rộng.

## Lưu ý pháp lý và đạo đức

- Sử dụng tiện ích này chỉ cho mục đích hợp pháp, cá nhân và học tập.
- Không dùng để vượt giới hạn truy cập, vi phạm điều khoản dịch vụ của Coursera, hoặc phân phối mã nhằm mục đích trái phép.

## Đóng góp

- Muốn sửa/chia sẻ ý tưởng, các bước: fork dự án, chỉnh mã, và gửi pull request (nếu có repository công khai).

## License

- Chưa có license cụ thể; thêm file `LICENSE` nếu muốn chỉ định giấy phép.

---

Nếu bạn muốn mình viết thêm phiên bản tiếng Anh, hướng dẫn cài đặt tự động hóa, hoặc tạo `package.json`/scripts để đóng gói, cho mình biết nhé.

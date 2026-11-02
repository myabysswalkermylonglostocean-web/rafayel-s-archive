# Rafayel’s Archive

Web tĩnh, không cần cài đặt hay build. Bài viết là các file Markdown trong `content/`, menu khai báo trong `site.json`.

## Đưa lên GitHub + Vercel
1. Tạo repo mới trên GitHub, rồi trong thư mục này chạy:
   `git init && git add . && git commit -m "init" && git branch -M main`
   `git remote add origin https://github.com/TEN-BAN/rafayel-archive.git && git push -u origin main`
2. Vào vercel.com, đăng nhập bằng GitHub, chọn **Add New → Project**, chọn repo.
3. Framework Preset: **Other**. Để trống Build Command và Output Directory, bấm **Deploy**.
4. Từ đó, mỗi lần push lên GitHub là Vercel tự cập nhật site.

## Thêm bài mới
1. Tạo file `content/ten-trang.md` (hỗ trợ tiêu đề `#`, **đậm**, *nghiêng*, danh sách, bảng, ảnh, trích dẫn `>`).
2. Thêm một dòng vào `site.json`: `{"slug": "ten-trang", "title": "Tên hiển thị"}`.

## Ảnh
Ảnh trang chủ đang lấy tạm từ WordPress cũ. Hãy tải ảnh về thư mục `images/` rồi đổi đường dẫn thành `images/ten-anh.png` trước khi xóa site WordPress.

## Video YouTube
Trong file bài viết, viết một dòng riêng như sau (dán link YouTube hoặc YouTube Shorts đều được):
`[video](https://youtube.com/shorts/fZ_Kvy3bRbc)`
Shorts hiện khung dọc, video thường hiện khung ngang.

## Banner trang chủ
Các ảnh tròn bên phải banner nằm trong `site.json`, mục `hero.picks` (đổi `title` và `image` tùy ý, nên để ảnh trong thư mục `images/`).

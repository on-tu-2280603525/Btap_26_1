// HTTP REQUEST GETALL GETONE PUT POST DELETE
const URL_REQUEST = 'http://localhost:3000/posts'

async function GetData() {
    try {
        let res = await fetch(URL_REQUEST);
        let posts = await res.json();

        let body_of_table = document.getElementById('table-body')
        body_of_table.innerHTML = "";

        for (const post of posts) {
            // YÊU CẦU: Kiểm tra nếu đã bị xóa mềm thì thêm style gạch ngang
            let strikeThrough = post.isDeleted ? "style='text-decoration: line-through; color: gray;'" : "";

            body_of_table.innerHTML +=
                `<tr ${strikeThrough}>
                    <td>${post.id}</td>
                    <td>${post.title}</td>
                    <td>${post.views}</td>
                    <td>
                        ${post.isDeleted ? 'Đã xóa' : `<input type='submit' onclick='Delete("${post.id}")' value='Delete'/>`}
                    </td>
                </tr>`
        }
    } catch (error) {
        console.log(error);
    }
}

// YÊU CẦU: ID tự tăng = maxId + 1, ID lưu là chuỗi
async function Save() {
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("views_txt").value;

    // 1. Lấy danh sách hiện tại để tìm ID lớn nhất
    let resList = await fetch(URL_REQUEST);
    let posts = await resList.json();

    // 2. Tìm maxId: Duyệt qua mảng, chuyển id sang số để so sánh
    let maxId = 0;
    if (posts.length > 0) {
        maxId = Math.max(...posts.map(post => parseInt(post.id)));
    }

    // 3. Tạo ID mới = maxId + 1 và chuyển thành chuỗi
    let newId = (maxId + 1).toString();

    // 4. Gửi yêu cầu POST để tạo mới (Bỏ trống ID ở giao diện, tự tính ở đây)
    let res = await fetch(URL_REQUEST, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: newId,         // ID mới là chuỗi
            title: title,
            views: views,
            isDeleted: false   // Mặc định là false khi tạo mới
        })
    });

    if (!res.ok) {
        console.log("bị lỗi khi lưu");
    } else {
        // Xóa sạch form sau khi lưu thành công
        document.getElementById("id_txt").value = "";
        document.getElementById("title_txt").value = "";
        document.getElementById("views_txt").value = "";
    }

    GetData();
    return false;
}

// CHỨC NĂNG: Xóa mềm (Soft Delete)
async function Delete(id) {
    let res = await fetch(URL_REQUEST + '/' + id, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            isDeleted: true
        })
    });

    if (res.ok) {
        console.log("Xóa mềm thành công");
        GetData();
    } else {
        console.log("Lỗi khi thực hiện xóa mềm");
    }
}

GetData();
const URL_COMMENTS = 'http://localhost:3000/comments';

// 1. READ: Lấy danh sách bình luận
async function GetComments() {
    try {
        let res = await fetch(URL_COMMENTS);
        let comments = await res.json();
        let body = document.getElementById('comment-table-body');
        body.innerHTML = "";

        for (const c of comments) {
            body.innerHTML += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.text}</td>
                    <td>${c.postId}</td>
                    <td>
                        <button onclick="DeleteComment('${c.id}')">Xóa cứng</button>
                    </td>
                </tr>`;
        }
    } catch (error) {
        console.log("Lỗi tải comment:", error);
    }
}

// 2. CREATE: Thêm bình luận mới (Áp dụng ID tự tăng Max + 1 dạng Chuỗi)
async function SaveComment() {
    let text = document.getElementById("comment_text_txt").value;
    let postId = document.getElementById("comment_postId_txt").value;

    // Lấy danh sách để tính ID max
    let resList = await fetch(URL_COMMENTS);
    let comments = await resList.json();

    let maxId = comments.length > 0 ? Math.max(...comments.map(c => parseInt(c.id))) : 0;
    let newId = (maxId + 1).toString(); // ID chuỗi tự tăng

    let res = await fetch(URL_COMMENTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: newId,
            text: text,
            postId: postId
        })
    });

    if (res.ok) {
        document.getElementById("comment_text_txt").value = "";
        document.getElementById("comment_postId_txt").value = "";
        GetComments(); // Tải lại bảng comment
    }
}

// 3. DELETE: Xóa bình luận (Xóa cứng theo yêu cầu CRUD cơ bản)
async function DeleteComment(id) {
    if (confirm("Bạn có chắc muốn xóa bình luận này?")) {
        await fetch(URL_COMMENTS + '/' + id, { method: 'DELETE' });
        GetComments();
    }
}

// Gọi hàm GetComments khi trang web vừa load xong
GetComments();
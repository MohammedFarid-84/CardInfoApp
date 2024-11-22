// restor variables
const account_no = localStorage.getItem("AccountNo");
const customer_name = localStorage.getItem("CustName");
const group_no = localStorage.getItem("groupNo");
const branch_no = localStorage.getItem("userBranch");
let db;

// show customer name on head
document.getElementById("custName").value = customer_name;

// تحميل قاعدة البيانات
async function loadDatabase() {
    const SQL = await initSqlJs({ locateFile: file => '../libs/sql-wasm.wasm' });
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "../database/cardinfo.db", true);
    xhr.responseType = "arraybuffer";
    xhr.onload = () => {
        const uInt8Array = new Uint8Array(xhr.response);
        db = new SQL.Database(uInt8Array);
        console.log("Database loaded successfully!");
    };
    xhr.send();
}

// فتح الكاميرا والتقاط الصورة
async function captureImage(buttonId, imageType) {
    try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.createElement("video");
        videoElement.srcObject = videoStream;
        videoElement.play();

        // نافذة لعرض الفيديو
        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100vw";
        modal.style.height = "100vh";
        modal.style.background = "rgba(0, 0, 0, 0.8)";
        modal.style.zIndex = "9999";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";

        const captureButton = document.createElement("button");
        captureButton.innerText = "التقاط";
        captureButton.style.marginTop = "20px";

        modal.appendChild(videoElement);
        modal.appendChild(captureButton);
        document.body.appendChild(modal);

        captureButton.onclick = () => {
            const canvas = document.createElement("canvas");
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const context = canvas.getContext("2d");
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL("image/png");
            saveImageToDatabase(imageData, imageType);

            // عرض الصورة على الواجهة
            if (imageType === "face") {
                document.getElementById("facePreview").src = imageData;
            } else {
                document.getElementById("backPreview").src = imageData;
            }

            // تنظيف الموارد
            videoStream.getTracks().forEach(track => track.stop());
            document.body.removeChild(modal);
        };
    } catch (error) {
        console.error("Error capturing image:", error);
    }
}

// حفظ الصورة في قاعدة البيانات
function saveImageToDatabase(imageData, imageType) {
    const column = imageType === "face" ? "face_path" : "back_path";
    const query = `
                UPDATE customers SET ${column} = ? 
                WHERE 
                    branch_no = ?
                    group_no = ?
                    account_no = ?

                `;

    db.run(query, [imageData, branch_no, group_no, account_no]);
    console.log(`Image saved in database: ${imageType}`);
}

// تهيئة الأزرار
document.getElementById("getFaceBtn").addEventListener("click", () => captureImage("getFaceBtn", "face"));
document.getElementById("getBackBtn").addEventListener("click", () => captureImage("getBackBtn", "back"));

// تحميل قاعدة البيانات عند تشغيل التطبيق
loadDatabase();
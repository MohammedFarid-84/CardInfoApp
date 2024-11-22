// تحميل مكتبة SQL.js
const config = { locateFile: filename => 'libs/${filename}' };

initSqlJs(config).then(SQL => {
    // تحميل قاعدة البيانات
    fetch("../database/cardinfo.db").then(response => {
        if (!response.ok) throw new Error("Failed to load database");
        return response.arrayBuffer();
    }).then(buffer => {
        const db = new SQL.Database(new Uint8Array(buffer));
        console.log("Database loaded successfully.");

        // تسجيل الدخول
        document.getElementById('loginbtn').addEventListener('click', () => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // تحقق من الحقول
            if (!username || !password) {
                showNotification("لم يتم ادخال البيانات بشكل صحيح!", "error");
                return;
            }

            // استعلام SQL للتحقق من المستخدم
            const stmt = db.prepare("SELECT * FROM collectors WHERE c_code = ? AND c_password = ?");
            stmt.bind([username, password]);

            if (stmt.step()) {
                // الحصول على اسم المستخدم من العمود c_name
                const userName = stmt.getAsObject().c_name;
                const userCode = stmt.getAsObject().c_code;
                const userBranch = stmt.getAsObject().c_branch;

                // save user loginfo for use in another pages
                localStorage.setItem("userCode", userCode);
                localStorage.setItem("userBranch", userBranch);

                // عرض تحية مخصصة
                showNotification(`مرحبا, ${userName}!`, "success");
                setTimeout(() => {
                    window.location.href = "../screens/home.html"; // الانتقال إلى الصفحة الرئيسية
                }, 2000); // تأخير لمدة 2 ثانية قبل الانتقال
            
            } else {
                showNotification("ربما كانت كلمة المرور أو الاسم غير صحيح!", "error");
            }

            stmt.free();
        });
    }).catch(error => {
        console.error("Error loading database:", error);
    });
}).catch(error => {
    console.error("Error initializing SQL.js:", error);
});

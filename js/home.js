// جلب المتغيرات المحلية من Local Storage
const u_code = localStorage.getItem("userCode");
const u_branch = localStorage.getItem("userBranch");

// الوظيفة الرئيسية لتنفيذ البحث
function performSearch() {
    const searchText = document.getElementById("searchtext").value.trim();
    const resultsDiv = document.getElementById("results");

    // التأكد من إدخال نص في مربع البحث
    if (searchText === "") {
        showNotification("يرجى إدخال رقم الحساب للبحث!", "error");
        return;
    }

    // تحميل مكتبة SQLite
    initSqlJs({
        locateFile: (file) => `../libs/${file}`
    }).then((SQL) => {
        // تحميل قاعدة البيانات
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "../database/cardinfo.db", true);
        xhr.responseType = "arraybuffer";

        xhr.onload = function () {
            if (xhr.status === 200) {
                const uInt8Array = new Uint8Array(xhr.response);
                const db = new SQL.Database(uInt8Array);

                // استعلام SQL للبحث عن الحساب
                const query = `
                    SELECT 
                        collectors.c_code, 
                        customers.*, 
                        customers.account_no
                    FROM 
                        (collectors 
                        INNER JOIN blocks ON collectors.c_code = blocks.c_code)
                        INNER JOIN customers ON blocks.block_no = customers.block_no
                    WHERE 
                        collectors.c_code = ? 
                        AND customers.branch_no = ? 
                        AND (
                        customers.account_no LIKE ?
                        OR customers.cust_name LIKE ?
                        )
                `;

                const stmt = db.prepare(query);
                const searchTxtPattern = `%${searchText}%`;
                stmt.bind([u_code, u_branch, searchTxtPattern, searchTxtPattern]);

                // مسح النتائج السابقة
                const tableBody = document.querySelector(".resultstbl").querySelector("tbody");
                if (tableBody) {
                    tableBody.remove();
                }

                // إنشاء جسم جدول جديد للنتائج
                const newBody = document.createElement("tbody");

                // تعبئة الجدول بالنتائج
                let found = false;
                let serialNo = 1;
                while (stmt.step()) {
                    found = true;
                    const row = stmt.getAsObject();
                    const tr = document.createElement("tr");

                    tr.innerHTML = `
                        <td>${serialNo}</td>
                        <td class="account-no">${row.account_no}</td>
                        <td class="group-no">${row.group_no}</td>
                        <td class="cust-name">${row.cust_name}</td>
                        <td>${row.address}</td>
                        <td>
                            <button class="editBtn">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                        </td>
                    `;

                    const editBtn = tr.querySelector(".editBtn");
                    editBtn.addEventListener("click", () => {
                        // الحصول على القيم من نفس الصف
                        const accountNo = tr.querySelector(".account-no").textContent;
                        const custName = tr.querySelector(".cust-name").textContent;
                        const groupNo = tr.querySelector(".group-no").textContent;
                        // تخزين القيم في LocalStorage
                        localStorage.setItem("AccountNo", accountNo);
                        localStorage.setItem("CustName", custName);
                        localStorage.setItem("groupNo", groupNo);
                        // showNotification(`${accountNo}, ${custName}`, 'success')
                        window.location.href = "getCard.html"
                    });

                    newBody.appendChild(tr);
                    // إضافة رقم تسلسلي
                    serialNo++;
                }

                document.querySelector(".resultstbl").appendChild(newBody);

                if (!found) {
                    showNotification("لم يتم العثور على نتائج.", "error");
                    // hidden tabel when no results
                    resultsDiv.style.display = "none";
                } else {
                    // عرض الجدول في حالة العثور على نتائج
                    resultsDiv.style.display = "block";
                }

                // إغلاق الاتصال بقاعدة البيانات
                stmt.free();
                db.close();
            }
        };

        xhr.send();
    }).catch((error) => {
        console.error("خطأ في تحميل SQLite:", error);
    });
}

// Debounce function to prevent frequent calls
// let debounceTimer;
// function debounceSearch() {
//     clearTimeout(debounceTimer);
//     debounceTimer = setTimeout(performSearch, 500); // Wait 300ms before calling performSearch
// }

// Function to handle Enter key press
function handleEnterKey(event) {
    if (event.key === "Enter") {
        performSearch();
    }
}

// Attach events
document.getElementById("searchbtn").addEventListener("click", performSearch);
// document.getElementById("searchtext").addEventListener("input", debounceSearch);
document.getElementById("searchtext").addEventListener("keydown", handleEnterKey);

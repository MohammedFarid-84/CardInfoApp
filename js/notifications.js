// show notification message:
function showNotification(message, type) {
    const notification = document.getElementById("notification");

    if (!notification) {
        console.error("Notification element not found in the HTML.");
        return;
    }

    // تخصيص ألوان الرسالة بناءً على النوع
    if (type === "success") {
        notification.style.backgroundColor = "#4CAF50"; // لون النجاح
    } else if (type === "error") {
        notification.style.backgroundColor = "#f44336"; // لون الخطأ
    }

    notification.textContent = message;
    notification.classList.remove("hidden"); // إزالة الإخفاء
    notification.classList.add("show");

    // إخفاء الرسالة بعد 3 ثوانٍ
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            notification.classList.add("hidden");
        }, 300); // تأخير بسيط للسماح بالانتقال السلس
    }, 3000);
}

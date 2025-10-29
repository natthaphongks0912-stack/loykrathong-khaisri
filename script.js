// ===================== Firebase Config =====================
const firebaseConfig = {
    apiKey: "AIzaSyChhf-4w_Hya9kj_Hy_hNBJk_vlHzQWYnA",
    authDomain: "loykrathongkhaisri.firebaseapp.com",
    databaseURL: "https://loykrathongkhaisri-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "loykrathongkhaisri",
    storageBucket: "loykrathongkhaisri.firebasestorage.app",
    messagingSenderId: "63769787285",
    appId: "1:63769787285:web:72b591fc1bcc486364549c",
    measurementId: "G-00Y3C1QE7M"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ===================== DOM Elements =====================
const btnFloat = document.getElementById("btnFloat");
const wishInput = document.getElementById("wishInput");
const floatingArea = document.getElementById("floatingArea");
const choices = document.querySelectorAll("#krathongChoices img");

let selectedKrathong = "1.png"; // default

// ===================== เลือกกระทง =====================
choices.forEach(choice => {
    choice.addEventListener("click", () => {
        choices.forEach(c => c.classList.remove("selected"));
        choice.classList.add("selected");
        selectedKrathong = choice.dataset.src;
    });
});

// ===================== SessionId =====================
const sessionId = Date.now(); // ใช้ sessionId ป้องกันโหลดกระทงเก่า

// ===================== ปุ่มลอยกระทง =====================
btnFloat.addEventListener("click", () => {
    const wishText = wishInput.value.trim();
    if (!wishText) {
        alert("กรุณาเขียนคำอธิษฐานก่อนลอยกระทง 🌕");
        return;
    }

    const krathong = {
        img: selectedKrathong,
        wish: wishText,
        time: Date.now(),
        session: sessionId
    };

    db.ref("krathongs").push(krathong);
    wishInput.value = "";
});

// ===================== ฟังข้อมูล Realtime =====================
db.ref("krathongs").on("child_added", snapshot => {
    const data = snapshot.val();

    // ไม่โหลดกระทงเก่าเกิน 2 นาที
    if (Date.now() - data.time > 2*60*1000) return;

    createKrathongElement(data.img, data.wish);
});

// ===================== สร้างกระทง =====================
function createKrathongElement(imgSrc, wishText) {
    const krathong = document.createElement("div");
    krathong.className = "krathong";

    // Random start position: ซ้ายหรือขวา
    const fromLeft = Math.random() < 0.5;
    krathong.style.bottom = Math.random() * 200 + "px";
    krathong.style.left = fromLeft ? "-100px" : window.innerWidth + "px";

    // รูปกระทง
    const img = document.createElement("img");
    img.src = imgSrc;
    krathong.appendChild(img);

    // คำอธิษฐาน
    const wish = document.createElement("div");
    wish.className = "wishText";
    wish.textContent = wishText;
    krathong.appendChild(wish);

    floatingArea.appendChild(krathong);

    // Animation: 10–15 วินาที
    const duration = 10000 + Math.random()*5000;
    const distance = window.innerWidth + 200;

    krathong.style.transition = `transform ${duration}ms linear, opacity ${duration}ms linear`;
    setTimeout(() => {
        krathong.style.transform = fromLeft
            ? `translateX(${distance}px)`
            : `translateX(${-distance}px)`;
        krathong.style.opacity = 0;
    }, 50);

    // ลบหลัง animation
    setTimeout(() => krathong.remove(), duration + 1000);
}

// ===================== ลบกระทงเก่าเกิน 2 นาทีจาก Database =====================
setInterval(() => {
    db.ref("krathongs").once("value", snapshot => {
        snapshot.forEach(child => {
            const data = child.val();
            if (Date.now() - data.time > 2*60*1000) {
                db.ref("krathongs/" + child.key).remove();
            }
        });
    });
}, 60*1000); // ตรวจทุก 1 นาที

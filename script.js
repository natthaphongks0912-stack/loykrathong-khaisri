// 🔥 Firebase Config
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

// DOM
const btnFloat = document.getElementById("btnFloat");
const wishInput = document.getElementById("wishInput");
const floatingArea = document.getElementById("floatingArea");

// เลือกแบบกระทง
let selectedKrathong = "1.png"; // ปรับตามชื่อไฟล์ของคุณ
const choices = document.querySelectorAll("#krathongChoices img");
choices.forEach(choice => {
  choice.addEventListener("click", () => {
    choices.forEach(c => c.classList.remove("selected"));
    choice.classList.add("selected");
    selectedKrathong = choice.dataset.src;
  });
});

// สร้าง sessionId แบบสุ่ม
const sessionId = 'session_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

// ปุ่มปล่อยกระทง
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
    sessionId: sessionId // บอกว่าเป็นกระทงของ session นี้
  };

  // ลอยกระทงบนหน้าจอของตัวเอง
  createKrathongElement(krathong.img, krathong.wish);

  // Push ไป Firebase ให้คนอื่นเห็น
  db.ref("krathongs").push(krathong);

  // ล้าง textarea
  wishInput.value = "";
});

// ฟังทุกกระทงจาก Firebase
db.ref("krathongs").on("child_added", snapshot => {
  const data = snapshot.val();
  
  // แสดงกระทงของคนอื่นหรือกระทงใหม่ แต่ไม่เอากระทงของ session ตัวเองก่อนหน้า
  if (!data.sessionId || data.sessionId !== sessionId) {
    createKrathongElement(data.img, data.wish);
  }
});

// ฟังก์ชันสร้างกระทงและให้ลอย
function createKrathongElement(imgSrc, wishText) {
  const krathong = document.createElement("div");
  krathong.className = "krathong";
  krathong.style.left = "-100px";
  krathong.style.bottom = Math.random() * 200 + "px"; // ลอยสูงต่ำแบบสุ่ม

  const img = document.createElement("img");
  img.src = imgSrc;
  krathong.appendChild(img);

  const wish = document.createElement("div");
  wish.className = "wishText";
  wish.textContent = wishText;
  krathong.appendChild(wish);

  floatingArea.appendChild(krathong);

  // Animation จากซ้ายไปขวา
  const duration = 12000 + Math.random() * 5000; // 12–17 วิ
  krathong.style.transition = `transform ${duration}ms linear, opacity ${duration}ms linear`;

  setTimeout(() => {
    krathong.style.transform = `translateX(${window.innerWidth + 200}px)`;
    krathong.style.opacity = 0;
  }, 50);

  // ลบออกหลังครบเวลา
  setTimeout(() => krathong.remove(), duration + 1000);
}

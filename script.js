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
let selectedKrathong = "1.png";
const choices = document.querySelectorAll("#krathongChoices img");
choices.forEach(choice => {
  choice.addEventListener("click", () => {
    choices.forEach(c => c.classList.remove("selected"));
    choice.classList.add("selected");
    selectedKrathong = choice.dataset.src;
  });
});

// ปล่อยกระทง
btnFloat.addEventListener("click", () => {
  const wishText = wishInput.value.trim();
  if (!wishText) {
    alert("กรุณาเขียนคำอธิษฐานก่อนลอยกระทง 🌕");
    return;
  }
  const krathong = {
    img: selectedKrathong,
    wish: wishText,
    time: Date.now()
  };
  db.ref("krathongs").push(krathong);
  wishInput.value = "";
});

// ฟังข้อมูลเรียลไทม์
db.ref("krathongs").on("child_added", snapshot => {
  const data = snapshot.val();
  createKrathongElement(data.img, data.wish);
});

// สร้างกระทงและให้ลอย
function createKrathongElement(imgSrc, wishText) {
  const krathong = document.createElement("div");
  krathong.className = "krathong";
  krathong.style.left = "-100px";
  krathong.style.bottom = Math.random() * 200 + "px";

  const img = document.createElement("img");
  img.src = imgSrc;
  krathong.appendChild(img);

  const wish = document.createElement("div");
  wish.className = "wishText";
  wish.textContent = wishText;
  krathong.appendChild(wish);

  floatingArea.appendChild(krathong);

  const duration = 12000 + Math.random() * 5000;
  krathong.style.transition = `transform ${duration}ms linear, opacity ${duration}ms linear`;

  setTimeout(() => {
    krathong.style.transform = `translateX(${window.innerWidth + 200}px)`;
    krathong.style.opacity = 0;
  }, 50);

  setTimeout(() => krathong.remove(), duration + 1000);
}

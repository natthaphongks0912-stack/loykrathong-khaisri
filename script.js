document.addEventListener("DOMContentLoaded", () => {

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

  // เลือกกระทง
  let selectedKrathong = "1.png"; 
  const choices = document.querySelectorAll("#krathongChoices img");
  choices.forEach(choice => {
    choice.addEventListener("click", () => {
      choices.forEach(c => c.classList.remove("selected"));
      choice.classList.add("selected");
      selectedKrathong = choice.dataset.src;
    });
  });

  const sessionId = 'session_' + Date.now() + '_' + Math.floor(Math.random()*1000);
  const sessionStart = Date.now();

  // ลบกระทงเก่าเกิน 2 นาที (120,000 ms) แบบ client-side
  db.ref("krathongs").once("value", snapshot => {
    const now = Date.now();
    snapshot.forEach(child => {
      const data = child.val();
      if(data.time && (now - data.time > 120000)){
        db.ref("krathongs").child(child.key).remove();
      }
    });
  });

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
      sessionId: sessionId
    };

    createKrathongElement(krathong.img, krathong.wish);
    db.ref("krathongs").push(krathong);
    wishInput.value = "";
  });

  wishInput.addEventListener("keypress", (e) => {
    if(e.key === "Enter"){
      e.preventDefault();
      btnFloat.click();
    }
  });

  // ฟังกระทงใหม่แบบ realtime
  db.ref("krathongs").on("child_added", snapshot => {
    const data = snapshot.val();
    const now = Date.now();

    // แสดงเฉพาะกระทงไม่เกิน 2 นาที และไม่ใช่ของ session ตัวเองที่โหลดก่อนหน้า
    if(now - data.time <= 120000 && data.time >= sessionStart && data.sessionId !== sessionId){
      createKrathongElement(data.img, data.wish);
    }
  });

  // สร้างกระทงและลอยแบบสุ่ม
  function createKrathongElement(imgSrc, wishText){
    const krathong = document.createElement("div");
    krathong.className = "krathong";

    // ลอยซ้าย->ขวา หรือ ขวา->ซ้าย แบบสุ่ม
    const direction = Math.random() < 0.5 ? "ltr" : "rtl";
    krathong.style.bottom = Math.random()*200 + "px";

    const img = document.createElement("img");
    img.src = imgSrc;
    krathong.appendChild(img);

    const wish = document.createElement("div");
    wish.className = "wishText";
    wish.textContent = wishText;
    krathong.appendChild(wish);

    floatingArea.appendChild(krathong);

    // ความเร็วลอยสุ่ม 10-15 วินาที
    const duration = 10000 + Math.random()*5000;
    krathong.style.transition = `transform ${duration}ms linear, opacity ${duration}ms linear`;

    setTimeout(()=>{
      if(direction === "ltr"){
        krathong.style.left = "-100px"; 
        krathong.style.transform = `translateX(${window.innerWidth + 200}px)`;
      } else {
        krathong.style.left = window.innerWidth + "px"; 
        krathong.style.transform = `translateX(-${window.innerWidth + 200}px)`;
      }
      krathong.style.opacity = 0;
    },50);

    setTimeout(()=> krathong.remove(), duration + 1000);
  }

});

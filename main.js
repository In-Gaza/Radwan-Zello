// استيراد Firebase
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onChildAdded } from "firebase/database";

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAxoC6esP0bRsZ5i5--RBTpPeTTVOhoD1Y",
  authDomain: "radwan-zello.firebaseapp.com",
  databaseURL: "https://radwan-zello-default-rtdb.firebaseio.com",
  projectId: "radwan-zello",
  storageBucket: "radwan-zello.firebasestorage.app",
  messagingSenderId: "610135917058",
  appId: "1:610135917058:web:593bcd470bf91d80269d1b"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, "messages");

// عناصر HTML
const recordBtn = document.getElementById("recordBtn");

// متغيرات التسجيل
let mediaRecorder;
let audioChunks = [];

// بدء التسجيل عند الضغط
recordBtn.addEventListener("mousedown", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = e => {
    audioChunks.push(e.data);
  };

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    audioChunks = [];

    // تحويل إلى Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result;

      // إرسال إلى قاعدة البيانات
      push(messagesRef, {
        audio: base64Audio,
        timestamp: Date.now()
      });
    };
    reader.readAsDataURL(audioBlob);
  };

  mediaRecorder.start();
  console.log("بدأ التسجيل...");
});

// إيقاف التسجيل عند رفع الضغط
recordBtn.addEventListener("mouseup", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("توقف التسجيل");
  }
});

// تشغيل الأصوات عند وصولها من الآخرين
onChildAdded(messagesRef, snapshot => {
  const message = snapshot.val();
  if (message.audio) {
    const audio = new Audio(message.audio);
    audio.play();
  }
});

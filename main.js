import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onChildAdded } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAxoC6esP0bRsZ5i5--RBTpPeTTVOhoD1Y",
  authDomain: "radwan-zello.firebaseapp.com",
  databaseURL: "https://radwan-zello-default-rtdb.firebaseio.com",
  projectId: "radwan-zello",
  storageBucket: "radwan-zello.firebasestorage.app",
  messagingSenderId: "610135917058",
  appId: "1:610135917058:web:593bcd470bf91d80269d1b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, "messages");

// تهيئة Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAxoC6esP0bRsZ5i5--RBTpPeTTVOhoD1Y",
  authDomain: "radwan-zello.firebaseapp.com",
  databaseURL: "https://radwan-zello-default-rtdb.firebaseio.com",
  projectId: "radwan-zello",
  storageBucket: "radwan-zello.firebasestorage.app",
  messagingSenderId: "610135917058",
  appId: "1:610135917058:web:593bcd470bf91d80269d1b"
};

// تحميل مكتبات Firebase (Firebase compat SDKs مضافة في HTML)
firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const messagesRef = db.ref("messages");

// عناصر HTML
const recordBtn = document.getElementById("recordBtn");
const status = document.getElementById("status");

let mediaRecorder;
let audioChunks = [];

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = e => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      audioChunks = [];

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result;
        messagesRef.push({
          audio: base64Audio,
          timestamp: Date.now()
        });
        status.textContent = "تم إرسال التسجيل ✔️";
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorder.start();
    status.textContent = "يتم التسجيل... 🎤";
  } catch (err) {
    status.textContent = "لم يتم منح إذن الميكروفون!";
    console.error("خطأ في الوصول إلى الميكروفون:", err);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    status.textContent = "تم إيقاف التسجيل";
  }
}

// بدء التسجيل عند الضغط مع الاستمرار
recordBtn.addEventListener("mousedown", () => {
  startRecording();
});

// إيقاف التسجيل عند رفع الضغط
recordBtn.addEventListener("mouseup", () => {
  stopRecording();
});

// تشغيل الأصوات عند وصولها من الآخرين
messagesRef.on("child_added", snapshot => {
  const message = snapshot.val();
  if (message.audio) {
    const audio = new Audio(message.audio);
    audio.play().catch(e => console.warn("خطأ في تشغيل الصوت:", e));
  }
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, set, onDisconnect, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// إعدادات Firebase الخاصة بك
const firebaseConfig = {
  apiKey: "AIzaSyDO5c6tKCzondWfKYiyqYqh4-pIuOjCNVY",
  authDomain: "family-zello.firebaseapp.com",
  databaseURL: "https://family-zello-default-rtdb.firebaseio.com",
  projectId: "family-zello",
  storageBucket: "family-zello.firebasestorage.app",
  messagingSenderId: "904926022752",
  appId: "1:904926022752:web:11bcdef3f51643a3e70705"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// تسجيل الدخول المجهول
signInAnonymously(auth).catch(e => {
  console.error("فشل تسجيل الدخول:", e.message);
});

// حساب عدد المتصلين
const onlineCountSpan = document.getElementById("onlineCount");

// معرف فريد مؤقت للمستخدم (يمكن تحسينه لاحقًا)
const userId = Math.random().toString(36).substring(2, 10);
const userRef = ref(db, "onlineUsers/" + userId);

// سجل وجود المستخدم
set(userRef, true);
onDisconnect(userRef).remove();

// حدث تحديث عدد المتصلين
const onlineUsersRef = ref(db, "onlineUsers");
onValue(onlineUsersRef, snapshot => {
  const count = snapshot.size || snapshot.numChildren();
  onlineCountSpan.textContent = `المتصلون الآن: ${count}`;
});

// ----------------------------
// تسجيل الصوت مع ضغط طويل
// ----------------------------
const recordBtn = document.getElementById("recordBtn");

let mediaRecorder = null;
let audioChunks = [];

async function startRecording() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("متصفحك لا يدعم تسجيل الصوت");
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = e => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = e => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      audioChunks = [];
      playAudio(audioBlob);
      // هنا يمكنك إضافة رفع الصوت إلى Firebase Storage لاحقًا
    };

    mediaRecorder.start();
    recordBtn.classList.add("recording");
  } catch (err) {
    alert("فشل الحصول على إذن المايكروفون");
    console.error(err);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    recordBtn.classList.remove("recording");
  }
}

function playAudio(blob) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
}

// التحكم بزر الضغط الطويل
let pressTimer = null;

recordBtn.addEventListener("mousedown", () => {
  startRecording();
});

recordBtn.addEventListener("mouseup", () => {
  stopRecording();
});

recordBtn.addEventListener("mouseleave", () => {
  stopRecording();
});

recordBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  startRecording();
});

recordBtn.addEventListener("touchend", e => {
  e.preventDefault();
  stopRecording();
});

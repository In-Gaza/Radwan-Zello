import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  onDisconnect,
  push
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDO5c6tKCzondWfKYiyqYqh4-pIuOjCNVY",
  authDomain: "family-zello.firebaseapp.com",
  databaseURL: "https://family-zello-default-rtdb.firebaseio.com",
  projectId: "family-zello",
  storageBucket: "family-zello.appspot.com",
  messagingSenderId: "904926022752",
  appId: "1:904926022752:web:11bcdef3f51643a3e70705"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

signInAnonymously(auth);

const userId = Math.random().toString(36).substring(2, 10);
const userRef = ref(db, "onlineUsers/" + userId);
set(userRef, true);
onDisconnect(userRef).remove();

const onlineCountSpan = document.getElementById("onlineCount");
const onlineUsersRef = ref(db, "onlineUsers");

onValue(onlineUsersRef, snapshot => {
  const count = snapshot.size || snapshot.numChildren();
  onlineCountSpan.textContent = `المتصلون الآن: ${count}`;
});

const recordBtn = document.getElementById("recordBtn");

let mediaRecorder = null;
let audioChunks = [];

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = e => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      audioChunks = [];

      const filename = `voice_${Date.now()}.webm`;
      const audioRef = storageRef(storage, `voices/${filename}`);

      await uploadBytes(audioRef, audioBlob);
      const downloadURL = await getDownloadURL(audioRef);

      const voiceRef = push(ref(db, "voices"));
      set(voiceRef, {
        url: downloadURL,
        time: Date.now()
      });
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

recordBtn.addEventListener("mousedown", () => startRecording());
recordBtn.addEventListener("mouseup", () => stopRecording());
recordBtn.addEventListener("mouseleave", () => stopRecording());
recordBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  startRecording();
});
recordBtn.addEventListener("touchend", e => {
  e.preventDefault();
  stopRecording();
});

// تشغيل الصوت الجديد تلقائيًا
const voicesRef = ref(db, "voices");
let lastPlayed = 0;

onValue(voicesRef, snapshot => {
  const voices = snapshot.val();
  if (!voices) return;

  const sorted = Object.values(voices).sort((a, b) => a.time - b.time);
  const latest = sorted[sorted.length - 1];

  if (latest.time > lastPlayed) {
    lastPlayed = latest.time;
    const audio = new Audio(latest.url);
    audio.play();
  }
});

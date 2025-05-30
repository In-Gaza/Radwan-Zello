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

const recordBtn = document.getElementById("recordBtn");

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
        push(messagesRef, {
          audio: base64Audio,
          timestamp: Date.now()
        });
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorder.start();
    console.log("بدأ التسجيل...");
  } catch (err) {
    alert("يرجى السماح بالوصول إلى الميكروفون");
    console.error(err);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("توقف التسجيل");
  }
}

recordBtn.addEventListener("mousedown", startRecording);
recordBtn.addEventListener("mouseup", stopRecording);
recordBtn.addEventListener("mouseleave", stopRecording);

onChildAdded(messagesRef, snapshot => {
  const message = snapshot.val();
  if (message.audio) {
    const audio = new Audio(message.audio);
    audio.play().catch(e => {
      console.warn("تعذر تشغيل الصوت تلقائيًا:", e);
    });
  }
});


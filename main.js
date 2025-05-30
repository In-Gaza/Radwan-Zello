import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    onChildAdded
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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
const status = document.getElementById("status");

// متغيرات التسجيل
let mediaRecorder;
let audioChunks = [];
let audioStream = null;

// بدء التسجيل
async function startRecording() {
    try {
        if (!audioStream) {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        mediaRecorder = new MediaRecorder(audioStream);
        audioChunks = [];

        mediaRecorder.ondataavailable = e => {
            audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64Audio = reader.result;
                push(messagesRef, {
                    audio: base64Audio,
                    timestamp: Date.now()
                });
            };

            reader.readAsDataURL(audioBlob);
            status.textContent = "تم إرسال التسجيل";
        };

        mediaRecorder.start();
        status.textContent = "التسجيل جاري... 🎤";
    } catch (error) {
        console.error("خطأ في الوصول للميكروفون:", error);
        status.textContent = "لم يتم منح إذن الميكروفون!";
    }
}

// إيقاف التسجيل
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
}

// دعم أحداث الماوس واللمس
recordBtn.addEventListener("mousedown", startRecording);
recordBtn.addEventListener("touchstart", (e) => {
    e.preventDefault(); // منع تمرير الصفحة على الجوال أثناء اللمس
    startRecording();
});

recordBtn.addEventListener("mouseup", stopRecording);
recordBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    stopRecording();
});

// تشغيل الرسائل الصوتية الواردة من الآخرين
onChildAdded(messagesRef, snapshot => {
    const message = snapshot.val();
    if (message.audio) {
        const audio = new Audio(message.audio);
        audio.play();
    }
});

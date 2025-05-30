// === Firebase config ===
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const recordBtn = document.getElementById("recordBtn");
const messagesDiv = document.getElementById("messages");

let mediaRecorder;
let chunks = [];

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = e => chunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result;
      const time = Date.now();
      db.ref("messages/" + time).set({ audio: base64 });
      chunks = [];
    };

    reader.readAsDataURL(blob);
  };
});

recordBtn.addEventListener("mousedown", () => {
  chunks = [];
  mediaRecorder.start();
});

recordBtn.addEventListener("mouseup", () => {
  mediaRecorder.stop();
});

// الاستماع للرسائل الجديدة
db.ref("messages").on("child_added", snapshot => {
  const data = snapshot.val();
  if (data.audio) {
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = data.audio;
    messagesDiv.prepend(audio);
  }
});


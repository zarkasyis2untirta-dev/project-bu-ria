// Konfigurasi & Inisialisasi Firebase Firestore
const firebaseConfig = {
    apiKey: "AIzaSyC0LM3tc_x3dJuyNJlOS0V2BNFiLjgyVaY",
    authDomain: "project-bu-ria-f1ec2.firebaseapp.com",
    projectId: "project-bu-ria-f1ec2",
    storageBucket: "project-bu-ria-f1ec2.firebasestorage.app",
    messagingSenderId: "493584914070",
    appId: "1:493584914070:web:19f706eee31fb8f38594b7"
};

let db = null;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
} catch (e) {
    console.warn("Firebase offline mode fallback activated:", e);
}

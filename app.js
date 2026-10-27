// Global Application State
let studentSession = {
    name: '',
    nim: '',
    classRoom: '',
    pretestAnswers: {},
    pretestScore: 0,
    posttestAnswers: {},
    posttestScore: 0,
    timestamp: null
};

let currentPreTestIdx = 0;
let currentPostTestIdx = 0;
let isPostTestFinished = false;

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});

// --- VALIDATION & SESSION LOGIC (CHECK NIM IN FIREBASE) ---
async function checkAndStartSession() {
    const name = document.getElementById('input-name').value.trim();
    const nim = document.getElementById('input-nim').value.trim();
    const cls = document.getElementById('input-class').value.trim();

    if (!name || !nim || !cls) {
        document.getElementById('reg-error').classList.remove('hidden');
        return;
    }
    document.getElementById('reg-error').classList.add('hidden');

    studentSession.name = name;
    studentSession.nim = nim;
    studentSession.classRoom = cls;

    let existingData = null;
    if (db) {
        try {
            const docRef = await db.collection("student_results").doc(nim).get();
            if (docRef.exists) {
                existingData = docRef.data();
            }
        } catch (e) {
            console.error("Error checking existing NIM:", e);
        }
    }

    if (existingData) {
        studentSession.pretestScore = existingData.pretestScore || 0;
        studentSession.posttestScore = existingData.posttestScore || 0;
        enterMainStage();
        showToast(`Selamat datang kembali, ${name}! Data Anda ditemukan.`);
    } else {
        document.getElementById('reg-form-box').classList.add('hidden');
        document.getElementById('pretest-quiz-box').classList.remove('hidden');
        renderPreTestQuestion();
    }
}

function enterMainStage() {
    document.getElementById('stage-pretest').classList.add('hidden');
    document.getElementById('stage-main').classList.remove('hidden');
    document.getElementById('student-badge-container').style.display = 'flex';
    document.getElementById('nav-student-info').innerText = `${studentSession.name} (${studentSession.classRoom})`;
    document.getElementById('welcome-student-name').innerText = `Halo, ${studentSession.name}!`;
    document.getElementById('welcome-student-meta').innerText = `NIM/NIS: ${studentSession.nim} | Kelas: ${studentSession.classRoom}`;
    document.getElementById('display-pretest-score').innerText = `${studentSession.pretestScore} / 100`;
    lucide.createIcons();
}

function renderPreTestQuestion() {
    const container = document.getElementById('pretest-question-container');
    const q = quizQuestions[currentPreTestIdx];
    document.getElementById('pretest-counter').innerText = `Soal ${currentPreTestIdx + 1} dari 10`;

    let html = `<p class="text-sm sm:text-base font-bold text-white mb-4">${currentPreTestIdx + 1}. ${q.q}</p><div class="space-y-2.5">`;
    q.options.forEach((opt, idx) => {
        const selected = studentSession.pretestAnswers[currentPreTestIdx] === idx;
        html += `
            <button onclick="selectPreTestOpt(${idx})" class="w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${selected ? 'bg-teal-600/40 border-teal-400 text-white font-semibold' : 'bg-emerald-950/70 border-teal-800/80 text-emerald-100 hover:border-teal-400'}">
                <span>${opt}</span>
                <span class="w-5 h-5 rounded-full border border-teal-500/50 flex items-center justify-center text-[10px] ${selected ? 'bg-teal-500 text-white' : ''}">${selected ? '✓' : ''}</span>
            </button>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;

    document.getElementById('pretest-prev-btn').disabled = currentPreTestIdx === 0;
    const nextBtn = document.getElementById('pretest-next-btn');
    if (currentPreTestIdx === 9) {
        nextBtn.innerHTML = `<span>Selesai & Buka Materi</span> <i data-lucide="check-circle" class="w-4 h-4"></i>`;
    } else {
        nextBtn.innerHTML = `<span>Selanjutnya</span> <i data-lucide="chevron-right" class="w-4 h-4"></i>`;
    }
    lucide.createIcons();
}

function selectPreTestOpt(optIdx) {
    studentSession.pretestAnswers[currentPreTestIdx] = optIdx;
    renderPreTestQuestion();
}

function prevPreTestQ() {
    if (currentPreTestIdx > 0) {
        currentPreTestIdx--;
        renderPreTestQuestion();
    }
}

function nextPreTestQ() {
    if (studentSession.pretestAnswers[currentPreTestIdx] === undefined) {
        showToast("Pilih salah satu jawaban terlebih dahulu!");
        return;
    }
    if (currentPreTestIdx < 9) {
        currentPreTestIdx++;
        renderPreTestQuestion();
    } else {
        finishPreTest();
    }
}

function finishPreTest() {
    let correct = 0;
    quizQuestions.forEach((q, idx) => {
        if (studentSession.pretestAnswers[idx] === q.answer) correct++;
    });
    studentSession.pretestScore = correct * 10;
    studentSession.timestamp = new Date().toISOString();

    saveSessionToFirebase();
    enterMainStage();
    showToast("Pre-Test selesai! Menu materi dan video interaktif kini terbuka.");
}

// --- NAVIGATION TABS ---
function switchTab(tabName) {
    ['materi', 'video', 'posttest', 'leaderboard'].forEach(t => {
        const contentEl = document.getElementById(`tabcontent-${t}`);
        const navEl = document.getElementById(`navtab-${t}`);
        if (contentEl) contentEl.classList.add('hidden');
        if (navEl) navEl.className = "px-4 py-2 rounded-xl text-xs font-bold transition text-emerald-200 hover:bg-teal-900/40 flex items-center gap-2 border border-transparent";
    });
    
    const activeContent = document.getElementById(`tabcontent-${tabName}`);
    const activeNav = document.getElementById(`navtab-${tabName}`);
    
    if (activeContent) activeContent.classList.remove('hidden');
    if (activeNav) activeNav.className = "active-nav px-4 py-2 rounded-xl text-xs font-bold transition text-white flex items-center gap-2 border border-transparent";
    
    if (tabName === 'posttest' && Object.keys(studentSession.posttestAnswers).length === 0 && !isPostTestFinished) {
        renderPostTestQuestion();
    }
    if (tabName === 'leaderboard') {
        loadLeaderboardTab();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    lucide.createIcons();
}

// --- YOUTUBE CONTROLS ---
function setPresetVideo(embedUrl) {
    document.getElementById('youtube-iframe').src = embedUrl;
    showToast("Video YouTube berhasil dimuat!");
}

function loadCustomYouTube() {
    let rawUrl = document.getElementById('youtube-url-input').value.trim();
    if (!rawUrl) {
        showToast("Masukkan URL YouTube terlebih dahulu!");
        return;
    }
    if (rawUrl.includes("watch?v=")) {
        rawUrl = rawUrl.replace("watch?v=", "embed/");
    } else if (rawUrl.includes("youtu.be/")) {
        const parts = rawUrl.split("youtu.be/");
        rawUrl = "https://www.youtube.com/embed/" + parts[1];
    }
    document.getElementById('youtube-iframe').src = rawUrl;
    showToast("Video custom YouTube berhasil disematkan!");
}

function copyYouTubeLink() {
    const iframeSrc = document.getElementById('youtube-iframe').src;
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = iframeSrc;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    showToast("Link YouTube berhasil disalin ke clipboard!");
}

// --- POST-TEST LOGIC ---
function renderPostTestQuestion() {
    isPostTestFinished = false;
    document.getElementById('posttest-header-box').style.display = 'flex';
    const container = document.getElementById('posttest-question-container');
    const footer = document.getElementById('posttest-nav-footer');
    footer.style.display = 'flex';

    const q = quizQuestions[currentPostTestIdx];
    document.getElementById('posttest-counter').innerText = `Soal ${currentPostTestIdx + 1} dari 10`;

    let html = `<p class="text-sm sm:text-base font-bold text-white mb-4">${currentPostTestIdx + 1}. ${q.q}</p><div class="space-y-2.5">`;
    q.options.forEach((opt, idx) => {
        const selected = studentSession.posttestAnswers[currentPostTestIdx] === idx;
        html += `
            <button onclick="selectPostTestOpt(${idx})" class="w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${selected ? 'bg-teal-600/40 border-teal-400 text-white font-semibold' : 'bg-emerald-950/70 border-teal-800/80 text-emerald-100 hover:border-teal-400'}">
                <span>${opt}</span>
                <span class="w-5 h-5 rounded-full border border-teal-500/50 flex items-center justify-center text-[10px] ${selected ? 'bg-teal-500 text-white' : ''}">${selected ? '✓' : ''}</span>
            </button>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;

    document.getElementById('posttest-prev-btn').disabled = currentPostTestIdx === 0;
    const nextBtn = document.getElementById('posttest-next-btn');
    if (currentPostTestIdx === 9) {
        nextBtn.innerHTML = `<span>Simpulkan & Kirim Post-Test</span> <i data-lucide="check-circle" class="w-4 h-4"></i>`;
    } else {
        nextBtn.innerHTML = `<span>Selanjutnya</span> <i data-lucide="chevron-right" class="w-4 h-4"></i>`;
    }
    lucide.createIcons();
}

function selectPostTestOpt(optIdx) {
    studentSession.posttestAnswers[currentPostTestIdx] = optIdx;
    renderPostTestQuestion();
}

function prevPostTestQ() {
    if (currentPostTestIdx > 0) {
        currentPostTestIdx--;
        renderPostTestQuestion();
    }
}

function nextPostTestQ() {
    if (studentSession.posttestAnswers[currentPostTestIdx] === undefined) {
        showToast("Pilih salah satu jawaban terlebih dahulu!");
        return;
    }
    if (currentPostTestIdx < 9) {
        currentPostTestIdx++;
        renderPostTestQuestion();
    } else {
        finishPostTest();
    }
}

function finishPostTest() {
    let correct = 0;
    quizQuestions.forEach((q, idx) => {
        if (studentSession.posttestAnswers[idx] === q.answer) correct++;
    });
    studentSession.posttestScore = correct * 10;
    isPostTestFinished = true;
    studentSession.timestamp = new Date().toISOString();

    saveSessionToFirebase();
    showToast(`Post-Test selesai! Skor Anda: ${studentSession.posttestScore} / 100`);

    document.getElementById('posttest-header-box').style.display = 'none';
    const container = document.getElementById('posttest-question-container');
    document.getElementById('posttest-nav-footer').style.display = 'none';

    container.innerHTML = `
        <div class="text-center py-6 space-y-4">
            <div class="inline-flex p-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
                <i data-lucide="award" class="w-12 h-12"></i>
            </div>
            <h3 class="text-xl sm:text-2xl font-extrabold text-white">Evaluasi Post-Test Selesai!</h3>
            <p class="text-xs sm:text-sm text-emerald-200">Terima kasih telah menyelesaikan seluruh rangkaian modul pembelajaran Teks Deskripsi.</p>
            
            <div class="inline-block bg-emerald-950/80 border border-teal-500/30 px-6 py-3 rounded-2xl my-3">
                <span class="text-xs text-teal-300 block uppercase font-bold">Skor Akhir Anda</span>
                <span class="text-3xl font-extrabold text-amber-400">${studentSession.posttestScore} / 100</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 max-w-xl mx-auto">
                <button onclick="switchTab('materi')" class="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg">
                    <i data-lucide="book-open" class="w-4 h-4"></i>
                    <span>Kembali ke Materi</span>
                </button>
                <button onclick="restartPostTest()" class="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg">
                    <i data-lucide="rotate-cw" class="w-4 h-4"></i>
                    <span>Ulangi Post-Test</span>
                </button>
                <button onclick="switchTab('leaderboard')" class="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg">
                    <i data-lucide="trophy" class="w-4 h-4"></i>
                    <span>Lihat Leaderboard</span>
                </button>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function restartPostTest() {
    studentSession.posttestAnswers = {};
    currentPostTestIdx = 0;
    renderPostTestQuestion();
    showToast("Silakan mulai ulang Post-Test!");
}

// --- FIREBASE DATABASE SYNC (CRUD) ---
function saveSessionToFirebase() {
    if (!db) return;
    try {
        db.collection("student_results").doc(studentSession.nim).set({
            name: studentSession.name,
            nim: studentSession.nim,
            classRoom: studentSession.classRoom,
            pretestScore: studentSession.pretestScore,
            posttestScore: studentSession.posttestScore,
            timestamp: studentSession.timestamp || new Date().toISOString()
        }, { merge: true }).catch(err => console.error("Firebase write error:", err));
    } catch (e) {
        console.error("Firestore sync exception:", e);
    }
}

async function deleteStudentRecord(nim) {
    if (!confirm(`Apakah Anda yakin ingin menghapus data siswa dengan NIM/NIS ${nim}?`)) return;
    if (db) {
        try {
            await db.collection("student_results").doc(nim).delete();
            showToast(`Data siswa ${nim} berhasil dihapus.`);
            loadLeaderboardTab();
            loadAdminTable();
        } catch (e) {
            console.error("Error deleting document:", e);
            showToast("Gagal menghapus data.");
        }
    }
}

// --- LEADERBOARD TAB & ADMIN TABLE ---
async function loadLeaderboardTab() {
    const container = document.getElementById('leaderboard-table-body');
    if (!container) return;
    container.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-emerald-300">Memuat data leaderboard...</td></tr>`;

    let participants = [];
    if (db) {
        try {
            const snapshot = await db.collection("student_results").orderBy("posttestScore", "desc").get();
            snapshot.forEach(doc => {
                participants.push(doc.data());
            });
        } catch (e) {
            console.error("Error reading leaderboard:", e);
        }
    }

    if (!participants.some(p => p.nim === studentSession.nim) && studentSession.name) {
        participants.push(studentSession);
    }

    participants.sort((a, b) => b.posttestScore - a.posttestScore);

    if (participants.length === 0) {
        container.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-emerald-300">Belum ada data peserta.</td></tr>`;
        return;
    }

    let html = ``;
    participants.forEach((p, idx) => {
        const formattedDate = p.timestamp ? new Date(p.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';
        html += `
            <tr class="hover:bg-emerald-900/30 transition">
                <td class="p-3 text-center font-extrabold text-amber-400">#${idx + 1}</td>
                <td class="p-3 font-mono text-[11px] text-emerald-200">${formattedDate}</td>
                <td class="p-3 font-bold text-white">${p.name}</td>
                <td class="p-3 font-mono text-teal-300">${p.nim}</td>
                <td class="p-3">${p.classRoom}</td>
                <td class="p-3 text-center font-bold text-teal-300">${p.pretestScore || 0}</td>
                <td class="p-3 text-center font-extrabold text-amber-400">${p.posttestScore || 0}</td>
            </tr>
        `;
    });
    container.innerHTML = html;
    lucide.createIcons();
}

// --- ADMIN PANEL & TABLE CRUD ---
function openAdminModal() {
    document.getElementById('admin-modal').classList.remove('hidden');
    document.getElementById('admin-pass').value = '';
    document.getElementById('admin-login-error').classList.add('hidden');
    document.getElementById('admin-login-box').classList.remove('hidden');
    document.getElementById('admin-panel-box').classList.add('hidden');
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
}

async function verifyAdmin() {
    const pass = document.getElementById('admin-pass').value.trim();
    if (pass === "admin123") {
        document.getElementById('admin-login-box').classList.add('hidden');
        document.getElementById('admin-panel-box').classList.remove('hidden');
        showToast("Login Admin Berhasil!");
        await loadAdminTable();
    } else {
        document.getElementById('admin-login-error').classList.remove('hidden');
    }
}

async function loadAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-emerald-300">Memuat data peserta...</td></tr>`;

    let participants = [];
    if (db) {
        try {
            const snapshot = await db.collection("student_results").get();
            snapshot.forEach(doc => {
                participants.push(doc.data());
            });
        } catch (e) {
            console.error("Error reading admin table:", e);
        }
    }

    if (!participants.some(p => p.nim === studentSession.nim) && studentSession.name) {
        participants.push(studentSession);
    }

    if (participants.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-emerald-300">Belum ada data peserta.</td></tr>`;
        return;
    }

    let html = ``;
    participants.forEach(p => {
        const formattedDate = p.timestamp ? new Date(p.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';
        html += `
            <tr class="hover:bg-emerald-900/30 transition">
                <td class="p-3 font-mono text-[11px] text-emerald-200">${formattedDate}</td>
                <td class="p-3 font-bold text-white">${p.name}</td>
                <td class="p-3 font-mono text-teal-300">${p.nim}</td>
                <td class="p-3">${p.classRoom}</td>
                <td class="p-3 text-center font-bold text-teal-300">${p.pretestScore || 0}</td>
                <td class="p-3 text-center font-extrabold text-amber-400">${p.posttestScore || 0}</td>
                <td class="p-3 text-center">
                    <button onclick="deleteStudentRecord('${p.nim}')" class="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 text-[11px] font-semibold transition flex items-center justify-center gap-1 mx-auto">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Hapus
                    </button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
    lucide.createIcons();
}

async function downloadCSVSpreadsheet() {
    let participants = [];
    if (db) {
        try {
            const snapshot = await db.collection("student_results").get();
            snapshot.forEach(doc => {
                participants.push(doc.data());
            });
        } catch (e) {
            console.error("Error fetching for CSV:", e);
        }
    }
    if (!participants.some(p => p.nim === studentSession.nim) && studentSession.name) {
        participants.push(studentSession);
    }

    if (participants.length === 0) {
        showToast("Tidak ada data peserta untuk diunduh.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Tanggal,Nama,NIM_NIS,Kelas,Skor_PreTest,Skor_PostTest\n";
    participants.forEach(p => {
        const dateStr = p.timestamp ? new Date(p.timestamp).toISOString() : '-';
        csvContent += `"${dateStr}","${p.name}","${p.nim}","${p.classRoom}",${p.pretestScore || 0},${p.posttestScore || 0}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Rekap_Nilai_Teks_Deskripsi_SMP.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Spreadsheet CSV berhasil diunduh!");
}

// --- TOAST NOTIFICATION HELPER ---
function showToast(msg) {
    const toast = document.getElementById('toast-box');
    if (!toast) return;
    document.getElementById('toast-text').innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3500);
}

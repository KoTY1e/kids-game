document.addEventListener('DOMContentLoaded', () => {
    renderQuestions();

    document.getElementById('add-q-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('q-audio-file');
        if(fileInput.files.length === 0) return alert("Please select an audio file!");

        try {
            const audioBase64 = await Storage.fileToBase64(fileInput.files[0]);

            const newQuestion = {
                id: Date.now(),
                miniGame: document.getElementById('q-minigame').value,
                points: parseInt(document.getElementById('q-points').value),
                audio: audioBase64,
                answers: [
                    document.getElementById('ans-in-0').value,
                    document.getElementById('ans-in-1').value,
                    document.getElementById('ans-in-2').value,
                    document.getElementById('ans-in-3').value
                ],
                correct: parseInt(document.querySelector('input[name="correct-ans"]:checked').value)
            };

            const questions = Storage.getQuestions();
            questions.push(newQuestion);
            Storage.saveQuestions(questions);
            
            e.target.reset(); 
            renderQuestions();
            alert("Question added successfully!");

        } catch (error) {
            console.error(error);
            if(error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                alert("Storage Full! The audio file is too large. Please compress your MP3 file before uploading.");
            } else {
                alert("Error saving question.");
            }
        }
    });
});

function renderQuestions() {
    const questions = Storage.getQuestions();
    const list = document.getElementById('questions-list');
    document.getElementById('q-count').innerText = questions.length;
    
    list.innerHTML = '';
    
    if(questions.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#888;">No questions yet. Add one!</p>';
        return;
    }

    questions.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'q-item';
        item.innerHTML = `
            <div class="q-info">
                <h3>Question ${index + 1} (${q.points} Pts)</h3>
                <p>Mini Game: ${q.miniGame} | Correct: Answer ${q.correct + 1}</p>
            </div>
            <div class="q-actions">
                <button class="btn-delete" onclick="deleteQuestion(${q.id})">🗑 Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
}

function deleteQuestion(id) {
    if(confirm("Are you sure you want to delete this question?")) {
        let questions = Storage.getQuestions();
        questions = questions.filter(q => q.id !== id);
        Storage.saveQuestions(questions);
        renderQuestions();
    }
}

// --- Sync Data Functions (Phone <-> Laptop) ---

function exportData() {
    const data = localStorage.getItem('kids_questions');
    if (!data || data === '[]') return alert("No questions to export!");
    
    // تشفير البيانات لتجنب أي مشاكل أو مسافات عند النسخ
    const encodedData = btoa(encodeURIComponent(data)); 
    document.getElementById('sync-code').value = encodedData;
    
    // محاولة نسخ النص تلقائياً للحافظة
    navigator.clipboard.writeText(encodedData).then(() => {
        alert("✅ Code copied! Send it to your laptop (e.g. via WhatsApp/Notes) and paste it there.");
    }).catch(err => {
        alert("Code generated! Please copy the text inside the box manually.");
    });
}

function importData() {
    const code = document.getElementById('sync-code').value.trim();
    if (!code) return alert("❌ Please paste the code first!");
    
    try {
        // فك التشفير
        const decodedData = decodeURIComponent(atob(code));
        
        // التأكد من أن البيانات الناتجة هي مصفوفة أسئلة صحيحة
        const parsed = JSON.parse(decodedData);
        if (Array.isArray(parsed)) {
            localStorage.setItem('kids_questions', decodedData);
            renderQuestions(); // تحديث القائمة فوراً
            document.getElementById('sync-code').value = ''; // تنظيف المربع
            alert("🎉 Questions imported successfully! You can start the game now.");
        } else {
            throw new Error("Invalid format");
        }
    } catch(e) {
        alert("❌ Invalid code! Make sure you copied the whole text.");
        console.error(e);
    }
}
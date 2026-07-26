let teams = Storage.getTeams();
let questions = Storage.getQuestions();
// نسخ جميع الأسئلة وتصفيتها لضمان عدم التكرار طوال اللعبة
let remainingQuestions = [...questions]; 
let currentTurn = Storage.getTurn() - 1; // 0 for T1, 1 for T2, 2 for T3
let currentQuestion = null;
let audioPlayer = document.getElementById('q-audio');

document.addEventListener('DOMContentLoaded', () => {
    updateScoreboard();
    setupTurnScreen();

    audioPlayer.onended = () => {
        document.getElementById('answers-grid').classList.remove('hidden');
    };
});

function updateScoreboard() {
    teams.forEach((t, index) => {
        const idx = index + 1;
        document.getElementById(`name-t${idx}`).innerText = `${t.emoji} ${t.name}`;
        document.getElementById(`pts-t${idx}`).innerText = t.score;
        document.getElementById(`score-t${idx}`).style.borderColor = t.color;
    });
}

function setupTurnScreen() {
    const activeTeam = teams[currentTurn];
    const indicator = document.getElementById('turn-indicator');
    document.getElementById('turn-text').innerText = `${activeTeam.name}'s Turn!`;
    document.getElementById('turn-text').style.color = activeTeam.color;
    
    // إبراز الفريق صاحب الدور الحالي في لوحة النتائج
    for(let i=1; i<=3; i++) {
        let el = document.getElementById(`score-t${i}`);
        if(i - 1 === currentTurn) {
            el.style.transform = 'scale(1.1)';
            el.style.opacity = '1';
        } else {
            el.style.transform = 'scale(1)';
            el.style.opacity = '0.5';
        }
    }

    indicator.classList.remove('hidden');
    document.getElementById('mini-game-container').classList.add('hidden');
    document.getElementById('question-container').classList.add('hidden');
}

async function startTurn() {
    document.getElementById('turn-indicator').classList.add('hidden');
    
    // التحقق مما إذا كانت الأسئلة قد انتهت تماماً
    if(questions.length === 0) {
        alert("No questions available! Please add questions in the Admin Panel.");
        return;
    }
    
    // إذا نفدت جميع الأسئلة، إنهاء اللعبة تلقائياً وإظهار الفائزين
    if(remainingQuestions.length === 0) {
        alert("🏁 All questions have been finished! Let's see who won the challenge!");
        showPodium();
        return;
    }
    
    // اختيار سؤال عشوائي من الأسئلة المتبقية فقط (يمنع التكرار تماماً)
    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    currentQuestion = remainingQuestions[randomIndex];
    
    // حذف السؤال من القائمة لكي لا يتكرر أبداً
    remainingQuestions.splice(randomIndex, 1);

    const mgContainer = document.getElementById('mini-game-container');
    mgContainer.classList.remove('hidden');
    
    const mgSuccess = await MiniGames.start(currentQuestion.miniGame, document.getElementById('mini-game-canvas'));
    
    mgContainer.classList.add('hidden');

    if(mgSuccess) {
        startAudioQuestion();
    } else {
        showFeedback(false, "Mini Game Failed! Turn Over.");
        setTimeout(() => switchTurn(), 3000);
    }
}

function startAudioQuestion() {
    const qContainer = document.getElementById('question-container');
    qContainer.classList.remove('hidden');
    document.getElementById('answers-grid').classList.add('hidden');

    currentQuestion.answers.forEach((ans, i) => {
        const btn = document.getElementById(`ans-${i}`);
        btn.innerText = ans;
        btn.className = 'answer-btn'; 
        btn.disabled = false;
    });

    audioPlayer.src = currentQuestion.audio;
    audioPlayer.play().catch(e => console.error("Autoplay prevented.", e));
}

function togglePlay() {
    const btn = document.getElementById('play-pause-btn');
    if (audioPlayer.paused) {
        audioPlayer.play();
        btn.innerText = '⏸️';
    } else {
        audioPlayer.pause();
        btn.innerText = '▶️';
    }
}

function replayAudio() {
    audioPlayer.currentTime = 0;
    audioPlayer.play();
}

document.getElementById('volume-control').addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value;
});

function checkAnswer(selectedIndex) {
    for(let i=0; i<4; i++) {
        document.getElementById(`ans-${i}`).disabled = true;
        if(i === currentQuestion.correct) {
            document.getElementById(`ans-${i}`).classList.add('correct');
        }
    }

    const isCorrect = (selectedIndex === currentQuestion.correct);
    
    if(isCorrect) {
        document.getElementById(`ans-${selectedIndex}`).classList.add('correct');
        teams[currentTurn].score += currentQuestion.points;
        Storage.setTeams(teams);
        updateScoreboard();
        showFeedback(true, `Correct! +${currentQuestion.points} Points`);
        triggerConfetti();
    } else {
        document.getElementById(`ans-${selectedIndex}`).classList.add('wrong');
        showFeedback(false, `Wrong! The correct answer was highlighted.`);
    }

    setTimeout(() => {
        document.getElementById('feedback-overlay').classList.add('hidden');
        switchTurn();
    }, 4000);
}

function showFeedback(isSuccess, text) {
    const overlay = document.getElementById('feedback-overlay');
    const icon = document.getElementById('feedback-icon');
    const txt = document.getElementById('feedback-text');
    
    overlay.classList.remove('hidden');
    if(isSuccess) {
        icon.innerText = '🎉';
        txt.className = 'feedback-success';
    } else {
        icon.innerText = '❌';
        txt.className = 'feedback-error';
    }
    txt.innerText = text;
}

function switchTurn() {
    document.getElementById('question-container').classList.add('hidden');
    audioPlayer.pause();
    
    currentTurn = (currentTurn + 1) % 3; // التبديل بين الـ 3 فرق بترتيب منظم (0 -> 1 -> 2 -> 0)
    Storage.setTurn(currentTurn + 1);
    setupTurnScreen();
}

function endGameManually() {
    if(!confirm("Are you sure you want to end the game and announce the winners?")) return;
    showPodium();
}

// دالة عرض منصة التتويج المشتركة (تستدعى تلقائياً أو يدوياً)
function showPodium() {
    let sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    
    document.body.innerHTML = `
        <div class="container home-container" style="background: #2c3e50; color: white; border-radius: 20px; min-height: 100vh;">
            <h1 style="color:#f1c40f; font-size: 5rem;">🏆 GAME OVER 🏆</h1>
            
            <div style="display: flex; justify-content: center; align-items: flex-end; margin: 40px 0; height: 350px; gap: 20px;">
                
                <!-- 2nd Place -->
                <div style="text-align: center; width: 30%;">
                    <h2 style="font-size: 2rem;">🥈 2nd Place</h2>
                    <h3>${sortedTeams[1].emoji} ${sortedTeams[1].name}</h3>
                    <p>${sortedTeams[1].score} Pts</p>
                    <div style="background: silver; height: 180px; width: 100%; border-radius: 10px 10px 0 0;"></div>
                </div>

                <!-- 1st Place -->
                <div style="text-align: center; z-index: 10; width: 35%;">
                    <h2 style="font-size: 3rem; color: #f1c40f;">🥇 1st Place</h2>
                    <h2>${sortedTeams[0].emoji} ${sortedTeams[0].name}</h2>
                    <p style="font-weight:bold; font-size: 1.5rem;">${sortedTeams[0].score} Pts</p>
                    <div style="background: gold; height: 260px; width: 100%; border-radius: 10px 10px 0 0; box-shadow: 0 0 30px gold;"></div>
                </div>

                <!-- 3rd Place -->
                <div style="text-align: center; width: 30%;">
                    <h2 style="font-size: 2rem; color: #cd7f32;">🥉 3rd Place</h2>
                    <h3>${sortedTeams[2].emoji} ${sortedTeams[2].name}</h3>
                    <p>${sortedTeams[2].score} Pts</p>
                    <div style="background: #cd7f32; height: 120px; width: 100%; border-radius: 10px 10px 0 0;"></div>
                </div>

            </div>
            
            <button class="btn btn-primary" onclick="window.location.href='index.html'">Play Again</button>
        </div>
    `;
    
    setInterval(triggerConfetti, 800);
}

function triggerConfetti() {
    for(let i=0; i<30; i++) {
        let conf = document.createElement('div');
        conf.style.position = 'fixed';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-10px';
        conf.style.width = '10px';
        conf.style.height = '20px';
        conf.style.backgroundColor = ['#ff0','#f00','#0f0','#00f','#f0f'][Math.floor(Math.random()*5)];
        conf.style.zIndex = '9999';
        conf.style.transition = 'top 2s ease-in, transform 2s linear';
        document.body.appendChild(conf);
        
        setTimeout(() => {
            conf.style.top = '100vh';
            conf.style.transform = `rotate(${Math.random() * 720}deg)`;
        }, 50);
        
        setTimeout(() => conf.remove(), 2000);
    }
}

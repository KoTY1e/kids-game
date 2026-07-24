let teams = Storage.getTeams();
let questions = Storage.getQuestions();
let remainingQuestions = []; // مصفوفة لتتبع الأسئلة التي لم تُطرح بعد لمنع التكرار
let currentTurn = Storage.getTurn() - 1; // 0 for T1, 1 for T2
let currentQuestion = null;
let audioPlayer = document.getElementById('q-audio');

document.addEventListener('DOMContentLoaded', () => {
    updateScoreboard();
    setupTurnScreen();

    // Setup audio auto-show answers when finished
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
    
    // Highlight scoreboard
    document.getElementById(`score-t1`).style.transform = currentTurn === 0 ? 'scale(1.1)' : 'scale(1)';
    document.getElementById(`score-t1`).style.opacity = currentTurn === 0 ? '1' : '0.5';
    document.getElementById(`score-t2`).style.transform = currentTurn === 1 ? 'scale(1.1)' : 'scale(1)';
    document.getElementById(`score-t2`).style.opacity = currentTurn === 1 ? '1' : '0.5';

    indicator.classList.remove('hidden');
    document.getElementById('mini-game-container').classList.add('hidden');
    document.getElementById('question-container').classList.add('hidden');
}

async function startTurn() {
    document.getElementById('turn-indicator').classList.add('hidden');
    
    // التأكد من وجود أسئلة مسجلة
    if(questions.length === 0) {
        alert("No questions available! Please add questions in the Admin Panel.");
        return;
    }
    
    // إذا نفدت الأسئلة، قم بإعادة تعبئة المصفوفة لتبدأ دورة جديدة بدون تكرار
    if(remainingQuestions.length === 0) {
        remainingQuestions = [...questions];
    }
    
    // اختيار سؤال عشوائي من الأسئلة المتبقية فقط
    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    currentQuestion = remainingQuestions[randomIndex];
    
    // حذف السؤال المختار من القائمة المؤقتة حتى لا يتكرر
    remainingQuestions.splice(randomIndex, 1);

    // 1. تشغيل الميني جيم
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
    document.getElementById('answers-grid').classList.add('hidden'); // Hide until audio ends

    // Setup Answers
    currentQuestion.answers.forEach((ans, i) => {
        const btn = document.getElementById(`ans-${i}`);
        btn.innerText = ans;
        btn.className = 'answer-btn'; // reset class
        btn.disabled = false;
    });

    // Play Audio
    audioPlayer.src = currentQuestion.audio;
    audioPlayer.play().catch(e => console.error("Autoplay prevented. User must click play.", e));
}

// Audio Controls
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
    // Disable all buttons
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
    
    // Check win condition (Score >= 100)
    if(teams[currentTurn].score >= 100) {
        showWinner(teams[currentTurn]);
        return;
    }

    currentTurn = currentTurn === 0 ? 1 : 0;
    Storage.setTurn(currentTurn + 1);
    setupTurnScreen();
}

function showWinner(team) {
    document.body.innerHTML = `
        <div class="container home-container" style="background: ${team.color}; color: white; border-radius: 20px;">
            <h1 style="color:white; font-size: 5rem;">🏆 WINNER!</h1>
            <h2 style="font-size: 4rem;">${team.emoji} ${team.name}</h2>
            <p style="font-size: 3rem; margin: 20px 0;">Score: ${team.score}</p>
            <button class="btn btn-primary" style="background: white; color: ${team.color};" onclick="window.location.href='index.html'">Play Again</button>
        </div>
    `;
    setInterval(triggerConfetti, 1000);
}

// Minimalist Confetti
function triggerConfetti() {
    for(let i=0; i<50; i++) {
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
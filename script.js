document.addEventListener('DOMContentLoaded', () => {
    const teams = Storage.getTeams();
    
    // Load Team 1
    document.getElementById('t1-name').value = teams[0].name;
    document.getElementById('t1-color').value = teams[0].color;
    setupEmojiPicker('t1-emoji-picker', teams[0].emoji, 0);

    // Load Team 2
    document.getElementById('t2-name').value = teams[1].name;
    document.getElementById('t2-color').value = teams[1].color;
    setupEmojiPicker('t2-emoji-picker', teams[1].emoji, 1);
});

function setupEmojiPicker(id, currentEmoji, teamIndex) {
    const picker = document.getElementById(id);
    const spans = picker.querySelectorAll('span');
    
    // Select active
    spans.forEach(span => {
        if(span.innerText === currentEmoji) {
            spans.forEach(s => s.classList.remove('active'));
            span.classList.add('active');
        }
        span.onclick = () => {
            spans.forEach(s => s.classList.remove('active'));
            span.classList.add('active');
        };
    });
}

function startGame() {
    const teams = Storage.getTeams();
    
    // Save Team 1
    teams[0].name = document.getElementById('t1-name').value;
    teams[0].color = document.getElementById('t1-color').value;
    teams[0].emoji = document.querySelector('#t1-emoji-picker .active').innerText;
    
    // Save Team 2
    teams[1].name = document.getElementById('t2-name').value;
    teams[1].color = document.getElementById('t2-color').value;
    teams[1].emoji = document.querySelector('#t2-emoji-picker .active').innerText;
    
    Storage.setTeams(teams);
    
    // Make sure we have questions
    if(Storage.getQuestions().length === 0) {
        alert("Wait! You need to add questions in the Admin Panel first.");
        return;
    }

    Storage.resetScores();
    window.location.href = 'game.html';
}

function resetData() {
    if(confirm("Are you sure? This will delete all questions and teams!")) {
        localStorage.clear();
        Storage.init();
        location.reload();
    }
}
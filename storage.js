// LocalStorage Wrapper
const Storage = {
    init() {
        if(!localStorage.getItem('kids_teams')) {
            localStorage.setItem('kids_teams', JSON.stringify([
                { id: 1, name: 'The Lions', emoji: '🦁', color: '#ff9800', score: 0 },
                { id: 2, name: 'The Eagles', emoji: '🦅', color: '#03a9f4', score: 0 }
            ]));
        }
        if(!localStorage.getItem('kids_questions')) {
            localStorage.setItem('kids_questions', JSON.stringify([]));
        }
        if(!localStorage.getItem('kids_turn')) {
            localStorage.setItem('kids_turn', '1');
        }
    },
    getTeams() { return JSON.parse(localStorage.getItem('kids_teams')); },
    setTeams(teams) { localStorage.setItem('kids_teams', JSON.stringify(teams)); },
    getQuestions() { return JSON.parse(localStorage.getItem('kids_questions')); },
    saveQuestions(q) { localStorage.setItem('kids_questions', JSON.stringify(q)); },
    getTurn() { return parseInt(localStorage.getItem('kids_turn')); },
    setTurn(t) { localStorage.setItem('kids_turn', t.toString()); },
    resetScores() {
        let teams = this.getTeams();
        teams.forEach(t => t.score = 0);
        this.setTeams(teams);
        this.setTurn(1);
    },
    // Converts Audio File to Base64 string for LocalStorage
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
};

Storage.init();
const MiniGames = {
    canvas: null,
    resolve: null,
    timer: null,
    timeLeft: 20,
    activeIntervals: [], // لتنظيف أي حركات مستمرة بعد انتهاء اللعبة

    start(type, containerElement) {
        this.canvas = containerElement;
        this.canvas.innerHTML = '';
        this.timeLeft = 20; // 20 ثانية لكل لعبة
        this.activeIntervals = [];
        document.getElementById('mini-game-timer').innerText = `Time: ${this.timeLeft}s`;

        return new Promise((resolve) => {
            this.resolve = resolve;
            
            this.timer = setInterval(() => {
                this.timeLeft--;
                document.getElementById('mini-game-timer').innerText = `Time: ${this.timeLeft}s`;
                if(this.timeLeft <= 0) {
                    this.end(false); // خسر في الميني جيم
                }
            }, 1000);

            // تشغيل اللعبة المطلوبة
            if(this[type]) {
                this[type]();
            } else {
                this.balloonPop(); // لعبة افتراضية لو حدث خطأ
            }
        });
    },

    end(success) {
        clearInterval(this.timer);
        this.activeIntervals.forEach(clearInterval); // إيقاف أي حركات
        this.canvas.innerHTML = '';
        this.resolve(success);
    },

    // 1. فرقعة البالونات (اضغط على 5 بالونات)
    balloonPop() {
        let popped = 0;
        let colors = ['#f44336', '#2196f3', '#4caf50', '#9c27b0', '#ff9800'];
        
        for(let i=0; i<5; i++) {
            let b = document.createElement('div');
            b.style.width = '60px'; b.style.height = '80px';
            b.style.backgroundColor = colors[i];
            b.style.borderRadius = '50% 50% 50% 50% / 40% 40% 60% 60%';
            b.style.position = 'absolute';
            b.style.cursor = 'pointer';
            b.style.boxShadow = '0 5px 10px rgba(0,0,0,0.2)';
            b.style.left = (Math.random() * 80) + '%';
            b.style.top = (Math.random() * 70) + '%';
            
            b.onclick = () => {
                b.style.transform = 'scale(0)';
                setTimeout(() => b.style.display = 'none', 100);
                popped++;
                if(popped === 5) this.end(true);
            };
            this.canvas.appendChild(b);
        }
    },

    // 2. بطاقات الذاكرة (طابق 3 أزواج من الوجوه)
    memoryCards() {
        const emojis = ['🐶', '🐶', '🐱', '🐱', '🐰', '🐰'];
        emojis.sort(() => Math.random() - 0.5);
        let flipped = [];
        let matched = 0;
        
        emojis.forEach(em => {
            let card = document.createElement('div');
            card.style.width = '70px'; card.style.height = '90px';
            card.style.background = '#03a9f4';
            card.style.borderRadius = '10px';
            card.style.cursor = 'pointer';
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'center';
            card.style.fontSize = '2.5rem';
            card.style.color = 'transparent';
            card.style.transition = '0.3s';
            card.dataset.val = em;
            
            card.onclick = () => {
                if(flipped.length < 2 && card.style.color === 'transparent') {
                    card.style.background = '#fff';
                    card.style.color = '#000';
                    card.style.border = '2px solid #03a9f4';
                    flipped.push(card);
                    
                    if(flipped.length === 2) {
                        setTimeout(() => {
                            if(flipped[0].dataset.val === flipped[1].dataset.val) {
                                matched += 2;
                                if(matched === emojis.length) this.end(true);
                            } else {
                                flipped[0].style.background = '#03a9f4';
                                flipped[0].style.color = 'transparent';
                                flipped[0].style.border = 'none';
                                flipped[1].style.background = '#03a9f4';
                                flipped[1].style.color = 'transparent';
                                flipped[1].style.border = 'none';
                            }
                            flipped = [];
                        }, 600);
                    }
                }
            };
            this.canvas.appendChild(card);
        });
    },

    // 3. لغز الرياضيات السريع (جمع بسيط)
    mathPuzzle() {
        let num1 = Math.floor(Math.random() * 10) + 1;
        let num2 = Math.floor(Math.random() * 5) + 1;
        let correct = num1 + num2;

        let title = document.createElement('h2');
        title.innerText = `${num1} + ${num2} = ?`;
        title.style.width = '100%';
        title.style.fontSize = '3.5rem';
        this.canvas.appendChild(title);

        let options = [correct, correct + 1, correct - 2, correct + 2].sort(() => Math.random() - 0.5);
        
        options.forEach(opt => {
            let btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.innerText = opt;
            btn.style.margin = '10px';
            btn.style.fontSize = '2rem';
            btn.onclick = () => {
                if(opt === correct) this.end(true);
                else btn.style.background = '#f44336'; // أحمر للخطأ
            };
            this.canvas.appendChild(btn);
        });
    },

    // 4. ابحث عن اللون الأخضر (بين ألوان مشتتة)
    findGreen() {
        let title = document.createElement('h3');
        title.innerText = "Click the GREEN color!";
        title.style.width = '100%';
        title.style.fontSize = '2rem';
        this.canvas.appendChild(title);

        let colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        colors.sort(() => Math.random() - 0.5);

        colors.forEach(color => {
            let box = document.createElement('div');
            box.style.width = '80px'; box.style.height = '80px';
            box.style.backgroundColor = color;
            box.style.borderRadius = '15px';
            box.style.cursor = 'pointer';
            box.style.margin = '10px';
            box.onclick = () => {
                if(color === 'green') this.end(true);
                else box.style.opacity = '0.2';
            };
            this.canvas.appendChild(box);
        });
    },

    // 5. اصطد النجمة (نجمة تتحرك بسرعة ويجب الضغط عليها 3 مرات)
    catchStar() {
        let title = document.createElement('h3');
        title.innerText = "Catch the moving Star 3 times! 🌟";
        title.style.width = '100%';
        this.canvas.appendChild(title);

        let star = document.createElement('div');
        star.innerText = '⭐';
        star.style.fontSize = '3rem';
        star.style.position = 'absolute';
        star.style.cursor = 'pointer';
        star.style.transition = 'all 0.3s';
        
        let clicks = 0;
        star.onclick = () => {
            clicks++;
            star.style.transform = 'scale(1.5)';
            setTimeout(() => star.style.transform = 'scale(1)', 100);
            if(clicks === 3) this.end(true);
        };
        this.canvas.appendChild(star);

        let moveStar = () => {
            star.style.left = (Math.random() * 80) + '%';
            star.style.top = (Math.random() * 60 + 10) + '%';
        };
        moveStar();
        
        let interval = setInterval(moveStar, 800); // تتحرك كل 0.8 ثانية
        this.activeIntervals.push(interval);
    },

    // 6. الترتيب التصاعدي (اضغط الأرقام من 1 إلى 5)
    sortNumbers() {
        let title = document.createElement('h3');
        title.innerText = "Click numbers from 1 to 5 in order!";
        title.style.width = '100%';
        this.canvas.appendChild(title);

        let nums = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
        let expected = 1;

        nums.forEach(n => {
            let btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.innerText = n;
            btn.style.margin = '10px';
            btn.style.fontSize = '2rem';
            btn.style.width = '60px';
            btn.style.height = '60px';
            
            btn.onclick = () => {
                if(n === expected) {
                    btn.style.visibility = 'hidden';
                    expected++;
                    if(expected === 6) this.end(true);
                } else {
                    let oldBg = btn.style.background;
                    btn.style.background = 'red';
                    setTimeout(() => btn.style.background = oldBg, 300);
                }
            };
            this.canvas.appendChild(btn);
        });
    },

    // 7. المختلف (أوجد الشكل المختلف)
    oddOneOut() {
        let title = document.createElement('h3');
        title.innerText = "Find the different Emoji!";
        title.style.width = '100%';
        this.canvas.appendChild(title);

        // 5 تفاحات وفراولة واحدة
        let items = ['🍎','🍎','🍎','🍎','🍎','🍓'];
        items.sort(() => Math.random() - 0.5);

        items.forEach(item => {
            let span = document.createElement('span');
            span.innerText = item;
            span.style.fontSize = '4rem';
            span.style.cursor = 'pointer';
            span.style.margin = '10px';
            span.onclick = () => {
                if(item === '🍓') this.end(true);
                else span.style.opacity = '0.3';
            };
            this.canvas.appendChild(span);
        });
    },

    // 8. الفقاعات الزرقاء فقط (اضغط 4 فقاعات زرقاء وتجنب الحمراء)
    blueBubbles() {
        let title = document.createElement('h3');
        title.innerText = "Pop ONLY the 4 Blue Bubbles! 🔵";
        title.style.width = '100%';
        this.canvas.appendChild(title);

        let bubbles = ['blue','blue','blue','blue','red','red','red'];
        bubbles.sort(() => Math.random() - 0.5);
        let blueCount = 0;

        bubbles.forEach(color => {
            let b = document.createElement('div');
            b.style.width = '60px'; b.style.height = '60px';
            b.style.backgroundColor = color;
            b.style.borderRadius = '50%';
            b.style.margin = '10px';
            b.style.cursor = 'pointer';
            b.style.boxShadow = 'inset -5px -5px 15px rgba(0,0,0,0.3)';
            
            b.onclick = () => {
                if(color === 'blue') {
                    b.style.visibility = 'hidden';
                    blueCount++;
                    if(blueCount === 4) this.end(true);
                } else {
                    // إذا ضغط أحمر ينقص الوقت 3 ثواني كعقاب!
                    this.timeLeft -= 3;
                    b.style.visibility = 'hidden';
                }
            };
            this.canvas.appendChild(b);
        });
    },

    // 9. أطعم القرد (اضغط على الموزة 10 مرات بسرعة)
    feedMonkey() {
        let title = document.createElement('h3');
        title.innerText = "Feed the Monkey! Tap the banana 10 times!";
        title.style.width = '100%';
        this.canvas.appendChild(title);

        let monkey = document.createElement('div');
        monkey.innerText = '🐒';
        monkey.style.fontSize = '5rem';
        monkey.style.width = '100%';
        this.canvas.appendChild(monkey);

        let banana = document.createElement('button');
        banana.className = 'btn btn-primary';
        banana.innerText = '🍌';
        banana.style.fontSize = '3rem';
        banana.style.marginTop = '20px';
        
        let clicks = 0;
        banana.onclick = () => {
            clicks++;
            monkey.style.transform = `scale(${1 + (clicks*0.05)})`; // يكبر القرد مع الأكل
            if(clicks >= 10) {
                monkey.innerText = '🐵'; // يفرح
                setTimeout(() => this.end(true), 500);
            }
        };
        this.canvas.appendChild(banana);
    },

    // 10. تهجئة الكلمة (اضغط الحروف بالترتيب C - A - T)
    spellWord() {
        let title = document.createElement('h3');
        title.innerText = "Spell the word: C - A - T";
        title.style.width = '100%';
        this.canvas.appendChild(title);

        let letters = ['T', 'C', 'A'].sort(() => Math.random() - 0.5);
        let expected = ['C', 'A', 'T'];
        let currentIndex = 0;

        let wordDisplay = document.createElement('h1');
        wordDisplay.innerText = "_ _ _";
        wordDisplay.style.width = '100%';
        wordDisplay.style.letterSpacing = '10px';
        this.canvas.appendChild(wordDisplay);

        letters.forEach(char => {
            let btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.innerText = char;
            btn.style.margin = '10px';
            btn.style.fontSize = '2rem';
            
            btn.onclick = () => {
                if(char === expected[currentIndex]) {
                    btn.style.visibility = 'hidden';
                    // تحديث الكلمة المعروضة
                    let currentText = wordDisplay.innerText.split(' ');
                    currentText[currentIndex] = char;
                    wordDisplay.innerText = currentText.join(' ');
                    
                    currentIndex++;
                    if(currentIndex === 3) setTimeout(() => this.end(true), 500);
                } else {
                    let oldBg = btn.style.background;
                    btn.style.background = 'red';
                    setTimeout(() => btn.style.background = oldBg, 300);
                }
            };
            this.canvas.appendChild(btn);
        });
    }
};
document.addEventListener('DOMContentLoaded', () => {
    // ▼▼▼ 【重要】ここに、デプロイしたApps ScriptのURLを貼り付け ▼▼▼
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyuCRdmxS5gNtEY32kZlPMl78PJlBsaqDyvfsKmQ93JXM-BGdUAyLlXNOlVJSErHN1w/exec';

    // === DOM要素の取得 ===
    const pages = document.querySelectorAll('.page');
    const nicknameInput = document.getElementById('nickname-input');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const questionText = document.getElementById('question-text');
    const optionsArea = document.getElementById('options-area');
    const feedbackText = document.getElementById('feedback-text');
    const timerDisplay = document.getElementById('timer');
    const questionNumberDisplay = document.getElementById('question-number');
    const resultNickname = document.getElementById('result-nickname');
    const resultTime = document.getElementById('result-time');
    const resultCorrect = document.getElementById('result-correct');
    const resultScore = document.getElementById('result-score');
    const retryBtn = document.getElementById('retry-btn');
    const backToTopBtn = document.getElementById('back-to-top-btn');
    const rankingDisplay = document.getElementById('ranking-display');
    const submitScoreBtn = document.getElementById('submit-score-btn');
    const submitStatus = document.getElementById('submit-status');
    // ▼▼▼ 新しいボタンを取得 ▼▼▼
    const viewRankingBtnTop = document.getElementById('view-ranking-btn-top');
    const viewRankingBtnResult = document.getElementById('view-ranking-btn-result');

    // === ゲームの状態管理 ===
    let gameState = { level: 1, nickname: '', questions: [], currentQuestionIndex: 0, correctCount: 0, score: 0, startTime: 0, timerInterval: null };

    // === 汎用ヘルパー関数 ===
    const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const showPage = (pageId) => pages.forEach(p => p.classList.toggle('active', p.id === pageId));

    // === 問題生成 ===
    const generateQuestion = (level) => {
        let a = 1, b = 0, c = 0;
        switch (level) {
            case 1: b = r(-10, 10) * 2; c = r(-20, 20); break;
            case 2: b = r(-9, 9) * 2 + 1; c = r(-20, 20); break;
            case 3: a = r(2, 5); b = r(-5, 5) * 2 * a; c = r(-20, 20); break;
            case 4: a = r(-5, -2); b = r(-5, 5) * 2 * a; c = r(-20, 20); break;
        }
        return { a, b, c };
    };

    const formatLatex = (a, b, c) => {
        let equation = 'y = ';
        if (a === -1) equation += '-';
        else if (a !== 1) equation += a;
        equation += 'x^{2} ';
        if (b !== 0) {
            if (b > 0) {
                equation += '+ ';
                if (b !== 1) equation += b;
            } else {
                equation += '- ';
                if (b !== -1) equation += -b;
            }
            equation += 'x ';
        }
        if (c !== 0) {
            if (c > 0) equation += `+ ${c}`;
            else equation += `- ${-c}`;
        }
        return equation.trim();
    };
    
    const formatCompleted = (a, p, q) => {
        const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
        const toFrac = (num) => {
            const absNum = Math.abs(num);
            if (absNum % 1 === 0) return absNum.toString();
            let denominator = 1000;
            let numerator = Math.round(absNum * denominator);
            const commonDivisor = gcd(numerator, denominator);
            numerator /= commonDivisor;
            denominator /= commonDivisor;
            if (denominator === 1) return numerator.toString();
            return `\\frac{${numerator}}{${denominator}}`;
        };
        let result = 'y = ';
        if (a === -1) result += '-';
        else if (a !== 1) result += a;
        if (p === 0) {
            result += 'x^{2} ';
        } else {
            result += `(x ${p > 0 ? '+' : '-'} ${toFrac(p)})^{2} `;
        }
        if (q !== 0) {
           if (q > 0) result += `+ ${toFrac(q)}`;
           else result += `- ${toFrac(q)}`;
        }
        return result.trim();
    };

    // === 選択肢生成 ===
    const generateOptions = ({ a, b, c }) => {
        const p = b / (2 * a), q = c - (b * b) / (4 * a);
        const opts = new Set();
        opts.add(formatCompleted(a, p, q));
        opts.add(formatCompleted(a, -p, q));
        opts.add(formatCompleted(a, p, c));
        while (opts.size < 4) opts.add(formatCompleted(a, p + r(1, 2), q));
        return Array.from(opts).sort(() => Math.random() - .5);
    };

    // === ゲーム進行 ===
    const startGame = (level) => {
        gameState.level = level;
        gameState.nickname = nicknameInput.value || '名無し';
        gameState.questions = Array.from({ length: 10 }, () => {
            const params = generateQuestion(level);
            return { question: formatLatex(params.a, params.b, params.c), options: generateOptions(params), answer: formatCompleted(params.a, params.b / (2 * params.a), params.c - (params.b * params.b) / (4 * params.a)) };
        });
        gameState.currentQuestionIndex = 0;
        gameState.correctCount = 0;
        showPage('game-page');
        displayNextQuestion();
        gameState.startTime = Date.now();
        gameState.timerInterval = setInterval(updateTimer, 100);
    };

    const displayNextQuestion = () => {
        if (gameState.currentQuestionIndex >= 10) { endGame(); return; }
        const q = gameState.questions[gameState.currentQuestionIndex];
        questionNumberDisplay.textContent = gameState.currentQuestionIndex + 1;
        katex.render(q.question, questionText, { throwOnError: false });
        optionsArea.innerHTML = '';
        q.options.forEach(opt => { const btn = document.createElement('button'); btn.className = 'option-btn'; katex.render(opt, btn, { throwOnError: false }); btn.onclick = () => checkAnswer(btn, opt, q.answer); optionsArea.appendChild(btn); });
        feedbackText.textContent = '';
    };

    const checkAnswer = (btn, sel, ans) => {
        document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
        if (sel === ans) { feedbackText.textContent = "Excellent!"; feedbackText.className = 'correct'; btn.classList.add('correct'); gameState.correctCount++; }
        else { feedbackText.textContent = "Try again!"; feedbackText.className = 'incorrect'; btn.classList.add('incorrect'); }
        gameState.currentQuestionIndex++;
        setTimeout(displayNextQuestion, 1200);
    };

    const updateTimer = () => timerDisplay.textContent = ((Date.now() - gameState.startTime) / 1000).toFixed(2);

    const endGame = () => {
        clearInterval(gameState.timerInterval);
        const time = (Date.now() - gameState.startTime) / 1000;
        const multipliers = { 1: 1.0, 2: 1.5, 3: 2.0, 4: 2.5 };
        const baseScore = 100 * gameState.correctCount;
        gameState.score = Math.max(0, Math.floor((baseScore * multipliers[gameState.level]) - time));
        resultNickname.textContent = gameState.nickname;
        resultTime.textContent = time.toFixed(2);
        resultCorrect.textContent = gameState.correctCount;
        resultScore.textContent = gameState.score;
        submitScoreBtn.disabled = false;
        submitScoreBtn.textContent = 'スコアを送信する';
        submitStatus.textContent = '';
        saveScoreToLocalStorage(gameState.level, gameState.nickname, gameState.score);
        showPage('result-page');
    };

    // === スコア送信 ===
    const submitScore = () => {
        submitScoreBtn.disabled = true;
        submitStatus.textContent = '送信中...';
        const formData = new FormData();
        formData.append('nickname', gameState.nickname);
        formData.append('score', gameState.score);
        formData.append('level', gameState.level);
        fetch(GAS_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: formData });
        setTimeout(() => {
            submitStatus.textContent = '✅ 送信完了！';
            submitScoreBtn.textContent = '送信済み';
        }, 500);
    };

    // === 自分用ランキング (localStorage) ===
    const saveScoreToLocalStorage = (level, nickname, score) => {
        const key = `ranking_level_${level}`;
        const rankings = JSON.parse(localStorage.getItem(key)) || [];
        rankings.push({ nickname, score });
        rankings.sort((a, b) => b.score - a.score);
        localStorage.setItem(key, JSON.stringify(rankings.slice(0, 5)));
    };

    const updateRankingDisplay = () => {
        rankingDisplay.innerHTML = '';
        ['かんたん', 'ふつう', 'むずかしい', '鬼'].forEach((name, i) => {
            const level = i + 1;
            const key = `ranking_level_${level}`;
            const rankings = JSON.parse(localStorage.getItem(key)) || [];
            const div = document.createElement('div');
            div.innerHTML = `<h3>${name}</h3>`;
            if (rankings.length > 0) {
                const ol = document.createElement('ol');
                rankings.forEach(r => { const li = document.createElement('li'); li.textContent = `${r.nickname}: ${r.score}pt`; ol.appendChild(li); });
                div.appendChild(ol);
            } else { div.innerHTML += '<p>まだ記録がありません</p>'; }
            rankingDisplay.appendChild(div);
        });
    };

    // === イベントリスナー ===
    difficultyButtons.forEach(b => b.addEventListener('click', () => startGame(parseInt(b.dataset.level))));
    retryBtn.addEventListener('click', () => startGame(gameState.level));
    backToTopBtn.addEventListener('click', () => { updateRankingDisplay(); showPage('top-page'); });
    submitScoreBtn.addEventListener('click', submitScore);
    
    // ▼▼▼ 新しいボタンの動作を追加 ▼▼▼
    const openRankingPage = () => {
        window.open('ranking.html', '_blank');
    };
    viewRankingBtnTop.addEventListener('click', openRankingPage);
    viewRankingBtnResult.addEventListener('click', openRankingPage);

    // === 初期化処理 ===
    updateRankingDisplay();
    showPage('top-page');
});
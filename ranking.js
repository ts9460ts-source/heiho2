// ranking.js (HTML構造に合わせた最終修正版)

document.addEventListener('DOMContentLoaded', () => {
    // ▼▼▼ 【重要】ここに、新しくデプロイしたApps ScriptのURLを貼り付け ▼▼▼
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxOIkWI6ZhpflPwm016cfYyUNdZx5f7QL2HgzAHTSTX1Hc7T1n8eHgve_MulkKDxTo/exec';
    const container = document.querySelector('.container');

    /**
     * 指定された場所にランキングのHTMLテーブルを生成する関数
     */
    function renderRanking(data, elementId) {
        const targetElement = document.getElementById(elementId);
        if (!targetElement) return;

        if (!data || data.length === 0) {
            targetElement.innerHTML = '<p>まだ記録がありません。</p>';
            return;
        }

        let tableHTML = '<table><thead><tr><th class="rank">#</th><th class="nickname">ニックネーム</th><th class="score">スコア</th></tr></thead><tbody>';
        data.forEach((item, index) => {
            tableHTML += `<tr><td class="rank">${index + 1}</td><td class="nickname">${item.nickname}</td><td class="score">${item.score}</td></tr>`;
        });
        tableHTML += '</tbody></table>';
        targetElement.innerHTML = tableHTML;
    }

    /**
     * Apps Scriptから全データを取得し、各ランキングを生成するメインの関数
     */
    async function fetchAndDisplayRankings() {
        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('ここに')) {
            container.innerHTML = '<p style="color: red; text-align: center;">エラー: ランキングURLが設定されていません。</p>';
            return;
        }

        try {
            const response = await fetch(APPS_SCRIPT_URL);
            if (!response.ok) throw new Error(`ネットワークエラー (ステータス: ${response.status})`);
            
            const allScores = await response.json();

            // 総合ランキング
            renderRanking(allScores.slice(0, 10), 'total-ranking');
            // 難易度別ランキング
            // 難易度別ランキング
renderRanking(allScores.filter(item => item.difficulty == 1).slice(0, 10), 'easy-ranking');
renderRanking(allScores.filter(item => item.difficulty == 2).slice(0, 10), 'normal-ranking');
renderRanking(allScores.filter(item => item.difficulty == 3).slice(0, 10), 'hard-ranking');
renderRanking(allScores.filter(item => item.difficulty == 4).slice(0, 10), 'oni-ranking');

        } catch (error) {
            console.error('ランキングの取得または表示に失敗しました:', error);
            // エラーメッセージをコンテナ全体に表示
            container.innerHTML = '<p style="color: red; text-align: center;">データの読み込みに失敗しました。Apps Scriptのデプロイ設定を確認してください。</p>';
        }
    }

    fetchAndDisplayRankings();
});
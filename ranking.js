// ranking.js (HTML構造に合わせた最終修正版)

document.addEventListener('DOMContentLoaded', () => {
    // ▼▼▼ 【重要】ここに、デプロイしたApps ScriptのURLを貼り付け ▼▼▼
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwaiMc39zAu2qjdPW1z2k54folOzgImhAbuYdoaPAQ0a8YzusUoPR2LdGsPYxLvo4TD/exec';

    /**
     * 指定された場所にランキングのHTMLテーブルを生成する関数
     * @param {Array} data - 表示するスコアの配列
     * @param {string} elementId - 表示先のdiv要素のID
     */
    function renderRanking(data, elementId) {
        const targetElement = document.getElementById(elementId);
        if (!targetElement) {
            console.error(`エラー: IDが'${elementId}'の要素が見つかりません。`);
            return;
        }

        if (!data || data.length === 0) {
            targetElement.innerHTML = '<p>まだ記録がありません。</p>';
            return;
        }

        // HTMLのテーブルを組み立てる
        let tableHTML = '<table><thead><tr><th class="rank">#</th><th class="nickname">ニックネーム</th><th class="score">スコア</th></tr></thead><tbody>';
        
        data.forEach((item, index) => {
            tableHTML += `
                <tr>
                    <td class="rank">${index + 1}</td>
                    <td class="nickname">${item.nickname}</td>
                    <td class="score">${item.score}</td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody></table>';
        targetElement.innerHTML = tableHTML;
    }

    /**
     * Apps Scriptから全データを取得し、各ランキングを生成するメインの関数
     */
    async function fetchAndDisplayRankings() {
        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('ここに')) {
            document.querySelector('.container').innerHTML = '<p style="color: red; text-align: center;">エラー: ランキングURLが設定されていません。</p>';
            return;
        }

        try {
            const response = await fetch(APPS_SCRIPT_URL);
            if (!response.ok) {
                throw new Error(`ネットワークエラー (ステータス: ${response.status})`);
            }
            
            const allScores = await response.json();

            // 1. 総合ランキングを処理 (Apps Script側で既にスコア順にソート済み)
            const totalTop10 = allScores.slice(0, 10);
            renderRanking(totalTop10, 'total-ranking');

            // 2. 難易度別のランキングを処理
            const easyScores = allScores.filter(item => item.level == 1).slice(0, 10);
            renderRanking(easyScores, 'easy-ranking');
            
            const normalScores = allScores.filter(item => item.level == 2).slice(0, 10);
            renderRanking(normalScores, 'normal-ranking');

            const hardScores = allScores.filter(item => item.level == 3).slice(0, 10);
            renderRanking(hardScores, 'hard-ranking');

            const oniScores = allScores.filter(item => item.level == 4).slice(0, 10);
            renderRanking(oniScores, 'oni-ranking');

        } catch (error) {
            console.error('ランキングの取得または表示に失敗しました:', error);
            document.querySelector('.container').innerHTML = '<p style="color: red; text-align: center;">データの読み込みに失敗しました。設定を確認してください。</p>';
        }
    }

    fetchAndDisplayRankings();
});
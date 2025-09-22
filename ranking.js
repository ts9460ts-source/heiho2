// script.js

// ステップ1でコピーしたウェブアプリのURLをここに貼り付けます
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyuCRdmxS5gNtEY32kZlPMl78PJlBsaqDyvfsKmQ93JXM-BGdUAyLlXNOlVJSErHN1w/exec';

// 難易度の数値を日本語に変換するための対応表
const difficultyMap = {
    1: 'かんたん',
    2: 'ふつう',
    3: 'むずかしい',
    4: '鬼'
};

// HTMLの読み込みが完了したら処理を開始
document.addEventListener('DOMContentLoaded', () => {
    fetch(GAS_URL)
        .then(response => response.json())
        .then(data => {
            // 取得したデータが正しいか確認
            if (!Array.isArray(data)) {
                console.error("取得したデータが配列ではありません:", data);
                return;
            }
            // スコアを数値に変換
            const processedData = data.map(item => ({
                ...item,
                score: Number(item.score)
            }));
            
            // 各ランキングを生成して表示
            displayRanking(processedData, null, 'total-ranking'); // 総合
            displayRanking(processedData, 1, 'easy-ranking');       // かんたん
            displayRanking(processedData, 2, 'normal-ranking');     // ふつう
            displayRanking(processedData, 3, 'hard-ranking');     // むずかしい
            displayRanking(processedData, 4, 'oni-ranking');         // 鬼
        })
        .catch(error => console.error('データの取得に失敗しました:', error));
});

/**
 * ランキングを生成してHTMLに表示する関数
 * @param {Array} data - 全てのスコアデータ
 * @param {number|null} difficulty - フィルタリングする難易度 (nullの場合は総合)
 * @param {string} elementId - 表示先のHTML要素のID
 */
function displayRanking(data, difficulty, elementId) {
    // 難易度でデータを絞り込む (difficultyがnullの場合は全データを使用)
    const filteredData = difficulty ? data.filter(item => item.difficulty == difficulty) : data;

    // スコアの高い順に並び替え、上位10件を取得
    const top10 = filteredData.sort((a, b) => b.score - a.score).slice(0, 10);

    // 表示先のHTML要素を取得
    const container = document.getElementById(elementId);
    if (top10.length === 0) {
        container.innerHTML = '<p>データがまだありません。</p>';
        return;
    }

    // ランキングテーブルのHTMLを生成
    let html = '<table><tr><th>順位</th><th>ニックネーム</th><th>スコア</th><th>月日</th></tr>';
    top10.forEach((item, index) => {
        const date = new Date(item.timestamp);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const formattedDate = `${month}/${day}`;
        
        html += `
            <tr>
                <td class="rank">${index + 1}</td>
                <td class="nickname">${item.nickname}</td>
                <td class="score">${item.score}</td>
                <td>${formattedDate}</td>
            </tr>
        `;
    });
    html += '</table>';

    // 生成したHTMLをページに表示
    container.innerHTML = html;

}


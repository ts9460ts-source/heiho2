// ranking.js (最終修正版)

document.addEventListener('DOMContentLoaded', () => {
    // ▼▼▼ 【重要】ここに、新しくデプロイしたApps ScriptのURLを貼り付け ▼▼▼
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwaiMc39zAu2qjdPW1z2k54folOzgImhAbuYdoaPAQ0a8YzusUoPR2LdGsPYxLvo4TD/exec';

    const tbody = document.getElementById('ranking-body');
    const statusDiv = document.getElementById('status');

    async function fetchRanking() {
        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'ここに新しいApps ScriptのデプロイURLを貼り付けてください') {
            statusDiv.textContent = 'エラー: ランキングURLが設定されていません。';
            return;
        }

        try {
            const response = await fetch(APPS_SCRIPT_URL);
            if (!response.ok) {
                throw new Error(`ネットワークエラー (ステータス: ${response.status})`);
            }

            const rankingData = await response.json();
            if (rankingData.length === 0) {
                statusDiv.textContent = 'まだランキングデータがありません。';
                return;
            }
            
            // 上位10件に絞る処理をここで行う
            const top10 = rankingData.slice(0, 10);

            tbody.innerHTML = '';
            
            top10.forEach((item, index) => {
                const tr = document.createElement('tr');
                const difficultyNames = {'1': 'かんたん', '2': 'ふつう', '3': 'むずかしい', '4': '鬼'};
                tr.innerHTML = `
                    <td class="rank">${index + 1}</td>
                    <td>${item.nickname}</td>
                    <td>${item.score}</td>
                    <td>${difficultyNames[item.level] || '不明'}</td>
                    <td>${new Date(item.timestamp).toLocaleString('ja-JP')}</td>
                `;
                tbody.appendChild(tr);
            });

            statusDiv.style.display = 'none';
            document.getElementById('ranking-table').style.display = 'table';

        } catch (error) {
            statusDiv.textContent = 'データの読み込みに失敗しました。';
            console.error('ランキング取得エラー:', error);
        }
    }

    fetchRanking();
});
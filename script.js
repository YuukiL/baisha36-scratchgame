document.addEventListener('DOMContentLoaded', function() {
    // 獎項設置（可由品牌方自定義）
    const prizes = [
        { name: "招待迎賓飲品乙份", weight: 40 },
        { name: "95折優惠", weight: 10 },
        { name: "再接再厲", weight: 20 },
        { name: "加購價1000元體驗秘境SUP活動(1人)", weight: 30 }
    ];

    // 初始化遊戲
    initGame();

    // 初始化遊戲
    function initGame() {
        createCards();
        setupEventListeners();
    }

    // 創建卡片
    function createCards() {
        const cardsRow = document.querySelector('.cards-row');
        cardsRow.innerHTML = '';
        
        // 創建10張卡片
        for (let i = 0; i < 10; i++) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.index = i;
            cardsRow.appendChild(card);
        }
    }

    // 設置事件監聽器
    function setupEventListeners() {
        // 卡片選擇事件
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('click', selectCard);
        });

        // 保存獎品按鈕
        const saveBtn = document.getElementById('save-btn');
        saveBtn.addEventListener('click', savePrizeImage);
    }

    // 選擇卡片
    function selectCard(e) {
        // 移除所有卡片的點擊事件，防止多次選擇
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.removeEventListener('click', selectCard);
            card.style.opacity = '0.5';
        });

        // 選中當前卡片
        const selectedCard = e.currentTarget;
        selectedCard.classList.add('card-selected');
        selectedCard.style.opacity = '1';

        // 抽卡動畫完成後，顯示刮刮樂畫面
        setTimeout(() => {
            // 切換到刮刮樂畫面
            showScreen('scratch-screen');
            // 初始化刮刮樂
            initScratchCard();
        }, 1000);
    }

    // 初始化刮刮樂
    function initScratchCard() {
        // 獲取獎項
        const prize = getPrize();
        
        // 設置獎項文字
        const prizeText = document.getElementById('prize-text');
        prizeText.textContent = prize;
        
        // 初始化Canvas
        const canvas = document.getElementById('scratch-canvas');
        const ctx = canvas.getContext('2d');
        
        // 設置Canvas大小
        const scratchCard = document.querySelector('.scratch-card');
        canvas.width = scratchCard.offsetWidth;
        canvas.height = scratchCard.offsetHeight;
        
        // 繪製覆蓋層（灰色底紋+圖案）
        drawScratchLayer(ctx, canvas.width, canvas.height);
        
        // 設置Canvas事件
        setupCanvasEvents(canvas, ctx);
    }

    // 繪製刮刮樂覆蓋層
    function drawScratchLayer(ctx, width, height) {
        // 使用漸層背景
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#888');
        gradient.addColorStop(0.5, '#999');
        gradient.addColorStop(1, '#888');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // 添加紋理效果
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
            ctx.beginPath();
            ctx.arc(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // 添加品牌圖案（此處使用文字代替，實際應使用品牌圖像）
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('白砂の叁六', width / 2, height / 2);
    }

    // 設置Canvas事件
    function setupCanvasEvents(canvas, ctx) {
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        let scratchedPixels = 0;
        const totalPixels = canvas.width * canvas.height;
        const revealThreshold = 0.4; // 刮開40%顯示結果
        
        // 鼠標/觸摸事件
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('touchstart', handleTouchStart);
        
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('touchmove', handleTouchMove);
        
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('touchend', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        function startDrawing(e) {
            isDrawing = true;
            [lastX, lastY] = [e.offsetX, e.offsetY];
        }
        
        function handleTouchStart(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            isDrawing = true;
            [lastX, lastY] = [x, y];
        }
        
        function draw(e) {
            if (!isDrawing) return;
            
            const x = e.offsetX;
            const y = e.offsetY;
            
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 30;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            // 計算已刮開的像素
            scratchedPixels += Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2)) * ctx.lineWidth;
            
            // 檢查是否達到閾值
            if (scratchedPixels / totalPixels > revealThreshold) {
                revealPrize();
            }
            
            [lastX, lastY] = [x, y];
        }
        
        function handleTouchMove(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            const fakeEvent = { offsetX: x, offsetY: y };
            draw(fakeEvent);
        }
        
        function stopDrawing() {
            isDrawing = false;
        }
    }

    // 顯示獎品結果
    function revealPrize() {
        const prizeText = document.getElementById('prize-text').textContent;
        
        // 設置結果畫面獎品文字
        document.getElementById('prize-result').textContent = prizeText;
        
        // 生成獎品圖片
        generatePrizeImage(prizeText);
        
        // 延遲一點顯示結果畫面
        setTimeout(() => {
            showScreen('result-screen');
        }, 500);
    }

    // 生成獎品圖片
    function generatePrizeImage(prizeText) {
        const resultImage = document.getElementById('result-image');
        resultImage.innerHTML = '';
        
        // 創建Canvas生成圖片
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        
        const ctx = canvas.getContext('2d');
        
        // 背景
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 繪製獎品文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('恭喜您獲得', canvas.width / 2, 50);
        
        ctx.font = 'bold 30px Arial';
        ctx.fillText(prizeText, canvas.width / 2, canvas.height / 2);
        
        // 添加使用期限
        ctx.font = '16px Arial';
        ctx.fillText('使用期限：2024年12月31日', canvas.width / 2, canvas.height / 2 + 40);
        
        // 添加品牌標識
        ctx.font = '16px Arial';
        ctx.fillText('白砂の叁六', canvas.width / 2, canvas.height - 30);
        
        // 創建圖片
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        resultImage.appendChild(img);
    }

    // 保存獎品圖片
    function savePrizeImage() {
        const img = document.querySelector('#result-image img');
        if (img) {
            // 創建下載連結
            const link = document.createElement('a');
            link.download = '白砂の叁六獎品.png';
            link.href = img.src;
            link.click();
        }
    }

    // 切換畫面
    function showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        document.getElementById(screenId).classList.add('active');
    }

    // 根據權重獲取獎項
    function getPrize() {
        // 計算總權重
        const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
        
        // 隨機值
        const random = Math.random() * totalWeight;
        
        // 根據權重選擇獎項
        let weightSum = 0;
        for (const prize of prizes) {
            weightSum += prize.weight;
            if (random < weightSum) {
                return prize.name;
            }
        }
        
        // 預設返回第一個獎項
        return prizes[0].name;
    }
}); 
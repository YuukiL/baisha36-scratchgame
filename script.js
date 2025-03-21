document.addEventListener('DOMContentLoaded', function() {
    // 獎項設置（可由品牌方自定義）
    const prizes = [
        { name: "招待迎賓飲品乙份", weight: 35 },
        { name: "95折優惠", weight: 1 },
        { name: "入浴澡球組", weight: 35 },
        { name: "招待新鮮水果盤乙份", weight: 20 },
        { name: "818tequila 乙支", weight: 1 },
        { name: "烤肉食材折價卷1000元", weight: 8 },
    ];

    // 使用期限
    const expiryDate = "2025/08/31";
    
    // Google Apps Script URL (需替換為您的Apps Script部署網址)
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzKCO21hLIW703kpZGEdexC5fT8Zw_HckKNXhgw9tHzVskiMx0E_4jUkWlpqNZoHX3e/exec";
    
    // LIFF ID (需替換為您的LIFF ID)
    const LIFF_ID = "2007079805-78p64LPW";
    
    // 用戶ID
    let userId = null;
    
    // 初始化應用程式
    initApp();
    
    // 應用程式初始化函數
    async function initApp() {
        try {
            // 檢查是否在LINE Webview中
            if (!isLineWebview()) {
                showError("請透過LINE App開啟此遊戲！");
                hideGame();
                hideLoading();
                return;
            }
            
            // 初始化LIFF
            await initLineLiff();
            
            // 繼續初始化遊戲
            initGame();
        } catch (error) {
            console.error("初始化失敗:", error);
            showError("遊戲載入失敗，請稍後再試！");
            hideLoading();
        }
    }
    
    // 檢查是否在LINE Webview中
    function isLineWebview() {
        return /Line/i.test(navigator.userAgent);
    }
    
    // 顯示錯誤訊息
    function showError(message) {
        const errorElement = document.getElementById("error-message");
        const errorTextElement = document.getElementById("error-text");
        errorTextElement.textContent = message;
        errorElement.style.display = "block";
        
        // 5秒後自動隱藏錯誤訊息
        setTimeout(() => {
            errorElement.style.display = "none";
        }, 5000);
    }
    
    // 隱藏遊戲界面
    function hideGame() {
        document.getElementById("game-container").style.display = "none";
    }
    
    // 隱藏載入畫面
    function hideLoading() {
        document.getElementById("loading-overlay").style.display = "none";
    }
    
    // 初始化LINE LIFF
    async function initLineLiff() {
        try {
            await liff.init({ liffId: LIFF_ID });
            
            if (!liff.isLoggedIn()) {
                liff.login(); // 如果未登入，導向LINE登入
                return;
            }
            
            const profile = await liff.getProfile();
            userId = profile.userId; // 獲取LINE用戶ID
            
            // 檢查用戶是否已經參與過遊戲
            const hasPlayed = await checkUserStatus(userId);
            
            if (hasPlayed) {
                showError("❌ 您已參加過活動，無法重複遊玩！");
                hideGame();
                return;
            }
            
            // 用戶未參與過，可以繼續遊戲
            console.log("✅ 用戶可以開始遊戲");
            hideLoading();
        } catch (error) {
            console.error("LIFF初始化失敗:", error);
            throw new Error("無法連接到LINE服務，請稍後再試！");
        }
    }
    
    // 檢查用戶狀態
    async function checkUserStatus(userId) {
        try {
            const response = await fetch(`${GAS_URL}?action=check&userId=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            const data = await response.json();
            return data.hasPlayed; // 返回用戶是否已參與
        } catch (error) {
            console.error("檢查用戶狀態失敗:", error);
            // 如果無法連接到後端，假設用戶未參與過
            return false;
        }
    }
    
    // 記錄用戶已參與
    async function recordUserPlay(userId, prize) {
        try {
            const response = await fetch(GAS_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "record",
                    userId: userId,
                    prize: prize,
                    timestamp: new Date().toISOString()
                })
            });
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error("記錄用戶參與失敗:", error);
            return false;
        }
    }
    
    // 初始化遊戲
    function initGame() {
        createCards();
        setupEventListeners();
    }

    // 創建卡片
    function createCards() {
        const cardsRow = document.querySelector('.cards-row');
        cardsRow.innerHTML = '';
        
        // 創建9張卡片
        for (let i = 0; i < 9; i++) {
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
        
        // 完成按鈕
        const finishBtn = document.getElementById('finish-btn');
        finishBtn.addEventListener('click', finishGame);
    }

    // 選擇卡片
    function selectCard(e) {
        // 移除所有卡片的點擊事件，防止多次選擇
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.removeEventListener('click', selectCard);
            card.style.opacity = '1';
            card.style.zIndex = '1'; // 設置所有卡片為較低層級
        });

        // 選中當前卡片
        const selectedCard = e.currentTarget;
        selectedCard.classList.add('card-selected');
        selectedCard.style.opacity = '1';
        selectedCard.style.zIndex = '10'; // 將選中的卡片提升到最上層

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
        
        // 設置Canvas大小 - 使用getBoundingClientRect獲取精確尺寸
        const scratchCard = document.querySelector('.scratch-card');
        const cardRect = scratchCard.getBoundingClientRect();
        
        // 設置canvas尺寸，稍微增加一些邊距確保完全覆蓋
        canvas.width = cardRect.width + 4;
        canvas.height = cardRect.height + 4;
        
        // 確保canvas位置正確覆蓋，調整其位置
        canvas.style.position = 'absolute';
        canvas.style.top = '-2px';
        canvas.style.left = '-2px';
        canvas.style.width = (cardRect.width + 4) + 'px';
        canvas.style.height = (cardRect.height + 4) + 'px';
        
        // 繪製覆蓋層（灰色底紋+圖案）
        drawScratchLayer(ctx, canvas.width, canvas.height);
        
        // 設置Canvas事件
        setupCanvasEvents(canvas, ctx);
        
        // 添加視窗大小改變時的事件處理
        window.addEventListener('resize', debounce(function() {
            // 重新獲取尺寸
            const newCardRect = scratchCard.getBoundingClientRect();
            
            // 重設canvas尺寸
            canvas.width = newCardRect.width + 4;
            canvas.height = newCardRect.height + 4;
            canvas.style.width = (newCardRect.width + 4) + 'px';
            canvas.style.height = (newCardRect.height + 4) + 'px';
            
            // 重新繪製覆蓋層
            drawScratchLayer(ctx, canvas.width, canvas.height);
        }, 250));
    }

    // 防抖函數，避免頻繁觸發resize事件
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
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
        const revealThreshold = 0.3; // 刮開30%顯示結果
        
        // 鼠標/觸摸事件
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        
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
            ctx.lineJoin = 'round';
            
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
            if (!isDrawing) return;
            
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 40;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
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
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('恭喜您獲得', canvas.width / 2, 50);
        
        ctx.font = 'bold 26px Arial';
        ctx.fillText(prizeText, canvas.width / 2, canvas.height / 2);
        
        // 添加使用期限
        ctx.font = '16px Arial';
        ctx.fillText(`使用期限：${expiryDate}`, canvas.width / 2, canvas.height / 2 + 40);
        
        // 添加品牌標識
        ctx.font = '16px Arial';
        ctx.fillText('白砂の叁六', canvas.width / 2, canvas.height - 30);
        
        // 創建圖片
        const img = document.createElement('img');
        
        // 確保圖片可以跨域使用
        img.crossOrigin = 'anonymous';
        
        // 在移動設備上添加額外屬性
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            img.classList.add('saveable');
            
            // 更新按鈕文字
            const saveBtn = document.getElementById('save-btn');
            if (saveBtn) {
                // 检测是否支援分享API
                if (navigator.share && navigator.canShare) {
                    saveBtn.textContent = '儲存/分享獎品';
                } else {
                    saveBtn.textContent = '儲存至手機相冊';
                }
            }
        }
        
        img.src = canvas.toDataURL('image/png');
        resultImage.appendChild(img);
    }

    // 保存獎品圖片
    function savePrizeImage() {
        const img = document.querySelector('#result-image img');
        if (!img) return;
        
        // 檢測是否為移動設備
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // 移動設備 - 使用 Web Share API 或提供儲存指導
            if (navigator.share && navigator.canShare) {
                // 使用 Web Share API (現代瀏覽器支持)
                fetch(img.src)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], '白砂の叁六獎品.png', { type: 'image/png' });
                        
                        if (navigator.canShare({ files: [file] })) {
                            navigator.share({
                                title: '我的白砂の叁六獎品',
                                files: [file]
                            }).catch(error => {
                                console.error('分享失敗:', error);
                                showSaveTip();
                            });
                        } else {
                            showSaveTip();
                        }
                    }).catch(() => {
                        showSaveTip();
                    });
            } else {
                // 不支持 Web Share API 時提供視覺指導
                showSaveTip();
            }
        } else {
            // 桌面設備 - 使用傳統下載方式
            const link = document.createElement('a');
            link.download = '白砂の叁六獎品.png';
            link.href = img.src;
            link.click();
        }
    }
    
    // 顯示儲存提示
    function showSaveTip() {
        // 更新按鈕文字
        const saveBtn = document.getElementById('save-btn');
        saveBtn.textContent = '長按圖片儲存';
        
        // 添加點擊效果，點擊後提示用戶長按圖片
        saveBtn.onclick = function() {
            alert('請長按圖片，然後選擇「儲存圖片」或「保存圖片」選項將獎品儲存至您的相冊');
        };
    }
    
    // 完成遊戲並記錄用戶
    async function finishGame() {
        if (!userId) {
            showError("無法記錄您的參與，請重新開啟遊戲");
            return;
        }
        
        const prizeText = document.getElementById('prize-result').textContent;
        
        try {
            document.getElementById("loading-overlay").style.display = "flex";
            const success = await recordUserPlay(userId, prizeText);
            
            if (success) {
                alert("✅ 恭喜您完成遊戲！獎品已記錄，請妥善保存");
                
                // 如果在LIFF環境中，可以選擇關閉LIFF
                if (liff.isInClient()) {
                    setTimeout(() => {
                        liff.closeWindow();
                    }, 2000);
                }
            } else {
                showError("記錄獎品時出現問題，但您可以截圖保存獎品");
            }
        } catch (error) {
            console.error("完成遊戲時出錯:", error);
            showError("無法連接伺服器，請截圖保存您的獎品");
        } finally {
            document.getElementById("loading-overlay").style.display = "none";
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
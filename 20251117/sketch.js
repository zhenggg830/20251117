// 全域變數，用於儲存畫布的 100% 尺寸
let canvasWidth;
let canvasHeight;
// 儲存所有動態形狀物件的陣列
let objs = [];
// 顏色選擇
let colors = ['#f71735', '#f7d002', '#1A53C0', '#232323'];

// 選單相關的全域變數
let isMenuOpen = false;
let menuButton;
let menuPanel;

function setup() {
    // 1. 設定畫布尺寸為全螢幕 (100%)
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;

    // 2. 建立畫布並設定 ID
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.id('center-canvas'); 
    
    // 3. 確保整個網頁背景為黑色
    document.body.style.backgroundColor = '#000000';
    document.body.style.margin = '0'; 
    document.body.style.padding = '0'; 
    
    rectMode(CENTER);
    objs.push(new DynamicShape());

    // 4. 初始化選單和 CSS
    setupCSS(); // 確保 CSS 樣式在 DOM 元素建立前就緒
    setupMenu(); // 建立選單 DOM 元素
}

function draw() {
    background(0); 

    for (let i of objs) {
        i.run();
    }

    // 動態新增形狀的邏輯
    if (frameCount % int(random([15, 30])) == 0) {
        let addNum = int(random(1, 30));
        for (let i = 0; i < addNum; i++) {
            objs.push(new DynamicShape());
        }
    }
    
    // 移除已死亡的形狀
    for (let i = 0; i < objs.length; i++) {
        if (objs[i].isDead) {
            objs.splice(i, 1);
        }
    }
    
    // =======================================================
    // 繪製封面主題文字 - 白色、絕對置中
    // =======================================================
    push();
    fill(255); // 白色
    noStroke();
    let textScale = isMenuOpen ? 0.025 : 0.03;
    textSize(canvasWidth * textScale); 
    textAlign(CENTER, CENTER); 
    
    // 絕對置中在畫布中心
    text('淡江大學鄭安淳704', canvasWidth / 2, canvasHeight / 2);
    pop();
    // =======================================================
}

// 響應式調整：視窗大小變動時重新調整畫布尺寸
function windowResized() {
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    resizeCanvas(canvasWidth, canvasHeight);
    background(0);
}

// 緩動函式：InOutExpo
function easeInOutExpo(x) {
    return x === 0 ? 0 :
        x === 1 ?
        1 :
        x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 :
        (2 - Math.pow(2, -20 * x + 10)) / 2;
}

/**
 * DynamicShape 類別 (保持不變)
 */
class DynamicShape {
    constructor() {
        this.x = random(0.3, 0.7) * canvasWidth;
        this.y = random(0.3, 0.7) * canvasHeight;
        this.reductionRatio = 1;
        this.shapeType = int(random(4));
        this.animationType = 0;
        this.maxActionPoints = int(random(2, 5));
        this.actionPoints = this.maxActionPoints;
        this.elapsedT = 0;
        this.size = 0;
        this.sizeMax = canvasWidth * random(0.01, 0.05); 
        this.fromSize = 0;
        this.init();
        this.isDead = false;
        this.clr = random(colors);
        this.changeShape = true;
        this.ang = int(random(2)) * PI * 0.25;
        this.lineSW = 0;
    }

    show() {
        push();
        translate(this.x, this.y);
        if (this.animationType == 1) scale(1, this.reductionRatio);
        if (this.animationType == 2) scale(this.reductionRatio, 1);
        
        let c = color(this.clr);
        strokeWeight(this.size * 0.05);
        
        if (this.shapeType == 0) { // 實心圓
            noStroke();
            fill(c);
            circle(0, 0, this.size);
        } else if (this.shapeType == 1) { // 空心圓
            noFill();
            stroke(c);
            circle(0, 0, this.size);
        } else if (this.shapeType == 2) { // 實心矩形
            noStroke();
            fill(c);
            rect(0, 0, this.size, this.size);
        } else if (this.shapeType == 3) { // 空心矩形
            noFill();
            stroke(c);
            rect(0, 0, this.size * 0.9, this.size * 0.9);
        } else if (this.shapeType == 4) { // 十字線
            strokeWeight(this.size * 0.1); 
            stroke(c);
            noFill();
            line(0, -this.size * 0.45, 0, this.size * 0.45);
            line(-this.size * 0.45, 0, this.size * 0.45, 0);
        }
        pop();
        
        // 繪製拖曳線條
        strokeWeight(this.lineSW);
        stroke(c);
        line(this.x, this.y, this.fromX, this.fromY);
    }

    move() {
        let n = easeInOutExpo(norm(this.elapsedT, 0, this.duration));
        
        if (0 < this.elapsedT && this.elapsedT < this.duration) {
            if (this.actionPoints == this.maxActionPoints) {
                this.size = lerp(0, this.sizeMax, n);
            } else if (this.actionPoints > 0) {
                if (this.animationType == 0) {
                    this.size = lerp(this.fromSize, this.toSize, n);
                } else if (this.animationType == 1) { 
                    this.x = lerp(this.fromX, this.toX, n);
                    this.lineSW = lerp(0, this.size / 5, sin(n * PI));
                } else if (this.animationType == 2) { 
                    this.y = lerp(this.fromY, this.toY, n);
                    this.lineSW = lerp(0, this.size / 5, sin(n * PI));
                } else if (this.animationType == 3) { 
                    if (this.changeShape == true) {
                        this.shapeType = int(random(5));
                        this.changeShape = false;
                    }
                }
                this.reductionRatio = lerp(1, 0.3, sin(n * PI));
            } else {
                this.size = lerp(this.fromSize, 0, n);
            }
        }

        this.elapsedT++;
        if (this.elapsedT > this.duration) {
            this.actionPoints--;
            this.init();
        }
        if (this.actionPoints < 0) {
            this.isDead = true;
        }
    }

    run() {
        this.show();
        this.move();
    }

    init() {
        this.elapsedT = 0;
        this.fromSize = this.size;
        this.toSize = this.sizeMax * random(0.5, 1.5);
        this.fromX = this.x;
        this.toX = this.fromX + (canvasWidth / 10) * random([-1, 1]) * int(random(1, 4)); 
        this.fromY = this.y;
        this.toY = this.fromY + (canvasHeight / 10) * random([-1, 1]) * int(random(1, 4));
        this.animationType = int(random(4)); 
        this.duration = random(20, 50);
        this.changeShape = true;
    }
}


// =======================================================
// 選單邏輯調整：新增項目並重新編號
// =======================================================

function setupMenu() {
    // 1. 建立選單按鈕
    menuButton = createButton('☰');
    menuButton.id('menu-button');
    menuButton.mousePressed(toggleMenu);

    // 2. 建立選單內容面板
    menuPanel = createElement('div');
    menuPanel.id('menu-panel');
    menuPanel.class('closed'); 
    
    // 3. 選單內容 (已新增項目並重新編號)
    menuPanel.html(`
        <h3>選單</h3>
        <hr>
        <div class="menu-items">
            <a href="https://cfchengit.github.io/20251020">1. 第一單元作業</a>
            
            <a href="https://hackmd.io/@fKWOBZpQQz-vgaa-V2eHdQ/ByCNKmCill">2. 第一單元筆記</a>
            
            <a href="https://zhenggg830.github.io/20251103./">3. 測驗系統</a>
            
            <a href="https://hackmd.io/@fKWOBZpQQz-vgaa-V2eHdQ/SyuJFzdg-l">4. 第二單元筆記</a>
            
            <a href="https://www.et.tku.edu.tw/">5. 淡江大學</a>
            
            <a href="#" onclick="objs = []; objs.push(new DynamicShape()); toggleMenu(); return false;">6. 回到首頁 (重設動畫)</a>
        </div>
        <p style="margin-top: 30px; font-size: 0.8em; opacity: 0.7;">Powered by p5.js</p>
    `);
}

function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        menuPanel.class('open');
        menuButton.html('✕'); // 換成關閉圖標 (X)
    } else {
        menuPanel.class('closed');
        menuButton.html('☰'); // 換回選單圖標
    }
}

// =======================================================
// CSS 樣式 (保持不變)
// =======================================================

function setupCSS() {
    const style = document.createElement('style');
    style.innerHTML = `
        /* 確保 HTML 和 BODY 嚴格佔滿 100% 視窗且無溢出 */
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden; 
            background-color: #000000;
        }
        
        /* 畫布定位 */
        #center-canvas {
            display: block;
            position: absolute; 
            top: 0;
            left: 0;
            z-index: 1; 
        }

        /* ----------------------- 選單按鈕樣式 (左上角) ----------------------- */
        #menu-button {
            position: fixed;
            top: 20px;
            left: 20px; 
            z-index: 100; 
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #ffffff; 
            color: #000000; 
            border: none;
            cursor: pointer;
            font-size: 24px;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
            transition: background-color 0.3s, transform 0.3s;
        }

        #menu-button:hover {
            background-color: #f0f0f0;
            transform: scale(1.05);
        }

        /* ----------------------- 選單面板樣式 (左側) ----------------------- */
        #menu-panel {
            position: fixed;
            top: 0;
            left: 0; 
            height: 100%;
            width: 300px; 
            max-width: 80%; 
            background-color: rgba(255, 255, 255, 0.95); 
            color: #232323;
            z-index: 50; 
            padding: 20px;
            box-sizing: border-box;
            box-shadow: 5px 0 15px rgba(0, 0, 0, 0.5); 
            
            /* 動畫過渡 */
            transition: transform 0.4s ease-in-out; 
            overflow-y: auto;
        }

        /* 預設關閉狀態：移出螢幕左側 */
        #menu-panel.closed {
            transform: translateX(-100%); 
        }

        /* 開啟狀態：回到原始位置 */
        #menu-panel.open {
            transform: translateX(0);
        }

        /* ----------------------- 選單項目樣式 (垂直排列) ----------------------- */
        .menu-items {
            display: flex;
            flex-direction: column;
            gap: 15px; 
            padding-top: 10px;
        }

        .menu-items a {
            text-decoration: none;
            color: #1A53C0; 
            font-size: 1.1em;
            padding: 8px 10px;
            border-radius: 5px;
            transition: background-color 0.2s, color 0.2s;
            border: 1px solid #ddd;
        }

        .menu-items a:hover {
            background-color: #1A53C0;
            color: white;
        }

        /* 選單內容基本樣式 */
        #menu-panel h3 {
            border-bottom: 2px solid #232323;
            padding-bottom: 10px;
            margin-top: 0;
        }
    `;
    document.head.appendChild(style);
}
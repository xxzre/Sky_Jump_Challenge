/**
 * 💰 Escalada no Dinheiro - V2
 * Jogo de subida infinita focado em moedas e progressão.
 */

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreValueDisplay = document.getElementById('score-value');
    const highScoreValueDisplay = document.getElementById('high-score-value');
    const finalScoreDisplay = document.getElementById('final-score');
    const startScreen = document.getElementById('start-screen');
    const shopScreen = document.getElementById('shop-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('start-button');
    const shopButton = document.getElementById('shop-button');
    const closeShopButton = document.getElementById('close-shop');
    const restartButton = document.getElementById('restart-button');
    const settingsButton = document.getElementById('settings-button');
    const closeSettingsButton = document.getElementById('close-settings');
    const settingsScreen = document.getElementById('settings-screen');
    const volumeControl = document.getElementById('volume-control');
    const mapLeftBtn = document.getElementById('map-left');
    const mapRightBtn = document.getElementById('map-right');
    const coinDisplay = document.getElementById('coin-count');
    const skinListContainer = document.getElementById('skin-list');
    const bgMusic = document.getElementById('bg-music');

    // Elementos de Tradução
    const uiElements = {
        title: document.getElementById('main-title'),
        subtitle: document.getElementById('main-subtitle'),
        startBtn: document.getElementById('start-button'),
        shopBtn: document.getElementById('shop-button'),
        bestLabel: document.getElementById('best-label'),
        shopTitle: document.getElementById('shop-title'),
        closeShopBtn: document.getElementById('close-shop'),
        gameOverTitle: document.getElementById('game-over-title'),
        restartBtn: document.getElementById('restart-button'),
        menuBtn: document.getElementById('menu-button'),
        supportTitle: document.getElementById('support-title'),
        helpControlsTitle: document.getElementById('help-controls-title'),
        helpControlsDesc: document.getElementById('help-controls-desc'),
        helpGoalTitle: document.getElementById('help-goal-title'),
        helpGoalDesc: document.getElementById('help-goal-desc'),
        helpItemsTitle: document.getElementById('help-items-title'),
        helpItemsDesc: document.getElementById('help-items-desc'),
        helpContactTitle: document.getElementById('help-contact-title'),
        helpContactDesc: document.getElementById('help-contact-desc'),
        closeSupportBtn: document.getElementById('close-support'),
        settingsTitle: document.getElementById('settings-title'),
        volumeLabel: document.getElementById('label-volume'),
        controlsLabel: document.getElementById('label-controls'),
        leftLabel: document.getElementById('label-left'),
        rightLabel: document.getElementById('label-right'),
        closeSettingsBtn: document.getElementById('close-settings')
    };

    const TRANSLATIONS = {
        pt: {
            title: 'Escalada no Dinheiro',
            subtitle: 'O lucro não tem limites',
            startBtn: 'Jogar Agora',
            shopBtn: 'Loja de Itens',
            bestLabel: 'Melhor',
            shopTitle: 'Mercado de Skins',
            closeShopBtn: 'Voltar ao Menu',
            gameOverTitle: 'Fim de Jogo',
            restartBtn: 'Novo Vôo',
            menuBtn: 'Menu Principal',
            scorePrefix: 'Pontuação: ',
            coinsSuffix: ' moedas',
            active: 'Ativo',
            select: 'Selecionar',
            skins: {
                default: { name: 'Porquinho Gay', ability: 'Padrão' },
                neon: { name: 'Porquinho Preto', ability: '+25% Velocidade' },
                jump: { name: 'Porquinho Bolsonarista', ability: 'Super Buff (+15% Tudo)' },
                magnet: { name: 'Porquinho Petista', ability: 'Imã Potente' },
                gravity: { name: 'Porquinho Do Bem', ability: '-15% Gravidade' }
            },
            supportTitle: 'Ajuda & Suporte',
            helpControlsTitle: 'Controles',
            helpControlsDesc: 'Use A/D ou as Setas do teclado para mover o personagem.',
            helpGoalTitle: 'Objetivo',
            helpGoalDesc: 'Suba o mais alto possível coletando moedas e evitando os bixos!',
            helpItemsTitle: 'Itens',
            helpItemsDesc: 'Plataformas amarelas dão super pulo. Na loja, compre skins com habilidades únicas.',
            helpContactTitle: 'Contato & Feedback',
            helpContactDesc: 'Gostou? Deixe seu feedback ou sugira novos bixos!',
            closeSupportBtn: 'Voltar',
            settingsTitle: 'Configurações',
            volumeLabel: 'Volume',
            controlsLabel: 'Controles',
            leftLabel: 'Esquerda',
            rightLabel: 'Direita',
            closeSettingsBtn: 'Voltar',
            pressKey: 'Pressione uma tecla...'
        },
        en: {
            title: 'Money Climb',
            subtitle: 'Profits have no limits',
            startBtn: 'Play Now',
            shopBtn: 'Item Shop',
            bestLabel: 'Best',
            shopTitle: 'Skin Market',
            closeShopBtn: 'Back to Menu',
            gameOverTitle: 'Game Over',
            restartBtn: 'New Flight',
            menuBtn: 'Main Menu',
            scorePrefix: 'Score: ',
            coinsSuffix: ' coins',
            active: 'Active',
            select: 'Select',
            skins: {
                default: { name: 'Gay Piggy', ability: 'Standard' },
                neon: { name: 'Black Piggy', ability: '+25% Speed' },
                jump: { name: 'Bolsonarista Piggy', ability: 'Super Buff (+15% All)' },
                magnet: { name: 'Petista Piggy', ability: 'Power Magnet' },
                gravity: { name: 'Good Piggy', ability: '-15% Gravity' }
            },
            supportTitle: 'Help & Support',
            helpControlsTitle: 'Controls',
            helpControlsDesc: 'Use A/D or Arrow keys to move the character.',
            helpGoalTitle: 'Goal',
            helpGoalDesc: 'Climb as high as possible collecting coins and dodging monsters!',
            helpItemsTitle: 'Items',
            helpItemsDesc: 'Yellow platforms give a super jump. In the shop, buy skins with unique abilities.',
            helpContactTitle: 'Contact & Feedback',
            helpContactDesc: 'Like it? Leave feedback or suggest new monsters!',
            closeSupportBtn: 'Back',
            settingsTitle: 'Settings',
            volumeLabel: 'Volume',
            controlsLabel: 'Controls',
            leftLabel: 'Left',
            rightLabel: 'Right',
            closeSettingsBtn: 'Back',
            pressKey: 'Press a key...'
        }
    };

    let currentLang = localStorage.getItem('skyJumpLang') || 'pt';

    // Controles Customizados
    let leftKey = localStorage.getItem('skyJumpKeyLeft') || 'a';
    let rightKey = localStorage.getItem('skyJumpKeyRight') || 'd';
    let isMapping = null; // 'left' ou 'right'

    // Configurações e Física
    const CANVAS_WIDTH = 400;
    const CANVAS_HEIGHT = 600;
    const INITIAL_GRAVITY = 0.35;
    const INITIAL_HORIZONTAL_SPEED = 6;
    const JUMP_FORCE = -12;
    const SCORE_STEP = 200;
    const DIFFICULTY_INCREMENT = 0.05;

    // Skins e Habilidades
    const SKINS = [
        { id: 'default', color: '#ffb6c1', imgSrc: 'assets/Porquinho_Da_Sorte_Gay.png', price: 0, stats: { gravity: 0, speed: 0, jump: 0, magnet: 40 } },
        { id: 'neon', color: '#000000ff', imgSrc: 'assets/Porquinho_Da_Sorte_Preto.png', price: 50, stats: { gravity: 0, speed: 1.5, jump: 0, magnet: 40 } },
        { id: 'jump', color: '#eeff00ff', imgSrc: 'assets/Porquinho_da_Sorte_Bolsonaro.png', price: 100, stats: { gravity: -0.0575, speed: 1.725, jump: -3.45, magnet: 138 } },
        { id: 'magnet', color: '#ff0000ff', imgSrc: 'assets/Porquinho_da_Sorte_PT.png', price: 150, stats: { gravity: 0, speed: 0, jump: 0, magnet: 120 } },
        { id: 'gravity', color: '#ffffff', imgSrc: 'assets/Porquinho_Da_Sorte_Branco.png', price: 200, stats: { gravity: -0.05, speed: 0, jump: 0, magnet: 45 } }
    ];

    // Estado do Jogo
    let score = 0;
    let highScore = parseInt(localStorage.getItem('skyJumpHighScore')) || 0;
    let gameActive = false;
    let platforms = [];
    let enemies = [];
    let cameraY = 0;
    let gravity = INITIAL_GRAVITY;
    let horizontalSpeed = INITIAL_HORIZONTAL_SPEED;
    let currentColor = { r: 135, g: 206, b: 235 };
    let animationId = null;
    const keys = {};

    // Economia e Skins
    let coins = parseInt(localStorage.getItem('skyJumpCoins')) || 0;
    let purchasedSkins = [];
    try {
        purchasedSkins = JSON.parse(localStorage.getItem('skyJumpPurchased')) || ['default'];
        if (!Array.isArray(purchasedSkins)) purchasedSkins = ['default'];
    } catch (e) {
        purchasedSkins = ['default'];
    }
    let activeSkinId = localStorage.getItem('skyJumpActiveSkin') || 'default';

    // Transições de Cores
    const COLORS = {
        SKY: { r: 135, g: 206, b: 235 },
        DEEP: { r: 26, g: 35, b: 126 },
        SPACE: { r: 0, g: 0, b: 51 }
    };

    // UI Inicial
    updateLanguageUI();
    if (highScoreValueDisplay) highScoreValueDisplay.textContent = highScore;
    updateCoinUI();

    function updateLanguageUI() {
        const lang = TRANSLATIONS[currentLang];
        uiElements.title.textContent = lang.title;
        uiElements.subtitle.textContent = lang.subtitle;
        uiElements.startBtn.textContent = lang.startBtn;
        uiElements.shopBtn.textContent = lang.shopBtn;
        uiElements.bestLabel.textContent = lang.bestLabel;
        uiElements.shopTitle.textContent = lang.shopTitle;
        uiElements.closeShopBtn.textContent = lang.closeShopBtn;
        uiElements.gameOverTitle.textContent = lang.gameOverTitle;
        uiElements.restartBtn.textContent = lang.restartBtn;
        uiElements.menuBtn.textContent = lang.menuBtn;

        uiElements.supportTitle.textContent = lang.supportTitle;
        uiElements.helpControlsTitle.textContent = lang.helpControlsTitle;
        uiElements.helpControlsDesc.textContent = lang.helpControlsDesc;
        uiElements.helpGoalTitle.textContent = lang.helpGoalTitle;
        uiElements.helpGoalDesc.textContent = lang.helpGoalDesc;
        uiElements.helpItemsTitle.textContent = lang.helpItemsTitle;
        uiElements.helpItemsDesc.textContent = lang.helpItemsDesc;
        uiElements.helpContactTitle.textContent = lang.helpContactTitle;
        uiElements.helpContactDesc.textContent = lang.helpContactDesc;
        uiElements.closeSupportBtn.textContent = lang.closeSupportBtn;

        uiElements.settingsTitle.textContent = lang.settingsTitle;
        uiElements.volumeLabel.textContent = lang.volumeLabel;
        uiElements.controlsLabel.textContent = lang.controlsLabel;
        uiElements.leftLabel.textContent = lang.leftLabel;
        uiElements.rightLabel.textContent = lang.rightLabel;
        uiElements.closeSettingsBtn.textContent = lang.closeSettingsBtn;

        mapLeftBtn.textContent = leftKey.toUpperCase();
        mapRightBtn.textContent = rightKey.toUpperCase();

        document.getElementById('btn-pt').classList.toggle('active', currentLang === 'pt');
        document.getElementById('btn-en').classList.toggle('active', currentLang === 'en');

        localStorage.setItem('skyJumpLang', currentLang);
    }

    function updateCoinUI() {
        if (coinDisplay) coinDisplay.textContent = coins;
    }

    class Player {
        constructor() {
            this.width = 45;
            this.height = 45;
            this.x = CANVAS_WIDTH / 2 - this.width / 2;
            this.y = CANVAS_HEIGHT - 100;
            this.vx = 0;
            this.vy = 0;

            const skin = SKINS.find(s => s.id === activeSkinId) || SKINS[0];
            this.color = skin.color;
            this.stats = skin.stats;
            if (skin.imgSrc) {
                this.image = new Image();
                this.image.src = skin.imgSrc;
            } else {
                this.image = null;
            }
        }

        draw() {
            const drawY = this.y - cameraY;
            if (this.image && this.image.complete && this.image.naturalWidth > 0) {
                ctx.drawImage(this.image, this.x, drawY, this.width, this.height);
                return;
            }
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, drawY + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        update() {
            const currentSpeed = horizontalSpeed + this.stats.speed;
            const goLeft = (keys[leftKey] === true) || (keys[leftKey.toUpperCase()] === true) || (keys['ArrowLeft'] === true);
            const goRight = (keys[rightKey] === true) || (keys[rightKey.toUpperCase()] === true) || (keys['ArrowRight'] === true);
            if (goLeft) this.vx = -currentSpeed;
            else if (goRight) this.vx = currentSpeed;
            else this.vx *= 0.8;
            this.x += this.vx;
            if (this.x + this.width < 0) this.x = CANVAS_WIDTH;
            if (this.x > CANVAS_WIDTH) this.x = -this.width;
            this.vy += (gravity + this.stats.gravity);
            this.y += this.vy;
            if (this.y < cameraY + 250) cameraY = this.y - 250;
        }

        jump(multiplier = 1) {
            this.vy = (JUMP_FORCE + this.stats.jump) * multiplier;
        }
    }

    class Platform {
        constructor(y, isFirst = false) {
            this.width = 70;
            this.height = 12;
            this.x = Math.random() * (CANVAS_WIDTH - this.width);
            this.y = y;
            this.type = (!isFirst && Math.random() < 0.15) ? 'BOOST' : 'NORMAL';
            this.hasCoin = (!isFirst && Math.random() < 0.5);
            this.coinCollected = false;
            this.isMoving = !isFirst && Math.random() < 0.2;
            this.vx = this.isMoving ? (Math.random() < 0.5 ? 2 : -2) : 0;
        }
        update() {
            if (!this.isMoving) return;
            this.x += this.vx;
            if (this.x <= 0 || this.x + this.width >= CANVAS_WIDTH) this.vx *= -1;
        }
        draw() {
            const drawY = this.y - cameraY;
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(this.x + 4, drawY + 4, this.width, this.height);
            if (this.type === 'BOOST') {
                ctx.fillStyle = '#ffeb3b';
                ctx.fillRect(this.x, drawY, this.width, this.height);
                ctx.fillStyle = '#f44336';
                ctx.fillRect(this.x + 5, drawY - 4, this.width - 10, 4);
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(this.x, drawY, this.width, this.height);
            }
            if (this.hasCoin && !this.coinCollected) {
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, drawY - 15, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    class Enemy {
        constructor(y) {
            this.width = 40;
            this.height = 40;
            this.x = Math.random() * (CANVAS_WIDTH - this.width);
            this.y = y;
            this.vx = (Math.random() - 0.5) * 4;
            this.pulse = 0;
        }
        update() {
            this.x += this.vx;
            if (this.x <= 0 || this.x + this.width >= CANVAS_WIDTH) this.vx *= -1;
            this.pulse += 0.1;
        }
        draw() {
            const drawY = this.y - cameraY;
            const scale = 1 + Math.sin(this.pulse) * 0.1;
            ctx.save();
            ctx.translate(this.x + this.width / 2, drawY + this.height / 2);
            ctx.scale(scale, scale);
            ctx.fillStyle = '#9c27b0';
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function spawnPlatforms() {
        let highestPlatformY = platforms.length > 0 ? platforms[platforms.length - 1].y : CANVAS_HEIGHT;
        while (highestPlatformY > cameraY - 100) {
            highestPlatformY -= 90 + Math.random() * 40;
            platforms.push(new Platform(highestPlatformY));
        }
        if (platforms.length > 0 && platforms[0].y - cameraY > CANVAS_HEIGHT + 100) platforms.shift();
    }

    function spawnEnemies() {
        if (score < 400) return;
        const spawnY = cameraY - 400;
        const minDistance = 2000;
        if (enemies.length === 0 || (enemies[enemies.length - 1].y > spawnY + minDistance)) {
            const spawnChance = Math.min(0.002 + (score / 40000), 0.03);
            if (Math.random() < spawnChance) enemies.push(new Enemy(spawnY));
        }
        if (enemies.length > 0 && enemies[0].y - cameraY > CANVAS_HEIGHT + 300) enemies.shift();
    }

    function checkCollisions() {
        if (!player) return;
        if (player.vy > 0) {
            platforms.forEach(p => {
                if (player.x + player.width > p.x && player.x < p.x + p.width && player.y + player.height > p.y && player.y + player.height < p.y + p.height + player.vy) {
                    player.jump(p.type === 'BOOST' ? 1.8 : 1);
                    const currentScore = Math.floor(Math.abs(player.y - (CANVAS_HEIGHT - 100)) / 10);
                    if (currentScore > score) {
                        score = currentScore;
                        if (scoreValueDisplay) scoreValueDisplay.textContent = score;
                    }
                }
            });
        }
        platforms.forEach(p => {
            if (p.hasCoin && !p.coinCollected) {
                const coinX = p.x + p.width / 2;
                const coinY = p.y - 15;
                const dist = Math.sqrt(Math.pow((player.x + player.width / 2) - coinX, 2) + Math.pow((player.y + player.height / 2) - coinY, 2));
                if (dist < player.stats.magnet) {
                    p.coinCollected = true;
                    coins++;
                    updateCoinUI();
                    localStorage.setItem('skyJumpCoins', coins);
                }
            }
        });
        enemies.forEach(e => {
            const distX = Math.abs((player.x + player.width / 2) - (e.x + e.width / 2));
            const distY = Math.abs((player.y + player.height / 2) - (e.y + e.height / 2));
            if (distX < 25 && distY < 25) endGame();
        });
        if (player.y - cameraY > CANVAS_HEIGHT) endGame();
    }

    function updateBackground() {
        canvas.style.background = '#1a1a2e';
    }

    let player = null;
    function gameLoop() {
        if (!gameActive) return;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        player.update();
        spawnPlatforms();
        spawnEnemies();
        checkCollisions();
        updateBackground();
        platforms.forEach(p => { p.update(); p.draw(); });
        enemies.forEach(e => { e.update(); e.draw(); });
        player.draw();
        animationId = requestAnimationFrame(gameLoop);
    }

    function startGame() {
        if (animationId) cancelAnimationFrame(animationId);
        gameActive = true;
        player = new Player();
        score = 0;
        cameraY = 0;
        platforms = [];
        enemies = [];
        const firstP = new Platform(CANVAS_HEIGHT - 50, true);
        firstP.x = CANVAS_WIDTH / 2 - firstP.width / 2;
        platforms.push(firstP);
        for (let i = 1; i < 7; i++) platforms.push(new Platform(CANVAS_HEIGHT - (i * 100) - 50));
        updateCoinUI();
        startScreen.classList.add('hidden');
        shopScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        gameLoop();
    }

    function endGame() {
        gameActive = false;
        const lang = TRANSLATIONS[currentLang];
        if (animationId) cancelAnimationFrame(animationId);
        gameOverScreen.classList.remove('hidden');
        finalScoreDisplay.textContent = `${lang.scorePrefix}${score}`;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('skyJumpHighScore', highScore);
            highScoreValueDisplay.textContent = highScore;
        }
    }

    function renderShop() {
        if (!skinListContainer) return;
        const lang = TRANSLATIONS[currentLang];
        skinListContainer.innerHTML = '';
        SKINS.forEach(skin => {
            const isPurchased = purchasedSkins.includes(skin.id);
            const isActive = activeSkinId === skin.id;
            const skinTrans = lang.skins[skin.id] || { name: 'Unknown', ability: '---' };
            const card = document.createElement('div');
            card.className = `skin-card ${isActive ? 'selected' : ''}`;
            let previewHTML = `<div class="skin-preview" style="background-image: url('${skin.imgSrc}'); background-size: cover; background-position: center; border-radius: 50%;"></div>`;
            const priceText = isPurchased ? (isActive ? lang.active : lang.select) : skin.price + lang.coinsSuffix;
            card.innerHTML = `${previewHTML}<div class="skin-info"><span class="skin-name">${skinTrans.name}</span><span class="skin-ability">${skinTrans.ability}</span></div><div class="skin-price">${priceText}</div>`;
            card.onclick = () => {
                if (isPurchased) {
                    activeSkinId = skin.id;
                    localStorage.setItem('skyJumpActiveSkin', activeSkinId);
                    renderShop();
                } else if (coins >= skin.price) {
                    coins -= skin.price;
                    purchasedSkins.push(skin.id);
                    activeSkinId = skin.id;
                    localStorage.setItem('skyJumpCoins', coins);
                    localStorage.setItem('skyJumpPurchased', JSON.stringify(purchasedSkins));
                    localStorage.setItem('skyJumpActiveSkin', activeSkinId);
                    updateCoinUI();
                    renderShop();
                }
            };
            skinListContainer.appendChild(card);
        });
    }

    startButton.onclick = startGame;
    restartButton.onclick = startGame;
    shopButton.onclick = () => { startScreen.classList.add('hidden'); shopScreen.classList.remove('hidden'); renderShop(); };
    closeShopButton.onclick = () => { shopScreen.classList.add('hidden'); startScreen.classList.remove('hidden'); };

    document.getElementById('btn-pt').onclick = () => { currentLang = 'pt'; updateLanguageUI(); renderShop(); };
    document.getElementById('btn-en').onclick = () => { currentLang = 'en'; updateLanguageUI(); renderShop(); };

    window.addEventListener('keydown', (e) => keys[e.key] = true);
    window.addEventListener('keyup', (e) => keys[e.key] = false);

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    renderShop();
});

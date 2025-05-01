class Player {
    constructor(x, y, color, isAI = false) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 3;
        this.color = color;
        this.isAI = isAI;
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.pushPower = 0;
        this.pushCooldown = 0;
        this.isPushing = false;
        this.health = 100;
        this.isKnockedBack = false;
        this.knockbackTimer = 0;
        this.knockbackDirection = { x: 0, y: 0 };
        this.attackRange = 100;
    }

    move(arena) {
        if (this.isKnockedBack) {
            // 被擊退時的移動
            this.x += this.knockbackDirection.x * 5;
            this.y += this.knockbackDirection.y * 5;
            this.knockbackTimer--;
            
            if (this.knockbackTimer <= 0) {
                this.isKnockedBack = false;
            }
        } else {
            // 正常移動
            const currentSpeed = this.speed * (this.isPushing ? 0.5 : 1);
            this.x += this.nextDirection.x * currentSpeed;
            this.y += this.nextDirection.y * currentSpeed;
        }

        // 邊界檢查（只防止完全離開畫面）
        this.x = Math.max(0, Math.min(this.x, arena.width - this.width));
        this.y = Math.max(0, Math.min(this.y, arena.height - this.height));

        // 更新當前方向
        this.direction = { ...this.nextDirection };
    }

    draw(ctx) {
        // 繪製玩家
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 繪製生命值條
        const healthWidth = this.width * (this.health / 100);
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - 10, this.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y - 10, healthWidth, 5);

        // 繪製推擠狀態
        if (this.isPushing) {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        }
    }

    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    update() {
        // 更新推擠冷卻
        if (this.pushCooldown > 0) {
            this.pushCooldown--;
        }
    }

    takeKnockback(fromX, fromY) {
        if (!this.isKnockedBack) {
            this.isKnockedBack = true;
            this.knockbackTimer = 30; // 擊退持續時間
            
            // 計算擊退方向（從攻擊者指向被攻擊者）
            const dx = this.x - fromX;
            const dy = this.y - fromY;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            if (length > 0) {
                this.knockbackDirection = {
                    x: dx / length,
                    y: dy / length
                };
            }
        }
    }

    push(target) {
        // 計算兩個方塊中心點的距離
        const centerX1 = this.x + this.width / 2;
        const centerY1 = this.y + this.height / 2;
        const centerX2 = target.x + target.width / 2;
        const centerY2 = target.y + target.height / 2;
        
        const dx = centerX2 - centerX1;
        const dy = centerY2 - centerY1;
        const distance = Math.sqrt(dx * dx + dy * dy);

        console.log('攻擊距離:', distance, '攻擊範圍:', this.attackRange);

        // 檢查是否在攻擊範圍內
        if (distance > this.attackRange) {
            console.log('目標太遠，無法攻擊');
            return;
        }

        if (this.pushCooldown === 0) {
            console.log('開始攻擊！');
            this.isPushing = true;
            this.pushCooldown = 30;
            
            // 計算推擠方向
            const length = Math.sqrt(dx * dx + dy * dy);
            
            if (length > 0) {
                // 施加推力並造成擊退效果
                target.takeKnockback(this.x, this.y);
                target.health -= 5;
                console.log('攻擊成功！造成5點傷害');
            }
            
            setTimeout(() => {
                this.isPushing = false;
            }, 500);
        } else {
            console.log('攻擊冷卻中，還剩:', this.pushCooldown, '幀');
        }
    }
}

class AIPlayer extends Player {
    constructor(x, y, color) {
        super(x, y, color, true);
        this.directionChangeTimer = 0;
        this.directionChangeInterval = 30;
        this.avoidTimer = 0;
        this.avoidDuration = 0;
        this.lastAction = null;
        this.targetDirection = { x: 0, y: 0 };
        this.currentDirection = { x: 0, y: 0 };
        this.smoothFactor = 0.2;
        this.aggressiveness = 0.9;
        this.attackRange = 150;
        this.pushRange = 50;
        this.nextAction = null;
        this.isThinking = false;
        this.randomActionTimer = 0;
        this.randomActionInterval = 15;
        this.lastRandomAction = null;
        
        // 檢查API密鑰
        if (!window.GEMINI_API_KEY) {
            console.warn('警告：未設置Gemini API密鑰，AI將使用備用邏輯');
            this.useFallbackLogic = true;
        } else {
            this.useFallbackLogic = false;
        }
    }

    getRandomAction() {
        const actions = ['attack', 'move', 'push'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        // 生成隨機方向
        const angle = Math.random() * Math.PI * 2;
        const direction = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };

        return {
            action: randomAction,
            direction: direction,
            reason: "隨機行動"
        };
    }

    async update(arena, targetPlayer) {
        super.update();
        this.directionChangeTimer++;
        this.randomActionTimer++;

        // 定期執行隨機行動
        if (this.randomActionTimer >= this.randomActionInterval) {
            this.randomActionTimer = 0;
            this.lastRandomAction = this.getRandomAction();
            console.log('AI隨機行動:', this.lastRandomAction);
        }

        // 如果正在思考，使用上次的決策或隨機行動
        if (this.isThinking) {
            if (this.nextAction) {
                this.executeAction(this.nextAction, targetPlayer, arena);
            } else if (this.lastRandomAction) {
                this.executeAction(this.lastRandomAction, targetPlayer, arena);
            }
            return;
        }

        // 如果到了決策時間
        if (this.directionChangeTimer >= this.directionChangeInterval) {
            this.directionChangeTimer = 0;
            this.isThinking = true;

            // 在後台進行決策
            this.getAIAction({
                player: targetPlayer,
                arena: arena
            }).then(action => {
                console.log('AI決策:', action);
                this.nextAction = action;
                this.isThinking = false;
            }).catch(error => {
                console.warn('AI決策錯誤:', error);
                this.nextAction = this.getFallbackAction({
                    player: targetPlayer,
                    arena: arena
                });
                this.isThinking = false;
            });
        }

        // 執行當前決策或隨機行動
        if (this.nextAction) {
            this.executeAction(this.nextAction, targetPlayer, arena);
        } else if (this.lastRandomAction) {
            this.executeAction(this.lastRandomAction, targetPlayer, arena);
        }
    }

    executeAction(action, targetPlayer, arena) {
        console.log('執行AI行動:', action);
        
        // 計算與目標的距離
        const dx = targetPlayer.x - this.x;
        const dy = targetPlayer.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        switch (action.action) {
            case "attack":
                this.targetDirection = action.direction;
                // 只有在推擠範圍內才進行推擠
                if (distance < this.pushRange && Math.random() < 0.4 && this.pushCooldown === 0) {
                    console.log('AI進行推擠');
                    this.push(targetPlayer);
                }
                break;
            case "defend":
                this.targetDirection = action.direction;
                this.avoidTimer = 30;
                break;
            case "push":
                // 只有在推擠範圍內才進行推擠
                if (distance < this.pushRange && this.pushCooldown === 0) {
                    console.log('AI進行推擠');
                    this.push(targetPlayer);
                }
                break;
            case "move":
                this.targetDirection = action.direction;
                break;
        }

        // 平滑過渡到目標方向
        this.currentDirection.x += (this.targetDirection.x - this.currentDirection.x) * this.smoothFactor;
        this.currentDirection.y += (this.targetDirection.y - this.currentDirection.y) * this.smoothFactor;
        
        // 更新移動方向
        this.nextDirection = { ...this.currentDirection };
        
        this.move(arena);
    }

    async getAIAction(gameState) {
        // 如果沒有API密鑰，直接使用備用邏輯
        if (this.useFallbackLogic) {
            return this.getFallbackAction(gameState);
        }

        try {
            const prompt = {
                contents: [{
                    parts: [{
                        text: `你是一個相撲遊戲的AI對手。你的目標是積極進攻，將對手擊退。
                        
                        遊戲規則：
                        1. 你可以使用推擠（push）來攻擊對手
                        2. 推擠會造成傷害並將對手推開
                        3. 生命值低時要更謹慎
                        
                        當前遊戲狀態：
                        你的位置: (${this.x}, ${this.y})
                        你的生命值: ${this.health}
                        對手位置: (${gameState.player.x}, ${gameState.player.y})
                        對手生命值: ${gameState.player.health}
                        
                        重要提示：
                        1. 保持積極進攻的態度，主動接近對手
                        2. 不要待在角落，要主動出擊
                        3. 當生命值低於20%時才考慮防守
                        4. 在接近對手時優先使用推擠
                        5. 不要過度防守，要持續進攻
                        
                        請以JSON格式回傳你的行動決策，格式如下：
                        {
                            "action": "attack" | "defend" | "move" | "push",
                            "direction": {
                                "x": -1 | 0 | 1,
                                "y": -1 | 0 | 1
                            },
                            "reason": "你的決策理由"
                        }`
                    }]
                }]
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${window.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(prompt)
            });

            if (!response.ok) {
                throw new Error(`API請求失敗: ${response.status}`);
            }

            const data = await response.json();
            const responseText = data.candidates[0].content.parts[0].text;
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            
            if (!jsonMatch) {
                throw new Error('無法從回應中提取JSON');
            }

            const action = JSON.parse(jsonMatch[0]);
            
            // 根據攻擊性參數調整決策
            if (action.action === "defend" && Math.random() < this.aggressiveness) {
                action.action = "attack";
                action.reason = "轉守為攻";
            }
            
            return action;
        } catch (error) {
            console.warn('使用Gemini API時發生錯誤，切換到備用邏輯:', error);
            this.useFallbackLogic = true;
            return this.getFallbackAction(gameState);
        }
    }

    getFallbackAction(gameState) {
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        console.log('AI距離:', distance, '攻擊範圍:', this.attackRange, '推擠範圍:', this.pushRange);

        // 更積極的進攻邏輯
        if (this.health <= 20 && distance < 60) {
            // 只有生命值很低且距離很近時才防守
            return {
                action: "defend",
                direction: {
                    x: -Math.sign(dx),
                    y: -Math.sign(dy)
                },
                reason: "生命值低，暫時防守"
            };
        }

        // 在攻擊範圍內時接近
        if (distance < this.attackRange) {
            // 隨機決定是否直接攻擊或推擠
            if (Math.random() < 0.7) { // 70% 的機率直接攻擊
                return {
                    action: "attack",
                    direction: {
                        x: Math.sign(dx),
                        y: Math.sign(dy)
                    },
                    reason: "接近目標"
                };
            } else {
                return {
                    action: "push",
                    direction: {
                        x: Math.sign(dx),
                        y: Math.sign(dy)
                    },
                    reason: "直接推擠"
                };
            }
        }

        // 預判對手的移動方向
        if (gameState.player.direction) {
            const predictedX = gameState.player.x + gameState.player.direction.x * 50;
            const predictedY = gameState.player.y + gameState.player.direction.y * 50;
            const predictedDx = predictedX - this.x;
            const predictedDy = predictedY - this.y;
            
            return {
                action: "attack",
                direction: {
                    x: Math.sign(predictedDx),
                    y: Math.sign(predictedDy)
                },
                reason: "預判對手移動方向"
            };
        }

        // 隨機移動時保持當前方向一段時間
        if (Math.random() < 0.3) { // 增加隨機移動的機率
            return {
                action: "move",
                direction: {
                    x: Math.random() * 2 - 1,
                    y: Math.random() * 2 - 1
                },
                reason: "尋找目標"
            };
        }

        return {
            action: "attack", // 默認使用攻擊
            direction: {
                x: Math.sign(dx),
                y: Math.sign(dy)
            },
            reason: "持續進攻"
        };
    }
}

class Arena {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
        this.radius = Math.min(width, height) / 2 - 50;
    }

    isOutOfBounds(x, y, width, height) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const distance = Math.sqrt(
            Math.pow(centerX - this.centerX, 2) + 
            Math.pow(centerY - this.centerY, 2)
        );
        return distance > this.radius;
    }

    draw(ctx) {
        // 繪製競技場
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;

        // 創建競技場
        this.arena = new Arena(this.canvas.width, this.canvas.height);

        // 遊戲狀態
        this.gameOver = false;
        this.winner = null;
        this.countdown = 3;
        this.gameStarted = false;

        // 創建玩家
        this.player = new Player(
            this.canvas.width / 4,
            this.canvas.height / 2,
            '#00ff00'
        );

        // 創建AI玩家
        this.aiPlayers = [
            new AIPlayer(
                this.canvas.width * 3 / 4,
                this.canvas.height / 2,
                '#ff0000'
            )
        ];

        // 設置鍵盤控制
        this.keys = {};
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        if (this.gameOver || !this.gameStarted) return;

        this.keys[e.key] = true;
        
        // 更新玩家方向
        if (e.key === 'ArrowLeft') this.player.nextDirection.x = -1;
        if (e.key === 'ArrowRight') this.player.nextDirection.x = 1;
        if (e.key === 'ArrowUp') this.player.nextDirection.y = -1;
        if (e.key === 'ArrowDown') this.player.nextDirection.y = 1;
        
        // 推擠功能
        if (e.key === 'z' || e.key === 'Z') {
            console.log('Z鍵按下，嘗試攻擊');
            if (this.player.pushCooldown === 0) {
                console.log('冷卻時間已到，可以攻擊');
                this.player.push(this.aiPlayers[0]);
            } else {
                console.log('冷卻時間未到，無法攻擊');
            }
        }
    }

    handleKeyUp(e) {
        if (this.gameOver || !this.gameStarted) return;

        this.keys[e.key] = false;
        
        // 當放開方向鍵時，檢查對應的反方向鍵是否還按著
        if (e.key === 'ArrowLeft' && !this.keys['ArrowRight']) this.player.nextDirection.x = 0;
        if (e.key === 'ArrowRight' && !this.keys['ArrowLeft']) this.player.nextDirection.x = 0;
        if (e.key === 'ArrowUp' && !this.keys['ArrowDown']) this.player.nextDirection.y = 0;
        if (e.key === 'ArrowDown' && !this.keys['ArrowUp']) this.player.nextDirection.y = 0;
    }

    checkGameOver() {
        // 檢查玩家生命值
        if (this.player.health <= 0) {
            this.gameOver = true;
            this.winner = 'AI';
            return;
        }

        // 檢查AI生命值
        for (const aiPlayer of this.aiPlayers) {
            if (aiPlayer.health <= 0) {
                this.gameOver = true;
                this.winner = 'Player';
                return;
            }
        }
    }

    async update() {
        if (this.gameOver || !this.gameStarted) return;

        // 更新玩家
        this.player.update();
        this.player.move(this.arena);

        // 更新AI玩家
        for (const aiPlayer of this.aiPlayers) {
            await aiPlayer.update(this.arena, this.player);
        }

        this.checkGameOver();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.gameStarted) {
            // 繪製倒數計時
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.countdown.toString(), this.canvas.width / 2, this.canvas.height / 2);
            return;
        }

        // 繪製競技場
        this.arena.draw(this.ctx);

        // 繪製玩家
        this.player.draw(this.ctx);

        // 繪製AI玩家
        for (const aiPlayer of this.aiPlayers) {
            aiPlayer.draw(this.ctx);
        }

        // 繪製生命值
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`玩家生命值: ${this.player.health}`, 10, 30);
        this.ctx.fillText(`AI生命值: ${this.aiPlayers[0].health}`, 10, 60);

        if (this.gameOver) {
            const gameOverDiv = document.getElementById('gameOver');
            const gameResult = document.getElementById('gameResult');
            gameOverDiv.classList.remove('hidden');
            gameResult.textContent = this.winner === 'Player' ? '你贏了！' : '遊戲結束！';
        }
    }
}

// 遊戲初始化
const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

async function gameLoop() {
    await game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}

function startCountdown() {
    const countdownInterval = setInterval(() => {
        game.countdown--;
        if (game.countdown <= 0) {
            clearInterval(countdownInterval);
            game.gameStarted = true;
        }
    }, 1000);
}

function restartGame() {
    const gameOverDiv = document.getElementById('gameOver');
    gameOverDiv.classList.add('hidden');
    
    // 重新初始化遊戲
    const newGame = new Game(canvas);
    Object.assign(game, newGame);
    startCountdown();
}

// 開始倒數計時
startCountdown();

// 開始遊戲循環
gameLoop(); 
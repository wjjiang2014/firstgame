/**
 * 贪吃蛇游戏 - Snake Game
 * 参考 GitHub 最佳实践开发
 * 参考项目: patorjk/JavaScript-Snake, epidemian/snake
 */

class SnakeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏配置
        this.gridSize = 20;  // 格子大小
        this.tileCount = this.canvas.width / this.gridSize;  // 格子数量
        
        // 游戏状态
        this.snake = [];
        this.food = { x: 15, y: 15 };
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoop = null;
        this.speed = 120;  // 速度（毫秒）
        
        // 颜色配置
        this.colors = {
            background: '#0f0f23',
            snakeHead: '#00ff88',
            snakeBody: '#00cc6a',
            snakeBodyDark: '#009950',
            food: '#ff6b6b',
            foodGlow: '#ff8787',
            grid: '#1a1a2e',
            text: '#ffffff'
        };
        
        // 初始化
        this.init();
        this.bindEvents();
        this.draw();
    }
    
    init() {
        // 初始化蛇的位置（中间）
        const mid = Math.floor(this.tileCount / 2);
        this.snake = [
            { x: mid, y: mid },
            { x: mid, y: mid + 1 },
            { x: mid, y: mid + 2 }
        ];
        this.direction = { x: 0, y: -1 };  // 向上
        this.nextDirection = { x: 0, y: -1 };
        this.score = 0;
        this.placeFood();
        this.updateUI();
    }
    
    bindEvents() {
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.toggleGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
    }
    
    handleKeyPress(e) {
        const key = e.key;
        
        // 防止方向键和空格滚动页面
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
            e.preventDefault();
        }
        
        // 暂停
        if (key === ' ' && this.gameRunning) {
            this.togglePause();
            return;
        }
        
        // 重新开始
        if (key === 'r' || key === 'R') {
            this.restart();
            return;
        }
        
        // 方向控制
        if (!this.gameRunning || this.gamePaused) return;
        
        const currentDir = this.direction;
        let newDir = null;
        
        switch (key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (currentDir.y !== 1) {
                    newDir = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (currentDir.y !== -1) {
                    newDir = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (currentDir.x !== 1) {
                    newDir = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (currentDir.x !== -1) {
                    newDir = { x: 1, y: 0 };
                }
                break;
        }
        
        if (newDir) {
            this.nextDirection = newDir;
        }
    }
    
    toggleGame() {
        if (this.gameRunning) {
            this.togglePause();
        } else {
            this.start();
        }
    }
    
    start() {
        if (!this.gameRunning) {
            this.init();
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameLoop = setInterval(() => this.update(), this.speed);
            document.getElementById('startBtn').textContent = '暂停';
        }
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('startBtn').textContent = this.gamePaused ? '继续' : '暂停';
    }
    
    restart() {
        this.stop();
        this.init();
        this.draw();
    }
    
    stop() {
        this.gameRunning = false;
        this.gamePaused = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        document.getElementById('startBtn').textContent = '开始游戏';
    }
    
    update() {
        if (this.gamePaused) return;
        
        // 更新方向
        this.direction = { ...this.nextDirection };
        
        // 计算新头部位置
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // 检查碰撞（墙壁）
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // 检查碰撞（自己）
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        // 添加新头部
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            
            // 每50分加速
            if (this.score % 50 === 0 && this.speed > 50) {
                this.speed -= 5;
                this.stop();
                this.start();
            }
            
            this.placeFood();
            this.updateUI();
        } else {
            // 移除尾部
            this.snake.pop();
        }
        
        this.draw();
    }
    
    placeFood() {
        // 随机放置食物，确保不在蛇身上
        let valid = false;
        while (!valid) {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            
            valid = true;
            for (let segment of this.snake) {
                if (this.food.x === segment.x && this.food.y === segment.y) {
                    valid = false;
                    break;
                }
            }
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格（可选，增加视觉效果）
        this.drawGrid();
        
        // 绘制食物
        this.drawFood();
        
        // 绘制蛇
        this.drawSnake();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.tileCount; i++) {
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        const size = this.gridSize;
        
        // 食物发光效果
        this.ctx.shadowColor = this.colors.foodGlow;
        this.ctx.shadowBlur = 15;
        
        // 绘制圆形食物
        this.ctx.fillStyle = this.colors.food;
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 重置阴影
        this.ctx.shadowBlur = 0;
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const size = this.gridSize;
            
            // 头部颜色不同
            if (index === 0) {
                this.ctx.fillStyle = this.colors.snakeHead;
                // 头部发光
                this.ctx.shadowColor = this.colors.snakeHead;
                this.ctx.shadowBlur = 10;
            } else {
                // 身体颜色交替
                this.ctx.fillStyle = index % 2 === 0 ? 
                    this.colors.snakeBody : this.colors.snakeBodyDark;
                this.ctx.shadowBlur = 0;
            }
            
            // 绘制圆角矩形
            this.roundRect(x + 1, y + 1, size - 2, size - 2, 4);
            this.ctx.fill();
            
            // 重置阴影
            this.ctx.shadowBlur = 0;
            
            // 眼睛（只在头部）
            if (index === 0) {
                this.drawEyes(x, y);
            }
        });
    }
    
    drawEyes(x, y) {
        const size = this.gridSize;
        const eyeSize = 4;
        const eyeOffset = 5;
        
        this.ctx.fillStyle = '#000';
        
        // 根据方向绘制眼睛
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        if (this.direction.x === 1) {  // 向右
            leftEyeX = x + size - eyeOffset - eyeSize;
            leftEyeY = y + eyeOffset;
            rightEyeX = x + size - eyeOffset - eyeSize;
            rightEyeY = y + size - eyeOffset - eyeSize;
        } else if (this.direction.x === -1) {  // 向左
            leftEyeX = x + eyeOffset;
            leftEyeY = y + eyeOffset;
            rightEyeX = x + eyeOffset;
            rightEyeY = y + size - eyeOffset - eyeSize;
        } else if (this.direction.y === -1) {  // 向上
            leftEyeX = x + eyeOffset;
            leftEyeY = y + eyeOffset;
            rightEyeX = x + size - eyeOffset - eyeSize;
            rightEyeY = y + eyeOffset;
        } else {  // 向下
            leftEyeX = x + eyeOffset;
            leftEyeY = y + size - eyeOffset - eyeSize;
            rightEyeX = x + size - eyeOffset - eyeSize;
            rightEyeY = y + size - eyeOffset - eyeSize;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(leftEyeX + eyeSize/2, leftEyeY + eyeSize/2, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(rightEyeX + eyeSize/2, rightEyeY + eyeSize/2, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
    }
    
    gameOver() {
        this.stop();
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        
        // 显示游戏结束界面
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverHighScore').textContent = this.highScore;
        document.getElementById('gameOver').style.display = 'block';
    }
}

// 启动游戏
window.onload = () => {
    const game = new SnakeGame('gameCanvas');
    
    // 暴露给全局，方便调试
    window.snakeGame = game;
};

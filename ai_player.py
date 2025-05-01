import random
from player import Player

class AIPlayer(Player):
    def __init__(self, x, y, color):
        super().__init__(x, y, color, is_ai=True)
        self.direction_change_timer = 0
        self.direction_change_interval = 60  # 每60幀改變一次方向
    
    def update(self, target_player, screen_width, screen_height):
        # 更新計時器
        self.direction_change_timer += 1
        
        # 定期改變方向
        if self.direction_change_timer >= self.direction_change_interval:
            self.direction_change_timer = 0
            
            # 簡單的AI邏輯：有50%的機率朝目標移動，50%的機率隨機移動
            if random.random() < 0.5:
                # 朝目標移動
                dx = target_player.x - self.x
                dy = target_player.y - self.y
                
                # 標準化方向
                length = (dx**2 + dy**2)**0.5
                if length > 0:
                    self.direction[0] = dx / length
                    self.direction[1] = dy / length
            else:
                # 隨機移動
                self.direction[0] = random.uniform(-1, 1)
                self.direction[1] = random.uniform(-1, 1)
        
        # 移動AI玩家
        self.move(screen_width, screen_height) 
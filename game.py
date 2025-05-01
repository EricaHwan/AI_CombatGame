import pygame
from player import Player
from ai_player import AIPlayer

class Game:
    def __init__(self, screen_width, screen_height):
        self.screen_width = screen_width
        self.screen_height = screen_height
        
        # 創建玩家
        self.player = Player(screen_width // 4, screen_height // 2, (0, 255, 0))
        
        # 創建AI玩家
        self.ai_players = [
            AIPlayer(screen_width * 3 // 4, screen_height // 2, (255, 0, 0)),
            AIPlayer(screen_width // 2, screen_height // 4, (0, 0, 255))
        ]
        
        # 遊戲狀態
        self.game_over = False
        self.winner = None
    
    def handle_keydown(self, key):
        if self.game_over:
            return
            
        if key == pygame.K_LEFT:
            self.player.direction[0] = -1
        elif key == pygame.K_RIGHT:
            self.player.direction[0] = 1
        elif key == pygame.K_UP:
            self.player.direction[1] = -1
        elif key == pygame.K_DOWN:
            self.player.direction[1] = 1
    
    def handle_keyup(self, key):
        if self.game_over:
            return
            
        if key == pygame.K_LEFT and self.player.direction[0] == -1:
            self.player.direction[0] = 0
        elif key == pygame.K_RIGHT and self.player.direction[0] == 1:
            self.player.direction[0] = 0
        elif key == pygame.K_UP and self.player.direction[1] == -1:
            self.player.direction[1] = 0
        elif key == pygame.K_DOWN and self.player.direction[1] == 1:
            self.player.direction[1] = 0
    
    def check_collisions(self):
        # 檢查玩家與AI玩家的碰撞
        for ai_player in self.ai_players:
            if self.player.get_rect().colliderect(ai_player.get_rect()):
                if self.player.take_damage(1):
                    self.game_over = True
                    self.winner = "AI"
                if ai_player.take_damage(1):
                    self.ai_players.remove(ai_player)
                    if not self.ai_players:
                        self.game_over = True
                        self.winner = "Player"
    
    def update(self):
        if self.game_over:
            return
            
        # 更新玩家位置
        self.player.move(self.screen_width, self.screen_height)
        
        # 更新AI玩家
        for ai_player in self.ai_players:
            ai_player.update(self.player, self.screen_width, self.screen_height)
        
        # 檢查碰撞
        self.check_collisions()
    
    def draw(self, screen):
        # 繪製玩家
        self.player.draw(screen)
        
        # 繪製AI玩家
        for ai_player in self.ai_players:
            ai_player.draw(screen)
        
        # 如果遊戲結束，顯示結果
        if self.game_over:
            font = pygame.font.Font(None, 74)
            if self.winner == "Player":
                text = font.render("You Win!", True, (0, 255, 0))
            else:
                text = font.render("Game Over!", True, (255, 0, 0))
            text_rect = text.get_rect(center=(self.screen_width/2, self.screen_height/2))
            screen.blit(text, text_rect) 
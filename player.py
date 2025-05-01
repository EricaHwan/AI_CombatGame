import pygame

class Player:
    def __init__(self, x, y, color, is_ai=False):
        self.x = x
        self.y = y
        self.width = 30
        self.height = 30
        self.speed = 5
        self.color = color
        self.is_ai = is_ai
        self.direction = [0, 0]  # [x, y]
        self.health = 100
        
    def move(self, screen_width, screen_height):
        # 更新位置
        self.x += self.direction[0] * self.speed
        self.y += self.direction[1] * self.speed
        
        # 邊界檢查
        self.x = max(0, min(self.x, screen_width - self.width))
        self.y = max(0, min(self.y, screen_height - self.height))
    
    def draw(self, screen):
        pygame.draw.rect(screen, self.color, (self.x, self.y, self.width, self.height))
        
        # 繪製生命值條
        health_width = self.width * (self.health / 100)
        pygame.draw.rect(screen, (255, 0, 0), (self.x, self.y - 10, self.width, 5))
        pygame.draw.rect(screen, (0, 255, 0), (self.x, self.y - 10, health_width, 5))
    
    def take_damage(self, amount):
        self.health = max(0, self.health - amount)
        return self.health <= 0
    
    def get_rect(self):
        return pygame.Rect(self.x, self.y, self.width, self.height) 
import pygame
import sys
from game import Game

def main():
    # 初始化Pygame
    pygame.init()
    
    # 設置遊戲窗口
    screen_width = 800
    screen_height = 600
    screen = pygame.display.set_mode((screen_width, screen_height))
    pygame.display.set_caption("AI Combat Game")
    
    # 創建遊戲實例
    game = Game(screen_width, screen_height)
    
    # 遊戲主循環
    clock = pygame.time.Clock()
    running = True
    
    while running:
        # 處理事件
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                game.handle_keydown(event.key)
            elif event.type == pygame.KEYUP:
                game.handle_keyup(event.key)
        
        # 更新遊戲狀態
        game.update()
        
        # 繪製遊戲畫面
        screen.fill((0, 0, 0))  # 黑色背景
        game.draw(screen)
        pygame.display.flip()
        
        # 控制遊戲幀率
        clock.tick(60)
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main() 
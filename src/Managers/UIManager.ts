import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import FTUEHand from 'assets/images/FTUEHand.png';
import Arrow from 'assets/images/Arrow.png';
import soundOn from 'assets/images/sound.png';
import soundOff from 'assets/images/soff.png';
import { AudioManager } from './AudioManager';


export class UiManager {

    private app: PIXI.Application;
    private toggleButton: PIXI.Container;
    private musicToggleButton: PIXI.Container;
    private isDayMode: boolean = true;
    private isMusicPlaying: boolean = true;
    private musicIcon: PIXI.Sprite;
    private arrowImage: PIXI.Sprite | null = null;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.addFTUEScreen();
        this.create();
        this.setupFirstClickHandler();
    }

    private setupFirstClickHandler() {
        window.addEventListener('firstFarmClick', ((event: Event) => {
            if (this.arrowImage && this.arrowImage.parent) {
                this.app.stage.removeChild(this.arrowImage);
                this.arrowImage = null;
            }
        }) as EventListener);
    }

    private addFTUEScreen() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';
        document.body.appendChild(overlay);

        const text = document.createElement('div');
        text.textContent = 'Tap to start';
        text.style.color = 'white';
        text.style.fontSize = '32px';
        text.style.fontFamily = 'Arial, sans-serif';
        text.style.marginBottom = '20px';
        text.style.animation = 'pulse 1.5s infinite';
        overlay.appendChild(text);

        const handImage = document.createElement('img');
        handImage.src = FTUEHand;
        handImage.style.width = '100px';
        handImage.style.height = 'auto';
        handImage.style.animation = 'scale 1.5s infinite';
        overlay.appendChild(handImage);

      
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            @keyframes scale {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            @keyframes bounce {
                0% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
                100% { transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);

        overlay.addEventListener('click', () => {
            
            document.body.removeChild(overlay);
            document.head.removeChild(style);
            this.addArrow();
             
        });
    }

    private toggleMusic() {
        this.isMusicPlaying = !this.isMusicPlaying;
        
        const duration = 0.5;
        
        gsap.to(this.musicIcon, {
            alpha: 0,
            duration: duration / 2,
            onComplete: () => {
                this.musicIcon.texture = PIXI.Texture.from(this.isMusicPlaying ? soundOn : soundOff);
                gsap.to(this.musicIcon, {
                    alpha: 1,
                    duration: duration / 2
                });
            }
        });
        
        if (this.isMusicPlaying) {
            AudioManager.getInstance().playBgMusic();
        } else {
            AudioManager.getInstance().stopBgMusic();
        }
    }

    private addArrow() {
        const arrowTexture = PIXI.Texture.from(Arrow);
        this.arrowImage = new PIXI.Sprite(arrowTexture);
        this.arrowImage.anchor.set(0.5);
        this.arrowImage.x = window.innerWidth * 0.9;
        this.arrowImage.y = window.innerHeight * .35;
        this.arrowImage.width = 60;
        this.arrowImage.rotation = -(Math.PI / 2);
        this.arrowImage.scale.set(0.6);
        this.arrowImage.height = this.arrowImage.width * (arrowTexture.height / arrowTexture.width);
        this.app.stage.addChild(this.arrowImage);

        gsap.to(this.arrowImage.scale, {
            x: 0.3,
            y: 0.3,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });

        AudioManager.getInstance().playBgMusic();
    }


    public create() {
        this.toggleButton = new PIXI.Container();
        
        const bgCircle = new PIXI.Graphics();
        bgCircle.beginFill(0xFFFFFF);
        bgCircle.drawCircle(15, 15, 20); 
        bgCircle.endFill();
        
        const icon = new PIXI.Graphics();
        icon.beginFill(0xFFD700); 
        icon.drawCircle(15, 15, 10);
        icon.endFill();

        this.toggleButton.addChild(bgCircle);
        this.toggleButton.addChild(icon);
        
        this.toggleButton.position.set(
            this.app.screen.width - 80,
            20
        );
        
        this.toggleButton.interactive = true;
        this.toggleButton.buttonMode = true;
        
        this.toggleButton.on('pointerdown', () => this.toggleDayNight());
        this.app.stage.addChild(this.toggleButton);

        this.musicToggleButton = new PIXI.Container();
        
        const musicBgCircle = new PIXI.Graphics();
        musicBgCircle.beginFill(0xFFFFFF);
        musicBgCircle.drawCircle(15, 15, 20);
        musicBgCircle.endFill();
        
        this.musicIcon = new PIXI.Sprite(PIXI.Texture.from(soundOn));
        this.musicIcon.anchor.set(0.5);
        this.musicIcon.width = 30;
        this.musicIcon.height = 30;
        this.musicIcon.position.set(15, 15);
        
        this.musicToggleButton.addChild(musicBgCircle);
        this.musicToggleButton.addChild(this.musicIcon);
        
        this.musicToggleButton.position.set(
            this.app.screen.width - 140,
            20
        );
        
        this.musicToggleButton.interactive = true;
        this.musicToggleButton.buttonMode = true;
        
        this.musicToggleButton.on('pointerdown', () => this.toggleMusic());
        
        this.app.stage.addChild(this.musicToggleButton);
    }

    private toggleDayNight() {
        this.isDayMode = !this.isDayMode;
        
        const icon = this.toggleButton.children[1] as PIXI.Graphics;
        const duration = 0.5;
        
        const from = { t: 0 };
        const to = { t: 1 };
        const isDay = this.isDayMode;
        
        const drawIcon = (progress: number) => {
            icon.clear();
            if (isDay) {
                
                const sunAlpha = progress;
                const moonAlpha = 1 - progress;
                icon.beginFill(0xFFD700, sunAlpha);
                icon.drawCircle(15, 15, 10);
                icon.endFill();
                if (moonAlpha > 0) {
                    icon.beginFill(0xE6E6FA, moonAlpha);
                    icon.drawCircle(15, 15, 10);
                    icon.endFill();
                    icon.beginFill(0xFFFFFF, moonAlpha);
                    icon.drawCircle(20, 10, 8);
                    icon.endFill();
                }
            } else {
                // Animate sun to moon
                const sunAlpha = 1 - progress;
                const moonAlpha = progress;
                if (sunAlpha > 0) {
                    icon.beginFill(0xFFD700, sunAlpha);
                    icon.drawCircle(15, 15, 10);
                    icon.endFill();
                }
                icon.beginFill(0xE6E6FA, moonAlpha);
                icon.drawCircle(15, 15, 10);
                icon.endFill();
                icon.beginFill(0xFFFFFF, moonAlpha);
                icon.drawCircle(20, 10, 8);
                icon.endFill();
            }
        };
        
        gsap.to(from, {
            t: 1,
            duration,
            onUpdate: () => drawIcon(from.t),
            onComplete: () => drawIcon(1)
        });
        
        const event = new CustomEvent('dayNightToggle', {
            detail: { isDayMode: this.isDayMode }
        });
        window.dispatchEvent(event);
    }

    public update() {
        this.toggleButton.position.set(
            this.app.screen.width - 80,
            20
        );
        this.musicToggleButton.position.set(
            this.app.screen.width - 140,
            20
        );
    }

}
import * as PIXI from 'pixi.js';
import corn from 'assets/images/corn.png';
import grape from 'assets/images/grape.png';
import tomato from 'assets/images/tomato.png';
import rounded from 'assets/images/rounded.png';
import cow from 'assets/images/cow.png';
import sheep from 'assets/images/sheep.png';
import chicken from 'assets/images/chicken.png';
import treefarm from 'assets/images/treefarm.png';
import animalFarm from 'assets/images/animalfarm.png';
import waterDrop from 'assets/images/water.png';

export class FarmingIcons {

    private app: PIXI.Application;
    private images: PIXI.Sprite[] = [];
    private xOffset: number = 0.25;
    private clickCounts: { [key: string]: number } = {
        'corn': 0,
        'grape': 0,
        'tomato': 0,
        'cow': 0,
        'sheep': 0,
        'chicken': 0
    };
    private maxClicks: { [key: string]: number } = {
        'corn': 8,
        'grape': 8,
        'tomato': 8,
        'cow': 1,
        'sheep': 5,
        'chicken': 4
    };

    private waterDropOffsets: { [key: string]: { x: number; y: number } } = {
        corn: { x: -70, y: -200 },
        grape: { x: 0, y: -50 },
        tomato: { x: 0, y: -40 }
    };
    private animalTextures: { [key: string]: PIXI.Texture } = {};
    private plantTextures: { [key: string]: PIXI.Texture } = {};
    private containers: PIXI.Container[] = [];
    private isDayMode: boolean = true;
    private treeFarmOptions: PIXI.Container[] = [];
    private animalFarmOptions: PIXI.Container[] = [];
    private treeFarmButton: PIXI.Container | null = null;
    private animalFarmButton: PIXI.Container | null = null;
    private baseSize: number = 80;  
    private baseImageSize: number = 50; 
    private waterDropButtons: { [key: string]: PIXI.Container } = {};
    private loadingCircles: { [key: string]: PIXI.Graphics } = {};
    private loadingProgresses: { [key: string]: number } = {};
    private loadingIntervals: { [key: string]: number | null } = {};
    private readonly LOADING_DURATION: number = 10000; 

    constructor(app: PIXI.Application) {
        console.log("Initializing ClickableImages");
        this.app = app;
        this.init();
        this.setupResizeHandler();
    }

    private setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.updatePositionsAndSizes();
        });
    }

    private updatePositionsAndSizes() {
        const isMobile = window.innerWidth <= 768;
        const scale = isMobile ? 0.1 : 1; 
        const buttonSize = this.baseSize * scale;
        const imageSize = this.baseImageSize * scale;
        const spacing = isMobile ? 40 : 100; 

        if (this.treeFarmButton) {
            this.treeFarmButton.position.set(
                window.innerWidth * 0.95,
                window.innerHeight * 0.35
            );
            this.updateContainerSize(this.treeFarmButton, buttonSize, imageSize);
        }

        if (this.animalFarmButton) {
            this.animalFarmButton.position.set(
                window.innerWidth * 0.95,
                window.innerHeight * 0.55
            );
            this.updateContainerSize(this.animalFarmButton, buttonSize, imageSize);
        }
        const baseX = window.innerWidth * 0.9; 
const baseYTree = window.innerHeight * 0.3; 
const baseYAnimal = window.innerHeight * 0.3; 
const verticalSpacing = isMobile ? 50 : 100; 

this.treeFarmOptions.forEach((container, index) => {
    container.position.set(
        baseX,
        baseYTree + index * verticalSpacing
    );
    this.updateContainerSize(container, buttonSize, imageSize);
});

this.animalFarmOptions.forEach((container, index) => {
    container.position.set(
        baseX,
        baseYAnimal + index * verticalSpacing
    );
    this.updateContainerSize(container, buttonSize, imageSize);
});


        Object.entries(this.waterDropButtons).forEach(([type, container]) => {
            const idx = type === 'corn' ? 0 : type === 'grape' ? 1 : 2;
            const cropContainer = this.treeFarmOptions[idx];
            const baseOffset = this.waterDropOffsets[type] || { x: 0, y: -100 };
            
            if (cropContainer) {
                const scaledOffset = {
                    x: baseOffset.x * scale,
                    y: baseOffset.y * scale
                };
                var y;
                if (type === 'corn') {
                    y = window.innerHeight * 0.35;
                } else if (type === 'grape') {
                    y = window.innerHeight * 0.45;
                } else if (type === 'tomato') {
                    y = window.innerHeight * 0.65;
                }
                
                container.position.set(
                    window.innerWidth * 0.33,
                    y
                );
                
                const background = container.children[0] as PIXI.Graphics;
                if (background) {
                    background.clear();
                    background.beginFill(0xFFFFFF);
                    background.drawCircle(0, 0, (this.baseSize / 3) * scale);
                    background.endFill();
                    background.alpha = 0.5;
                }
                
                const waterDrop = container.children[1] as PIXI.Sprite;
                if (waterDrop) {
                    waterDrop.width = imageSize * 0.8;
                    waterDrop.height = imageSize * 0.8;
                }
            }
        });
    }

    private updateContainerSize(container: PIXI.Container, buttonSize: number, imageSize: number) {
        const background = container.children[0] as PIXI.Sprite;
        const image = container.children[1] as PIXI.Sprite;

        background.width = buttonSize;
        background.height = buttonSize;
        image.width = imageSize;
        image.height = imageSize;
    }

    private async init() {
        console.log("Starting ClickableImages initialization");
        try {
            const [
                cornTexture, grapeTexture, leafTexture, roundedTexture,
                cowTexture, sheepTexture, chickenTexture,
                treeFarmTexture, animalFarmTexture, waterDropTexture
            ] = await Promise.all([
                PIXI.Texture.from(corn),
                PIXI.Texture.from(grape),
                PIXI.Texture.from(tomato),
                PIXI.Texture.from(rounded),
                PIXI.Texture.from(cow),
                PIXI.Texture.from(sheep),
                PIXI.Texture.from(chicken),
                PIXI.Texture.from(treefarm),
                PIXI.Texture.from(animalFarm),
                PIXI.Texture.from(waterDrop)
            ]);
            console.log("Textures loaded successfully",cornTexture);

            this.animalTextures = {
                'cow': cowTexture,
                'sheep': sheepTexture,
                'chicken': chickenTexture
            };

            this.plantTextures = {
                'corn': cornTexture,
                'grape': grapeTexture,
                'tomato': leafTexture
            };

            const treeFarmContainer = this.createContainerWithBackground(roundedTexture, treeFarmTexture, 0, 0);
            const animalFarmContainer = this.createContainerWithBackground(roundedTexture, animalFarmTexture, 0, 0);

            const cornContainer = this.createContainerWithBackground(roundedTexture, cornTexture, 0, 0);
            const grapeContainer = this.createContainerWithBackground(roundedTexture, grapeTexture, 0, 0);
            const tomatoContainer = this.createContainerWithBackground(roundedTexture, leafTexture, 0, 0);

            const cowContainer = this.createContainerWithBackground(roundedTexture, cowTexture, 0, 0);
            const sheepContainer = this.createContainerWithBackground(roundedTexture, sheepTexture, 0, 0);
            const chickenContainer = this.createContainerWithBackground(roundedTexture, chickenTexture, 0, 0);

            this.treeFarmOptions = [cornContainer, grapeContainer, tomatoContainer];
            this.animalFarmOptions = [cowContainer, sheepContainer, chickenContainer];

            this.treeFarmOptions.forEach(container => container.visible = false);
            this.animalFarmOptions.forEach(container => container.visible = false);

            this.app.stage.addChild(treeFarmContainer);
            this.app.stage.addChild(animalFarmContainer);
            this.treeFarmOptions.forEach(container => this.app.stage.addChild(container));
            this.animalFarmOptions.forEach(container => this.app.stage.addChild(container));

            this.setupFarmButton(treeFarmContainer, 'treefarm', this.treeFarmOptions);
            this.setupFarmButton(animalFarmContainer, 'animalfarm', this.animalFarmOptions);

            this.addClickHandler(cornContainer, 'corn');
            this.addClickHandler(grapeContainer, 'grape');
            this.addClickHandler(tomatoContainer, 'tomato');

            this.addClickHandler(cowContainer, 'cow');
            this.addClickHandler(sheepContainer, 'sheep');
            this.addClickHandler(chickenContainer, 'chicken');

            ['corn', 'grape', 'tomato'].forEach((type, idx) => {
                this.createWaterDropButton(roundedTexture, waterDropTexture, type);
            });

            this.updatePositionsAndSizes();

            console.log("ClickableImages initialization complete");
        } catch (error) {
            console.error("Error in ClickableImages initialization:", error);
        }
    }
    
    private createContainerWithBackground(backgroundTexture: PIXI.Texture, imageTexture: PIXI.Texture, x: number, y: number): PIXI.Container {
        const container = new PIXI.Container();
        
        const background = new PIXI.Sprite(backgroundTexture);
        background.anchor.set(0.5);
        background.width = this.baseSize;
        background.height = this.baseSize;
        background.interactive = true;
        
        const imageSprite = new PIXI.Sprite(imageTexture);
        imageSprite.anchor.set(0.5);
        imageSprite.width = this.baseImageSize;
        imageSprite.height = this.baseImageSize;
        imageSprite.alpha = 0.8;
        imageSprite.interactive = true;
        
        container.addChild(background);
        container.addChild(imageSprite);
        container.position.set(x, y);
        
        this.containers.push(container);
        return container;
    }
    
    private setupFarmButton(container: PIXI.Container, type: string, options: PIXI.Container[]) {
        if (type === 'treefarm') {
            this.treeFarmButton = container;
        } else if (type === 'animalfarm') {
            this.animalFarmButton = container;
        }

        container.interactive = true;
        container.buttonMode = true;
        let isOptionsVisible = false;
        let isFirstClick = true;

        const handleInteraction = () => {
            const allExhausted = options.every(opt => {
                const optionType = this.getOptionType(opt);
                return optionType && this.clickCounts[optionType] >= this.maxClicks[optionType];
            });

            if (allExhausted) return;

            if (isFirstClick) {
                const event = new CustomEvent('firstFarmClick', {
                    detail: { type }
                });
                window.dispatchEvent(event);
                isFirstClick = false;
            }

            if (isOptionsVisible) {
                options.forEach(opt => opt.visible = false);
                isOptionsVisible = false;
                return;
            }

            this.treeFarmOptions.forEach(opt => opt.visible = false);
            this.animalFarmOptions.forEach(opt => opt.visible = false);

            options.forEach(opt => {
                const optionType = this.getOptionType(opt);
                if (optionType && this.clickCounts[optionType] < this.maxClicks[optionType]) {
                    opt.visible = true;
                }
            });
            isOptionsVisible = true;
        };

        container.on('click', handleInteraction);
        container.on('touchend', handleInteraction);

        const handleOver = () => {
            const allExhausted = options.every(opt => {
                const optionType = this.getOptionType(opt);
                return optionType && this.clickCounts[optionType] >= this.maxClicks[optionType];
            });

            if (!allExhausted) {
                (container.children[0] as PIXI.Sprite).tint = 0xAAAAAA;
                (container.children[1] as PIXI.Sprite).tint = 0xAAAAAA;
            }
        };

        const handleOut = () => {
            (container.children[0] as PIXI.Sprite).tint = 0xFFFFFF;
            (container.children[1] as PIXI.Sprite).tint = 0xFFFFFF;
        };

        container.on('pointerover', handleOver);
        container.on('pointerout', handleOut);
        container.on('touchstart', handleOver);
        container.on('touchend', handleOut);
    }

    private addClickHandler(container: PIXI.Container, type: string) {
        container.interactive = true;
        container.buttonMode = true;

        const handleInteraction = () => {

            if (this.clickCounts[type] >= this.maxClicks[type]) {
                return;
            }

            this.clickCounts[type]++;
            
            const event = new CustomEvent('imageClicked', {
                detail: { type }
            });
            window.dispatchEvent(event);

            if (this.clickCounts[type] >= this.maxClicks[type]) {
                container.interactive = false;
                container.buttonMode = false;
                container.alpha = 0.5;
            }

            if ((type === 'corn' || type === 'grape' || type === 'tomato') && this.clickCounts[type] === 8) {
                this.showWaterDropButton(type);
            }

            this.checkAndDisableMainChoice(type);
        };

        container.on('click', handleInteraction);
        container.on('touchend', handleInteraction);

        const handleOver = () => {
            if (this.clickCounts[type] < this.maxClicks[type]) {
                (container.children[0] as PIXI.Sprite).tint = 0xAAAAAA;
                (container.children[1] as PIXI.Sprite).tint = 0xAAAAAA;
            }
        };

        const handleOut = () => {
            (container.children[0] as PIXI.Sprite).tint = 0xFFFFFF;
            (container.children[1] as PIXI.Sprite).tint = 0xFFFFFF;
        };

        container.on('pointerover', handleOver);
        container.on('pointerout', handleOut);
        container.on('touchstart', handleOver);
        container.on('touchend', handleOut);
    }

    private checkAndDisableMainChoice(type: string) {
        const isPlant = ['corn', 'grape', 'tomato'].includes(type);
        const mainButton = isPlant ? this.treeFarmButton : this.animalFarmButton;
        const options = isPlant ? this.treeFarmOptions : this.animalFarmOptions;
        
        if (!mainButton) return;

        const allExhausted = options.every(opt => {
            const optionType = this.getOptionType(opt);
            return optionType && this.clickCounts[optionType] >= this.maxClicks[optionType];
        });

        if (allExhausted) {
            mainButton.interactive = false;
            mainButton.buttonMode = false;
            mainButton.alpha = 0.5; 
            
            options.forEach(opt => opt.visible = false);
        }
    }

    private getOptionType(container: PIXI.Container): string | null {
        const sprite = container.children[1] as PIXI.Sprite;
        for (const [type, texture] of Object.entries(this.plantTextures)) {
            if (sprite.texture === texture) return type;
        }
        for (const [type, texture] of Object.entries(this.animalTextures)) {
            if (sprite.texture === texture) return type;
        }
        return null;
    }

    public updateDayNightMode(isDayMode: boolean) {
        this.isDayMode = isDayMode;
        
        this.containers.forEach(container => {
            const background = container.children[0] as PIXI.Sprite;
            const image = container.children[1] as PIXI.Sprite;
            
            if (isDayMode) {
                background.alpha = 1;
                image.alpha = 0.8;
            } else {
                background.alpha = 0.5;
                image.alpha = 0.5;
            }
        });
    }

    private createWaterDropButton(backgroundTexture: PIXI.Texture, waterDropTexture: PIXI.Texture, type: string) {
        const container = new PIXI.Container();
        
        const background = new PIXI.Graphics();
        background.beginFill(0xFFFFFF);
        background.drawCircle(0, 0, this.baseSize / 3);
        background.endFill();
        background.alpha = 0.5;
        
        const waterDrop = new PIXI.Sprite(waterDropTexture);
        waterDrop.anchor.set(0.5);
        waterDrop.width = this.baseImageSize * 0.8;
        waterDrop.height = this.baseImageSize * 0.8;
        
        container.addChild(background);
        container.addChild(waterDrop);
        
        this.waterDropButtons[type] = container;
        this.loadingCircles[type] = background;
        this.loadingProgresses[type] = 0;
        
        const offset = this.waterDropOffsets[type];
        if (offset) {
            const cropContainer = this.treeFarmOptions[type === 'corn' ? 0 : type === 'grape' ? 1 : 2];
            if (cropContainer) {
                container.position.set(
                    cropContainer.position.x + offset.x,
                    cropContainer.position.y + offset.y
                );
            }
        }
        
        container.visible = false;
        
        this.app.stage.addChild(container);
        
        return container;
    }

    private showWaterDropButton(type: string) {
        const container = this.waterDropButtons[type];
        if (container) {
            container.visible = true;
            this.startLoadingAnimation(type);
        }
    }

    private startLoadingAnimation(type: string) {
        const background = this.loadingCircles[type];
        if (!background) return;

        if (this.loadingIntervals[type]) {
            clearInterval(this.loadingIntervals[type]);
        }

        const isMobile = window.innerWidth <= 768;
        const scale = isMobile ? 0.5 : 1;

        this.loadingProgresses[type] = 0;
        background.clear();
        background.beginFill(0xFFFFFF);
        background.drawCircle(0, 0, (this.baseSize / 3) * scale);
        background.endFill();
        background.alpha = 0.5;

        this.loadingIntervals[type] = window.setInterval(() => {
            this.loadingProgresses[type] += 1;
            
            background.clear();
            background.beginFill(0xFFFFFF);
            
            const progress = this.loadingProgresses[type] / 100;
            const radius = (this.baseSize / 5) * scale;
            
            background.moveTo(0, 0);
            background.arc(0, 0, radius, Math.PI, Math.PI * (1 + progress * 2), false);
            background.lineTo(0, 0);
            background.endFill();
            
            if (this.loadingProgresses[type] >= 100) {
                if (this.loadingIntervals[type]) {
                    clearInterval(this.loadingIntervals[type]);
                    this.loadingIntervals[type] = null;
                }

                const container = this.waterDropButtons[type];
                if (container) {
                    this.app.stage.removeChild(container);
                    delete this.waterDropButtons[type];
                    delete this.loadingCircles[type];
                    delete this.loadingProgresses[type];
                }                   
                console.log('wateringComplete', type);

                const event = new CustomEvent('wateringComplete', {
                    detail: { type }
                });
                window.dispatchEvent(event);
            }
        }, this.LOADING_DURATION / 100);
    }

} 




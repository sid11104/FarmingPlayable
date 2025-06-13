import { sdk } from '@smoud/playable-sdk';
import * as PIXI from 'pixi.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import buttonBg from 'assets/button.png';
import groundModel from 'assets/ground.glb';
import objectsModel from 'assets/objects.glb';
import { FarmingIcons } from './FarmingIcons';
import { Corn } from './Farmingobjects/Corn';
import { Grape } from './Farmingobjects/Grape';
import { Tomato } from './Farmingobjects/Tomato';
import { Cow } from './Farmingobjects/Cow';
import { Goat } from './Farmingobjects/Goat';
import { Chicken } from './Farmingobjects/Chicken';
import { UiManager } from './Managers/UIManager';
import { AudioManager } from './Managers/AudioManager';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private uiContainer: HTMLDivElement;
  private mixer?: THREE.AnimationMixer;
  private installButton: HTMLDivElement;
  private animations?: THREE.AnimationClip[];
  private buttonImage: HTMLImageElement;
  private pixiApp !: PIXI.Application;
  private clickableImages !: FarmingIcons;
  private uiManager !: UiManager;
  private groundModel: THREE.Group;
  private objectsModel: THREE.Group;
  private clock: THREE.Clock;
  private ambientLight!: THREE.AmbientLight;
  private directionalLight!: THREE.DirectionalLight;
  public isPaused: boolean = false;
  private pixiCanvas !: HTMLCanvasElement;
  private isDayMode: boolean = true;



  //objects
  private corn !: Corn;
  private grape !: Grape;
  private tomato !: Tomato;
  private cow !: Cow;
  private goat !: Goat;
  private chicken !: Chicken;

  constructor(width: number, height: number) {
    // Create renderer
    // this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // this.renderer.setSize(width, height);
    // this.renderer.setPixelRatio(1.5);
    this.pixiCanvas = document.getElementById('pixi-canvas') as HTMLCanvasElement;
    if (!this.pixiCanvas) {
        console.error("PIXI canvas not found!");
        return;
    }

    this.initializePixi();
    
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(this.renderer.domElement);

    // Create THREE.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x001a2d);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(30, 25, 30);
    this.camera.lookAt(0, 0, 0);

    // Add audio listener to camera
    const audioListener = AudioManager.getInstance().getListener();
    this.camera.add(audioListener);

    // Initialize clock for animations
    this.clock = new THREE.Clock();

    // Create UI container
    this.uiContainer = document.createElement('div');
    this.uiContainer.style.cssText = 'position: absolute; top: 0px; left: 0px; transform-origin: top left;';
    document.body.appendChild(this.uiContainer);

    // Load button image
    this.buttonImage = new Image();
    this.buttonImage.src = buttonBg;
    this.buttonImage.onload = () => {
      const loader = new GLTFLoader();
      loader.load(groundModel, (gltf) => {
        this.groundModel = gltf.scene;
        this.groundModel.position.set(1, 0,0);
        this.groundModel.scale.set(1, 1, 1);
        const box = new THREE.Box3().setFromObject(this.groundModel);
        const center = box.getCenter(new THREE.Vector3());
        this.camera.position.set(center.x, center.y + 40, center.z + 95);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.zoom = 3.1;
        this.camera.updateProjectionMatrix();
        
        // Load objects model
        loader.load(objectsModel, (gltf) => {
          this.objectsModel = gltf.scene;
          // this.objectsModel.position.set(0, 7, 5);
          // this.objectsModel.scale.set(4, 4, 4);
          this.scene.add(this.objectsModel);
        });

        
        this.create();
      });

      loader.load(
        objectsModel,
        (gltf) => {
            const fence = gltf.scene.getObjectByName('fence');
               if (fence) {
                fence.position.set(11, 5, 6);
                fence.scale.set(1.2, 1.2, 1.2);
                this.scene.add(fence);
                console.log('Fence placed successfully');
            }
        })


    };

         this.corn = new Corn(this.scene);
         this.grape = new Grape(this.scene);
         this.tomato = new Tomato(this.scene);
         this.cow = new Cow(this.scene);
         this.goat = new Goat(this.scene);
         this.chicken = new Chicken(this.scene);


    window.addEventListener('imageClicked', ((event: CustomEvent) => {
      this.handleImageClick(event.detail.type);
    }) as EventListener);

    window.addEventListener('dayNightToggle', ((event: CustomEvent) => {
      this.dayNightToggle();
    }) as EventListener);
  }


    private async handleImageClick(type: string) {
        // Play appropriate sound effect based on type
        switch(type) {
            case 'corn': 
                AudioManager.getInstance().playSfx('click_003');
                await this.corn.handleClick(); 
                break;
            case 'grape': 
                AudioManager.getInstance().playSfx('click_003');
                await this.grape.handleClick(); 
                break;
            case 'tomato': 
                AudioManager.getInstance().playSfx('click_003');
                await this.tomato.handleClick(); 
                break;
            case 'cow': 
                AudioManager.getInstance().playSfx('cow');
                await this.cow.handleClick(); 
                break;
            case 'sheep': 
                AudioManager.getInstance().playSfx('sheep');
                await this.goat.handleClick(); 
                break;
            case 'chicken': 
                AudioManager.getInstance().playSfx('chicken');
                await this.chicken.handleClick(); 
                break;
        }
    }

  initializePixi() {
    this.pixiApp = new PIXI.Application({
      view: this.pixiCanvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x00000000,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      transparent: true
  });

   this.pixiApp.stage.interactive = true;

   this.pixiApp.stage.hitArea = this.pixiApp.screen;
   this.pixiApp.stage.on('pointerdown', (e) => {
       console.log('PIXI Stage Click at:');
   });

   this.clickableImages = new FarmingIcons(this.pixiApp);
   this.uiManager = new UiManager(this.pixiApp);
   
   
   console.log("PIXI Application created:", this.pixiApp);



  }


  private initLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 3.5);
    this.directionalLight.position.set(100, 150, 100);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.set(4096, 4096);
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 500;
    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    this.directionalLight.shadow.bias = -0.001;
    this.directionalLight.shadow.normalBias = 0.05;
    this.scene.add(this.directionalLight);
}

private transitionLighting(toDay: boolean) {
  const fromIntensity = this.directionalLight.intensity;
  const toIntensity = toDay ? 3.5 : 1.2;

  const fromColor = new THREE.Color(this.directionalLight.color.getHex());
  const toColor = new THREE.Color(toDay ? 0xffffff : 0x4a5d8c);

  const fromBG = new THREE.Color((this.scene.background as THREE.Color).getHex());
  const toBG = new THREE.Color(toDay ? 0xd1f4ff : 0x2c3e50);


  const fromAmbient = this.ambientLight.intensity;
  const toAmbient = toDay ? 1.2 : 0.7;

  const fromShadowMapSize = this.directionalLight.shadow.mapSize.x;
  const toShadowMapSize = toDay ? 4096 : 2048;
  const fromShadowBias = this.directionalLight.shadow.bias;
  const toShadowBias = toDay ? -0.001 : -0.0005;
  const fromShadowNormalBias = this.directionalLight.shadow.normalBias;
  const toShadowNormalBias = toDay ? 0.05 : 0.02;

  const startTime = performance.now();
  const duration = 2000;

  const animate = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);

      this.directionalLight.intensity = THREE.MathUtils.lerp(fromIntensity, toIntensity, t);
      this.directionalLight.color.lerpColors(fromColor, toColor, t);
      (this.scene.background as THREE.Color).lerpColors(fromBG, toBG, t);
      this.ambientLight.intensity = THREE.MathUtils.lerp(fromAmbient, toAmbient, t);

      const currentShadowMapSize = Math.round(THREE.MathUtils.lerp(fromShadowMapSize, toShadowMapSize, t));
      this.directionalLight.shadow.mapSize.set(currentShadowMapSize, currentShadowMapSize);
      this.directionalLight.shadow.bias = THREE.MathUtils.lerp(fromShadowBias, toShadowBias, t);
      this.directionalLight.shadow.normalBias = THREE.MathUtils.lerp(fromShadowNormalBias, toShadowNormalBias, t);

      if (!toDay) {
          const nightHeight = THREE.MathUtils.lerp(150, 50, t);
          const nightX = THREE.MathUtils.lerp(100, 200, t);
          const nightZ = THREE.MathUtils.lerp(100, 200, t);
          this.directionalLight.position.set(nightX, nightHeight, nightZ);
      } else {
          this.directionalLight.position.set(100, 150, 100);
      }

      this.directionalLight.shadow.camera.updateProjectionMatrix();
      this.directionalLight.shadow.map?.dispose();
      this.directionalLight.shadow.map = null;

      if (t < 1) requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

public dayNightToggle() {
  this.isDayMode = !this.isDayMode;
  this.transitionLighting(this.isDayMode);
}

  public create(): void {
    this.createUI();
    this.initLighting();

    //this.groundModel.scale.set(, 0.5, 0.5);
    this.scene.add(this.groundModel);

  this.animations = objectsModel.animations;
  
  this.mixer = new THREE.AnimationMixer(this.objectsModel);

    // Set up interaction listener
    sdk.on('interaction', (count: number) => {
      console.log(`Interaction count: ${count}`);

      if (sdk.interactions >= 10) {
        sdk.finish();
      }
    });

    // Start animation loop
    this.animate();

    this.groundModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Ensure materials are properly configured
          if (child.material) {
              // If it's an array of materials
              if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                      if (mat instanceof THREE.MeshStandardMaterial) {
                          mat.needsUpdate = true;
                          mat.envMapIntensity = 1.0;
                          mat.roughness = 0.5;
                          mat.metalness = 0.5;
                      }
                  });
              } 
              // If it's a single material
              else if (child.material instanceof THREE.MeshStandardMaterial) {
                  child.material.needsUpdate = true;
                  child.material.envMapIntensity = 1.0;
                  child.material.roughness = 0.5;
                  child.material.metalness = 0.5;
              }
          }
      }
  });


    sdk.start();
  }

  private createUI(): void {
    this.installButton = document.createElement('div');
    this.installButton.style.cssText =
      'cursor: pointer; width: 200px; display: flex; align-items: center; justify-content: center; margin: 20px;';
    this.installButton.onclick = () => sdk.install();

    // Add image
    this.buttonImage.style.width = '100%';
    this.installButton.appendChild(this.buttonImage);

    // Add text overlay
    const text = document.createElement('div');
    text.textContent = 'Install';
    text.style.cssText =
      'position: absolute ;color: rgb(255 255 255);font-size: 35px;font-weight: bold;text-shadow: rgb(255 252 106 / 63%) 4px 3px 9px;pointer-events: none;font-family: cursive;';
    this.installButton.appendChild(text);

    this.uiContainer.appendChild(this.installButton);
  }

  private update(deltaTime?: number): void {
    if (!deltaTime) deltaTime = this.clock.getDelta();
    this.cow.update(deltaTime);
    this.goat.update(deltaTime);
    this.chicken.update(deltaTime);
    this.renderer.render(this.scene, this.camera);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    if (!this.isPaused) this.update();

    this.renderer.render(this.scene, this.camera);
  }

  public resize(width: number, height: number): void {
    // Update container size
    this.uiContainer.style.width = `${width}px`;
    this.uiContainer.style.height = `${height}px`;

    // Calculate scale based on screen dimensions
    const scaleX = width / 320;
    const scaleY = height / 480;
    const scale = Math.min(scaleX, scaleY); // Use smaller scale to fit both dimensions

    this.uiContainer.style.transform = `scale(${scale})`;

    // Update camera aspect ratio
    this.camera.aspect = width / height;
    this.camera.position.z = width > height ? 80 : 160;
    this.camera.updateProjectionMatrix();

    // Resize renderer
    this.renderer.setSize(width, height);
  }

  public pause(): void {
    this.isPaused = true;
    console.log('Game paused');
  }

  public resume(): void {
    this.isPaused = false;
    console.log('Game resumed');
  }

  public volume(value: number): void {
    console.log(`Volume changed to: ${value}`);
  }

  public finish(): void {
    console.log('Game finished');
  }
}

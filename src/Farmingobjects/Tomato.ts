import * as THREE from 'three';
import { ObjectManager } from '../Managers/ObjectManager';

export class Tomato {
    private scene: THREE.Scene;
    private objectManager: ObjectManager;
    private tomatoModels: THREE.Object3D[] = [];
    private currentTomatoIndex: number = 0;

    private tomatoPositions: THREE.Vector3[] = [
        new THREE.Vector3(-12, 4.3, 3),
        new THREE.Vector3(-10, 4.3, 3),
        new THREE.Vector3(-8, 4.3, 3),
        new THREE.Vector3(-6, 4.3, 3),
        new THREE.Vector3(-12, 4.3, 5),
        new THREE.Vector3(-10, 4.3, 5),
        new THREE.Vector3(-8, 4.3, 5),
        new THREE.Vector3(-6, 4.3, 5)
    ];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.objectManager = new ObjectManager(scene);

        window.addEventListener('wateringComplete', ((event: Event) => {
            const customEvent = event as CustomEvent<{ type: string }>;
            if (customEvent.detail.type === 'tomato') {
                this.updateModel();
            }
        }) as EventListener);
    }

    public async handleClick(): Promise<void> {
        console.log('Tomato clicked');
        try {
            if (this.currentTomatoIndex >= this.tomatoPositions.length) {
                console.log('Maximum number of tomato models reached');
                return;
            }

            const position = this.tomatoPositions[this.currentTomatoIndex];
            const newTomatoModel = await this.objectManager.loadModel('tomato_1', position);
            this.scene.add(newTomatoModel);
            this.tomatoModels.push(newTomatoModel);
            
            this.objectManager.animatePlacement(newTomatoModel);
            this.currentTomatoIndex++;
        } catch (error) {
            console.error('Error loading tomato model:', error);
        }
    }

    private async updateModel(): Promise<void> {
        console.log('Tomato model updated after watering');
        
        const updatePromises = this.tomatoModels.map(async (oldModel) => {
            const newModel = await this.objectManager.updateModel(oldModel, 'tomato_3');
            this.tomatoModels[this.tomatoModels.indexOf(oldModel)] = newModel;
        });

        await Promise.all(updatePromises);
    }
} 
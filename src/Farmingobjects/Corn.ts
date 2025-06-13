import * as THREE from 'three';
import { ObjectManager } from '../Managers/ObjectManager';

export class Corn {
    private scene: THREE.Scene;
    private objectManager: ObjectManager;
    private cornModels: THREE.Object3D[] = [];
    private currentCornIndex: number = 0;

    private cornPositions: THREE.Vector3[] = [
        new THREE.Vector3(-12, 4.3, -10),
        new THREE.Vector3(-10, 4.3, -10),
        new THREE.Vector3(-8, 4.3, -10),
        new THREE.Vector3(-6, 4.3, -10),
        new THREE.Vector3(-12, 4.3, -8),
        new THREE.Vector3(-10, 4.3, -8),
        new THREE.Vector3(-8, 4.3, -8),
        new THREE.Vector3(-6, 4.3, -8)
    ];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.objectManager = new ObjectManager(scene);

        window.addEventListener('wateringComplete', ((event: Event) => {
            const customEvent = event as CustomEvent<{ type: string }>;
            if (customEvent.detail.type === 'corn') {
                this.updateModel();
            }
        }) as EventListener);
    }

    public async handleClick(): Promise<void> {
        console.log('Corn clicked');
        try {
            if (this.currentCornIndex >= this.cornPositions.length) {
                console.log('Maximum number of corn models reached');
                return;
            }

            const position = this.cornPositions[this.currentCornIndex];
            const newCornModel = await this.objectManager.loadModel('corn_1', position);
            this.scene.add(newCornModel);
            this.cornModels.push(newCornModel);
            
            this.objectManager.animatePlacement(newCornModel);
            this.currentCornIndex++;
        } catch (error) {
            console.error('Error loading corn model:', error);
        }
    }

    private async updateModel(): Promise<void> {
        console.log('Corn model updated after watering');
        
        const updatePromises = this.cornModels.map(async (oldModel) => {
            const newModel = await this.objectManager.updateModel(oldModel, 'corn_3');
            this.cornModels[this.cornModels.indexOf(oldModel)] = newModel;
        });

        await Promise.all(updatePromises);
    }
} 



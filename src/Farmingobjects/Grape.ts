import * as THREE from 'three';
import { ObjectManager } from '../Managers/ObjectManager';

export class Grape {
    private scene: THREE.Scene;
    private objectManager: ObjectManager;
    private grapeModels: THREE.Object3D[] = [];
    private currentGrapeIndex: number = 0;

    private grapePositions: THREE.Vector3[] = [
        new THREE.Vector3(-12, 4.3, -4),
        new THREE.Vector3(-10, 4.3, -4),
        new THREE.Vector3(-8, 4.3, -4),
        new THREE.Vector3(-6, 4.3, -4),
        new THREE.Vector3(-12, 4.3, -2),
        new THREE.Vector3(-10, 4.3, -2),
        new THREE.Vector3(-8, 4.3, -2),
        new THREE.Vector3(-6, 4.3, -2)
    ];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.objectManager = new ObjectManager(scene);

        window.addEventListener('wateringComplete', ((event: Event) => {
            const customEvent = event as CustomEvent<{ type: string }>;
            if (customEvent.detail.type === 'grape') {
                this.updateModel();
            }
        }) as EventListener);
    }

    public async handleClick(): Promise<void> {
        console.log('Grape clicked');
        try {
            if (this.currentGrapeIndex >= this.grapePositions.length) {
                console.log('Maximum number of grape models reached');
                return;
            }

            const position = this.grapePositions[this.currentGrapeIndex];
            const newGrapeModel = await this.objectManager.loadModel('grape_1', position);
            this.scene.add(newGrapeModel);
            this.grapeModels.push(newGrapeModel);
            
            this.objectManager.animatePlacement(newGrapeModel);
            this.currentGrapeIndex++;
        } catch (error) {
            console.error('Error loading grape model:', error);
        }
    }

    private async updateModel(): Promise<void> {
        console.log('Grape model updated after watering');
        
        const updatePromises = this.grapeModels.map(async (oldModel) => {
            const newModel = await this.objectManager.updateModel(oldModel, 'grape_3');
            this.grapeModels[this.grapeModels.indexOf(oldModel)] = newModel;
        });

        await Promise.all(updatePromises);
    }
} 
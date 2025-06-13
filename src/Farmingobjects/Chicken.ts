import * as THREE from 'three';
import { ObjectManager } from '../Managers/ObjectManager';

export class Chicken {
    private scene: THREE.Scene;
    private objectManager: ObjectManager;
    private chickenModels: THREE.Object3D[] = [];
    private currentChickenIndex: number = 0;

    private chickenPositions: THREE.Vector3[] = [
        new THREE.Vector3(3, 4.5, 7),
        new THREE.Vector3(1, 4.5, 3),
        new THREE.Vector3(2, 4.5, -1),
        new THREE.Vector3(-3, 4.5, 12),
        new THREE.Vector3(-1, 4.5, -4)
    ];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.objectManager = new ObjectManager(scene);
    }

    public async handleClick(): Promise<void> {
        console.log('Chicken clicked');
        try {
            if (this.currentChickenIndex >= this.chickenPositions.length) {
                console.log('Maximum number of chicken models reached');
                return;
            }

            const position = this.chickenPositions[this.currentChickenIndex];
            const newChickenModel = await this.objectManager.loadAnimalModel('chicken_1', position);
            this.objectManager.createSmokeEffect(new THREE.Vector3(
                position.x,
                position.y, // Lower the smoke effect slightly
                position.z
            ));
            this.scene.add(newChickenModel);
            this.chickenModels.push(newChickenModel);
                        this.currentChickenIndex++;
        } catch (error) {
            console.error('Error loading chicken model:', error);
        }
    }

    public update(deltaTime: number): void {
        this.objectManager.updateMixers(deltaTime);
    }
} 
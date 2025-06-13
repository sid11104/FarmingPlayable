import * as THREE from 'three';
import { ObjectManager } from '../Managers/ObjectManager';

export class Goat {
    private scene: THREE.Scene;
    private objectManager: ObjectManager;
    private goatModels: THREE.Object3D[] = [];
    private currentGoatIndex: number = 0;

    private goatPositions: THREE.Vector3[] = [
        new THREE.Vector3(8.5, 4, 7),
        new THREE.Vector3(14, 4, 9),
        new THREE.Vector3(10, 4, 2),
        new THREE.Vector3(13, 4, 10),
        new THREE.Vector3(10, 4, 4)
    ];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.objectManager = new ObjectManager(scene);
    }

    public async handleClick(): Promise<void> {
        console.log('Goat clicked');
        try {
            if (this.currentGoatIndex >= this.goatPositions.length) {
                console.log('Maximum number of goat models reached');
                return;
            }

            const position = this.goatPositions[this.currentGoatIndex];
            const newGoatModel = await this.objectManager.loadAnimalModel('sheep_1', position);
            this.objectManager.createSmokeEffect(new THREE.Vector3(
                position.x,
                position.y, // Lower the smoke effect slightly
                position.z
            ));
            this.scene.add(newGoatModel);
            this.goatModels.push(newGoatModel);
            
            this.currentGoatIndex++;
        } catch (error) {
            console.error('Error loading goat model:', error);
        }
    }

    public update(deltaTime: number): void {
        // this.mixers.forEach((mixer, index) => {
        //     mixer.update(deltaTime);
        // });
        this.objectManager.updateMixers(deltaTime);
    }
} 
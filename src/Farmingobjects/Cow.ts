import * as THREE from 'three';
import { ObjectManager } from '../Managers/ObjectManager';

export class Cow {
    private scene: THREE.Scene;
    private objectManager: ObjectManager;
    private cowModels: THREE.Object3D[] = [];
    private currentCowIndex: number = 0;

    private cowPositions: THREE.Vector3[] = [
        new THREE.Vector3(11, 4.2, -5.6)
    ];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.objectManager = new ObjectManager(scene);
    }

    public async handleClick(): Promise<void> {
        console.log('Cow clicked');
        try {
            if (this.currentCowIndex >= this.cowPositions.length) {
                console.log('Maximum number of cow models reached');
                return;
            }

            const position = this.cowPositions[this.currentCowIndex];
            const newCowModel = await this.objectManager.loadAnimalModel('cow_1', position);
            this.objectManager.createSmokeEffect(new THREE.Vector3(
                position.x,
                position.y, // Lower the smoke effect slightly
                position.z
            ));
            this.scene.add(newCowModel);
            this.cowModels.push(newCowModel);
            
            this.currentCowIndex++;
        } catch (error) {
            console.error('Error loading cow model:', error);
        }
    }

    public update(deltaTime: number): void {
        this.objectManager.updateMixers(deltaTime);
    }
} 
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import objectsModel from 'assets/objects.glb';
import smokeTexturePath from 'assets/images/smoke.png';

export class ObjectManager {
    private scene: THREE.Scene;
    private gltfLoader: GLTFLoader;
    private textureLoader: THREE.TextureLoader;
    private mixers: THREE.AnimationMixer[] = [];
    private particleSystem: THREE.Points | null = null;


    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.gltfLoader = new GLTFLoader();
        this.textureLoader = new THREE.TextureLoader();
    }

    public createSmokeEffect(position: THREE.Vector3) {
        const particleCount = 5;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const smokeTexture = this.textureLoader.load(smokeTexturePath);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = position.x;
            positions[i3 + 1] = position.y;
            positions[i3 + 2] = position.z;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 0.8 + Math.random() * 0.4;

            velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
            velocities[i3 + 1] = Math.cos(phi) * speed;
            velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

            sizes[i] = 15 + Math.random() * 8;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 25,
            map: smokeTexture,
            transparent: true,
            opacity: 0.95,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            color: 0xffffff
        });

        const points = new THREE.Points(geometry, material);
        this.scene.add(points);

        let time = 0;
        const duration = 0.5;

        const update = () => {
            time += 0.016;

            const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
            const velAttr = geometry.getAttribute('velocity') as THREE.BufferAttribute;
            const sizeAttr = geometry.getAttribute('size') as THREE.BufferAttribute;

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                posAttr.array[i3] += velAttr.array[i3] * 0.5;
                posAttr.array[i3 + 1] += velAttr.array[i3 + 1] * 0.5;
                posAttr.array[i3 + 2] += velAttr.array[i3 + 2] * 0.5;

                velAttr.array[i3] *= 0.995;
                velAttr.array[i3 + 1] *= 0.995;
                velAttr.array[i3 + 2] *= 0.995;

                sizeAttr.array[i] *= 1.04;
            }

            posAttr.needsUpdate = true;
            sizeAttr.needsUpdate = true;

            material.opacity = 0.9 * (1 - time / duration);

            if (time < duration) {
                requestAnimationFrame(update);
            } else {
                this.scene.remove(points);
                geometry.dispose();
                material.dispose();
            }
        };

        update();
    }

    public async loadAnimalModel(modelName: string, position: THREE.Vector3): Promise<THREE.Object3D> {
        return new Promise((resolve, reject) => {            
            setTimeout(() => {
                this.gltfLoader.load(
                    objectsModel,
                    (gltf) => {
                        const model = gltf.scene.getObjectByName(modelName);
                        if (model) {
                            model.position.copy(position);
                            model.scale.set(1, 1, 1);
                            if (modelName === 'sheep_1' || modelName === 'chicken_1') {
                            model.rotation.y = Math.random() * Math.PI * 2;
                            }
                            model.traverse((child) => {
                                if (child instanceof THREE.Mesh) {
                                    child.castShadow = true;
                                    child.receiveShadow = true;
                                }
                            });

                            const mixer = new THREE.AnimationMixer(model);
                            this.mixers.push(mixer);

                            const actionAnimation = gltf.animations.find(anim => anim.name === `action_${modelName.split('_')[0]}`);
                            const idleAnimation = gltf.animations.find(anim => anim.name === `idle_${modelName.split('_')[0]}`);
                            
                            if (actionAnimation && idleAnimation) {
                                const actionAction = mixer.clipAction(actionAnimation);
                                const idleAction = mixer.clipAction(idleAnimation);
                                
                                idleAction.setLoop(THREE.LoopRepeat, Infinity);
                                actionAction.play();
                                actionAction.clampWhenFinished = true;
                                actionAction.loop = THREE.LoopOnce;
                                
                                mixer.addEventListener('finished', (e) => {
                                    if (e.action === actionAction) {
                                        idleAction.play();
                                    }
                                });
                            }

                            resolve(model);
                        } else {
                            reject(new Error(`${modelName} not found in GLB file`));
                        }
                    },
                    undefined,
                    (error) => reject(error)
                );
            }, 100);
        });
    }

    public async loadModel(modelName: string, position: THREE.Vector3): Promise<THREE.Object3D> {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                objectsModel,
                (gltf) => {
                    const model = gltf.scene.getObjectByName(modelName);
                    if (model) {
                        model.position.copy(position);
                        model.scale.set(0.2, 0.2, 0.2);
                        model.rotation.y = Math.random() * Math.PI * 2;
                        model.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        resolve(model);
                    } else {
                        reject(new Error(`${modelName} not found in GLB file`));
                    }
                },
                undefined,
                (error) => reject(error)
            );
        });
    }

    public animatePlacement(model: THREE.Object3D): void {
        const originalPosition = model.position.clone();
        const originalScale = new THREE.Vector3(0.7, 0.7, 0.7);
        
        model.scale.set(0.1, 0.1, 0.1);
        model.position.y = originalPosition.y;
        model.rotation.set(0, 0, 0);

        gsap.to(model.scale, {
            x: originalScale.x,
            y: originalScale.y,
            z: originalScale.z,
            duration: 0.6,
            ease: "power2.out"
        });

        this.createSeedParticles(originalPosition);

        gsap.to(model.rotation, {
            y: Math.PI * 2,
            duration: 0.6,
            ease: "power2.out"
        });
    }

    public updateMixers(deltaTime: number): void {
        this.mixers.forEach(mixer => mixer.update(deltaTime));
    }

    public async updateModel(oldModel: THREE.Object3D, newModelName: string): Promise<THREE.Object3D> {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                objectsModel,
                (gltf) => {
                    const newModel = gltf.scene.getObjectByName(newModelName);
                    if (newModel) {
                        newModel.position.copy(oldModel.position);
                        newModel.rotation.copy(oldModel.rotation);
                        newModel.scale.set(0.1, 0.1, 0.1);
                        
                        newModel.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });

                        this.scene.add(newModel);

                        const tl = gsap.timeline({
                            onComplete: () => {
                                this.scene.remove(oldModel);
                                resolve(newModel);
                            }
                        });

                        tl.to(oldModel.scale, {
                            x: 0.1,
                            y: 0.1,
                            z: 0.1,
                            duration: 0.5,
                            ease: "power2.in"
                        }, 0);

                        tl.to(newModel.scale, {
                            x: 0.8,
                            y: 0.8,
                            z: 0.8,
                            duration: 0.5,
                            ease: "power2.out"
                        }, 0);

                        tl.to(newModel.rotation, {
                            y: oldModel.rotation.y + Math.PI * 2,
                            duration: 0.5,
                            ease: "power2.inOut"
                        }, 0);
                    } else {
                        reject(new Error(`${newModelName} not found in GLB file`));
                    }
                },
                undefined,
                (error) => reject(error)
            );
        });
    }


    private animateCornPlacement(cornModel: THREE.Object3D) {
        const originalPosition = cornModel.position.clone();
        const originalScale = new THREE.Vector3(1, 1, 1);
        
        cornModel.scale.set(0.1, 0.1, 0.1);
        cornModel.position.y = originalPosition.y;
        cornModel.rotation.set(0, 0, 0);

        gsap.to(cornModel.scale, {
            x: originalScale.x,
            y: originalScale.y,
            z: originalScale.z,
            duration: 0.6,
            ease: "power2.out"
        });

        this.createSeedParticles(originalPosition);

        gsap.to(cornModel.rotation, {
            y: Math.PI * 2,
            duration: 0.6,
            ease: "power2.out"
        });
    }
    private createSeedParticles(position: THREE.Vector3) {
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const initialPositions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // Create random positions in a 3D space
            const radius = Math.random() * 2; // Random distance from center
            const theta = Math.random() * Math.PI * 2; // Random angle around y-axis
            const phi = Math.random() * Math.PI; // Random angle from y-axis
            
            // Convert spherical coordinates to Cartesian
            const x = position.x + radius * Math.sin(phi) * Math.cos(theta);
            const y = position.y + radius * Math.cos(phi);
            const z = position.z + radius * Math.sin(phi) * Math.sin(theta);

            initialPositions[i3] = x;
            initialPositions[i3 + 1] = y;
            initialPositions[i3 + 2] = z;

            // Vary the colors slightly for more sparkle effect
            colors[i3] = 1.0;     // R
            colors[i3 + 1] = 0.7 + Math.random() * 0.3; // G
            colors[i3 + 2] = 0.2 + Math.random() * 0.2; // B
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.08 + Math.random() * 0.04, // Vary particle sizes
            vertexColors: true,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);

        const tl = gsap.timeline({
            onComplete: () => {
                if (this.particleSystem) {
                    this.scene.remove(this.particleSystem);
                    this.particleSystem = null;
                }
            }
        });

        tl.to(this.particleSystem.material, {
            opacity: 0,
            duration: 3,
            ease: "power2.out"
        }, 0);

        const particlePositions = this.particleSystem.geometry.attributes.position.array as Float32Array;
        tl.to(particlePositions, {
            duration: 3,
            ease: "power1.out",
            onUpdate: () => {
                if (this.particleSystem) {
                    for (let i = 0; i < particlePositions.length; i += 3) {
                        // More random movement in all directions
                        particlePositions[i] += (Math.random() - 0.5) * 0.02;
                        particlePositions[i + 1] += (Math.random() - 0.5) * 0.02;
                        particlePositions[i + 2] += (Math.random() - 0.5) * 0.02;
                    }
                    this.particleSystem.geometry.attributes.position.needsUpdate = true;
                }
            }
        }, 0);
    }
} 
import * as THREE from 'three';
import bgMusic from 'assets/audio/theme.mp3';
import clickSound from 'assets/audio/click_003.mp3';
import cowSound from 'assets/audio/cow.mp3';
import sheepSound from 'assets/audio/sheep.mp3';
import sheep2Sound from 'assets/audio/sheep2.mp3';
import throwSpearSound from 'assets/audio/throw_spear.mp3';
import popupChestSound from 'assets/audio/popup_chest.mp3';
import chickenSound from 'assets/audio/chicken.mp3';

export class AudioManager {
    private static instance: AudioManager;
    private audioLoader: THREE.AudioLoader;
    private listener: THREE.AudioListener;
    private bgMusic: THREE.Audio;
    private sfxMap: Map<string, THREE.Audio>;

    private constructor() {
        this.audioLoader = new THREE.AudioLoader();
        this.listener = new THREE.AudioListener();
        this.bgMusic = new THREE.Audio(this.listener);
        this.sfxMap = new Map();
        this.loadAllAudio();
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    private loadAllAudio(): void {
        // Load background music
        this.audioLoader.load(bgMusic, (buffer) => {
            this.bgMusic.setBuffer(buffer);
            this.bgMusic.setLoop(true);
            this.bgMusic.setVolume(0.5);
        });

        // Load sound effects separately
        const sfxConfigs = [
            { key: 'chicken', file: chickenSound },
            { key: 'click_003', file: clickSound },
            { key: 'cow', file: cowSound },
            { key: 'sheep', file: sheepSound },
            { key: 'sheep2', file: sheep2Sound },
            { key: 'throw_spear', file: throwSpearSound },
            { key: 'popup_chest', file: popupChestSound }
        ];

        sfxConfigs.forEach(config => {
            const audio = new THREE.Audio(this.listener);
            this.audioLoader.load(config.file, (buffer) => {
                audio.setBuffer(buffer);
                audio.setVolume(0.5);
                this.sfxMap.set(config.key, audio);
            });
        });
    }

    public playBgMusic(): void {
        console.log('playing bg music');
        if (!this.bgMusic.isPlaying) {
            this.bgMusic.play();
        }
    }

    public stopBgMusic(): void {
        if (this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }
    }

    public playSfx(key: string): void {
        const sfx = this.sfxMap.get(key);
        if (sfx && sfx.buffer) {
            // Create a new instance of the audio to allow overlapping sounds
            const newSfx = new THREE.Audio(this.listener);
            newSfx.setBuffer(sfx.buffer);
            newSfx.setVolume(0.5);
            newSfx.play();
        } else {
            console.warn(`Sound effect "${key}" not found or not loaded`);
        }
    }

    

    public getListener(): THREE.AudioListener {
        return this.listener;
    }
}

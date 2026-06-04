import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export default class SootSprite {
    constructor(scene) {
        this.scene = scene;
        this.body;
    }

    async render() {
        const gltfLoader = new GLTFLoader();
        let rockProb = Math.random();
        let url;
        if (rockProb < 0.4) {
            url = '../static/obj/SootSprite/soot_sprite.gltf';
        } else {
            url = '../static/obj/SootSprite/soot_sprite_no_rock.gltf';
        }
        await gltfLoader.load(url, (gltf) => {
            const root = gltf.scene;
            this.body = root;
            root.position.set(Math.random() * 40 - 20, 0.5, Math.random() * 40 - 20);
            root.rotation.set(0, Math.random() * Math.PI, 0);
            this.scene.add(root);
        })
    }
}
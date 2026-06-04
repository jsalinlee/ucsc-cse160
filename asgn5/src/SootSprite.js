import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export default class SootSprite {
    constructor(scene) {
        this.scene = scene;
        this.body;
    }

    async render() {
        const gltfLoader = new GLTFLoader();
        const url = '../static/obj/SootSprite/scene.gltf';
        this.body = await gltfLoader.loadAsync(url);
        this.scene.add(this.body.scene);
    }
}
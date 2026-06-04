import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';

export default class Lighting {
    constructor(camera, canvas, scene, type) {
        this.camera = camera;
        this.canvas = canvas;
        this.scene = scene;
        this.type = type;
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.target.set(0, 5 ,0);
        this.controls.update();

        this.color = 0xFFFFFF;
        this.skyColor = 0xB1E1FF;
        this.groundColor = 0xB97A20;
        this.intensity = 1;

        // this.light = new THREE.AmbientLight(color, intensity);
        this.light = this.createLight();
        // this.gui = new GUI();
        this.helper;
        if (type == 'directional') {
            this.helper = new THREE.DirectionalLightHelper(this.light);
        }
    }

    createLight() {
        let light;
        switch (this.type) {
            case 'ambient':
                light = new THREE.AmbientLight(this.color, this.intensity);
                break;
            case 'hemisphere':
                light = new THREE.HemisphereLight(this.skyColor, this.groundColor, this.intensity);
                break;
            case 'directional':
                light = new THREE.DirectionalLight(this.color, 0.15);
                light.position.set(0, 10, 2);
                light.target.position.set(-5, 0, 0);
                break;
            
            case 'spotlight':
                light = new THREE.SpotLight(0xFFFFFF, 250);
                light.penumbra = 0.2;
                light.position.set(5, 10, 2);
                light.angle = 30;
            }

        return light;
    }
    
    render() {
        this.scene.add(this.light);
        if (this.type == 'directional') {
            this.scene.add(this.light.target);
            this.updateLight();
        }
    }

    updateLight() {
        this.light.target.updateMatrixWorld();
        // this.helper.update();
    }

    renderGUI() {
        switch (this.type) {
            case 'directional':
                this.gui.addColor(new ColorGUIHelper(this.light, 'color'), 'value').name('directional color');
                this.gui.add(this.light, 'intensity', 0, 5, 0.01);
                // this.gui.add(this.light.target.position, 'x', -10, 10);
                // this.gui.add(this.light.target.position, 'z', -10, 10);
                // this.gui.add(this.light.target.position, 'y', 0, 10);
                this.helper = new THREE.DirectionalLightHelper(this.light);
                this.scene.add(this.helper);
                this.renderXYZGUI(this.gui, this.light.position, 'position', this.updateLight());
                this.renderXYZGUI(this.gui, this.light.target.position, 'target', this.updateLight());
                break;
            case 'ambient':
                this.gui.addColor(new ColorGUIHelper(this.light, 'color'), 'value').name('ambient color');
                this.gui.add(this.light, 'intensity', 0, 5, 0.01);
                break;
        };
    }

    renderXYZGUI(gui, vector3, name, onChangeFn) {
        const folder = gui.addFolder(name);
        folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
        folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
        folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
        folder.open();
    }
}

class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }

    get value() {
        return '#' + this.object[this.prop].getHexString();
    }

    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}
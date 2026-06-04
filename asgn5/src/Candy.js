import * as THREE from 'three';

export default class Candy {
    constructor(radius = 1.0, shapeProb = 0.5, matColor = getRandomColor()) {
        this.detail = 0;
        this.radius = radius;
        this.geometry;
        if (Math.random() < shapeProb) {
            this.geometry = new THREE.IcosahedronGeometry(this.radius, this.detail);
        } else {
            this.geometry = new THREE.DodecahedronGeometry(this.radius, this.detail);
        }
        const loader = new THREE.TextureLoader();
        const candyAlpha = loader.load('../static/img/candyAlpha.jpg');

        this.material = new THREE.MeshPhongMaterial ({
            color: matColor,
            shininess: 100,
            alphaMap: candyAlpha,
            transparent: true,
            opacity: 1.4,
         });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    render(scene) {
        scene.add(this.mesh);
    }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
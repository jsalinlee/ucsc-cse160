import * as THREE from 'three';
// import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import Lighting from './Lighting.js';
import Candy from './Candy.js';
import SootSprite from './SootSprite.js';

async function main() {
    // Canvas and WebGL renderer;
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    
    // Perspective camera
    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(-20, 10, 20);
    
    // Initialize scene
    const scene = new THREE.Scene();

    // const ambientLight = new Lighting(camera, canvas, scene, 'ambient');
    // ambientLight.render();
    // ambientLight.renderGUI();
    
    const hemisphereLight = new Lighting(camera, canvas, scene, 'hemisphere');
    hemisphereLight.render();
    
    // const dLight = new THREE.DirectionalLight(0xFFFFFF, 0.1);
    // dLight.position.set(0,10,0);
    // dLight.target.position.set(-5, 0,0);
    // scene.add(dLight);
    // scene.add(dLight.target);
    const directionalLight = new Lighting(camera, canvas, scene, 'directional');
    directionalLight.render();
    // directionalLight.renderGUI();

    // const spotLight = new Lighting(camera, canvas, scene, 'spotlight');
    // spotLight.render();

    // Hello Cube!
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // // Adding color
    // const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    // Maintain aspect ratio of rendered objects
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }
    

    // Main render update function
    function render(time) {
        time *= 0.001; // convert time to seconds

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        
        // cubes.forEach((cube, ndx) => {
        //     const speed = 1 + ndx * .1;
        //     const rot = time * speed;
        //     // cube.rotation.x = rot;
        //     // cube.rotation.y = rot;
        //     cube.rotation.y = 1;
        //     cube.rotation.x = 1;
        // });

        // candies.forEach((candy, ndx) => {
        //     const speed = 1 + ndx * 0.1;
        //     const rot = time * speed;
        //     candy.mesh.rotation.x = rot;
        //     candy.mesh.rotation.y = rot;
        //     candy.render(scene);
        // });

        // cube.rotation.x = time;
        // cube.rotation.y = time;
        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    // First light
    // const lightColor = 0xFFFFFF;
    // const intensity = 3;
    // const light = new THREE.DirectionalLight(lightColor, intensity);
    // light.position.set(-1, 2, 4);
    // scene.add(light);

    // quick simple color object creator
    function makeCubeInstance(color, x, y, z) {
        const cubeSize = 4;
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMat = new THREE.MeshPhongMaterial({color});
        const cube = new THREE.Mesh(cubeGeo, cubeMat);

        cube.position.set(cubeSize + 1 + x, y + cubeSize / 2, z);
        // cube.position.set(cubeSize + 1, cubeSize / 2, z);
        scene.add(cube);
        return cube;
    }

    // image textured object instantiator
    function makeTexturedInstance(geometry, x) {
        const loader = new THREE.TextureLoader();
        const texture = loader.load('../static/img/wall.jpg');
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({ map: texture,})
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x;

        return cube;
    }

    function loadColorTexture(path) {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    // list of cubes to render
    // const cubes = [
    //     makeCubeInstance(0x44aa88, -15, 2, -6),
    //     makeCubeInstance(0x8844aa, -5, 2, 0),
    //     makeCubeInstance(0xaa8844, 2, 2, 5),
    //     // makeTexturedInstance(geometry, -0)
    // ];

    // Async texture loading
    const loadManager = new THREE.LoadingManager();
    const multiLoader = new THREE.TextureLoader(loadManager);
    const flowerMats = [
        new THREE.MeshBasicMaterial({map: multiLoader.load('../static/img/flower-1.jpg')}),
        new THREE.MeshBasicMaterial({map: multiLoader.load('../static/img/flower-2.jpg')}),
        new THREE.MeshBasicMaterial({map: multiLoader.load('../static/img/flower-3.jpg')}),
        new THREE.MeshBasicMaterial({map: multiLoader.load('../static/img/flower-4.jpg')}),
        new THREE.MeshBasicMaterial({map: multiLoader.load('../static/img/flower-5.jpg')}),
        new THREE.MeshBasicMaterial({map: multiLoader.load('../static/img/flower-6.jpg')}),
    ];

    loadManager.onLoad = () => {
        // loadingElem.style.display = 'none';

        // Flower cube
        // const cube = new THREE.Mesh(geometry, flowerMats);
        // cube.position.x = 1;
        // scene.add(cube);
        // cubes.push(cube);
    };

    // progress bar
    // const loadingElem = document.getElementById('loading');
    // const progressBarElem = document.querySelector('.progressbar');

    // loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
    //     const progress = itemsLoaded / itemsTotal;
    //     progressBarElem.style.transform = 'scaleX(${progress})';
    // };

    const asyncLoader = new THREE.TextureLoader();

    // Async load lion cube
    // asyncLoader.load('../static/img/wall.jpg', (texture) => {
    //     texture.colorSpace = THREE.SRGBColorSpace;
    //     const material = new THREE.MeshBasicMaterial({
    //         map:texture,
    //     });
    //     const cube = new THREE.Mesh(geometry, material);
    //     scene.add(cube);
    //     cubes.push(cube);
    // });

    // Tips:
    // when using images from 3rd party servers, they need to have proper headers for Three.js to work.

    // Memory usage
    // in general, textures take width * height * 4 * 1.33 bytes of memory


    
    // Ground
    const planeSize = 40;
    const groundLoader = new THREE.TextureLoader();
    const groundColor = groundLoader.load('../static/tex/Ground/ground-color.png');
    groundColor.wrapS = THREE.RepeatWrapping;
    groundColor.wrapT = THREE.RepeatWrapping;
    groundColor.magFilter = THREE.NearestFilter;
    groundColor.colorSpace = THREE.SRGBColorSpace;
    const groundNormal = groundLoader.load('../static/tex/Ground/ground-normal.png');
    groundNormal.wrapS = THREE.RepeatWrapping;
    groundNormal.wrapT = THREE.RepeatWrapping;
    groundNormal.magFilter = THREE.NearestFilter;
    const groundDisplacement = groundLoader.load('../static/tex/Ground/ground-displacement.png');
    groundDisplacement.wrapS = THREE.RepeatWrapping;
    groundDisplacement.wrapT = THREE.RepeatWrapping;
    groundDisplacement.magFilter = THREE.NearestFilter;

    // Simple checkered ground
    // const groundTexture = groundLoader.load('../static/img/checker.png');
    // groundTexture.wrapS = THREE.RepeatWrapping;
    // groundTexture.wrapT = THREE.RepeatWrapping;
    // groundTexture.magFilter = THREE.NearestFilter;
    // groundTexture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 5;

    // groundTexture.repeat.set(repeats, repeats);
    groundColor.repeat.set(repeats, repeats);
    groundNormal.repeat.set(repeats, repeats);
    groundDisplacement.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
        map: groundColor,
        normalMap: groundNormal,
        displacementMap: groundDisplacement,
        side: THREE.DoubleSide,
    });
    const groundMesh = new THREE.Mesh(planeGeo, planeMat);
    groundMesh.rotation.x = Math.PI * -0.5;
    scene.add(groundMesh);

    // Skybox
    const skyLoader = new THREE.TextureLoader();
    const skyTexture = skyLoader.load(
        '../static/img/skybox.jpg',
        () => {
            skyTexture.mapping = THREE.EquirectangularReflectionMapping;
            skyTexture.colorSpace = THREE.SRGBColorSpace;
            scene.background = skyTexture;
        }
    );

    // Add furnace
    try {
        const hearth = await loadObj(scene, '../static/obj/Hearth/model.obj', '../static/obj/Hearth/materials.mtl', 7);
        const hearthBox = new THREE.Box3().setFromObject(hearth);
        const hearthBoxSize = hearthBox.getSize(new THREE.Vector3());
        const hearthBoxCenter = hearthBox.getCenter(new THREE.Vector3());
        hearth.position.set(10, (hearthBoxSize.y/2 - hearthBoxCenter.y + 0.5), 0);

        // const fireLight2 = new Lighting(camera, canvas, scene, 'spotlight');
        // fireLight.light.intensity = 300;
        // fireLight.light.penumbra = 0.2;
        // fireLight.light.position.set(1, 10, 0);
        // fireLight.light.target.position.set(fireLight.light.position.x, 0, 0);
        // fireLight.light.angle = 15;
        // const fireHelper = new THREE.SpotLightHelper(fireLight.light);
        // scene.add(fireHelper);
        // fireLight.render();
        
        const fireLight = new THREE.PointLight(0xFFB400, 250);
        fireLight.position.set(hearthBoxSize.x + 2, 3, 0);
        // fireLight.target.position.set(-fireLight.position.y, fireLight.position.y, 0);
        scene.add(fireLight);
        // const fireHelper = new THREE.SpotLightHelper(fireLight);
        // scene.add(fireHelper);

        // Chimney
        const chimneyColor = groundLoader.load('../static/tex/Chimney/chimney-diffuse.jpg');
        chimneyColor.wrapS = THREE.RepeatWrapping;
        chimneyColor.wrapT = THREE.RepeatWrapping;
        chimneyColor.magFilter = THREE.NearestFilter;
        chimneyColor.colorSpace = THREE.SRGBColorSpace;
        const chimneyNormal = groundLoader.load('../static/tex/Chimney/chimney-normal.jpg');
        chimneyNormal.wrapS = THREE.RepeatWrapping;
        chimneyNormal.wrapT = THREE.RepeatWrapping;
        chimneyNormal.magFilter = THREE.NearestFilter;
        const chimneyDisplacement = groundLoader.load('../static/tex/Chimney/chimney-displacement.jpg');
        chimneyDisplacement.wrapS = THREE.RepeatWrapping;
        chimneyDisplacement.wrapT = THREE.RepeatWrapping;
        chimneyDisplacement.magFilter = THREE.NearestFilter;
        // radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength
        const chimneyGeo = new THREE.CylinderGeometry(4, 6, 14, 12, 5, false, 0, Math.PI * 1.0);
        const chimneyMat = new THREE.MeshPhongMaterial({
            map: chimneyColor,
            normalMap: chimneyNormal,
            displacementMap: chimneyDisplacement,
            side: THREE.DoubleSide,
            
        });
        const chimneyMesh = new THREE.Mesh(chimneyGeo, chimneyMat);
        chimneyMesh.position.set(hearthBoxSize.x + 4.5, hearthBoxSize.y-6,0);
        scene.add(chimneyMesh);
        
    } catch (err) {
        console.error(err);
    }


    // Add soot sprite candies
    const candies = [];
    const candySize = 0.5;
    let refCandy = new Candy();
    refCandy.mesh.position.set(0, 4, 4);
    refCandy.mesh.rotation.x = Math.random();
    refCandy.mesh.rotation.y = Math.random();

    // candies.push(refCandy);
    for (let i = 0; i < 20; i++) {
        let candy = new Candy(candySize);
        candy.mesh.position.set((Math.random() * 40) - (planeSize / 2), candy.radius*2, (Math.random() * 40) - (planeSize / 2));
        candy.mesh.rotation.x = Math.random();
        candy.mesh.rotation.y = Math.random();
        candies.push(candy);
    }

    // Now soot sprites!
    const sprites = [];
    for (let i = 0; i < 25; i++) {
        let sprite = new SootSprite(scene);
        try {
            await sprite.render();
            // console.log(sprite);
        } catch (err) {
            console.error(err);
        }
    }

    const timer = new THREE.Timer();
    let timerElapsed = 0;

    function animate(timestamp) {
        requestAnimationFrame(animate);

        timer.update(timestamp);
        timer.getDelta();
        const timerDelta = timer.getDelta();
        timerElapsed = timer.getElapsed();

        candies.forEach((candy, ndx) => {
            const direction = new THREE.Vector3();
            candy.mesh.getWorldDirection(direction);
            // let deltaX = directionX * timerDelta;
            // let deltaZ = directionZ * timerDelta;
            const rot =  2;
            candy.mesh.rotation.x += rot * timerDelta;
            candy.mesh.rotation.z += rot * timerDelta;
            candy.render(scene);
        });

        renderer.render(scene, camera);

    }
    animate();
}

main();

async function loadObj(scene, objPath, mtlPath, scale = 1) {
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    mtlLoader.load(mtlPath, (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
    })
    // mtlLoader.load(mtlPath, (mtl) => {
    //     mtl.preload();
    //     objLoader.setMaterials(mtl);
    // })
    const object = await objLoader.loadAsync(objPath)
    scene.add(object);
    object.scale.set(scale, scale, scale);

    return object;
}
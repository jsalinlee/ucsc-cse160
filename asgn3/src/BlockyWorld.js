// BlockyAnimal.js
// Vertex shader program
let VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;

    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }
`;

// Fragment shader program
let FSHADER_SOURCE = `
    precision mediump float;

    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform float u_TexColorWeight;

    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;

    uniform int u_WhichTexture;

    vec4 texColor = vec4(0, 0, 0, 0.5);
    vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0);

    void main() {
        if (u_WhichTexture == -2) {
            baseColor = u_FragColor; // Use color
        } else if (u_WhichTexture == -1) {
            baseColor = vec4(v_UV, 1.0, 1.0); // Use UV debug color
        } else if (u_WhichTexture == 0) {
            texColor = texture2D(u_Sampler0, v_UV); // Use texture0
        } else if (u_WhichTexture == 1) { 
            texColor = texture2D(u_Sampler1, v_UV); // Use texture1
        } else {
            baseColor = vec4(1, 0.2, 0.2, 1); // Error, put Redish
        }
        gl_FragColor = (1.0 - u_TexColorWeight) * baseColor + u_TexColorWeight * texColor;
    }
`;

// Color values
const COLOR_BODY = [0.35, 0.2, 0.1, 1];
const COLOR_BONE = [0.8, 0.8, 0.8, 1];

// ------- Global variables ------------------
// WebGL variables
// Vertex shader
let canvas;
let gl;
let a_Position;
let a_UV;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;

// Fragment shader
let u_FragColor;
let u_TexColorWeight;
let u_Sampler0;
let u_Sampler1;
let u_WhichTexture;

// Shape type constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const CUBE = 3;

// Camera
let g_camera;

// Angle variables
// Camera angles
let g_globalAngle = 0;

// Bat angles
let g_pitchAngle = 0;
let g_rollAngle = 0;

// Left wing
let g_lUpArmAngle = 0;
let g_lLowArmAngle = 0;
let g_lOuterFingerAngle = 0;
let g_lMidFingerAngle = 0;
let g_lInnerFingerAngle = 0;

// Right wing
let g_rUpArmAngle = 0;
let g_rLowArmAngle = 0;
let g_rOuterFingerAngle = 0;
let g_rMidFingerAngle = 0;
let g_rInnerFingerAngle = 0;

// Animation booleans
let g_pitchAnimation = false;
let g_rollAnimation = false;
let g_flyingAnimation = false;

// Visual toggles
let g_showSkeleton = false;
// ------- End global variables ------------------

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    
    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    // Get the storage location of u_viewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    // Get the storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
    
    u_TexColorWeight = gl.getUniformLocation(gl.program, 'u_TexColorWeight');
    if (u_TexColorWeight < 0) {
        console.log('Failed to get the storage location of u_TexColorWeight');
        return;
    }

    // Get the storage location of u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if(!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return false;
    }

    // Get the storage location of u_Sampler1
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if(!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return false;
    }

    // Get the storage location of u_whichTexture
    u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
    if(!u_WhichTexture) {
        console.log('Failed to get the storage location of u_WhichTexture');
        return false;
    }

}

// Add event listeners
// UI elements
function addActionsForHtmlUI() {

    // Button events
    document.getElementById('animationPitchOnButton').onclick = function() {g_pitchAnimation = true;};
    document.getElementById('animationPitchOffButton').onclick = function() {g_pitchAnimation = false;};
    document.getElementById('animationRollOnButton').onclick = function() {g_rollAnimation = true;};
    document.getElementById('animationRollOffButton').onclick = function() {g_rollAnimation = false;};
    
    document.getElementById('animationFlightOnButton').onclick = function() {g_flyingAnimation = true;};
    document.getElementById('animationFlightOffButton').onclick = function() {g_flyingAnimation = false;};

    
    document.getElementById('toggleShowSkeleton').onclick = function() {g_showSkeleton = this.checked};

    // Joint movement sliders
    document.getElementById('pitchSlide').addEventListener(
        'mousemove', function() {g_pitchAngle = this.value; renderScene();});
    document.getElementById('rollSlide').addEventListener(
        'mousemove', function() {g_rollAngle = this.value; renderScene();});
    // Left arm
    document.getElementById('lUpArmSlide').addEventListener(
        'mousemove', function() {g_lUpArmAngle = this.value; renderScene();});
    document.getElementById('lLowArmSlide').addEventListener(
        'mousemove', function() {g_lLowArmAngle = this.value; renderScene();});
    document.getElementById('lOuterFingerSlide').addEventListener(
        'mousemove', function() {g_lOuterFingerAngle = this.value; renderScene();});
    document.getElementById('lMidFingerSlide').addEventListener(
        'mousemove', function() {g_lMidFingerAngle = this.value; renderScene();});
    document.getElementById('lInnerFingerSlide').addEventListener(
        'mousemove', function() {g_lInnerFingerAngle = this.value; renderScene();});

    document.getElementById('rUpArmSlide').addEventListener(
        'mousemove', function() {g_rUpArmAngle = this.value; renderScene();});
    document.getElementById('rLowArmSlide').addEventListener(
        'mousemove', function() {g_rLowArmAngle = this.value; renderScene();});
    document.getElementById('rOuterFingerSlide').addEventListener(
        'mousemove', function() {g_rOuterFingerAngle = this.value; renderScene();});
    document.getElementById('rMidFingerSlide').addEventListener(
        'mousemove', function() {g_rMidFingerAngle = this.value; renderScene();});
    document.getElementById('rInnerFingerSlide').addEventListener(
        'mousemove', function() {g_rInnerFingerAngle = this.value; renderScene();});
    
    // Camera movement slider
    document.getElementById('angleSlide').addEventListener(
        'mousemove', function() {g_globalAngle = this.value; renderScene(); });
}

let keys = {};
// Key press events
function addKeyPressEvents() {
    document.onkeydown = keydown;
    document.addEventListener('keydown', (e) => {keys[e.keyCode] = true});
    document.addEventListener('keyup', (e) => {keys[e.keyCode] = false;});
}

function initTextures() {
    let image0 = new Image(); // Create the image object
    if (!image0) {
        console.log('Failed to creat image object');
        return false;
    }

    let image1 = new Image(); // Create the image object
    if (!image1) {
        console.log('Failed to creat image object');
        return false;
    }

    // Register the event handler to be called on loading an image
    image0.onload = function() {sendImageToGLSL(0, image0);};
    image1.onload = function() {sendImageToGLSL(1, image1);};
    
    // Tell the browser to load an image
    image0.src = '../static/sky.jpg';
    image1.src = '../static/uv_grid.jpg';

    // Add more texture loading
    return true;
}

function sendImageToGLSL(texUnit, image) {
    let texture = gl.createTexture(); // Create the texture object
    if(!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    // don't need to flip?
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y-axis

    //Enable texture unit0
    if (texUnit == 0) {
        gl.activeTexture(gl.TEXTURE0);
    } else if (texUnit == 1) {
        gl.activeTexture(gl.TEXTURE1);
    }
    //Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl. RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    if (texUnit == 0) {
        gl.uniform1i(u_Sampler0, texUnit);
    } else if (texUnit == 1) {
        gl.uniform1i(u_Sampler1, texUnit);
    }

    console.log('finished loadTexture for texture unit ' + texUnit);
}

function main() {
    // Set up canvas and gl variables
    setupWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();
    // Set up actions for HTML UI elements
    addActionsForHtmlUI();

    // // Register event handlers for mouse events
    // canvas.onmousedown = (ev) => {
    //     handleClicks(ev);
    // };
    // canvas.onmousemove = function(ev) { if (ev.buttons == 1) handleClicks(ev);};

    // Register event handlers for key presses
    // document.onkeydown = keydown;
    addKeyPressEvents();

    initTextures();
    
    g_camera = new Camera(canvas);
    
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // Start render
    requestAnimationFrame(tick);
    // renderScene();
}

let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;

// Called by the browser repeatedly whenever it's time
function tick() {
    // Print some debug info
    g_seconds=performance.now() / 1000.0 - g_startTime;
    // console.log(performance.now());

    // Update Animation Angles
    updateAnimationAngles();

    // Draw everything
    renderScene();

    // Tell the browser to update again when it's time
    requestAnimationFrame(tick);
}

// Update the angles of everything if currently animated
function updateAnimationAngles() {
    if (g_pitchAnimation) {
        g_pitchAngle = 45 * Math.sin(2*g_seconds);
    }
    if (g_rollAnimation) {
        g_rollAngle = 45 * Math.sin(3*g_seconds);
    }
    if (g_flyingAnimation) {
        // Body
        // g_pitchAngle = -5 * Math.sin(2*g_seconds);

        // Left wing
        g_lUpArmAngle = 30 * Math.sin(2*g_seconds) - 30 + 30 * Math.cos(2*g_seconds);
        g_lLowArmAngle = -30 * Math.sin(2*g_seconds);
        g_lOuterFingerAngle = 45 * Math.sin(2*g_seconds);
        g_lMidFingerAngle = 45 * Math.sin(2*g_seconds);
        g_lInnerFingerAngle = 45 * Math.sin(2*g_seconds);

        // Right wing
        g_rUpArmAngle = 30 * Math.sin(2*g_seconds) - 30 + 30 * Math.cos(2*g_seconds);
        g_rLowArmAngle = -30 * Math.sin(2*g_seconds);
        g_rOuterFingerAngle = 45 * Math.sin(2*g_seconds);
        g_rMidFingerAngle = 45 * Math.sin(2*g_seconds);
        g_rInnerFingerAngle = 45 * Math.sin(2*g_seconds);
    }
}

function keydown(ev) {
    // while (keys[68]) {
    //     console.log("HEY");
    //     g_camera.right();
    // }

    // while (ev.keyCode == 65) {
    //     g_camera.left();
    // }
    // while (ev.keyCode == 87) {
    //     g_camera.forward();
    // }

    // while (ev.keyCode == 83) {
    //     g_camera.back();
    // }

    switch (ev.keyCode) {
        case 68:
            g_camera.moveRight();
            break;
        case 65:
            g_camera.moveLeft();
            break;
        case 87:
            g_camera.moveForward();
            break;
        case 83:
            g_camera.moveBack();
            break;
        case 81:
            g_camera.panLeft();
            break;
        case 69:
        default:

    }

    renderScene();
    console.log(ev.keyCode);
}

let worldMap = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
]

function generateMap(width, length) {
    let world = [];

    for (x = 0; x < width; x++) {
        let strip = [];
        for (y = 0; y < length; y++) {
            strip.push(1);
        }
        world.push(strip);
    }

    return world;
}

function drawAThisWorld(map) {
    for (x = 0; x < map.length; x++) {
        for (y = 0; y < map[x].length; y++) {
            if (map[x][y] == 1) {
                thisWorldBlock = new Cube();
                thisWorldBlock.color = [0.8, 1.0, 1.0, 1.0];
                thisWorldBlock.matrix.translate(0, -0.75, 0);
                thisWorldBlock.matrix.scale(0.3, 0.3, 0.3);
                thisWorldBlock.matrix.translate(x - map.length / 2, 0, y - map[x].length / 2);
                thisWorldBlock.render();
            }
        }
    }
}

function drawMap() {
    for (x = 0; x < worldMap.length; x++) {
        for (y = 0; y < worldMap[x].length; y++) {
            if (worldMap[x][y] == 1) {
                worldBlock = new Cube();
                worldBlock.color = [0.8, 1.0, 1.0, 1.0];
                worldBlock.matrix.translate(0, -0.75, 0);
                worldBlock.matrix.scale(0.3, 0.3, 0.3);
                worldBlock.matrix.translate(x - worldMap.length / 2, 0, y - worldMap[x].length / 2);
                worldBlock.render();
            }
        }
    }
}

// Draw every shape that is supposed to be in the canvas
function renderScene() {

    // Uncomment for performance testing
    let startTime = performance.now();
    
    // Set up camera view
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

    // Pass the matrix to u_GlobalRotateMatrix attribute
    let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let skybox = new Cube();
    skybox.color = [0.31, 0.62, 0.95, 1.0];
    skybox.textureNum = 0;
    skybox.matrix.scale(50, 50, 50);
    skybox.matrix.translate(-0.5, -0.5, -0.5);
    skybox.render();
    
    let floor = new Cube();
    skybox.color = [1.0, 0.0, 0.0, 1.0];
    floor.textureNum = 1;
    floor.matrix.translate(0, -0.75, 0.0);
    floor.matrix.scale(10, 0.001, 10);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.render();

    // drawMap();
    drawAThisWorld(generateMap(1, 1));
    drawBat();

    // Uncomment for performance testing 
    let duration = performance.now() - startTime;
    sendTextToHTML("FPS: " + Math.floor(10000/duration)/10, "numdot");
}

function drawBat() {
    let modelMatrix = new Matrix4();
    let bodyMat = new Matrix4();
    bodyMat.rotate(-g_pitchAngle, 1, 0, 0);
    bodyMat.rotate(-g_rollAngle, 0, 0, 1);

    // Head
    let head = new Cube();
    head.color = COLOR_BODY;
    head.matrix.translate(0, 0.1, -0.01);
    head.matrix.rotate(-30, 1, 0, 0);
    let headCoordinates = new Matrix4(head.matrix);
    head.matrix.scale(0.05, 0.05, 0.1);
    head.matrix.translate(-0.5, -0.5, -2.5);
    head.matrix = (new Matrix4(bodyMat)).multiply(head.matrix);
    head.render();
    
    // Left ear
    let leftEar = new Cube();
    head.color = COLOR_BODY;
    leftEar.matrix = new Matrix4(headCoordinates);
    leftEar.matrix.scale(0.075, 0.09, 0.05);
    leftEar.matrix.translate(0.55, 0.5, -4);
    leftEar.matrix.rotate(15, 1, 0, -1);
    leftEar.matrix = (new Matrix4(bodyMat)).multiply(leftEar.matrix);
    // drawCube(modelMatrix, COLOR_BODY);
    leftEar.render();
    
    // Right ear
    rightEar = new Cube();
    rightEar.color = COLOR_BODY;
    rightEar.textureNum = 0
    rightEar.matrix = new Matrix4(headCoordinates);
    rightEar.matrix.scale(0.075, 0.09, 0.05);
    rightEar.matrix.translate(-1.5, 0.3, -4);
    rightEar.matrix.rotate(15, 1, 0, 1);
    rightEar.matrix = (new Matrix4(bodyMat)).multiply(rightEar.matrix);
    rightEar.render();
}

function sendTextToHTML(text, htmlID) {
    var htmlEle = document.getElementById(htmlID);
    if (!htmlEle) {
        console.log("Failed to get " + htmlID + " from HTML");
    }
    htmlEle.innerHTML = text;
}

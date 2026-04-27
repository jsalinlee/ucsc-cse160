// BlockyAnimal.js
// Vertex shader program
let VSHADER_SOURCE = `
    attribute vec4 a_Position;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;

    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }
`;

// Fragment shader program
let FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;

    void main() {
        gl_FragColor = u_FragColor;
    }
`;

// Color values
const COLOR_BODY = [0.35, 0.2, 0.1, 1];
const COLOR_BONE = [0.8, 0.8, 0.8, 1];

// ------- Global variables ------------------
// WebGL variables
let canvas;
let gl;
let a_Position;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_FragColor;

// Shape type constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;


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

// Development initialization values
// Set default angle to make modeling easier
g_globalAngle = 180;
g_pitchAngle = -90;

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

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (u_Size < 0) {
        console.log('Failed to get the storage location of u_Size');
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
}

// Add event listeners
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
        'mousemove', function() {g_rUpArmAngle = this.value; renderScene();});
    
    // Camera movement slider
    document.getElementById('angleSlide').addEventListener(
        'mousemove', function() {g_globalAngle = this.value; renderScene(); });
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

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Start render
    requestAnimationFrame(tick);
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
        g_pitchAngle = 45 * Math.sin(g_seconds);
    }
    if (g_rollAnimation) {
        g_rollAngle = 45 * Math.sin(3*g_seconds);
    }
    if (g_flyingAnimation) {
        // Left wing
        g_lUpArmAngle = 45 * Math.sin(2*g_seconds);
        g_lLowArmAngle = 45 * Math.sin(2*g_seconds);
        g_lOuterFingerAngle = 45 * Math.sin(2*g_seconds);
        g_lMidFingerAngle = 45 * Math.sin(2*g_seconds);
        g_lInnerFingerAngle = 45 * Math.sin(2*g_seconds);

        // Right wing
        g_rUpArmAngle = 45 * Math.sin(2*g_seconds);
        g_rLowArmAngle = 45 * Math.sin(2*g_seconds);
        g_rHAngle = 45 * Math.sin(2*g_seconds);
    }
}

function drawCube(mat, color) {
    let newCube = new Cube();
    newCube.matrix = mat;
    newCube.color = color;
    newCube.render();
}

// Draw every shape that is supposed to be in the canvas
function renderScene() {

    // Uncomment for performance testing
    var startTime = performance.now();
    
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Pass the matrix to u_GlobalRotateMatrix attribute
    let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    
    drawBat();

    // Uncomment for performance testing 
    var duration = performance.now() - startTime;
    sendTextToHTML("FPS: " + Math.floor(10000/duration)/10, "numdot");
}

function drawBat() {
    let modelMatrix = new Matrix4();
    let bodyMat = new Matrix4();
    bodyMat.rotate(-g_pitchAngle, 1, 0, 0);
    bodyMat.rotate(-g_rollAngle, 0, 0, 1);

    // Shoulders
    let shoulderMat = new Matrix4();
    shoulderMat.scale(0.24, 0.06, 0.06);
    shoulderMat.translate(-0.5, -0.5, -1.3);
    modelMatrix.set(bodyMat);
    modelMatrix.multiply(shoulderMat);
    drawCube(modelMatrix, COLOR_BONE);
    modelMatrix.setIdentity();

    // Spine
    let spineMat = new Matrix4();
    spineMat.scale(0.06, 0.06, 0.3);
    spineMat.translate(-0.5, -0.5, -0.5);
    modelMatrix.set(bodyMat);
    modelMatrix.multiply(spineMat);
    drawCube(modelMatrix, COLOR_BONE);
    modelMatrix.setIdentity();
    
    
    // Left arm
    // Left upper arm
    modelMatrix.translate(0.12, 0, -0.05);
    modelMatrix.rotate(g_lUpArmAngle - 45, 0, 1, 0);
    let upperLArmCoordinates = new Matrix4(modelMatrix);
    modelMatrix.scale(0.15, 0.05, 0.05);
    modelMatrix.translate(0, -0.5, -0.5);
    modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
    drawCube(modelMatrix, COLOR_BONE);
    modelMatrix.setIdentity();
    
    // Left lower arm better?
    modelMatrix = new Matrix4(upperLArmCoordinates);
    modelMatrix.translate(0.15, -0.02, 0);
    modelMatrix.rotate(100, 0, 1, 0);
    modelMatrix.rotate(g_lLowArmAngle, 0, 0, 1);
    modelMatrix.scale(0.7, 0.7, 0.7);
    let lowerLArmCoordinates = new Matrix4(modelMatrix);
    modelMatrix.scale(0.3, 0.05, 0.05);
    modelMatrix.translate(0, 0, -1);
    modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
    drawCube(modelMatrix, COLOR_BONE);
    modelMatrix.setIdentity();
    
    // Left outer finger
    modelMatrix = new Matrix4(lowerLArmCoordinates);
    modelMatrix.translate(0.3, 0, 0);
    modelMatrix.rotate(-60, 0, 1, 0);
    modelMatrix.rotate(g_lOuterFingerAngle, 0, 0, 1);
    modelMatrix.scale(0.7, 0.03, 0.03);
    modelMatrix.translate(0, 0.3, 0);
    let lOuterFingerCoordinates = new Matrix4(modelMatrix);
    modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
    drawCube(modelMatrix, COLOR_BONE);
    modelMatrix.setIdentity();

    // Left middle finger
    modelMatrix = new Matrix4(lowerLArmCoordinates);
    modelMatrix.translate(0.3, 0, 0);
    modelMatrix.rotate(-90, 0, 1, 0);
    modelMatrix.rotate(g_lMidFingerAngle, 0, 0, 1);
    modelMatrix.scale(0.5, 0.03, 0.03);
    modelMatrix.translate(0, 0.3, 0);
    let lMidFingerCoordinates = new Matrix4(modelMatrix);
    modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
    drawCube(modelMatrix, COLOR_BONE);
    modelMatrix.setIdentity();
    
    // Left inner finger
    modelMatrix = new Matrix4(lowerLArmCoordinates);
    modelMatrix.translate(0.3, 0, 0);
    modelMatrix.rotate(-120, 0, 1, 0);
    modelMatrix.rotate(g_lMidFingerAngle, 0, 0, 1);
    modelMatrix.scale(0.45, 0.03, 0.03);
    modelMatrix.translate(0, 0.3, 0);
    let lInnerFingerCoordinates = new Matrix4(modelMatrix);
    modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
    drawCube(modelMatrix, COLOR_BONE);
    modelMatrix.setIdentity();

    // Right arm
    // Right upper arm
    modelMatrix.translate(-0.12, 0, -0.05);
    modelMatrix.rotate(225, 0, 1, 0);
    modelMatrix.rotate(-g_rUpArmAngle, 0, 1, 0);
    let upperRArmCoordinates = new Matrix4(modelMatrix);
    modelMatrix.scale(0.15, 0.05, 0.05);
    modelMatrix.translate(0, -0.5, -0.5);
    modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
    drawCube(modelMatrix, COLOR_BONE);
    modelMatrix.setIdentity();
    
    // let leftUpArmCoordinateMat = new Matrix4(modelMatrix);
    // modelMatrix.setIdentity();
    // modelMatrix.rotate(g_leftUpArmAngle, 0, 1, 0);
    // modelMatrix = modelMatrix.multiply(leftUpArmCoordinateMat);
    // modelMatrix.translate(1.5, 0, 0);
    // drawCube(modelMatrix, COLOR_BODY);
    
    // modelMatrix = new Matrix4(bodyCoordinateMat);
    // modelMatrix.translate(-0.1, 0, -0.05);
    // modelMatrix.rotate(225, 0, 1, 0);
    // modelMatrix.rotate(-g_rightUpArmAngle, 0, 1, 0);
    // modelMatrix.scale(0.1, 0.06, 0.06);
    // modelMatrix.translate(0, -0.5, -0.5);
    // drawCube(modelMatrix, COLOR_BODY);

    
    if (!g_showSkeleton) {
        // Draw the body
        modelMatrix.scale(0.2, 0.17, 0.301);
        modelMatrix.translate(-0.5, -0.5, -0.5);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        drawCube(modelMatrix, COLOR_BODY);
        modelMatrix.setIdentity();


        // modelMatrix = spineMat;
        // modelMatrix.scale(1.5, 1.5, 1.5);
        // // modelMatrix.translate(-0.5, -0.5, -0.5);
        // drawCube(modelMatrix, COLOR_BODY);
        // modelMatrix = bodyCoordinateMat;
        // modelMatrix.scale(0.8, 0.2, 0.8);
        // modelMatrix.translate(0.125, 5, 0.125);
        // drawCube(modelMatrix, COLOR_BONE);
        // modelMatrix.setIdentity();
        
        // // Draw a left arm
        // modelMatrix.translate(0, -0.5, 0);
        // // modelMatrix.rotate(-5, 1, 0, 0);
        // modelMatrix.rotate(-g_pitchAngle, 0, 0, 1);
        // let pitchCoordinatesMat = new Matrix4(modelMatrix);
        // modelMatrix.scale(0.25, 0.7, 0.5);
        // modelMatrix.translate(-0.5, 0, 0);
        // drawCube(modelMatrix, [1,1,0,1]);
        // modelMatrix.setIdentity();
        
        // // Test box
        // modelMatrix = pitchCoordinatesMat;
        // modelMatrix.translate(0, 0.65, 0);
        // modelMatrix.rotate(-g_rollAngle, 0, 0, 1);
        // modelMatrix.scale(0.3, 0.3, 0.3);
        // modelMatrix.translate(-0.5, 0, -0.001);
        // drawCube(modelMatrix, [1, 0, 1, 1]);
        // modelMatrix.setIdentity();
    }
}

function sendTextToHTML(text, htmlID) {
    var htmlEle = document.getElementById(htmlID);
    if (!htmlEle) {
        console.log("Failed to get " + htmlID + " from HTML");
    }
    htmlEle.innerHTML = text;
}

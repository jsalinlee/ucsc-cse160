// BlockyAnimal.js

// Vertex shader program
let VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec4 a_Color;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;

    varying vec4 v_Color;

    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_Color = a_Color;
    }
`;

// Fragment shader program
let FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;

    void main() {
        gl_FragColor = v_Color;
    }
`;
// // Vertex shader program
// let VSHADER_SOURCE = `
//     attribute vec4 a_Position;

//     uniform mat4 u_ModelMatrix;
//     uniform mat4 u_GlobalRotateMatrix;

//     void main() {
//         gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
//     }
// `;

// // Fragment shader program
// let FSHADER_SOURCE = `
//     precision mediump float;
//     uniform vec4 u_FragColor;

//     void main() {
//         gl_FragColor = u_FragColor;
//     }
// `;

// Color values
const COLOR_BODY = [0.35, 0.2, 0.1, 1];
const COLOR_BONE = [0.8, 0.8, 0.8, 1];

// Global variables
let canvas;
let gl;
let a_Position;
let a_Color;
let u_Size = 10.0;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl', { preserveDrawingBuffer: true });

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
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

    a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
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

// Type constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5.0;
let g_selectedType = POINT;

// Set default angle to make modeling easier
let g_globalAngle = 0;
// let g_globalAngle = 90;

let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;

function addActionsForHtmlUI() {

    // Button events
    document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation = true;};
    document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation = false;};
    document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation = true;};
    document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation = false;};

    // Joint movement sliders
    document.getElementById('yellowSlide').addEventListener('mousemove', function() {g_yellowAngle = this.value; renderScene();});
    document.getElementById('magentaSlide').addEventListener('mousemove', function() {g_magentaAngle = this.value; renderScene();});

    // document.getElementById('angleSlide').addEventListener('mouseup', function() {g_globalAngle = this.value; renderScene(); });
    document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderScene(); });
}

function main() {
    // Set up canvas and gl variables
    setupWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();
    
    // Set up actions for HTML UI elements
    addActionsForHtmlUI();
    // Register event handlers for mouse events
    canvas.onmousedown = (ev) => {
        handleClicks(ev);
    };
    canvas.onmousemove = function(ev) { if (ev.buttons == 1) handleClicks(ev);};

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
    if (g_yellowAnimation) {
        g_yellowAngle = 45 * Math.sin(g_seconds);
    }
    if (g_magentaAnimation) {
        g_magentaAngle = 45 * Math.sin(3*g_seconds);
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
    // let modelMatrix = new Matrix4();

    // modelMatrix.setTranslate(-0.25, -0.75, 0);
    // modelMatrix.scale(0.5, 0.3, 0.5);
    // // Draw the body cube
    // drawCube(modelMatrix, COLOR_BODY);

    // // Draw a left arm
    // modelMatrix.setTranslate(0, -0.5, 0);
    // modelMatrix.rotate(-5, 1, 0, 0);
    // modelMatrix.rotate(-g_yellowAngle, 0, 0, 1);
    // let yellowCoordinatesMat = new Matrix4(modelMatrix);
    // modelMatrix.scale(0.25, 0.7, 0.5);
    // modelMatrix.translate(-0.5, 0, 0);
    // drawCube(modelMatrix, [1,1,0,1]);

    // // Test box
    // modelMatrix = yellowCoordinatesMat;
    // modelMatrix.translate(0, 0.65, 0);
    // modelMatrix.rotate(-g_magentaAngle, 0, 0, 1);
    // modelMatrix.scale(0.3, 0.3, 0.3);
    // modelMatrix.translate(-0.5, 0, -0.001);
    // drawCube(modelMatrix, [1, 0, 1, 1]);

    // Uncomment for performance testing 
    var duration = performance.now() - startTime;
    sendTextToHTML("FPS: " + Math.floor(10000/duration)/10, "numdot");
}

function drawBat() {
    let modelMatrix = new Matrix4();
    
    // Draw the skeleton
    // modelMatrix.translate(0, -0.5, 0);
    modelMatrix.rotate(-g_yellowAngle, 1, 0, 0);
    modelMatrix.scale(0.08, 0.08, 1);
    modelMatrix.translate(-0.5, -0.5, -0.5);
    let bodyCoordinateMat = new Matrix4(modelMatrix);
    drawCube(modelMatrix, COLOR_BONE);
    modelMatrix.rotate(90, 0, 1, 0);
    modelMatrix.translate(-0.05, 0, -0.25);
    modelMatrix.scale(0.08, 0.08, 0.5);
    modelMatrix = bodyCoordinateMat;
    // modelMatrix.scale(0.3, 0.03, 0.4);
    modelMatrix.translate(-0.15, 0.1255, -0.2);
    // drawCube(modelMatrix, COLOR_BODY);
    modelMatrix.setIdentity();

    // // Draw the body
    // modelMatrix.translate(0, -0.125, 0);
    // modelMatrix.rotate(90, 0, 1, 0);
    // modelMatrix.rotate(-g_yellowAngle, 0, 0, 1);
    // modelMatrix.translate(-0.2, 0, -0.25);
    // modelMatrix.scale(0.5, 0.25, 0.4);
    // let bodyCoordinateMat = new Matrix4(modelMatrix);
    // drawCube(modelMatrix, COLOR_BODY);
    // modelMatrix = bodyCoordinateMat;
    // modelMatrix.scale(0.8, 0.2, 0.8);
    // modelMatrix.translate(0.125, 5, 0.125);
    // drawCube(modelMatrix, COLOR_BONE);
    // modelMatrix.setIdentity();
    
    // // Draw a left arm
    // modelMatrix.translate(0, -0.5, 0);
    // // modelMatrix.rotate(-5, 1, 0, 0);
    // modelMatrix.rotate(-g_yellowAngle, 0, 0, 1);
    // let yellowCoordinatesMat = new Matrix4(modelMatrix);
    // modelMatrix.scale(0.25, 0.7, 0.5);
    // modelMatrix.translate(-0.5, 0, 0);
    // drawCube(modelMatrix, [1,1,0,1]);
    // modelMatrix.setIdentity();
    
    // // Test box
    // modelMatrix = yellowCoordinatesMat;
    // modelMatrix.translate(0, 0.65, 0);
    // modelMatrix.rotate(-g_magentaAngle, 0, 0, 1);
    // modelMatrix.scale(0.3, 0.3, 0.3);
    // modelMatrix.translate(-0.5, 0, -0.001);
    // drawCube(modelMatrix, [1, 0, 1, 1]);
    // modelMatrix.setIdentity();
}

function sendTextToHTML(text, htmlID) {
    var htmlEle = document.getElementById(htmlID);
    if (!htmlEle) {
        console.log("Failed to get " + htmlID + " from HTML");
    }
    htmlEle.innerHTML = text;
}

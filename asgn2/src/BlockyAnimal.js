// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    void main() {
        gl_Position = u_ModelMatrix * a_Position;
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

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size = 10.0;
let u_ModelMatrix;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl', { preserveDrawingBuffer: true });

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
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

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
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
}

// Type constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5.0;
let g_selectedType = POINT;
let circleSegments = 10;

// Mandala Mode global variables
let mandalaMode = false;
let mandalaSegments = 6;

function addActionsForHtmlUI() {
    // Clear canvas event
    document.getElementById('clearButton').onclick = function() {g_shapesList = []; renderAllShapes();};

    // Slider Events
    document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100});
    document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100});
    document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100});
    
    // Shape slider events
    document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value});
    document.getElementById('circlinessSlide').addEventListener('mouseup', function() {circleSegments = this.value});
    
    // Shape select events
    document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
    document.getElementById('triButton').onclick = function() {g_selectedType=TRIANGLE};
    document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};
    
    // Bonus
    document.getElementById('mandalaMode').onclick = toggleMandalaMode;
    document.getElementById('mandalaSlide').addEventListener('mouseup', function() {mandalaSegments = this.value});
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = (ev) => {
        handleClicks(ev);
    };
    canvas.onmousemove = function(ev) { if (ev.buttons == 1) handleClicks(ev);};

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    // gl.clear(gl.COLOR_BUFFER_BIT);
    renderAllShapes();
}

// Array of all shapes to render
let g_shapesList = [];

function handleClicks(ev) {
    // Extract coordinates from click event and return in WebGL-converted coordinates.
    let [x, y] = convertCoordinatesEventToGL(ev);

    // let point = new Point("point", [x, y, 0.0], g_selectedColor.slice(), g_selectedSize);
    let point;
    if (g_selectedType == POINT) {
        point = new Point();
    } else if (g_selectedType == TRIANGLE) {
        point = new Triangle([x, y, 0.0], g_selectedColor, g_selectedSize);
    } else {
        point = new Circle(circleSegments);
    }
    point.position=[x,y];
    point.color = g_selectedColor.slice();
    point.size=g_selectedSize;
    g_shapesList.push(point);
    
    if (mandalaMode) {
       addMandalaPoints(point);
    }
    
    // Draw every shape that is supposed to be in the canvas
    renderAllShapes();
}

// Extract event click and return WebGL-converted coordinates
function convertCoordinatesEventToGL(ev) {
    let x = ev.clientX; // x coordinate of a mouse pointer
    let y = ev.clientY; // y coordinate of a mouse pointer
    let rect = ev.target.getBoundingClientRect();

    x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
    return [x, y];
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

    // Uncomment for performance testing
    // var startTime = performance.now();
    var startTime = performance.now();
    
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw a test triangle
    drawTriangle3D([-1.0, 0.0, 0.0,    -0.5, -1.0, 0.0,    0.0, 0.0, 0.0]);

    // Draw a cube
    let body = new Cube();
    body.color = [1.0, 0.0, 0.0, 1.0];
    body.matrix.setTranslate(-0.25, -0.5, 0.0);
    body.matrix.scale(0.5, 1.0, 0.5);
    body.render();

    // Draw a left arm
    var leftArm = new Cube();
    leftArm.color = [1.0, 1.0, 0.0, 1.0];
    leftArm.matrix.setTranslate(0.7, 0.0, 0.0);
    leftArm.matrix.rotate(45, 0, 0, 1);
    leftArm.matrix.scale(0.25, 0.7, 0.5);
    leftArm.render();

    // Uncomment for performance testing 
    // var duration = performance.now() - startTime;
    // sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
    var htmlEle = document.getElementById(htmlID);
    if (!htmlEle) {
        console.log("Failed to get " + htmlID + " from HTML");
    }
    htmlEle.innerHTML = text;
}

// convert canvas coordinates to WebGL coordinates
function convertToGLCoordinates(x, y, z = 0.0) {
    x = (x - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - y) / (canvas.height / 2);
    return [x, y, z];
}

function cookBreakfast() {
    // table
    let table = [
        [-1.0, 1.0, -1.0, -1.0, 1.0, 1.0],
        [1.0, 1.0, -1.0, -1.0, 1.0, -1.0],
    ]

    let utensils = [
        // Fork
        [-0.7, 0.5, -0.7, 0.3, -0.65, 0.3],
        [-0.65, 0.5, -0.65, 0.3, -0.6, 0.3],
        [-0.6, 0.5, -0.6, 0.3, -0.55, 0.3],
        [-0.7, 0.3, -0.7, 0.2, -0.55, 0.3],
        [-0.55, 0.3, -0.7, 0.2, -0.55, 0.2,],
        [-0.7, 0.2, -0.65, 0.1, -0.6, 0.1],
        [ -0.7, 0.2, -0.6, 0.1, -0.55, 0.2],
        [-0.65, 0.1, -0.6, 0.1, -0.6, -0.3],
        [-0.65, 0.1, -0.65, -0.28, -0.6, -0.28],
        
        // Spoons
        [-0.95, -0.25, -1.0, -0.3, -0.9, -0.3],
        [-1.0, -0.35, -0.9, -0.35, -0.95, -0.4],
        [-1.0, -0.3, -1.0, -0.35, -0.6, -0.3],
        [-0.6, -0.3, -1.0, -0.35, -0.6, -0.35],
        
        [0.95, -0.25, 0.9, -0.3, 1.0, -0.3],
        [1.0, -0.35, 0.95, -0.4, 0.9, -0.35],
        [1.0, -0.3, 0.6, -0.3, 1.0, -0.35],
        [0.6, -0.3, 0.6, -0.35, 1.0, -0.35],
        
        // Knife
        [0.6, 0.6, 0.6, 0.3, 0.7, 0.4],
        [0.7, 0.4, 0.6, 0.3, 0.7, 0.3],
        [0.6, 0.3, 0.6, 0.1, 0.65, 0.1],
        [0.6, 0.3, 0.65, 0.1, 0.7, 0.3],
        [0.6, 0.1, 0.6, -0.28, 0.65, 0.1],
        [0.65, 0.1, 0.6, -0.28, 0.65, -0.28],
    ];

    let plate = [
        // Plate
        [-0.4, 0.4, -0.4, -0.3, 0.4, 0.4],
        [-0.4, -0.3, 0.4, 0.4, 0.4, -0.3],
        
        [-0.2, 0.5, -0.4, 0.4, -0.2, 0.4],
        [-0.2, 0.5, -0.2, 0.4, 0.2, 0.5],
        [0.2, 0.5, -0.2, 0.4, 0.4, 0.4],
        
        [-0.4, 0.4, -0.5, 0.2, -0.4, -0.1],
        [-0.5, 0.2, -0.5, -0.1, -0.4, -0.1],
        [-0.5, -0.1, -0.4, -0.3, -0.4, -0.1],

        [-0.4, -0.3, -0.2, -0.4, -0.2, -0.3],
        [-0.2, -0.3, -0.2, -0.4, 0.2, -0.4],
        [-0.2, -0.3, 0.2, -0.4, 0.4, -0.3],

        [0.4, 0.4, 0.4, -0.1, 0.5, 0.2],
        [0.5, 0.2, 0.4, -0.1, 0.5, -0.1],
        [0.4, -0.1, 0.4, -0.3, 0.5, -0.1]
    ];

    // Bacon
    let bacon = [
        [-0.25, 0.4, -0.2, 0.2, -0.2, 0.4],
        [-0.2, 0.4, -0.25, 0.0, -0.15, 0.2],
        [-0.2, 0.2, -0.3, 0.0, -0.25, 0.0],
        [-0.3, 0.0, -0.3, -0.2, -0.25, 0.0],
        [-0.3, 0.0, -0.35, -0.2, -0.3, -0.2],

        [-0.15, 0.4, -0.1, 0.2, -0.1, 0.4],
        [-0.1, 0.4, -0.15, 0.0, -0.05, 0.2],
        [-0.1, 0.2, -0.2, 0.0, -0.15, 0.0],
        [-0.2, -0.0, -0.2, -0.2, -0.15, -0.2],
        [-0.2, 0.0, -0.15, -0.2, -0.15, 0.0],
    ];

    // Egg whites
    let eggWhites = [
        [0.1, 0.3, 0.0, 0.2, 0.1, 0.0],
        [0.0, 0.2, 0.0, 0.1, 0.1, 0.0],
        [0.1, 0.3, 0.1, -0.1, 0.2, 0.3],
        [0.2, 0.3, 0.1, -0.1, 0.2, -0.2],
        [0.2, 0.3, 0.1, -0.1, 0.2, -0.1], 
        [0.2, 0.3, 0.2, -0.2, 0.3, -0.2],
        [0.2, 0.3, 0.3, -0.2, 0.3, 0.2],
        [0.3, 0.1, 0.3, -0.2, 0.4, -0.1],
        [0.3, 0.1, 0.4, 0.0, 0.4, -0.1]
    ]

    // Egg yolk
    let eggYolks = [
        [0.15, 0.22, 0.1, 0.15, 0.15, 0.1],
        [0.15, 0.22, 0.15, 0.1, 0.22, 0.15],
        [0.23, 0.01, 0.2, -0.05, 0.32, -0.03],
        [0.2, -0.05, 0.25, -0.1, 0.32, -0.03],
    ]
    
    let tableColor = [0.73, 0.55, 0.39, 1.0];
    let utensilsColor = [0.75, 0.75, 0.75, 1.0];
    let plateColor = [0.68, 0.88, 0.82, 1.0];
    let baconColor = [0.62, 0.07, 0.07, 1.0];
    let eggWhitesColor = [0.93, 0.92, 0.87, 1.0];
    let eggYolksColor = [1.0, 0.8, 0.37, 1.0];

    // Add every triangle in drawing to shapes List
    table.forEach((tri) => { g_shapesList.push(new Triangle(tri, tableColor))});
    utensils.forEach((tri) => { g_shapesList.push(new Triangle(tri, utensilsColor))});
    plate.forEach((tri) => { g_shapesList.push(new Triangle(tri, plateColor))});
    bacon.forEach((tri) => { g_shapesList.push(new Triangle(tri, baconColor))});
    eggWhites.forEach((tri) => { g_shapesList.push(new Triangle(tri, eggWhitesColor))});
    eggYolks.forEach((tri) => { g_shapesList.push(new Triangle(tri, eggYolksColor))});

    // gl.uniform4f(u_FragColor, 0.73, 0.55, 0.39, 1.0);
    // table.forEach((tri) => {drawTriangle(tri)});
    // gl.uniform4f(u_FragColor, 0.75, 0.75, 0.75, 1.0);
    // utensils.forEach((tri) => {drawTriangle(tri)});

    // gl.uniform4f(u_FragColor, 0.68, 0.88, 0.82, 1.0);
    // plate.forEach((tri) => {drawTriangle(tri)});

    // gl.uniform4f(u_FragColor, 0.62, 0.07, 0.07, 1.0);
    // bacon.forEach((tri) => {drawTriangle(tri)});

    // gl.uniform4f(u_FragColor, 0.93, 0.92, 0.87, 1.0);
    // eggWhites.forEach((tri) => {drawTriangle(tri)});

    // gl.uniform4f(u_FragColor, 1.0, 0.8, 0.37, 1.0);
    // eggYolks.forEach((tri) => {drawTriangle(tri)});
    renderAllShapes();
}

function toggleMandalaMode() {
    mandalaMode = !mandalaMode;
}

// Takes a Point object and adds n reflected points (about the origin) to g_shapesList to be rendered
function addMandalaPoints(point) {
    // Calculate points
    let x = point.position[0];
    let y = point.position[1];

    let angleStep = 360/mandalaSegments;
    for (let angle = 0; angle < 360; angle += angleStep) {
        let reflectedPoint = Object.assign(Object.create(Object.getPrototypeOf(point)), point);

        // Reflect around origin
        
        let reflectionAngle = angle + angleStep;
        reflectedPoint.position = [
            x * Math.cos(reflectionAngle * Math.PI/180) - y * Math.sin(reflectionAngle * Math.PI/180),
            x * Math.sin(reflectionAngle * Math.PI/180) + y * Math.cos(reflectionAngle * Math.PI/180)];
        g_shapesList.push(reflectedPoint);
    }
}

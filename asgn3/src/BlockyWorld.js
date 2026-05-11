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
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;

    uniform int u_WhichTexture;

    vec4 texColor = vec4(0, 0, 0, 0.5);
    vec4 baseColor = u_FragColor;

    void main() {
        baseColor = u_FragColor; // Default use color

        if (u_WhichTexture == -1) {
            baseColor = vec4(1, 0.2, 0.2, 1); // Error, put Redish
        } else if (u_WhichTexture == 0) {
            // baseColor = vec4(v_UV, 1.0, 1.0); // Use UV debug color
            texColor = texture2D(u_Sampler0, v_UV); // Use texture0 (debug texture)
        } else if (u_WhichTexture == 1) {
            texColor = texture2D(u_Sampler1, v_UV); // Use texture1
        } else if (u_WhichTexture == 2) { 
            texColor = texture2D(u_Sampler2, v_UV); // Use texture2
        } else if (u_WhichTexture == 3) { 
            texColor = texture2D(u_Sampler3, v_UV); // Use texture3
        }
        gl_FragColor = (1.0 - u_TexColorWeight) * baseColor + u_TexColorWeight * texColor;
    }
`;

// Constants
const MAX_WORLD_HEIGHT = 4;

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
let u_Sampler2;
let u_Sampler3;
let u_WhichTexture;

// Shape type constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const CUBE = 3;

// Camera
let g_camera;

// World variables
let g_worldMap;
let g_worldTerrainDensity = 0.1;

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
    // Get the storage location of u_Sampler2
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if(!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return false;
    }
    // Get the storage location of u_Sampler3
    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if(!u_Sampler3) {
        console.log('Failed to get the storage location of u_Sampler3');
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

    let image2 = new Image(); // Create the image object
    if (!image2) {
        console.log('Failed to creat image object');
        return false;
    }
    
    let image3 = new Image(); // Create the image object
    if (!image3) {
        console.log('Failed to creat image object');
        return false;
    }

    // Register the event handler to be called on loading an image
    image0.onload = function() {sendImageToGLSL(0, image0);};
    image1.onload = function() {sendImageToGLSL(1, image1);};
    image2.onload = function() {sendImageToGLSL(2, image2);};
    image3.onload = function() {sendImageToGLSL(3, image3);};
    
    // Tell the browser to load an image
    image0.src = '../static/uv_grid.jpg';
    image1.src = '../static/sky.jpg';
    image2.src = '../static/ground.jpg';
    image3.src = '../static/dirt.jpg';

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
    } else if (texUnit == 2) {
        gl.activeTexture(gl.TEXTURE2);
    } else if (texUnit == 3) {
        gl.activeTexture(gl.TEXTURE3);
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
    } else if (texUnit == 2) {
        gl.uniform1i(u_Sampler2, texUnit);
    } else if (texUnit == 3) {
        gl.uniform1i(u_Sampler3, texUnit);
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
    g_worldMap = generateMap(32, 32);

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
            g_camera.panRight();
            break;
        case 71:
            world = generateMap(32, 32);
            break;
        default:
            break;
    }
    renderScene();
}

// Draw every shape that is supposed to be in the canvas
function renderScene() {

    // Uncomment for performance testing
    let startTime = performance.now();
    
    // Update camera view
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

    // Pass the matrix to u_GlobalRotateMatrix attribute
    let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawAThisWorld(g_worldMap);

    let skybox = new Cube();
    skybox.color = [0.31, 0.62, 0.95, 1.0];
    skybox.textureNum = 1;
    skybox.textureWeight = 0;
    skybox.matrix.scale(50, 50, 50);
    skybox.matrix.translate(-0.5, -0.5, -0.5);
    skybox.render();
    
    let floor = new Cube();
    floor.color = [1.0, 0.0, 0.0, 1.0];
    floor.textureNum = 2;
    floor.textureWeight = 1;
    floor.matrix.translate(0, -0.75, 0.0);
    floor.matrix.scale(10, 0.001, 10);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.render();

    // Uncomment for performance testing 
    let duration = performance.now() - startTime;
    sendTextToHTML("FPS: " + Math.floor(10000/duration)/10, "numdot");
}

function generateMap(width, length) {
    let worldMap = [];
    for (let x = 0; x < width; x++) {
        let strip = [];
        for (let y = 0; y < length; y++) {
            let block = Math.random();
            if (x === 0 || x === width - 1 || y === 0 || y === length - 1) {
                strip.push(Math.ceil(Math.random() * MAX_WORLD_HEIGHT));
            } else if (block < g_worldTerrainDensity) {
                if (block < g_worldTerrainDensity / 3.5) {
                    strip.push(1);
                } else if (block < g_worldTerrainDensity / 2.5) {
                    strip.push(3);
                } else if (block < g_worldTerrainDensity / 1.5) {
                    strip.push(2);
                } else {
                    strip.push(1);
                }
            } else {
                strip.push(0);
            }
        }
        worldMap.push(strip);
    }
    console.log(worldMap);
    return worldMap;
}

function cubePillar(position, height) {
    for (let i = 0; i < height; i++) {
        let pillar = new Cube();
        pillar.color = [0.8, 1.0, 1.0, 1.0];
        pillar.textureNum = 3;
        pillar.matrix.translate(0, -0.75, 0);
        pillar.matrix.scale(0.3, 0.3, 0.3);
        pillar.matrix.translate(position[0], i, position[1]);
        pillar.render();
    }
}

function drawAThisWorld(map) {
    for (x = 0; x < map.length; x++) {
        for (y = 0; y < map[x].length; y++) {
            if (map[x][y] > 0) {
                cubePillar([x - map.length / 2, y - map[x].length / 2], map[x][y]);
                // thisWorldBlock = new Cube();
                // thisWorldBlock.textureNum = 3;
                // thisWorldBlock.color = [0.8, 1.0, 1.0, 1.0];
                // thisWorldBlock.matrix.translate(0, -0.75, 0);
                // thisWorldBlock.matrix.scale(0.3, 0.3, 0.3);
                // thisWorldBlock.matrix.translate(x - map.length / 2, 0, y - map[x].length / 2);
                // thisWorldBlock.render();
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

function sendTextToHTML(text, htmlID) {
    var htmlEle = document.getElementById(htmlID);
    if (!htmlEle) {
        console.log("Failed to get " + htmlID + " from HTML");
    }
    htmlEle.innerHTML = text;
}

// Lighting.js
// Vertex shader program
let VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec3 a_Normal;
    attribute vec2 a_UV;
    
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    
    uniform mat4 u_NormalMatrix;

    varying vec4 v_WorldPos;
    varying vec3 v_Normal;
    varying vec2 v_UV;

    void main() {
        v_WorldPos = u_ModelMatrix * a_Position;
        v_UV = a_UV;
        
        v_Normal = normalize((u_NormalMatrix * vec4(a_Normal, 0.0)).xyz);
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * v_WorldPos;
    }
`;

// Fragment shader program
let FSHADER_SOURCE = `
    precision mediump float;
    uniform vec3 u_Color;

    uniform vec3 u_AmbientColor;
    uniform vec3 u_DiffuseColor;
    uniform vec3 u_SpecularColor;
    
    uniform vec3 u_LightDirection;
    uniform vec3 u_LightLocation;
    uniform vec3 u_EyePosition;
    
    varying vec4 v_WorldPos;
    varying vec3 v_Normal;

    vec3 calcAmbient() {
        return u_AmbientColor * u_Color;
    }

    vec3 calcDiffuse(vec3 l, vec3 n, vec3 dColor) {
        float nDotL = max(dot(l, n), 0.0);
        return dColor * u_Color * nDotL;
    }

    vec3 calcSpecular(vec3 r, vec3 v) {
        float rDotV = max(dot(r, v), 0.0);
        float rDotVPowS = pow(rDotV, 32.0);
        return u_SpecularColor * u_Color * rDotVPowS;
    }

    void main() {
        vec3 l1 = normalize(u_LightDirection); // Light 1
        vec3 l2 = normalize(u_LightLocation - v_WorldPos.xyz); // Light 2
        
        vec3 v = normalize(u_EyePosition - v_WorldPos.xyz);
        
        vec3 r1 = reflect(l1, v_Normal);
        vec3 r2 = reflect(l2, v_Normal);
        
        vec3 ambient = calcAmbient(); 
        
        vec3 diffuse1 = calcDiffuse(l1, v_Normal, u_DiffuseColor);
        vec3 specular1 = calcSpecular(r1, -v);
        
        vec3 diffuse2 = calcDiffuse(l2, v_Normal, u_DiffuseColor);
        vec3 specular2 = calcSpecular(r2, -v);
        
        vec3 v_Color = ambient + (diffuse1 + diffuse2) + (specular1 + specular2);

        gl_FragColor = vec4(v_Color, 1.0);
    }
`;

let modelMatrix = new Matrix4();
let normalMatrix = new Matrix4();

let models = [];

let lightDirection = new Vector3([1.0, 1.0, 1.0]);
let lightLocation = new Vector3([0.0, 1.0, 1.0]);
let lightRotation = new Matrix4().setRotate(1, 0, 1, 0);

// Uniform locations
let u_ModelMatrix = null;
let u_ViewMatrix = null;
let u_ProjectionMatrix = null;
let u_NormalMatrix = null;

let u_Color = null;
let u_AmbientColor = null;
let u_DiffuseColor = null;
let u_SpecularColor = null;

let u_LightDirection = null;
let u_LightLocation = null;
let u_EyePosition = null;

// let pointLightSphere = null;

function drawModel(model) {
    //  Update model matrix combining translate, rotate, and scale from cube
    modelMatrix.setIdentity();

    // Apply translation
    modelMatrix.translate(model.translate[0], model.translate[1], model.translate[2]);

    // Apply rotations
    modelMatrix.rotate(model.rotate[0], 1, 0, 0);
    modelMatrix.rotate(model.rotate[1], 0, 1, 0);
    modelMatrix.rotate(model.rotate[2], 0, 0, 1);

    // Apply scaling
    modelMatrix.scale(model.scale[0], model.scale[1], model.scale[2]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Compute normal matrix N_mat = (M`-1)^T
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // Set u_Color
    gl.uniform3f(u_Color, model.color[0], model.color[1], model.color[2]);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indices, gl.STATIC_DRAW);

    // gl.drawElements(gl.LINE_LOOP, model.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
}

function initBuffer(attributeName, n) {
    let shaderBuffer = gl.createBuffer();
    if(!shaderBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);

    let shaderAttribute = gl.getAttribLocation(gl.program, attributeName);
    gl.vertexAttribPointer(shaderAttribute, n, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderAttribute);

    return shaderBuffer;
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    lightLocation = lightRotation.multiplyVector3(lightLocation);
    gl.uniform3fv(u_LightLocation, lightLocation.elements);
    pointLightSphere.setTranslate(lightLocation.elements[0], lightLocation.elements[1], lightLocation.elements[2]);

    gl.uniform3fv(u_EyePosition, camera.eye.elements);

    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);

    gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

    for (let m of models) {
        drawModel(m);
    }

    requestAnimationFrame(draw);
}

function addModel(color, shapeType) {
    let model = null;
    switch (shapeType) {
        case "cube":
            model = new Cube(color);
            break;
        case "sphere":
            model = new Sphere(color);
            break;
    }

    if (model) {
        models.push(model);
    }

    return model;
}

function onZoomInput(value) {
    // console.log(1.0 + value/10);
    camera.zoom(1.0 + value/10);
}

window.addEventListener("keydown", function (event) {
    let speed = 1.0;

    switch (event.key) {
        case "w":
            console.log("Forward");
            camera.moveForward(speed);
            break;
        case "s":
            console.log("Back");
            camera.moveBack(-speed);
            break;
        case "a":
            console.log("move left");
            camera.moveLeft();
            break;
        case "d":
            console.log("move right");
            camera.moveRight();
            break;
        case "q":
            console.log("pan left");
            camera.panLeft();
            break;
        case "e":
            console.log("pan right");
            camera.panRight();
            break;
    }
});

function main() {
    canvas = document.getElementById("webgl");

    gl = canvas.getContext("webgl");
    if (!gl) {
        console.log("Failed to get webgl context");
        return -1;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to initialize shaders.");
        return -1;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");

    u_Color = gl.getUniformLocation(gl.program, "u_Color");

    u_AmbientColor = gl.getUniformLocation(gl.program, "u_AmbientColor");
    u_DiffuseColor = gl.getUniformLocation(gl.program, "u_DiffuseColor");
    u_SpecularColor = gl.getUniformLocation(gl.program, "u_SpecularColor");

    u_LightDirection = gl.getUniformLocation(gl.program, "u_LightDirection");
    u_LightLocation = gl.getUniformLocation(gl.program, "u_LightLocation");
    
    u_EyePosition = gl.getUniformLocation(gl.program, "u_EyePosition");

    for (let i = 0; i < 3; i++) {
        let randR = Math.random();
        let randG = Math.random();
        let randB = Math.random();
        
        let cube = addModel([randR, randG, randB, 1.0], "cube");
        cube.setScale(0.5, 0.5, 0.5);
        cube.setTranslate(-2.0 + (2.0 * i), -0.5, 0.0);
        let sphere = addModel([randR, randG, randB, 1.0], "sphere");
        sphere.setScale(0.5, 0.5, 0.5);
        sphere.setTranslate(-2.0 + (2.0 * i), 1.0, 0.0);

        // let cube = addModel([0.0, 0.35, 1.0, 1.0], "cube");
        // cube.setScale(0.5, 0.5, 0.5);
        // cube.setTranslate(-2.0 + (2.0 * i), -0.5, 0.0);
        // let sphere = addModel([1.0, 0.0, 0.5, 1.0], "sphere");
        // sphere.setScale(0.5, 0.5, 0.5);
        // sphere.setTranslate(-2.0 + (2.0 * i), 1.0, 0.0);
    }

    pointLightSphere = new Sphere([1.0, 1.0, 1.0, 1.0]);
    pointLightSphere.setScale(0.1, 0.1, 0.1);
    pointLightSphere.setTranslate(lightLocation);
    models.push(pointLightSphere);
 
    vertexBuffer = initBuffer("a_Position", 3);
    normalBuffer = initBuffer("a_Normal", 3);

    indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log("Can't create buffer.");
        return -1;
    }

    gl.uniform3f(u_AmbientColor, 0.2, 0.2, 0.2);
    gl.uniform3f(u_DiffuseColor, 0.8, 0.8, 0.8);
    gl.uniform3f(u_SpecularColor, 1.0, 1.0, 1.0);
    gl.uniform3fv(u_LightDirection, lightDirection.elements);

    camera = new Camera(canvas);
    
    draw();
}
// asgn0.js

// Vertex shader program
var VSHADER_SOURCE = 
  'void main() {\n' +
  '  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' + // Set the vertex coordinates of the point
  '  gl_PointSize = 10.0;\n' +                    // Set the point size
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' + // Set the point color
  '}\n';

function main() {
    // Retrieve <canvas> element <- (1)
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG <- (2)
    // var ctx = getWebGLContext(canvas);
    var ctx = canvas.getContext("2d");
    if (!ctx) {
        console.log('Failed to get the rendering context');
        return;
    }
    console.log(ctx);
    v1 = new Vector3([2.25, 2.25, 0.0]);
    drawVector(ctx, v1, "red");
    // if (!initShaders(ctx, VSHADER_SOURCE, FSHADER_SOURCE)) {
    //     console.log("Failed to initialize shaders");
    //     return;
    // }

    // Initialize black canvas
    ctx.canvas.style.background = "#000000";

    // ctx.fillRect(120, 10, 150, 150); // Fill a rectangle with the color
    // ctx.clearColor(0, 0, 0, 1.0);
    // ctx.clear(ctx.COLOR_BUFFER_BIT);
    // let v1 = new Vector3()
    
    // ctx.drawArrays(ctx, 0, 1);
}

// drawVector renders Vector3 object to context
function drawVector(context, v, color) {
    context.strokeStyle = color;
    let scaledV = v.elements;
    scaledV[0] = (scaledV[0] * 20) + 200
    scaledV[1] = -1 * (scaledV[1] * 20) + 200

    context.beginPath();
    context.moveTo(context.canvas.clientHeight / 2, context.canvas.clientWidth / 2);
    context.lineTo(...scaledV);
    context.stroke();
}

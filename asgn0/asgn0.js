// asgn0.js
const DEFAULT_CANVAS_BACKGROUND = "#000000";

function main() {
    // Retrieve <canvas> element <- (1)
    let canvas = document.getElementById('canvas');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG <- (2)
    let ctx = canvas.getContext("2d");
    if (!ctx) {
        console.log('Failed to get the rendering context');
        return;
    }
    clearCanvas(ctx);
    // console.log(ctx);
    v1 = new Vector3([2.25, 2.25, 0.0]);
    drawVector(ctx, v1, "red");
    // if (!initShaders(ctx, VSHADER_SOURCE, FSHADER_SOURCE)) {
    //     console.log("Failed to initialize shaders");
    //     return;
    // }

    // ctx.canvas.style.background = DEFAULT_CANVAS_BACKGROUND;

    // ctx.fillRect(120, 10, 150, 150); // Fill a rectangle with the color
    // ctx.clearColor(0, 0, 0, 1.0);
    // ctx.clear(ctx.COLOR_BUFFER_BIT);
    // let v1 = new Vector3()
    
    // ctx.drawArrays(ctx, 0, 1);
}

// clearCanvas resets canvas to default background color
function clearCanvas(context) {
    context.beginPath();
    context.fillStyle = DEFAULT_CANVAS_BACKGROUND;
    context.fillRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);
}

// drawVector renders Vector3 object to context
function drawVector(ctx, v, color) {
    ctx.strokeStyle = color;
    let scaledV = v.elements;
    scaledV[0] = scaledV[0] * 20 + 200;
    scaledV[1] = ctx.canvas.clientHeight - (scaledV[1] * 20 + 200);
    
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.clientHeight / 2, ctx.canvas.clientWidth / 2);
    ctx.lineTo(scaledV[0], scaledV[1]);
    ctx.stroke();
}

function getVectors(ctx) {
    let v1x = document.getElementById("v1x").value;
    let v1y = document.getElementById("v1y").value;
    let v1 = new Vector3([v1x, v1y, 0.0]);
    
    let v2x = document.getElementById("v2x").value;
    let v2y = document.getElementById("v2y").value;
    let v2 = new Vector3([v2x, v2y, 0.0]);
    return [v1, v2];
}

function handleDrawEvent() {
    let canvas = document.getElementById('canvas');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    let ctx = canvas.getContext("2d");
    if (!ctx) {
        console.log('Failed to get the rendering context');
        return;
    }

    clearCanvas(ctx);

    let [v1, v2] = [...getVectors(ctx)];
    console.log(v1, v2);
    drawVector(ctx, v1, "red");
    drawVector(ctx, v2, "blue");
}

function performOperation(ctx, operation) {
    let [v1, v2] = [...getVectors(ctx)];
    // console.log(v1);
    let operand = document.getElementById("operand").value;
    let v3 = [];
    switch (operation) {
        case "add":
            return [v1.add(v2)];
        case "subtract":
            return [v1.sub(v2)];
        case "multiply":
            return [v1.mul(operand), v2.mul(operand)];
        case "divide":
            return [v1.div(operand), v2.div(operand)];
        case "magnitude":
            console.log("Magnitude v1: " + v1.magnitude())
            console.log("Magnitude v2: " + v2.magnitude())
            return;
        case "normalize":
            return [v1.normalize(), v2.normalize()];
        case "dotProduct":
            console.log(angleBetween(v1, v2));
            return;
        default:
            console.log("Invalid operation: " + operation);
            return;
    }
}

function handleDrawOperationEvent() {
    let canvas = document.getElementById('canvas');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    let ctx = canvas.getContext("2d");
    if (!ctx) {
        console.log('Failed to get the rendering context');
        return;
    }

    clearCanvas(ctx);
    
    let op = document.getElementById("operation-select").value;
    
    
    let [v1, v2] = [...getVectors(ctx)];
    drawVector(ctx, v1, "red");
    drawVector(ctx, v2, "blue");

    let v3s = performOperation(ctx, op);
    if (v3s) v3s.forEach((v3) => drawVector(ctx, v3, "green"));
}

function angleBetween(v1, v2) {
    let theta = Vector3.dot(v1, v2);
    console.log(theta);
    theta /= (v1.magnitude() * v2.magnitude());
    console.log(theta);
    return;
}
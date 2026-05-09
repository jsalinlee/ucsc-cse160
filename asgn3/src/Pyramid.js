const _PYR_FRONT_LIGHT = 0.9;
const _PYR_BACK_LIGHT = 0.7;
const _PYR_SIDE_LIGHT = 0.6;
const _PYR_BOTTOM_LIGHT = 0.4;

class Pyramid {
    static buffer;

    constructor() {
        this.type = "pyramid";
        this.matrix = new Matrix4();
        this.color = [1.0, 1.0, 1.0, 1.0];
    }
    render() {
        let rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        drawTriangle3D();
    }
}

function drawPyramid3D(vertices) {
  // Create a buffer object
  if (Triangle.buffer === null) {
    Triangle.buffer = gl.createBuffer();
  }    
  if (!Triangle.buffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
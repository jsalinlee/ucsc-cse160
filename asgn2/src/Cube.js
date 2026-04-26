const _CUBE_FRONT_LIGHT = 0.9;
const _CUBE_BACK_LIGHT = 0.7;
const _CUBE_SIDE_LIGHT = 0.6;
const _CUBE_BOTTOM_LIGHT = 0.4;

class Cube {
    static buffer = null;

    constructor() {
        this.type="cube";
        this.matrix = new Matrix4();
        this.color = [1.0, 1.0, 1.0, 1.0];
    }

    render() {
        let rgba = this.color;
        
        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        // Pass the color to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0] * _CUBE_FRONT_LIGHT, rgba[1] * _CUBE_FRONT_LIGHT, rgba[2] * _CUBE_FRONT_LIGHT, rgba[3]);
        drawTriangle3D([0,0,0,   1,1,0,  1,0,0]);
        drawTriangle3D([0,0,0,   0,1,0,  1,1,0]);

        // Back of cube
        // Pass the color to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0] * _CUBE_BACK_LIGHT, rgba[1] * _CUBE_BACK_LIGHT, rgba[2] * _CUBE_BACK_LIGHT, rgba[3]);
        drawTriangle3D([1,0,1,   1,1,1,  0,1,1]);
        drawTriangle3D([1,0,1,   0,1,1,  0,0,1]);

        // Top of cube
        // Pass the color to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([0,1,0,   1,1,1,  1,1,0]);
        drawTriangle3D([0,1,0,   0,1,1,  1,1,1]);

        // Bottom of cube
        // Pass the color to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0] * _CUBE_BOTTOM_LIGHT, rgba[1] * _CUBE_BOTTOM_LIGHT, rgba[2] * _CUBE_BOTTOM_LIGHT, rgba[3]);
        drawTriangle3D([1,0,0,   1,0,1,  0,0,1]);
        drawTriangle3D([1,0,0,   0,0,1,  0,0,0]);

        // Left of cube
        // Pass the color to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0] * _CUBE_SIDE_LIGHT, rgba[1] * _CUBE_SIDE_LIGHT, rgba[2] * _CUBE_SIDE_LIGHT, rgba[3]);
        drawTriangle3D([0,1,0,   0,0,0,  0,0,1]);
        drawTriangle3D([0,1,0,   0,0,1,  0,1,1]);

        // Right of cube
        // Pass the color to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0] * _CUBE_SIDE_LIGHT, rgba[1] * _CUBE_SIDE_LIGHT, rgba[2] * _CUBE_SIDE_LIGHT, rgba[3]);
        drawTriangle3D([1,1,1,   1,0,1,  1,0,0]);
        drawTriangle3D([1,1,1,   1,0,0,  1,1,0]);
    }
}

function drawTriangle3D(vertices) {
    // Create static buffer object if uninitialized
    if (Cube.buffer === null) {
        Cube.buffer = gl.createBuffer();
        if (!Cube.buffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
    }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, Cube.buffer);

  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
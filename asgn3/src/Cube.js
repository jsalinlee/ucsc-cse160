const _CUBE_FRONT_LIGHT = 0.9;
const _CUBE_BACK_LIGHT = 0.7;
const _CUBE_SIDE_LIGHT = 0.6;
const _CUBE_BOTTOM_LIGHT = 0.4;

class Cube {
    constructor() {
        this.type="cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = 1;
        this.textureWeight = 1.0
    }

    render() {
        let rgba = this.color;

        // Pass the texture number;
        gl.uniform1i(u_WhichTexture, this.textureNum);
        gl.uniform1f(u_TexColorWeight, this.textureWeight);
        
        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // Front of cube
        // Pass the color to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0,0,0,    1,1,0,    1,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0,    0,1,0,    1,1,0], [0,0, 0,1, 1,1]);

        // // Back of cube
        // // Pass the color to u_FragColor variable
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([1,0,1,   1,1,1,  0,1,1], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([1,0,1,   0,1,1,  0,0,1], [0,0, 1,1, 1,0]);

        // // Top of cube
        // // Pass the color to u_FragColor variable
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0,1,0,   1,1,1,  1,1,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,1,0,   0,1,1,  1,1,1], [0,0, 0,1, 1,1]);

        // // Bottom of cube
        // // Pass the color to u_FragColor variable
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([1,0,0,   1,0,1,  0,0,1], [1,1, 1,0, 0,0]);
        drawTriangle3DUV([1,0,0,   0,0,1,  0,0,0], [1,1, 0,0, 0,1]);

        // // Left of cube
        // // Pass the color to u_FragColor variable
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0,1,0,   0,0,0,  0,0,1], [1,1, 1,0, 0,0]);
        drawTriangle3DUV([0,1,0,   0,0,1,  0,1,1], [1,1, 0,0, 0,1]);

        // // Right of cube
        // Pass the color to u_FragColor variable
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([1,1,1,   1,0,1,  1,0,0], [1,1, 1,0, 0,0]);
        drawTriangle3DUV([1,1,1,   1,0,0,  1,1,0], [1,1, 0,0, 0,1]);
    }

    renderFast() {
        let rgba = this.color;

        // Pass the texture number;
        gl.uniform1i(u_WhichTexture, this.textureNum);
        
        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        let allVerts = [];
        let allUVs = [];
        // Front of cube
        // Pass the color to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        allVerts.concat([0,0,0,    1,1,0,    1,0,0],);
        allUVs.concat( [0,0, 1,1, 1,0]);
        allVerts.concat([0,0,0,    0,1,0,    1,1,0], [0,0, 0,1, 1,1]);
        
        // // Back of cube
        // // Pass the color to u_FragColor variable
        allVerts.concat([1,0,1,   1,1,1,  0,1,1], [0,0, 0,1, 1,1]);
        allVerts.concat([1,0,1,   0,1,1,  0,0,1], [0,0, 1,1, 1,0]);

        // // Top of cube
        // // Pass the color to u_FragColor variable
        allVerts.concat([0,1,0,   1,1,1,  1,1,0], [0,0, 1,1, 1,0]);
        allVerts.concat([0,1,0,   0,1,1,  1,1,1], [0,0, 0,1, 1,1]);
        
        // // Bottom of cube
        // // Pass the color to u_FragColor variable
        allVerts.concat([1,0,0,   1,0,1,  0,0,1], [1,1, 1,0, 0,0]);
        allVerts.concat([1,0,0,   0,0,1,  0,0,0], [1,1, 0,0, 0,1]);

        // // Left of cube
        // // Pass the color to u_FragColor variable
        allVerts.concat([0,1,0,   0,0,0,  0,0,1], [1,1, 1,0, 0,0]);
        allVerts.concat([0,1,0,   0,0,1,  0,1,1], [1,1, 0,0, 0,1]);

        // // Right of cube
        // Pass the color to u_FragColor variable
        allVerts.concat([1,1,1,   1,0,1,  1,0,0], [1,1, 1,0, 0,0]);
        allVerts.concat([1,1,1,   1,0,0,  1,1,0], [1,1, 0,0, 0,1]);

        drawTriangle3DUV(allVerts);
    }

    drawCube(mat, color = [1,1,1,1]) {
        let newCube = new Cube();
        newCube.matrix = mat;
        newCube.color = color;
        newCube.render();
    }
}
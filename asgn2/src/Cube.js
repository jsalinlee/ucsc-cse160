class Cube {
    constructor(numSegments = 10) {
        
        this.type="cube";
        this.matrix = new Matrix4();
        this.color = [1.0, 1.0, 1.0, 1.0];
        
        this.buffer = null;
        this.vertices = null;
    }
    
    generateVertices() {
        const FRONT_LIGHT = 0.9;
        const BACK_LIGHT = 0.7;
        const SIDE_LIGHT = 0.6;
        const BOTTOM_LIGHT = 0.4;

        let rgba = this.color;
        let v = [];
        
        // Front of cube
        v.push( 0,0,0,   rgba[0] * FRONT_LIGHT, rgba[1] * FRONT_LIGHT, rgba[2] * FRONT_LIGHT, rgba[3],      
                1,1,0,   rgba[0] * FRONT_LIGHT, rgba[1] * FRONT_LIGHT, rgba[2] * FRONT_LIGHT, rgba[3],      
                1,0,0,   rgba[0] * FRONT_LIGHT, rgba[1] * FRONT_LIGHT, rgba[2] * FRONT_LIGHT, rgba[3]);
        v.push( 0,0,0,   rgba[0] * FRONT_LIGHT, rgba[1] * FRONT_LIGHT, rgba[2] * FRONT_LIGHT, rgba[3],
                0,1,0,   rgba[0] * FRONT_LIGHT, rgba[1] * FRONT_LIGHT, rgba[2] * FRONT_LIGHT, rgba[3],
                1,1,0,   rgba[0] * FRONT_LIGHT, rgba[1] * FRONT_LIGHT, rgba[2] * FRONT_LIGHT, rgba[3]);
        
        // Back of cube
        v.push( 1,0,1,   rgba[0] * BACK_LIGHT, rgba[1] * BACK_LIGHT, rgba[2] * BACK_LIGHT, rgba[3],
                1,1,1,   rgba[0] * BACK_LIGHT, rgba[1] * BACK_LIGHT, rgba[2] * BACK_LIGHT, rgba[3],
                0,1,1,   rgba[0] * BACK_LIGHT, rgba[1] * BACK_LIGHT, rgba[2] * BACK_LIGHT, rgba[3]);
        v.push( 1,0,1,   rgba[0] * BACK_LIGHT, rgba[1] * BACK_LIGHT, rgba[2] * BACK_LIGHT, rgba[3],
                0,1,1,   rgba[0] * BACK_LIGHT, rgba[1] * BACK_LIGHT, rgba[2] * BACK_LIGHT, rgba[3],
                0,0,1,   rgba[0] * BACK_LIGHT, rgba[1] * BACK_LIGHT, rgba[2] * BACK_LIGHT, rgba[3]);
        
        // Top of cube
        v.push( 0,1,0,   rgba[0], rgba[1], rgba[2], rgba[3],      
                1,1,1,   rgba[0], rgba[1], rgba[2], rgba[3],      
                1,1,0,   rgba[0], rgba[1], rgba[2], rgba[3]);
        v.push( 0,1,0,   rgba[0], rgba[1], rgba[2], rgba[3],      
                0,1,1,   rgba[0], rgba[1], rgba[2], rgba[3],      
                1,1,1,   rgba[0], rgba[1], rgba[2], rgba[3]);
 
        // Bottom of cube
        v.push( 1,0,0,   rgba[0] * BOTTOM_LIGHT, rgba[1] * BOTTOM_LIGHT, rgba[2] * BOTTOM_LIGHT, rgba[3],      
                1,0,1,   rgba[0] * BOTTOM_LIGHT, rgba[1] * BOTTOM_LIGHT, rgba[2] * BOTTOM_LIGHT, rgba[3],      
                0,0,1,   rgba[0] * BOTTOM_LIGHT, rgba[1] * BOTTOM_LIGHT, rgba[2] * BOTTOM_LIGHT, rgba[3]);
        v.push( 1,0,0,   rgba[0] * BOTTOM_LIGHT, rgba[1] * BOTTOM_LIGHT, rgba[2] * BOTTOM_LIGHT, rgba[3],      
                0,0,1,   rgba[0] * BOTTOM_LIGHT, rgba[1] * BOTTOM_LIGHT, rgba[2] * BOTTOM_LIGHT, rgba[3],      
                0,0,0,   rgba[0] * BOTTOM_LIGHT, rgba[1] * BOTTOM_LIGHT, rgba[2] * BOTTOM_LIGHT, rgba[3]);
                
        // Left side of cube
        v.push( 0,1,0,   rgba[0] * SIDE_LIGHT, rgba[1] * SIDE_LIGHT, rgba[2] * SIDE_LIGHT, rgba[3],      
                0,0,0,   rgba[0] * SIDE_LIGHT, rgba[1] * SIDE_LIGHT, rgba[2] * SIDE_LIGHT, rgba[3],      
                0,0,1,   rgba[0] * SIDE_LIGHT, rgba[1] * SIDE_LIGHT, rgba[2] * SIDE_LIGHT, rgba[3]);
        v.push( 0,1,0,   rgba[0] * SIDE_LIGHT, rgba[1] * SIDE_LIGHT, rgba[2] * SIDE_LIGHT, rgba[3],      
                0,0,1,   rgba[0] * SIDE_LIGHT, rgba[1] * SIDE_LIGHT, rgba[2] * SIDE_LIGHT, rgba[3],      
                0,1,1,   rgba[0] * SIDE_LIGHT, rgba[1] * SIDE_LIGHT, rgba[2] * SIDE_LIGHT, rgba[3]);

        // Right side cube
        v.push( 1,1,1,   rgba[0] * SIDE_LIGHT, rgba[1] * SIDE_LIGHT, rgba[2] * SIDE_LIGHT, rgba[3],      
                1,0,1,   rgba[0] * SIDE_LIGHT, rgba[1] * SIDE_LIGHT, rgba[2] * SIDE_LIGHT, rgba[3],      
                1,0,0,   rgba[0] * SIDE_LIGHT, rgba[1] * SIDE_LIGHT, rgba[2] * SIDE_LIGHT, rgba[3]);
        v.push( 1,1,1,   rgba[0] * SIDE_LIGHT, rgba[1] * SIDE_LIGHT, rgba[2] * SIDE_LIGHT, rgba[3],      
                1,0,0,   rgba[0] * SIDE_LIGHT, rgba[1] * SIDE_LIGHT, rgba[2] * SIDE_LIGHT, rgba[3],      
                1,1,0,   rgba[0] * SIDE_LIGHT, rgba[1] * SIDE_LIGHT, rgba[2] * SIDE_LIGHT, rgba[3]);


        this.vertices = new Float32Array(v);
    }

    render() {
        if (this.buffer === null) {
            this.buffer = gl.createBuffer();
            if (!this.buffer) {
            console.log('Failed to create the buffer object');
            return -1;
            }
        }

        if (this.vertices === null) {
            this.generateVertices();
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        
        let FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;

        
        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 7*FLOAT_SIZE, 0*FLOAT_SIZE);
        // // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        // Assign the buffer object to a_Color variable)
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 7*FLOAT_SIZE, 3*FLOAT_SIZE);
        // Enable the assignment to a_Color variable
        gl.enableVertexAttribArray(a_Color);

        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 7);
    }
}
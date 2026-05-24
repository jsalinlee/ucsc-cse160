class Camera {
    constructor(canvas) {
        this.eye = new Vector3([0,0,5]);
        this.at = new Vector3([0,0,-1]);
        this.up = new Vector3([0,1,0]);
        this.viewMatrix = new Matrix4();
        
        this.fov = 60.0;
        this.aspect = canvas.width / canvas.height;
        this.near = 0.1;
        this.far = 1000;
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, this.aspect, this.near, this.far);
        
        // this.mouse = new Vector3(); // will use as vector2
        // this.rotation = new Vector3([0, 1, 0]);
        // this.matrix = new Matrix4();
        // this.dragging = false;

        // this.setHandlers();
        this.cameraSpeed = 0.1;
        this.dTheta = 5.0;
        
        this.updateView();
    }

    // setHandlers() {
    //     this.canvas.onmousedown = (e) => {
    //         this.dragging = true;

    //         let x = (e.clientX / e.target.clientWidth) * 2.0 - 1.0;
    //         let y = (-e.clientY / e.target.clientHeight) * 2.0 + 1.0;

    //         this.mouse.elements.set([x, y, 0]);
    //     };

    //     this.canvas.onmouseup = this.canvas.onmouseleave = (e) => {
    //         this.dragging = false;
    //     };

    //     this.canvas.onmousemove = (e) => {
    //         let x = (e.clientX / e.target.clientWidth) * 2.0 - 1.0;
    //         let y = (-e.clientY / e.target.clientHeight) * 2.0 + 1.0;

    //         if (this.dragging) {
    //             let dx = x - this.mouse.elements[0];
    //             let dy = y - this.mouse.elements[1];

    //             this.rotation.elements[0] -= dy * 50;
    //             this.rotation.elements[1] += dx * 50;

    //             this.mouse.elements.set([x, y, 0]);
    //         }
    //     };
    // }

    // update() {
    //     // linearly interpolate rotation of object towards desired rotation
    //     // results in smooth rotation of camera via mouse by lerping 20% each tick
    //     let x =
    //     0.8 * this.rotation.elements[0] + 0.2 * this.rotation.elements[0];

    //     let y =
    //     0.8 * this.rotation.elements[1] + 0.2 * this.rotation.elements[1];

    //     this.rotation.elements.set([x, y, 0]);
    // }

    updateView() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], 
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2],
        )
    }

    zoom(scale) {
        this.projectionMatrix.setPerspective(this.fov * scale, this.aspect, this.near, this.far);
    }

    moveForward() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.cameraSpeed);
        this.at.add(f);
        this.eye.add(f);
        this.updateView();
    }

    moveBack() {
        let f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();
        f.mul(this.cameraSpeed);
        this.at.add(f);
        this.eye.add(f);
        this.updateView();
    }

    moveLeft() {
        let f = new Vector3();
        // calculate unit direction of camera
        f.set(this.at);
        f.sub(this.eye);
        // f.div(f.elements.length);

        // find unit normal to direction and up and shift to the left
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(this.cameraSpeed);
        this.at.sub(s);
        this.eye.sub(s);
        this.updateView();
    }
    
    moveRight() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        // find unit normal to direction and up and shift to the left
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(this.cameraSpeed);
        this.at.sub(s);
        this.eye.sub(s);
        this.updateView();
    }

    panLeft() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setIdentity();
        rotationMatrix.setRotate(this.dTheta, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye)
        this.at.add(f_prime);
        this.updateView();
    }
    
    panRight() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setIdentity();
        rotationMatrix.setRotate(-1 * this.dTheta, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye)
        this.at.add(f_prime);
        this.updateView();
    }
    
    // moveUp() {
    //     let f = new Vector3();
    //     f.set(this.at);
    //     f.sub(this.eye);

    //     let rotationMatrix = new Matrix4();
    //     rotationMatrix.setIdentity();
    //     rotationMatrix.setRotate(-1 * this.dTheta, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        
    //     this.updateView();
    // }
    
    // moveDown() {
    //     let f = new Vector3();
    //     f.set(this.at);
    //     f.sub(this.eye);
        
    //     let rotationMatrix = new Matrix4();
    //     rotationMatrix.setIdentity();
    //     rotationMatrix.setRotate(-1 * this.dTheta, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    //     this.updateView();
    // }
    
    // tiltUp() {
    //     let f = new Vector3();
    //     f.set(this.at);
    //     f.sub(this.eye);

    //     let rotationMatrix = new Matrix4();
    //     rotationMatrix.setIdentity();
    //     rotationMatrix.setRotate(-1 * this.dTheta, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        
    //     this.updateView();
    // }
    
    // tiltDown() {
    //     let f = new Vector3();
    //     f.set(this.at);
    //     f.sub(this.eye);

    //     let rotationMatrix = new Matrix4();
    //     rotationMatrix.setIdentity();
    //     rotationMatrix.setRotate(-1 * this.dTheta, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        
    //     this.updateView();
    // }

    onMouseMove(e) {
        console.log(e.offsetX);
        let newDir = new Vector3();
        this.at.set
    }
}
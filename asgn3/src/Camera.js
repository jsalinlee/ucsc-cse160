class Camera {
    constructor(canvas) {
        this.fov = 60.0;
        this.eye = new Vector3([0,0,0]);
        this.at = new Vector3([0,0,-1]);
        this.up = new Vector3([0,1,0]);
        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], 
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2],
        )
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
        this.cameraSpeed = 50;
        this.rotRate = 5;
    }

    moveForward() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.cameraSpeed);
        this.at.add(f);
        this.eye.add(f);
    }

    moveBack() {
        let f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();
        f.mul(this.cameraSpeed);
        this.at.add(f);
        this.eye.add(f);
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
        this.at = this.at.sub(s);
        this.eye = this.eye.sub(s);
    }
    
    moveRight() {
        // calculate unit direction of camera
        f.set(this.at);
        f.sub(this.eye);
        // f.div(f.elements.length);

        // find unit normal to direction and up and shift to the left
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(this.cameraSpeed);
        this.at = this.at.sub(s);
        this.eye = this.eye.sub(s);
    }

    panLeft() {
        let f = new Vector3();
        f.set(this.at);
        console.log(f);
        f.sub(this.eye);
        let r = Math.sqrt(Math.pow(f.elements[0],2) + Math.pow(f.elements[1],2));
        console.log(r);
        let newTheta = (Math.atan(f.elements[0] / f.elements[1] || 0) * 180 / Math.PI) + this.rotRate;
        console.log(newTheta);

        let x = r * Math.cos(newTheta);
        let y = r * Math.sin(newTheta);
        let d = new Vector3();
        d.elements[0], d.elements[1] = x, y;
        console.log("New D: " + d.elements);
    }
}

function vectorAdd(v1, v2) {
    let v3 = new Vector3();
    if (v1.elements.length === v2.elements.length) {
        for (let i = 0; i < v1.length; i++) {
            v3.elements[i] = v1.elements[i] + v2.elements[i];
        }
    }
    return v3;
}

// Sub v2 from v1
function vectorSub(v1, v2) {
    let v3 = new Vector3();
    if (v1.elements.length === v2.elements.length) {
        for (let i = 0; i < v1.length; i++) {
            v3.elements[i] = v1.elements[i] - v2.elements[i];
        }
    }
    return v3;
}

function vectorScalarMul(v, multiplier) {
    return v.elements.map((ele) => ele * multiplier);
}

function vectorScalarDiv(v, divisor) {
    console.log(v);
    for (let i = 0; i < v.elements.length; i++) {
        v.elements[i] /= divisor;
    }
}

function vectorDot(v1, v2) {
    return angleBetween(v1, v2);
}

function vectorCross(v1, v2) {
    let v3 = new Vector3();
    v3.elements[0] = (v1.elements[1] * v2.elements[2]) - (v1.elements[2] * v2.elements[1])
    v3.elements[1] = -1 * ((v1.elements[0] * v2.elements[2]) - (v1.elements[2] * v2.elements[0]))
    v3.elements[2] = (v1.elements[0] * v2.elements[1]) - (v1.elements[1] * v2.elements[0])
}

function vectorMagnitude(v) {
    return v.magnitude();
}

function vectorNormalize(v) {
    return v.normalize();
}

function angleBetween(v1, v2) {
    // from geometric dot product formula
    let theta = Math.acos(Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude()));
    // convert rad -> deg
    theta =  theta * (180/Math.PI)
    return theta;
}

function areaTriangle(v1, v2) {
    // area of parallelogram / 2
    // return v3.magnitude() / 2;
    return Vector3.cross(v1, v2);
}
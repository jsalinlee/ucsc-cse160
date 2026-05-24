

// Color values

// ------- Global variables ------------------

// ------- End global variables ------------------

// BlockyAnimal.js
class BlockyBat {
    constructor() {
        this.bodyColor = [0.35, 0.2, 0.1, 1];
        this.boneColor = [0.8, 0.8, 0.8, 1];

        // Bat angles
        this.pitchAngle = 0;
        this.rollAngle = 0;

        // Left wing
        this.lUpArmAngle = 0;
        this.lLowArmAngle = 0;
        this.lOuterFingerAngle = 0;
        this.lMidFingerAngle = 0;
        this.lInnerFingerAngle = 0;

        // Right wing
        this.rUpArmAngle = 0;
        this.rLowArmAngle = 0;
        this.rOuterFingerAngle = 0;
        this.rMidFingerAngle = 0;
        this.rInnerFingerAngle = 0;

        // Animation booleans
        this.pitchAnimation = false;
        this.rollAnimation = false;
        this.flyingAnimation = false;

        // Visual toggles
        this.showSkeleton = false;
    }
    
    // Add event listeners
    addActionsForHtmlUI() {
        // Button events
        document.getElementById('animationPitchOnButton').onclick = function() {this.pitchAnimation = true;};
        document.getElementById('animationPitchOffButton').onclick = function() {this.pitchAnimation = false;};
        document.getElementById('animationRollOnButton').onclick = function() {this.rollAnimation = true;};
        document.getElementById('animationRollOffButton').onclick = function() {this.rollAnimation = false;};
        
        document.getElementById('animationFlightOnButton').onclick = function() {this.flyingAnimation = true;};
        document.getElementById('animationFlightOffButton').onclick = function() {this.flyingAnimation = false;};

        
        document.getElementById('toggleShowSkeleton').onclick = function() {this.showSkeleton = this.checked};

        // Joint movement sliders
        document.getElementById('pitchSlide').addEventListener(
            'mousemove', function() {this.pitchAngle = this.value; renderScene();});
        document.getElementById('rollSlide').addEventListener(
            'mousemove', function() {this.rollAngle = this.value; renderScene();});
        // Left arm
        document.getElementById('lUpArmSlide').addEventListener(
            'mousemove', function() {this.lUpArmAngle = this.value; renderScene();});
        document.getElementById('lLowArmSlide').addEventListener(
            'mousemove', function() {this.lLowArmAngle = this.value; renderScene();});
        document.getElementById('lOuterFingerSlide').addEventListener(
            'mousemove', function() {this.lOuterFingerAngle = this.value; renderScene();});
        document.getElementById('lMidFingerSlide').addEventListener(
            'mousemove', function() {this.lMidFingerAngle = this.value; renderScene();});
        document.getElementById('lInnerFingerSlide').addEventListener(
            'mousemove', function() {this.lInnerFingerAngle = this.value; renderScene();});

        document.getElementById('rUpArmSlide').addEventListener(
            'mousemove', function() {this.rUpArmAngle = this.value; renderScene();});
        document.getElementById('rLowArmSlide').addEventListener(
            'mousemove', function() {this.rLowArmAngle = this.value; renderScene();});
        document.getElementById('rOuterFingerSlide').addEventListener(
            'mousemove', function() {this.rOuterFingerAngle = this.value; renderScene();});
        document.getElementById('rMidFingerSlide').addEventListener(
            'mousemove', function() {this.rMidFingerAngle = this.value; renderScene();});
        document.getElementById('rInnerFingerSlide').addEventListener(
            'mousemove', function() {this.rInnerFingerAngle = this.value; renderScene();});
    }

    // Update the angles of everything if currently animated
    updateAnimationAngles() {
        if (this.pitchAnimation) {
            this.pitchAngle = 45 * Math.sin(2*g_seconds);
        }
        if (this.rollAnimation) {
            this.rollAngle = 45 * Math.sin(3*g_seconds);
        }
        if (this.flyingAnimation) {
            // Body
            // this.pitchAngle = -5 * Math.sin(2*g_seconds);

            // Left wing
            this.lUpArmAngle = 30 * Math.sin(2*g_seconds) - 30 + 30 * Math.cos(2*g_seconds);
            this.lLowArmAngle = -30 * Math.sin(2*g_seconds);
            this.lOuterFingerAngle = 45 * Math.sin(2*g_seconds);
            this.lMidFingerAngle = 45 * Math.sin(2*g_seconds);
            this.lInnerFingerAngle = 45 * Math.sin(2*g_seconds);

            // Right wing
            this.rUpArmAngle = 30 * Math.sin(2*g_seconds) - 30 + 30 * Math.cos(2*g_seconds);
            this.rLowArmAngle = -30 * Math.sin(2*g_seconds);
            this.rOuterFingerAngle = 45 * Math.sin(2*g_seconds);
            this.rMidFingerAngle = 45 * Math.sin(2*g_seconds);
            this.rInnerFingerAngle = 45 * Math.sin(2*g_seconds);
        }
    }
    
    render() {
        let modelMatrix = new Matrix4();
        let bodyMat = new Matrix4();
        bodyMat.rotate(-this.pitchAngle, 1, 0, 0);
        bodyMat.rotate(-this.rollAngle, 0, 0, 1);

        // Head
        modelMatrix.translate(0, 0.1, -0.01);
        modelMatrix.rotate(-30, 1, 0, 0);
        let headCoordinates = new Matrix4(modelMatrix);
        modelMatrix.scale(0.05, 0.05, 0.1);
        modelMatrix.translate(-0.5, -0.5, -2.5);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.bodyColor);
        modelMatrix.setIdentity();
        
        // Ears
        modelMatrix = new Matrix4(headCoordinates);
        modelMatrix.scale(0.075, 0.09, 0.05);
        modelMatrix.translate(0.55, 0.5, -4);
        modelMatrix.rotate(15, 1, 0, -1);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.bodyColor);
        modelMatrix.setIdentity();
        // Ears
        modelMatrix = new Matrix4(headCoordinates);
        modelMatrix.scale(0.075, 0.09, 0.05);
        modelMatrix.translate(-1.5, 0.3, -4);
        modelMatrix.rotate(15, 1, 0, 1);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.bodyColor);
        modelMatrix.setIdentity();
        
        // Shoulders
        let shoulderMat = new Matrix4();
        shoulderMat.scale(0.24, 0.06, 0.06);
        shoulderMat.translate(-0.5, -0.5, -1.3);
        modelMatrix.set(bodyMat);
        modelMatrix.multiply(shoulderMat);
        Cube.drawCube(modelMatrix, this.boneColor);
        modelMatrix.setIdentity();

        // Spine
        let spineMat = new Matrix4();
        spineMat.scale(0.06, 0.06, 0.3);
        spineMat.translate(-0.5, -0.5, -0.5);
        modelMatrix.set(bodyMat);
        modelMatrix.multiply(spineMat);
        Cube.drawCube(modelMatrix, this.boneColor);
        modelMatrix.setIdentity();
        
        
        // Left arm
        // Left upper arm
        modelMatrix.translate(0.12, 0, -0.05);
        modelMatrix.rotate(this.lUpArmAngle - 30, 0, 1, 0);
        modelMatrix.rotate(this.lUpArmAngle, 0, 0, -1);
        let upperLArmCoordinates = new Matrix4(modelMatrix);
        modelMatrix.scale(0.15, 0.05, 0.05);
        modelMatrix.translate(0, -0.5, -0.5);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.boneColor);
        modelMatrix.setIdentity();
        
        // Left lower arm
        modelMatrix = new Matrix4(upperLArmCoordinates);
        modelMatrix.translate(0.15, -0.02, 0);
        modelMatrix.rotate(120, 0, 1, 0);
        modelMatrix.rotate(this.lLowArmAngle, 0, 1, 0);
        modelMatrix.rotate(this.lLowArmAngle, 0, 0, 1.5);
        modelMatrix.scale(0.7, 0.7, 0.7);
        let lowerLArmCoordinates = new Matrix4(modelMatrix);
        modelMatrix.scale(0.3, 0.05, 0.05);
        modelMatrix.translate(0, 0, -1);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.bodyColor);
        modelMatrix.setIdentity();
        
        // Left outer finger
        modelMatrix = new Matrix4(lowerLArmCoordinates);
        modelMatrix.translate(0.3, 0, 0);
        modelMatrix.rotate(-60, 0, 1, 0);
        modelMatrix.rotate(this.lOuterFingerAngle, 0, 1, 0);
        modelMatrix.scale(0.7, 0.03, 0.03);
        modelMatrix.translate(0, 0.3, 0);
        let lOuterFingerCoordinates = new Matrix4(modelMatrix);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.bodyColor);
        modelMatrix.setIdentity();
        
        // Left middle finger
        modelMatrix = new Matrix4(lowerLArmCoordinates);
        modelMatrix.translate(0.3, 0, 0);
        modelMatrix.rotate(-90, 0, 1, 0);
        modelMatrix.rotate(this.lMidFingerAngle/2, 0, 1, 1);
        // modelMatrix.rotate(this.lMidFingerAngle / 5, 0, 0, 1);
        modelMatrix.scale(0.5, 0.03, 0.03);
        modelMatrix.translate(0, 0.3, 0);
        let lMidFingerCoordinates = new Matrix4(modelMatrix);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.bodyColor);
        modelMatrix.setIdentity();
        
        // Left inner finger
        modelMatrix = new Matrix4(lowerLArmCoordinates);
        modelMatrix.translate(0.3, 0, 0);
        modelMatrix.rotate(-120, 0, 1, 0);
        modelMatrix.rotate(this.lInnerFingerAngle / 3, 0, 1, 0);
        modelMatrix.scale(0.45, 0.03, 0.03);
        modelMatrix.translate(0, 0.3, 0);
        let lInnerFingerCoordinates = new Matrix4(modelMatrix);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.bodyColor);
        modelMatrix.setIdentity();
        
        // Right arm
        // Right upper arm
        modelMatrix.translate(-0.12, 0, -0.05);
        modelMatrix.rotate(180, 0, 1, 0);
        modelMatrix.rotate(this.rUpArmAngle - 30, 0, -1, 0);
        modelMatrix.rotate(this.rUpArmAngle, 0, 0, -1);
        let upperRArmCoordinates = new Matrix4(modelMatrix);
        modelMatrix.scale(0.15, 0.05, 0.05);
        modelMatrix.translate(0, -0.5, -0.5);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.boneColor);
        modelMatrix.setIdentity();
        
        // Right lower arm
        modelMatrix = new Matrix4(upperRArmCoordinates);
        modelMatrix.translate(0.12, -0.02, -0.01);
        modelMatrix.rotate(240, 0, 1, 0);
        modelMatrix.rotate(this.rLowArmAngle, 0, -1, 0);
        modelMatrix.rotate(this.rLowArmAngle, 0, 0, 1.5);
        modelMatrix.scale(0.7, 0.7, 0.7);
        let lowerRArmCoordinates = new Matrix4(modelMatrix);
        modelMatrix.scale(0.3, 0.05, 0.05);
        modelMatrix.translate(0, 0, -1);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.bodyColor);
        modelMatrix.setIdentity();
        
        // Right outer finger
        modelMatrix = new Matrix4(lowerRArmCoordinates);
        modelMatrix.translate(0.25, 0, -0.02);
        modelMatrix.rotate(60, 0, 1, 0);
        modelMatrix.rotate(this.rOuterFingerAngle, 0, -1, 0);
        modelMatrix.scale(0.7, 0.03, 0.03);
        modelMatrix.translate(0, 0.3, 0);
        let rOuterFingerCoordinates = new Matrix4(modelMatrix);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.bodyColor);
        modelMatrix.setIdentity();
        
        // Right middle finger
        modelMatrix = new Matrix4(lowerRArmCoordinates);
        modelMatrix.translate(0.3, 0, 0);
        modelMatrix.rotate(90, 0, 1, 0);
        modelMatrix.rotate(this.rMidFingerAngle/2, 0, -1, 1);
        modelMatrix.scale(0.5, 0.03, 0.03);
        modelMatrix.translate(0, 0.3, -1);
        let rMidFingerCoordinates = new Matrix4(modelMatrix);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.bodyColor);
        modelMatrix.setIdentity();
        
        // Right inner finger
        modelMatrix = new Matrix4(lowerRArmCoordinates);
        modelMatrix.translate(0.3, 0, 0);
        modelMatrix.rotate(120, 0, 1, 0);
        modelMatrix.rotate(this.rInnerFingerAngle / 3, 0, -1, 0);
        modelMatrix.scale(0.45, 0.03, 0.03);
        modelMatrix.translate(0.1, 0.3, -0.4);
        let rInnerFingerCoordinates = new Matrix4(modelMatrix);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.bodyColor);
        modelMatrix.setIdentity();
        
        // Left leg
        modelMatrix.translate(0.05, 0, 0.2);
        modelMatrix.rotate(15, 0.8, 1, 0);
        let upperLLegCoordinates = new Matrix4(modelMatrix);
        modelMatrix.scale(0.05, 0.05, 0.15);
        modelMatrix.translate(0, -0.6, -0.44);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.bodyColor);
        modelMatrix.setIdentity();

        // Right leg
        modelMatrix.translate(-0.1, 0, 0.2);
        modelMatrix.rotate(-15, -0.8, 1, 0);
        let upperRLegCoordinates = new Matrix4(modelMatrix);
        modelMatrix.scale(0.05, 0.05, 0.15);
        modelMatrix.translate(0, -0.6, -0.5);
        modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        Cube.drawCube(modelMatrix, this.bodyColor);
        modelMatrix.setIdentity();
        
        // if (!this.showSkeleton) {

        //     // Draw head
        //     modelMatrix.translate(0, 0.1, -0.01);
        //     modelMatrix.rotate(-30, 1, 0, 0);
        //     modelMatrix.scale(0.13, 0.13, 0.2);
        //     modelMatrix.translate(-0.5, -0.5, -1.75);
        //     modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        //     Cube.drawCube(modelMatrix, this.bodyColor);
        //     modelMatrix.setIdentity();

        //     // Draw the body
        //     modelMatrix.scale(0.2, 0.17, 0.301);
        //     modelMatrix.translate(-0.5, -0.5, -0.5);
        //     modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        //     Cube.drawCube(modelMatrix, this.bodyColor);
        //     modelMatrix.setIdentity();
            
        //     // Draw shoulders
        //     modelMatrix.scale(0.25, 0.07, 0.07);
        //     modelMatrix.translate(-0.5, -0.5, -1.2);
        //     modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        //     Cube.drawCube(modelMatrix, this.bodyColor);
        //     modelMatrix.setIdentity();

        //     // Left arm
        //     // Left upper arm
        //     modelMatrix.translate(0.12, 0, -0.05);
        //     modelMatrix.rotate(this.lUpArmAngle - 30, 0, 1, 0);
        //     modelMatrix.rotate(this.lUpArmAngle, 0, 0, -1);
        //     let upperLArmCoordinates = new Matrix4(modelMatrix);
        //     modelMatrix.scale(0.152, 0.06, 0.06);
        //     modelMatrix.translate(-0.01, -0.5, -0.5);
        //     modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        //     Cube.drawCube(modelMatrix, this.bodyColor);
        //     modelMatrix.setIdentity();

        //     // Right arm
        //     // Right upper arm
        //     modelMatrix.translate(-0.12, 0, -0.05);
        //     modelMatrix.rotate(180, 0, 1, 0);
        //     modelMatrix.rotate(this.rUpArmAngle - 30, 0, -1, 0);
        //     modelMatrix.rotate(this.rUpArmAngle, 0, 0, -1);
        //     let upperRArmCoordinates = new Matrix4(modelMatrix);
        //     modelMatrix.scale(0.155, 0.06, 0.06);
        //     modelMatrix.translate(-0.02, -0.5, -0.5);
        //     modelMatrix = (new Matrix4(bodyMat)).multiply(modelMatrix);
        //     Cube.drawCube(modelMatrix, this.bodyColor);
        //     modelMatrix.setIdentity();
        // }
    }
}
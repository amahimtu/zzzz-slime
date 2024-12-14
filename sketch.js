let y = 0;
let startTime;
let auroraOffset = 0;
let willImage;
let glitchBuffer;
let isGlitching = false;
let glitchStartTime;
let particles = [];
let trees = [];
let geometricShapes = [];
let mouseHistory = [];

function preload() {
    willImage = loadImage('will-silhouette.jpg', 
        () => console.log('Image loaded successfully!'),
        (e) => {
            console.log('Failed to load .jpg, trying .png');
            willImage = loadImage('will-silhouette.png');
        }
    );
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    startTime = millis();
    imageMode(CORNER);
    glitchBuffer = createGraphics(width, height);
    glitchBuffer.imageMode(CORNER);
    
    // Create initial trees
    for(let i = 0; i < 15; i++) {
        trees.push({
            x: random(width),
            y: height,
            height: random(100, 300),
            branches: random(3, 7)
        });
    }
    
    // Create geometric shapes around mouse
    for(let i = 0; i < 20; i++) {
        geometricShapes.push({
            offsetX: random(-100, 100),
            offsetY: random(-100, 100),
            size: random(20, 60),
            rotation: 0,
            type: floor(random(3)),
            speed: random(0.001, 0.003)
        });
    }
    
    // Create particles around mouse
    for(let i = 0; i < 100; i++) {
        particles.push({
            offsetX: random(-150, 150),
            offsetY: random(-150, 150),
            size: random(1, 4),
            speed: random(0.5, 2),
            angle: random(TWO_PI)
        });
    }
}

function drawTree(x, y, len, angle, depth, branches) {
    if (depth === 0) return;
    
    stroke(255, 50);
    let endX = x + len * sin(angle);
    let endY = y - len * cos(angle);
    line(x, y, endX, endY);
    
    for(let i = 0; i < branches; i++) {
        let newAngle = angle + random(-PI/4, PI/4);
        drawTree(endX, endY, len * 0.7, newAngle, depth - 1, branches);
    }
}

function draw() {
    background(0, 5, 20, 25);
    
    // Store mouse history for trailing effect
    mouseHistory.push({x: mouseX, y: mouseY});
    if (mouseHistory.length > 20) mouseHistory.shift();
    
    // Update and draw particles
    for(let i = 0; i < particles.length; i++) {
        let p = particles[i];
        // Make particles orbit around mouse
        p.angle += 0.02;
        let targetX = mouseX + p.offsetX * cos(p.angle);
        let targetY = mouseY + p.offsetY * sin(p.angle);
        
        // Draw particle trail
        fill(255, 100);
        noStroke();
        ellipse(targetX, targetY, p.size);
    }
    
    // Draw geometric shapes following mouse with delay
    for(let i = 0; i < geometricShapes.length; i++) {
        let shape = geometricShapes[i];
        let historyIndex = floor(map(i, 0, geometricShapes.length, 0, mouseHistory.length - 1));
        let targetX = mouseHistory[historyIndex]?.x || mouseX;
        let targetY = mouseHistory[historyIndex]?.y || mouseY;
        
        shape.rotation += shape.speed;
        
        push();
        translate(targetX + shape.offsetX, targetY + shape.offsetY);
        rotate(shape.rotation);
        noFill();
        stroke(255, 30);
        if(shape.type === 0) {
            triangle(0, -shape.size/2, 
                    shape.size/2, shape.size/2, 
                    -shape.size/2, shape.size/2);
        } else if(shape.type === 1) {
            ellipse(0, 0, shape.size);
        } else {
            rectMode(CENTER);
            rect(0, 0, shape.size, shape.size);
        }
        pop();
    }
    
    // Enhanced Aurora effect
    auroraOffset += 0.005;
    for (let x = 0; x < width; x += 2) {
        for (let i = 0; i < 6; i++) {
            let yOffset = i * (height/8);
            let noiseVal = noise(x * 0.01, y * 0.01 + i, auroraOffset);
            let waveY = y + sin(x * 0.002 + auroraOffset * 2) * (height/6) 
                         + cos(x * 0.003 + auroraOffset) * (height/8);
            
            let lineHeight = map(noise(x * 0.02, i * 0.5, auroraOffset), 
                               0, 1, 
                               height/20,
                               height/8);
            
            let greenHue = map(noiseVal, 0, 1, 100, 200);
            let blueHue = map(noiseVal, 0, 1, 50, 150);
            let alpha = map(noiseVal, 0, 1, 20, 100);
            
            stroke(30 + sin(frameCount * 0.01) * 20, 
                   greenHue, 
                   blueHue, 
                   alpha);
            line(x, waveY + yOffset, x, waveY + yOffset + lineHeight);
        }
    }
    
    // Draw abstract trees
    for(let tree of trees) {
        drawTree(tree.x, tree.y, tree.height, -PI/2, 4, tree.branches);
    }
    
    // Add sine waves influenced by mouse position
    stroke(255, 20);
    noFill();
    beginShape();
    for(let x = 0; x < width; x += 20) {
        let distToMouse = abs(x - mouseX) * 0.005;
        let y = height/2 + sin(x * 0.01 + frameCount * 0.02 - distToMouse) * 100;
        vertex(x, y);
    }
    endShape();
    
    y = (y + 0.5) % height;
    
    // Will Ferrell glitch effect (unchanged)
    if (isGlitching && willImage && willImage.width > 0) {
        let timeSinceGlitch = millis() - glitchStartTime;
        
        if (timeSinceGlitch < 2000) {
            push();
            let flashAlpha = sin((timeSinceGlitch / 2000) * PI) * 255;
            
            glitchBuffer.clear();
            glitchBuffer.image(willImage, 0, 0, width, height);
            
            for (let i = 0; i < random(3, 8); i++) {
                let sliceY = random(height);
                let sliceH = random(10, 50);
                let offset = random(-20, 20);
                let temp = glitchBuffer.get(0, sliceY, width, sliceH);
                glitchBuffer.image(temp, offset, sliceY);
            }
            
            if (random() > 0.5) {
                let rgbShift = random(5, 15);
                let tempR = glitchBuffer.get();
                glitchBuffer.tint(255, 0, 0, flashAlpha * 0.5);
                glitchBuffer.image(tempR, rgbShift, 0);
                glitchBuffer.tint(0, 255, 0, flashAlpha * 0.5);
                glitchBuffer.image(tempR, 0, 0);
                glitchBuffer.tint(0, 0, 255, flashAlpha * 0.5);
                glitchBuffer.image(tempR, -rgbShift, 0);
            }
            
            if (random() > 0.7) {
                for (let i = 0; i < 100; i++) {
                    let x = random(width);
                    let y = random(height);
                    let w = random(20, 100);
                    let h = random(1, 5);
                    glitchBuffer.fill(255, random(50));
                    glitchBuffer.noStroke();
                    glitchBuffer.rect(x, y, w, h);
                }
            }
            
            tint(255, flashAlpha);
            image(glitchBuffer, 0, 0, width, height);
            pop();
        } else {
            isGlitching = false;
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    glitchBuffer.resizeCanvas(width, height);
    background(0);
}
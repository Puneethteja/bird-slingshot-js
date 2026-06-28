const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

let engine, world;
let ground, platform;
let box1, box2, box3, box4, box5;
let pig1, pig3;
let log1, log3, log4, log5;
let bird, slingshot;

let gameState = "start";
let isDragging = false;
let bg = "sprites/bg1.png";
let backgroundImg;
let score = 0;

const VIRTUAL_WIDTH = 1200;
const VIRTUAL_HEIGHT = 400;
let scaleX = 1;
let scaleY = 1;

const SLING_X = 200;
const SLING_Y = 50; 
const MAX_DIST = 80; 

let birdsUsed = 0;
const MAX_BIRDS = 5;
let currentLevel = 1;

function preload() {
    getTime();
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    calculateScale();
    engine = Engine.create();
    world = engine.world;
    engine.world.gravity.y = 1;
    gameState = "start";
    newGame();
}

function newGame() {
    World.clear(world);
    Engine.clear(engine);
    engine = Engine.create();
    world = engine.world;

    ground = new Ground(600, 400, 1200, 20);
    platform = new Ground(150, 305, 300, 170);

    box1 = new Box(850, 320, 70, 70);
    box2 = new Box(1070, 320, 70, 70);
    pig1 = new Pig(960, 350);
    log1 = new Log(960, 260, 300, PI / 2);

    box3 = new Box(850, 240, 70, 70);
    box4 = new Box(1070, 240, 70, 70);
    pig3 = new Pig(960, 220);
    log3 = new Log(960, 180, 300, PI / 2);

    box5 = new Box(960, 160, 70, 70);
    log4 = new Log(910, 120, 150, PI / 7);
    log5 = new Log(1010, 120, 150, -PI / 7);

    bird = new Bird(SLING_X, SLING_Y);
    slingshot = new SlingShot(bird.body, { x: SLING_X, y: SLING_Y });

    bird.body.frictionAir = 0.005;
    bird.body.mass = 1;
    
    gameState = "start";
    birdsUsed = 0;
}

function draw() {
    push();
    scale(scaleX, scaleY);
    background(backgroundImg || 180);

    noStroke();
    textSize(35);
    fill("white");
    text("Score: " + score + " | Birds left: " + (MAX_BIRDS - birdsUsed), VIRTUAL_WIDTH - 400, 50);

    if (gameState !== "ended" && gameState !== "start" && gameState !== "lost") {
        if (gameState === "onSling" && isDragging) {
            let targetX = mouseX / scaleX;
            let targetY = mouseY / scaleY;
            let d = dist(targetX, targetY, SLING_X, SLING_Y);

            if (d > MAX_DIST) {
                let angle = atan2(targetY - SLING_Y, targetX - SLING_X);
                targetX = SLING_X + cos(angle) * MAX_DIST;
                targetY = SLING_Y + sin(angle) * MAX_DIST;
            }

            Matter.Body.setPosition(bird.body, { x: targetX, y: targetY });
            Matter.Body.setVelocity(bird.body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(bird.body, 0);
            bird.body.force = { x: 0, y: 0 }; 
        }

        if (gameState === "flying") {
            let counterGravity = 0.001 * bird.body.mass;
            Matter.Body.applyForce(bird.body, bird.body.position, { x: 0, y: -counterGravity });
            if (bird.body.velocity.x < 15) {
                Matter.Body.setVelocity(bird.body, { x: 18, y: bird.body.velocity.y * 0.95 });
            }
        }
        Engine.update(engine);
    }

    if (gameState === "launched" || gameState === "flying") {
        if (bird.trajectory && bird.body.position.x > SLING_X + 20) {
            bird.trajectory.push([bird.body.position.x, bird.body.position.y]);
        }
    }

    box1.display(); box2.display(); ground.display(); pig1.display(); log1.display();
    box3.display(); box4.display(); pig3.display(); log3.display();
    box5.display(); log4.display(); log5.display();
    bird.display(); platform.display(); slingshot.display();

    if (gameState === "start") {
        push(); 
        rectMode(CORNER); fill(15, 15, 25, 220); rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT); 
        
        textAlign(CENTER, CENTER); fill(255, 215, 0); textSize(60); textStyle(BOLD);
        text("READY TO LAUNCH?", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 - 80);

        fill(255); textSize(22); textStyle(NORMAL);
        text("Drag and aim the bird to launch.", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 - 30);
        text("Tap mid-air to fly!", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 5);
        text("Press SPACE to reset the bird position.", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 40);
        
        fill(50, 200, 50); rectMode(CENTER); rect(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 120, 250, 60, 10);
        fill(255); textSize(28); textStyle(BOLD);
        text("TAP TO START", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 120);
        pop(); 
    } else if (gameState === "ended") {
        push();
        rectMode(CORNER); fill(0, 0, 0, 220); rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
        textAlign(CENTER, CENTER); fill(50, 255, 50); textSize(70); textStyle(BOLD);
        text("LEVEL " + currentLevel + " CLEARED!", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 - 40);
        fill(255, 165, 0); rectMode(CENTER); rect(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 100, 320, 50, 10);
        fill(255); textSize(22); textStyle(BOLD); text("TAP TO PLAY AGAIN", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 100);
        pop();
    } else if (gameState === "lost") {
        push();
        rectMode(CORNER); fill(20, 0, 0, 220); rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
        textAlign(CENTER, CENTER); fill(255, 50, 50); textSize(70); textStyle(BOLD);
        text("GAME OVER", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 - 40);
        fill(255, 165, 0); rectMode(CENTER); rect(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 100, 260, 50, 10);
        fill(255); textSize(22); textStyle(BOLD); text("TAP TO RESTART", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 100);
        pop();
    }
    checkWinCondition();
    pop();
}

function mousePressed() {
    let mX = mouseX / scaleX;
    let mY = mouseY / scaleY;

   if (gameState === "start") {
        let btnX = VIRTUAL_WIDTH / 2, btnY = VIRTUAL_HEIGHT / 2 + 120, btnW = 250, btnH = 60;
        if (mX >= btnX - btnW/2 && mX <= btnX + btnW/2 && mY >= btnY - btnH/2 && mY <= btnY + btnH/2) {
            gameState = "onSling";
        }
    }
    else if (gameState === "ended") {
        let btnX = VIRTUAL_WIDTH / 2, btnY = VIRTUAL_HEIGHT / 2 + 100, btnW = 320, btnH = 50;
        if (mX >= btnX - btnW/2 && mX <= btnX + btnW/2 && mY >= btnY - btnH/2 && mY <= btnY + btnH/2) {
         score = 0; newGame();
        }
    } 
    else if (gameState === "lost") { 
        let btnX = VIRTUAL_WIDTH / 2, btnY = VIRTUAL_HEIGHT / 2 + 100, btnW = 260, btnH = 50;
        if (mX >= btnX - btnW/2 && mX <= btnX + btnW/2 && mY >= btnY - btnH/2 && mY <= btnY + btnH/2) {
            score = 0; newGame();
        }
    }
    else if (gameState === "onSling") {
        if (dist(mX, mY, bird.body.position.x, bird.body.position.y) < 55) isDragging = true;
    } 
    else if (gameState === "launched") {
        if (bird.body.velocity.x > 0.1) {
            Matter.Body.setVelocity(bird.body, { x: 26, y: -2 }); 
            Matter.Body.setAngularVelocity(bird.body, 0);
            gameState = "flying"; 
        }
    }
}

function mouseDragged() { return false; }

function mouseReleased() {
    if (gameState === "onSling" && isDragging && birdsUsed < MAX_BIRDS) {
        isDragging = false; birdsUsed++;
        Matter.Body.setVelocity(bird.body, { x: (SLING_X - bird.body.position.x)*0.25, y: (SLING_Y - bird.body.position.y)*0.25 });
        slingshot.fly(); gameState = "launched";
    }
}

function keyPressed() {
    if (keyCode === 32) { 
        if (gameState === "launched" || gameState === "flying") {
            if (birdsUsed < MAX_BIRDS) {
                Matter.Body.setVelocity(bird.body, { x: 0, y: 0 });
                Matter.Body.setAngularVelocity(bird.body, 0);
                Matter.Body.setAngle(bird.body, 0);
                Matter.Body.setPosition(bird.body, { x: SLING_X, y: SLING_Y });
                slingshot.attach(bird.body);
                gameState = "onSling";
                isDragging = false;
                if (bird.trajectory) bird.trajectory = [];
            } else { gameState = "lost"; }
           
        }
        return false;
    }
    if ((key === 'r' || key === 'R') && gameState === "lost") {
        score = 0; currentLevel = 1; newGame();
    }
}

function checkWinCondition() {
    if (score >= 100) gameState = "ended";
    else if (birdsUsed >= MAX_BIRDS && Math.abs(bird.body.velocity.x) < 0.2 && Math.abs(bird.body.velocity.y) < 0.2) gameState = "lost";
}

function calculateScale() { scaleX = windowWidth / VIRTUAL_WIDTH; scaleY = windowHeight / VIRTUAL_HEIGHT; }
function windowResized() { resizeCanvas(windowWidth, windowHeight); calculateScale(); }

async function getTime() {
    try {
        let res = await fetch("https://worldtimeapi.org/api/timezone/Asia/Kolkata");
        if (!res.ok) throw new Error("API Offline");
        let data = await res.json();
        let hour = parseInt(data.datetime.slice(11, 13));
        bg = (hour >= 6 && hour <= 19) ? "sprites/bg1.png" : "sprites/bg2.jpg";
    } catch (e) { 
        bg = "sprites/bg1.png"; // Fallback to default
    }
    backgroundImg = loadImage(bg);
}
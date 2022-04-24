const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var engine, world;
var canvas;
var Cowboy, CowboyBase, CowboyShooter;
var computer, computerBase, computerShooter;
var CowboyBullets = [];
var computerBullets = [];
var CowboyShooterLife = 3;
var computerShooterLife = 3;

function preload() {
  backgroundImg = loadImage("./assets/background.gif");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);

  engine = Engine.create();
  world = engine.world;

  CowboyBase = new CowboyBase(300, random(450, height - 300), 180, 150);
  Cowboy = new Cowboy(285, CowboyBase.body.position.y - 153, 50, 180);
  CowboyShooter = new CowboyShooter(
    340,
    CowboyBase.body.position.y - 180,
    120,
    120
  );

  computerBase = new ComputerBase(
    width - 300,
    random(450, height - 300),
    180,
    150
  );
  computer = new Computer(
    width - 280,
    computerBase.body.position.y - 153,
    50,
    180
  );

  computerShooter = new ComputerShooter(
    width - 350,
    computerBase.body.position.y - 180,
    120,
    120
  );
  handleComputerShooter();
}

function draw() {
  background(backgroundImg);

  Engine.update(engine);

  // Title
  fill("#FFFF");
  textAlign("center");
  textSize(40);
  text("EPIC ShooterY", width / 2, 100);

  for (var i = 0; i < CowboyBullets.length; i++) {
    showBullets(i, CowboyBullets);
  }

  CowboyBase.display();
  Cowboy.display();
  Cowboy.life();
  CowboyShooter.display();
  handleCowboyArrowCollision();

  for (var i = 0; i < computerBullets.length; i++) {
    showBullets(i, computerBullets);
  }

  computerBase.display();
  computer.display();
  computer.life();
  computerShooter.display();
  handleComputerArrowCollision();
}

function keyPressed() {
  if (keyCode === 32) {
    var posX = CowboyShooter.body.position.x;
    var posY = CowboyShooter.body.position.y;
    var angle = CowboyShooter.body.angle;

    var arrow = new CowboyArrow(posX, posY, 100, 10, angle);

    arrow.trajectory = [];
    Matter.Body.setAngle(arrow.body, angle);
    CowboyBullets.push(arrow);
  }
}

function keyReleased() {
  if (keyCode === 32) {
    if (CowboyBullets.length) {
      var angle = CowboyShooter.body.angle;
      CowboyBullets[CowboyBullets.length - 1].shoot(angle);
    }
  }
}

function showBullets(index, Bullets) {
  Bullets[index].display();
  if (
    Bullets[index].body.position.x > width ||
    Bullets[index].body.position.y > height
  ) {
    if (!Bullets[index].isRemoved) {
      Bullets[index].remove(index, Bullets);
    } else {
      Bullets[index].trajectory = [];
    }
  }
}

function handleComputerShooter() {
  if (!computerShooter.collapse && !CowboyShooter.collapse) {
    setTimeout(() => {
      var pos = computerShooter.body.position;
      var angle = computerShooter.body.angle;
      var moves = ["UP", "DOWN"];
      var move = random(moves);
      var angleValue;

      if (move === "UP" && computerShooter.body.angle < 1.67) {
        angleValue = 0.1;
      }else{
          angleValue = -0.1;
      }
      if(move === "DOWN" && computerShooter.body.angle > 1.47) {
        angleValue = -0.1;
      }else{
          angleValue = 0.1;
      }
      
      angle += angleValue;

      var arrow = new ComputerArrow(pos.x, pos.y, 100, 10, angle);

      Matter.Body.setAngle(computerShooter.body, angle);
      Matter.Body.setAngle(computerShooter.body, angle);

      computerBullets.push(arrow);
      setTimeout(() => {
        computerBullets[computerBullets.length - 1].shoot(angle);
      }, 100);

      handleComputerShooter();
    }, 2000);
  }
}

function handleCowboyArrowCollision() {
  for (var i = 0; i < CowboyBullets.length; i++) {
    var baseCollision = Matter.SAT.collides(
      CowboyBullets[i].body,
      computerBase.body
    );

    var ShooterCollision = Matter.SAT.collides(
      CowboyBullets[i].body,
      computerShooter.body
    );

    var computerCollision = Matter.SAT.collides(
      CowboyBullets[i].body,
      computer.body
    );

    if (
      baseCollision.collided ||
      ShooterCollision.collided ||
      computerCollision.collided
    ) {
      computerShooterLife -= 1;
      computer.reduceLife(computerShooterLife);
      if (computerShooterLife <= 0) {
        computerShooter.collapse = true;
        Matter.Body.setStatic(computerShooter.body, false);
        Matter.Body.setStatic(computer.body, false);
        Matter.Body.setPosition(computer.body, {
          x: width - 100,
          y: computer.body.position.y
        });
      }
    }
  }
}

function handleComputerArrowCollision() {
  for (var i = 0; i < computerBullets.length; i++) {
    var baseCollision = Matter.SAT.collides(
      computerBullets[i].body,
      CowboyBase.body
    );

    var ShooterCollision = Matter.SAT.collides(
      computerBullets[i].body,
      CowboyShooter.body
    );

    var CowboyCollision = Matter.SAT.collides(
      computerBullets[i].body,
      Cowboy.body
    );

    if (
      baseCollision.collided ||
      ShooterCollision.collided ||
      CowboyCollision.collided
    ) {
      CowboyShooterLife -= 1;
      Cowboy.reduceLife(CowboyShooterLife);
      if (CowboyShooterLife <= 0) {
        CowboyShooter.collapse = true;
        Matter.Body.setStatic(CowboyShooter.body, false);
        Matter.Body.setStatic(Cowboy.body, false);
        Matter.Body.setPosition(Cowboy.body, {
          x: 100,
          y: Cowboy.body.position.y
        });
      }
    }
  }
}

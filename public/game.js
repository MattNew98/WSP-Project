let currentColor = 'black'

  function setup() {
    const myCanvas = createCanvas(900, 440);
    myCanvas.parent(document.querySelector("#right-top-container"))
    strokeWeight(1)
  }

  function draw() {

    //print('x:' + mouseX + 'y:' + mouseY);
    //the button
    fill(255, 0, 0);
    rect(100, 100, 50, 50)
    fill(0, 255, 0);
    rect(300, 100, 50, 50)
    fill(0, 0, 255);
    rect(500, 100, 50, 50)
    fill(255)
    rect(30, 30, 50, 20)

    //make the button can switch the color
    if (mouseIsPressed == true) {
      stroke(currentColor);
      line(mouseX, mouseY, pmouseX, pmouseY);
      console.log("mouseXY", mouseX, mouseY)
      
      console.log("pmouse",pmouseX, pmouseY)

    


    }

    if (mouseIsPressed) {
      if (mouseX > 100 && mouseX < 150 && mouseY > 100 && mouseY < 150) {
        print('switching to color red');
        currentColor = 'red';
      } else if (mouseX > 300 && mouseX < 350 && mouseY > 100 && mouseY < 150) {
        print('switching to color green');
        currentColor = 'green';
      } else if (mouseX > 500 && mouseX < 550 && mouseY > 100 && mouseY < 150) {
        print('switching to blue');
        currentColor = 'blue';
      } else if (mouseX > 32 && mouseX < 80 && mouseY > 33 && mouseY < 50) {
        print('clearing the bg');
        background(255);
        currentColor = 'black';

      }
    }

    //name the button
    textSize(20);
    text('Red', 108, 132);
    textSize(15);
    text('Green', 302, 132);
    textSize(20);
    text('blue', 508, 132);


  }

  function keyPressed() {
    if (key == 's') {
      saveCanvas('myart.png');
    }
  }
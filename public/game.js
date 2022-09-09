let selectedColor = 'black' // define the user selected color
const socket = io.connect(); // connect to socketIO

//接收server送來的座標
socket.on("draw-new-line", ({ mouseX, mouseY, pmouseX, pmouseY }) => {
  stroke('black')
  line(mouseX, mouseY, pmouseX, pmouseY);
})
function setup() {
  const myCanvas = createCanvas(1400, 640); // 遊戲版 Width x Height
  myCanvas.parent(document.querySelector("#drawing-board"))
  strokeWeight(3) // 線條粗幼度
}

function draw() {

  // Color button
  stroke('black');
  fill(255, 0, 0); // red // 變色按鈕顏色
  rect(120, 590, 40, 40) // 變色按鈕座標和圖案
  stroke('black')
  fill(0, 255, 0); // green
  rect(160, 590, 40, 40)
  stroke('black')
  fill(0, 0, 255); // blue
  rect(200, 590, 40, 40)
  stroke('black')
  fill(255, 204, 0); // yellow
  rect(240, 590, 40, 40)
  stroke('black')
  fill(0); // black
  rect(280, 590, 40, 40)


  //make the button can switch the color
  if (mouseIsPressed == true) {
    stroke(selectedColor);
    line(mouseX, mouseY, pmouseX, pmouseY);
    socket.emit("new-line", { mouseX, mouseY, pmouseX, pmouseY }) // 傳送座標給server
    console.log("mouseXY", mouseX, mouseY)

    console.log("pmouse", pmouseX, pmouseY)




  }

  if (mouseIsPressed) {
    if (mouseX > 120 && mouseX < 160 && mouseY > 590 && mouseY < 630) {
      print('switching to color red');
      selectedColor = 'red';
    } else if (mouseX > 160 && mouseX < 200 && mouseY > 590 && mouseY < 630) {
      print('switching to color green');
      selectedColor = 'green';
    } else if (mouseX > 200 && mouseX < 240 && mouseY > 590 && mouseY < 630) {
      print('switching to blue');
      selectedColor = 'blue';
    } else if (mouseX > 240 && mouseX < 280 && mouseY > 590 && mouseY < 630) {
      print('switching to orange');
      selectedColor = 'orange';
    } else if (mouseX > 280 && mouseX < 320 && mouseY > 590 && mouseY < 630) {
      print('switching to black');
      selectedColor = 'black';
    } else if (mouseX > 0 && mouseX < 80 && mouseY > 605 && mouseY < 640) {
      print('clearing the bg');
      background(255);
      selectedColor = 'black';

    }
  }
  textSize(25);
  stroke('white')
  text('Clear', 8, 630)


}

function keyPressed() {
  if (key == 's') {
    saveCanvas('myart.png');
  }
}
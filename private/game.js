let selectedColor = '#000000' // define the user selected color
console.log(selectedColor)
let selectedStrokeWeight = 10
const socket = io.connect(); // connect to socketIO
let ctx //get context of the canvas
let canvas
let fillBucket = false
function changeColor(color) {
  if (color === 'red') {
    selectedColor = '#ff0000';

  } else if (color === 'green') {
    selectedColor = '#008000';

  } else if (color === 'blue') {
    selectedColor = '#0000ff';

  } else if (color === 'yellow') {
    selectedColor = '#ffff00'
  } else if (color === 'black') {
    selectedColor = '#000000'
  } else if (color === 'white') {
    selectedColor = '#ffffff'
  }
  // console.log("selectedColor: " + selectedColor)
  // socket.emit("new-color", { selectedColor }) // 傳送selectedColor給server
}
function changeStroke(number) {
  selectedStrokeWeight = number
  fillBucket = false //turn off fillBucket when choosing stroke 
}
function clearBoard() {
  background(255)
  socket.emit("clear-board") //tell server to clear drawing board
}

function fillBucketOn() {
  fillBucket = true
}

socket.on("clear", data => { //clear drawing board as per sever
  background(255)
})

//接收server送來的座標
socket.on("draw-new-line", ({ mouseX, mouseY, pmouseX, pmouseY, selectedColor, selectedStrokeWeight }) => {
  // noStroke()
  // fill(selectedColor)
  // ellipse(mouseX, mouseY, 5)
  // console.log('cp01', selectedStrokeWeight)
  strokeWeight(selectedStrokeWeight)
  stroke(selectedColor)
  line(mouseX, mouseY, pmouseX, pmouseY)
})
function setup() {
  const myCanvas = createCanvas(1400, 640); // 遊戲版 Width x Height
  myCanvas.parent(document.querySelector("#drawing-board"))
  strokeWeight(3) // 線條粗幼度
  noLoop()
  socket.emit("get-board")
  socket.on("show-board", (drawBoardObj) => { //display drawing from before joining the game to the board
    let boardArray = drawBoardObj.drawBoardArray;
    for (let emit of boardArray) {
      stroke(emit.selectedColor)
      strokeWeight(selectedStrokeWeight)
      line(emit.mouseX, emit.mouseY, emit.pmouseX, emit.pmouseY)

    }
  })

  canvas = document.getElementById("defaultCanvas0")
  ctx = canvas.getContext("2d")
}

//can delete??
function draw() {
  // console.log('drawing')

  // Color button
  // stroke('black');
  // fill(255, 0, 0); // red // 變色按鈕顏色
  // rect(120, 590, 40, 40) // 變色按鈕座標和圖案
  // stroke('black')
  // fill(0, 255, 0); // green
  // rect(160, 590, 40, 40)
  // stroke('black')
  // fill(0, 0, 255); // blue
  // rect(200, 590, 40, 40)
  // stroke('black')
  // fill(255, 204, 0); // yellow
  // rect(240, 590, 40, 40)
  // stroke('black')
  // fill(0); // black
  // rect(280, 590, 40, 40)


  //make the button can switch the color
  // if (mouseIsPressed == true) {
  //   stroke(selectedColor);
  //   line(mouseX, mouseY, pmouseX, pmouseY);
  //   // socket.emit("new-line", { mouseX, mouseY, pmouseX, pmouseY }) // 傳送座標給server


  // }

  // if (mouseIsPressed) {
  //   if (mouseX > 120 && mouseX < 160 && mouseY > 590 && mouseY < 630) {
  //     selectedColor = 'red';
  //   } else if (mouseX > 160 && mouseX < 200 && mouseY > 590 && mouseY < 630) {
  //     selectedColor = 'green';
  //   } else if (mouseX > 200 && mouseX < 240 && mouseY > 590 && mouseY < 630) {
  //     selectedColor = 'blue';
  //   } else if (mouseX > 240 && mouseX < 280 && mouseY > 590 && mouseY < 630) {
  //     selectedColor = 'orange';
  //   } else if (mouseX > 280 && mouseX < 320 && mouseY > 590 && mouseY < 630) {
  //     selectedColor = 'black';
  //   } else if (mouseX > 0 && mouseX < 80 && mouseY > 605 && mouseY < 640) {
  //     background(255);
  //     selectedColor = 'black';
  //   }
  //   console.log("selectedColor: " + selectedColor)
  //   socket.emit("new-color", { selectedColor }) // 傳送selectedColor給server
  // }
  // textSize(25);
  // stroke('white')
  // text('Clear', 8, 630)


}

function mousePressed() {
  //update pmouse x and y for every new mouse press
  pmouseX = mouseX
  pmouseY = mouseY

  if (fillBucket === false) {
    mouseDragged()
  } else {
    flood_fill(mouseX, mouseY, color_to_rgba(selectedColor))
  }
  // console.log('pressed')
  // if (mouseX > 120 && mouseX < 160 && mouseY > 590 && mouseY < 630) {
  //   selectedColor = 'red';
  // } else if (mouseX > 160 && mouseX < 200 && mouseY > 590 && mouseY < 630) {
  //   selectedColor = 'green';
  // } else if (mouseX > 200 && mouseX < 240 && mouseY > 590 && mouseY < 630) {
  //   selectedColor = 'blue';
  // } else if (mouseX > 240 && mouseX < 280 && mouseY > 590 && mouseY < 630) {
  //   selectedColor = 'orange';
  // } else if (mouseX > 280 && mouseX < 320 && mouseY > 590 && mouseY < 630) {
  //   selectedColor = 'black';
  // } else if (mouseX > 0 && mouseX < 80 && mouseY > 605 && mouseY < 640) {
  //   background(255);
  //   selectedColor = 'black';
  //   console.log("selectedColor: " + selectedColor)
  //   socket.emit("new-color", { selectedColor }) // 傳送selectedColor給server

  //   stroke('black');
  //   fill(255, 0, 0); // red // 變色按鈕顏色
  //   rect(120, 590, 40, 40) // 變色按鈕座標和圖案
  //   stroke('black')
  //   fill(0, 255, 0); // green
  //   rect(160, 590, 40, 40)
  //   stroke('black')
  //   fill(0, 0, 255); // blue
  //   rect(200, 590, 40, 40)
  //   stroke('black')
  //   fill(255, 204, 0); // yellow
  //   rect(240, 590, 40, 40)
  //   stroke('black')
  //   fill(0); // black
  //   rect(280, 590, 40, 40)
  //   textSize(25);
  //   stroke('white')
  //   text('Clear', 8, 630)

  // }
}
function mouseDragged() {
  // console.log('dragged')
  stroke(selectedColor)
  strokeWeight(selectedStrokeWeight)
  line(mouseX, mouseY, pmouseX, pmouseY)
  socket.emit("new-line", { mouseX, mouseY, pmouseX, pmouseY, selectedColor, selectedStrokeWeight }) // 傳送座標給server
  pmouseX = mouseX //update pmouseX Y manually
  pmouseY = mouseY
}



function keyPressed() {
  if (key == 's') {
    saveCanvas('myart.png');
  }
}

function flood_fill(original_x, original_y, color) {
  original_color = ctx.getImageData(original_x, original_y, 1, 1).data;
  original_color = {
    r: original_color[0],
    g: original_color[1],
    b: original_color[2],
    a: original_color[3]
  };

  x = original_x;
  y = original_y;
  boundary_pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // first we go up until we find a boundary
  linear_cords = (y * canvas.width + x) * 4;
  var done = false;
  while (y >= 0 && !done) {
    var new_linear_cords = ((y - 1) * canvas.width + x) * 4;
    if (boundary_pixels.data[new_linear_cords] == original_color.r &&
      boundary_pixels.data[new_linear_cords + 1] == original_color.g &&
      boundary_pixels.data[new_linear_cords + 2] == original_color.b &&
      boundary_pixels.data[new_linear_cords + 3] == original_color.a) {
      y = y - 1;
      linear_cords = new_linear_cords;
    } else {
      done = true;
    }
  }
  // then we loop around until we get back to the starting point
  var path = [{ x: x, y: y }];
  var first_iteration = true;
  var iteration_count = 0;
  var orientation = 1; // 0:^, 1:<-, 2:v, 3:->
  while (!(path[path.length - 1].x == path[0].x && path[path.length - 1].y == path[0].y) || first_iteration) {
    iteration_count++;
    first_iteration = false;
    var got_it = false;

    if (path.length >= 2) {
      if (path[path.length - 1].y - path[path.length - 2].y < 0) {
        orientation = 0;
        //console.log( "^" ) ;
      } else if (path[path.length - 1].x - path[path.length - 2].x < 0) {
        orientation = 1;
        //console.log( "<-" ) ;
      } else if (path[path.length - 1].y - path[path.length - 2].y > 0) {
        orientation = 2;
        //console.log( "v" ) ;
      } else if (path[path.length - 1].x - path[path.length - 2].x > 0) {
        orientation = 3;
        //console.log( "->" ) ;
      } else {
        //console.log( "we shouldn't be here" ) ;
      }
    }

    for (var look_at = 0; !got_it && look_at <= 3; look_at++) {
      var both = (orientation + look_at) % 4;
      if (both == 0) {
        // we try right
        if (!got_it && (x + 1) < canvas.width) {
          linear_cords = (y * canvas.width + (x + 1)) * 4;
          if (boundary_pixels.data[linear_cords] == original_color.r &&
            boundary_pixels.data[linear_cords + 1] == original_color.g &&
            boundary_pixels.data[linear_cords + 2] == original_color.b &&
            boundary_pixels.data[linear_cords + 3] == original_color.a) {
            got_it = true;
            x = x + 1;
          }
        }
      } else if (both == 1) {
        // we try up
        if (!got_it && (y - 1) >= 0) {
          linear_cords = ((y - 1) * canvas.width + x) * 4;
          if (boundary_pixels.data[linear_cords] == original_color.r &&
            boundary_pixels.data[linear_cords + 1] == original_color.g &&
            boundary_pixels.data[linear_cords + 2] == original_color.b &&
            boundary_pixels.data[linear_cords + 3] == original_color.a) {
            got_it = true;
            y = y - 1;
          }
        }
      } else if (both == 2) {
        // we try left
        if (!got_it && (x - 1) >= 0) {
          linear_cords = (y * canvas.width + (x - 1)) * 4;
          if (boundary_pixels.data[linear_cords] == original_color.r &&
            boundary_pixels.data[linear_cords + 1] == original_color.g &&
            boundary_pixels.data[linear_cords + 2] == original_color.b &&
            boundary_pixels.data[linear_cords + 3] == original_color.a) {
            got_it = true;
            x = x - 1;
          }
        }
      } else if (both == 3) {
        // we try down
        if (!got_it && (y + 1) < canvas.height) {
          linear_cords = ((y + 1) * canvas.width + x) * 4;
          if (boundary_pixels.data[linear_cords] == original_color.r &&
            boundary_pixels.data[linear_cords + 1] == original_color.g &&
            boundary_pixels.data[linear_cords + 2] == original_color.b &&
            boundary_pixels.data[linear_cords + 3] == original_color.a) {
            got_it = true;
            y = y + 1;
          }
        }
      }
    }

    if (got_it) {
      path.push({ x: x, y: y });
    }
  }

  draw_quadratic_curve(path, ctx, color, 1, color);
}

function draw_quadratic_curve(path, ctx, color, thickness, fill_color) {
  color = "rgba( " + color.r + "," + color.g + "," + color.b + "," + color.a + ")";
  fill_color = "rgba( " + fill_color.r + "," + fill_color.g + "," + fill_color.b + "," + fill_color.a + ")";
  ctx.strokeStyle = color;
  ctx.fillStyle = fill_color;
  ctx.lineWidth = thickness;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  //ctx.fillStyle = fill_color ;

  if (path.length > 0) { // just in case
    if (path.length < 3) {
      var b = path[0];
      ctx.beginPath();
      ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0);
      ctx.fill();
      ctx.closePath();

      //return ;
    } else {
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (var i = 1; i < path.length - 2; i++) {
        var c = (path[i].x + path[i + 1].x) / 2;
        var d = (path[i].y + path[i + 1].y) / 2;
        ctx.quadraticCurveTo(path[i].x, path[i].y, c, d);
      }

      // the last 2 points are special
      ctx.quadraticCurveTo(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
      ctx.stroke();
    }
  }
  if (fill_color !== false) {
    ctx.fill();
  }
}






function generate_random_color() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// adapted from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function color_to_rgba(color) {
  if (color[0] == "#") { // hex notation
    color = color.replace("#", "");
    var bigint = parseInt(color, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return {
      r: r,
      g: g,
      b: b,
      a: 255,
    };

  } else if (color.indexOf("rgba(") == 0) { // already in rgba notation
    color = color.replace("rgba(", "").replace(" ", "").replace(")", "").split(",");
    console.log(color)
    return {
      r: color[0],
      g: color[1],
      b: color[2],
      a: color[3] * 255
    };
  } else {
    console.error("warning: can't convert color to rgba: " + color);
    return {
      r: 0,
      g: 0,
      b: 0,
      a: 0
    };
  }
}
// CHANGE IP BEFORE OPEN SERVER!!!!! // "192.168.59.61:8080" "localhost:8080"
let SERVER_IP = "localhost:8080"
let selectedColor = '#000000' // default selected color
let selectedStrokeWeight = 10 //default selected stroke weight
const socket = io.connect(SERVER_IP); // connect to socketIO
let ctx //get context of the canvas
let canvas
let fillBucket = false //toggle fillBucket on/off
let username
let socketID
let userIcon
let playerScore = []
let drawable = false
let topicsArray
let guessedTheWord = false
let timer = document.querySelector('.timer')
let turnCounter = 0
let scoreboardInAscendingOrder
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id')
const topicContainer = document.querySelector('.topic-container')
socketID = id

if (SERVER_IP[0] == "l") {
  history.pushState({ url: '/lobby.html' }, null)
} else {
  history.pushState({ url: 'http://${SERVER_IP}/lobby.html' }, null)
}
// GAME FLOW:
// Game loaded start 321 countdown on front end
//     vv
//if Player 1 >> Prompt WORD to P1 screen , drawable =true,start countdown bar
//     vv
//else display Player[x] is drawing,start guessing with chat
//     vv
//if Player[x] guessed correctly , Player[x] score ++
//if countdown bar ends, prompt scoreboard, Player 1 drawable=false
//     vv
//Next phase
//start 321 countdown 
//prompt word to next player screen drawable =true,start countdown bar


socket.emit('fetch-room-data', (socketID))


////// get user data
async function getProfile() {
  const res = await fetch('/user/me')
  const result = await res.json()
  username = result.username
  userIcon = result.image
  userID = result.id
  if (username) {
    document.querySelector('.user-name').innerHTML = `${username}`
    document.querySelector('.user-icon').innerHTML = `<img src="${userIcon}">`
  } else {
    document.querySelector('.user-name').innerHTML = `Welcome !!!`
  }
}
getProfile()


// setup canvas
function setup() {
  const myCanvas = createCanvas(1000, 700); // 遊戲版 Width x Height
  myCanvas.parent(document.querySelector("#drawing-board"))
  strokeWeight(3) // 線條粗幼度
  noLoop()

  //ask server for drawing board and display drawing for players who refresh their page or join the game after it starts
  socket.emit("get-board", (socketID))
  socket.on("show-board", (drawBoardArray) => {
    let boardArray = drawBoardArray;
    for (let emit of boardArray) {
      if (emit.fill == false) {
        stroke(emit.selectedColor)
        strokeWeight(emit.selectedStrokeWeight)
        line(emit.mouseX, emit.mouseY, emit.pmouseX, emit.pmouseY)
      } else if (emit.fill == true) {
        flood_fill(floor(emit.mouseX), floor(emit.mouseY), color_to_rgba(emit.selectedColor))
      }
    }
  })
  canvas = document.getElementById("defaultCanvas0")//get canvas element
  ctx = canvas.getContext("2d")//get canvas context


}

socket.on('show-room-data', (roomData) => {

  document.querySelector('.topic-container').innerHTML = " "
  // console.log(roomData.drawingPlayer)
  topicsArray = roomData.topics
  players = roomData.players
  playerScore = []
  turnCounter = roomData.turn
  for (let player of players) {
    if (player.name == roomData.drawingPlayer) {
      playerScore.push({ name: player.name, score: player.score, userIcon: player.userIcon, isDrawing: true })
    } else {
      playerScore.push({ name: player.name, score: player.score, userIcon: player.userIcon, isDrawing: false })
    }

  }
  createScoreboard()


  if (roomData.drawingPlayer == username) {
    move(roomData.barWidth)
    drawable = true

    document.querySelector('.topic-container').innerHTML += `
    <div class="topic">Your word is:<div style="font-weight: bold;margin-left:5px">${roomData.topics[turnCounter]}</div> </div>
    `
  } else {
    drawable = false
    let numberOfCharacters = roomData.topics[turnCounter].length
    let guess = " "
    for (let i = 0; i < numberOfCharacters; i++) {
      if (roomData.topics[turnCounter][i] == " ") {
        guess += " - "
      } else {
        guess += " _ "
      }

    }

    document.querySelector('.topic-container').innerHTML += `
    <div class="topic">${roomData.drawingPlayer} is drawing:</div>
    
    <div style="font-weight: bold;margin-left:8px">${guess}</div>
    `
  }

})



socket.on('next-turn', () => {

  drawable = false
  guessedTheWord = false
  setTimeout(() => { socket.emit('fetch-room-data', (socketID)) }, 3000)


})

socket.on('show-topic', () => {
  topicContainer.innerHTML = `<div class="topic">The answer is: <div class="topic-answer">${topicsArray[turnCounter]}</div> </div>`
})

////// create comment box
async function createChats() {

  const chatsFormElement = document.querySelector('#message-form')
  chatsFormElement.addEventListener('submit', async (e) => {
    e.preventDefault()
    const form = e.target
    const content = form.chat.value
    if (drawable == false) {
      if (guessedTheWord && content == topicsArray[turnCounter]) {
        return
      }
      socket.emit('chat', ({ content, username, socketID }))
      if (content == topicsArray[turnCounter]) {
        let score = 10
        guessedTheWord = true
        socket.emit('user-scored', ({ username, score, socketID }))
      }
      form.reset()
      // console.log(socketID)
    }
  })
}
createChats()
socket.on('chat', ({ content, username }) => {
  const html = document.querySelector('.chatroom-container')

  if (content == topicsArray[turnCounter]) {
    html.innerHTML += `<div style="color: lightgreen;">${username} guessed the word</div>`
    html.innerHTML += `<img src="/img/sticker.png" width="100px" height="100px"></img>`
  } else if (content == "has left the game.") {
    html.innerHTML += `<div style="color: red;">${username} ${content}</div>`
  } else {
    html.innerHTML += `<div> ${username}: ${content}</div>`
  }
  // console.log(`${username}: ${content} `)
  // always scroll to bottom
  let messageBody = document.querySelector('#scroll');
  messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
})

socket.on('score-update', (data) => {
  playerScore = data
  createScoreboard()
})

//START FIRST COUNT DOWN
let nextTurn = false

socket.on('stop-bar', (host) => {
  if (host == username) {
    nextTurn = true
  }

})
// progress bar
function move(width) {
  let emitter = username
  let elem = document.getElementById("myBar");
  let id = setInterval(frame, 400); // change time here //
  function frame() {

    if (width <= 0) {
      return
    } else {
      if (nextTurn == true) {
        width = 1
      }
      width--;
      socket.emit('bar-moving', ({ width, socketID, emitter }))
      elem.style.width = width + "%";
      nextTurn = false
    }
  }
}

socket.on('move-bar', (data) => {
  let width = data.width
  let emitter = data.emitter


  if (username === emitter) {
    return
  }

  let elem = document.getElementById("myBar");
  elem.style.width = width + "%";
})

socket.on('game-ended', () => {
  drawable = false;
  setTimeout(() => {
    window.alert("End of Game. Redirecting to lobby...")
    if (SERVER_IP[0] == "l") {
      window.location.replace(`/lobby.html`);
      // location.assign(`/ lobby.html`)
    } else {
      window.location.replace(`http://${SERVER_IP}/lobby.html`);
      // location.assign(`http://${SERVER_IP}/lobby.html`)
    }
  }, 20000)



  // popup result 
  function myFunction() {
    let x = document.getElementById("snackbar");
    x.className = "show";
    if (scoreboardInAscendingOrder.length > 2) {
      x.innerHTML += `<div class="finalScoreBoard">~End Of Game~</div>`

      let counter = 0
      for (let player of scoreboardInAscendingOrder) {
        if (counter == 0) {
          x.innerHTML += `<div class="finalScoreBoard">1st Place-${player.name} Score:${player.score}</div>`
        } else if (counter == 1) {
          x.innerHTML += `<div class="finalScoreBoard">2nd Place-${player.name} Score:${player.score}</div>`
        } else if (counter == 2) {
          x.innerHTML += `<div class="finalScoreBoard">3rd Place-${player.name} Score:${player.score}</div>`
        } else {
          x.innerHTML += `<div class="finalScoreBoard">${player.name} Score:${player.score}</div>`
        }
        counter++
      }
      x.innerHTML += `<a href="lobby.html" class="buttonsInGame" onclick="leaveGame()">Back to lobby</a>`
    } else {
      x.innerHTML += `<div class="finalScoreBoard">~End Of Game~</div>`
      let counter = 0
      for (let player of scoreboardInAscendingOrder) {
        if (counter == 0) {
          x.innerHTML += `<div class="finalScoreBoard">WINNER-${player.name}:${player.score}</div>`
        } else {
          x.innerHTML += `<div class="finalScoreBoard">${player.name}:${player.score}</div>`
        }
        counter++
      }
      x.innerHTML += `<a href="lobby.html" class="buttonsInGame" onclick="leaveGame()">Back to lobby</a>`

    }




    // After 3 seconds, remove the show class from DIV
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 1000000);
  }
  myFunction()



})

//SOCKETS
//接收server送來的command
// controls:
socket.on("clear", (emitter) => { //clear drawing board as per sever
  if (emitter === username) {
    return;
  }
  background(255)
  // console.log('cleared')
})

socket.on('draw-new-fill', ({ mouseX, mouseY, selectedColor, emitter }) => {
  if (emitter === username) {
    return;
  }
  let ratio = canvas.width / 1000;
  ratio = 1
  // flood_fill(floor(mouseX * ratio), floor(mouseY * ratio), color_to_rgba(selectedColor))
  flood_fill(floor(mouseX), floor(mouseY), color_to_rgba(selectedColor))
  // console.log(`${emitter} is drawing`)
})

socket.on("draw-new-line", ({ mouseX, mouseY, pmouseX, pmouseY, selectedColor, selectedStrokeWeight, emitter }) => {
  if (emitter === username) {
    return;
  }
  strokeWeight(selectedStrokeWeight)
  stroke(selectedColor)
  line(mouseX, mouseY, pmouseX, pmouseY)
  // console.log(`${emitter} is drawing`)
})

// UI:

socket.on('host-left', (host) => {
  if (host === username) {
    return;
  }
  window.alert("This host has left the game. Redirecting to lobby...")
  if (SERVER_IP[0] == "l") {
    window.location.replace(`/lobby.html`);
    // location.assign(`/ lobby.html`)
  } else {
    window.location.replace(`http://${SERVER_IP}/lobby.html`);
    // location.assign(`http://${SERVER_IP}/lobby.html`)
  }
})

socket.on('player-left', (data) => {
  let name = data.name
  let host = data.host
  let content = `has left the game.`
  if (host == username) {
    let username = name
    socket.emit('chat', ({ content, username, socketID }))
  }
  socket.emit('fetch-room-data', (socketID))

  // createScoreboard()
})

// GAME CONTROLS
function changeColor(color) {
  if (color === 'red') {
    selectedColor = '#FE7C9B';
  } else if (color === 'orange') {
    selectedColor = '#FBA879';
  } else if (color === 'yellow') {
    selectedColor = '#FDCC0D';
  } else if (color === 'green') {
    selectedColor = '#AAD7D2'
  } else if (color === 'blue') {
    selectedColor = '#B7D6EB'
  } else if (color === 'darkblue') {
    selectedColor = '#B4B7DC'
  } else if (color === 'purple') {
    selectedColor = '#CF9FCA'
  } else if (color === 'pink') {
    selectedColor = '#FAD0E3'
  } else if (color === 'white') {
    selectedColor = '#ffffff'
  } else if (color === 'black') {
    selectedColor = '#000000'
  }
}
function changeStroke(number) {
  if (drawable == false) {
    return;
  }
  selectedStrokeWeight = number
  fillBucket = false //turn off fillBucket when choosing stroke 
}
function clearBoard() {
  if (drawable == false) {
    return;
  }
  let emitter = username
  background(255)
  socket.emit("clear-board", { socketID, emitter }) //tell server to clear drawing board
}
function fillBucketOn() {
  if (drawable == false) {
    return;
  }
  fillBucket = true
}
function mousePressed() {
  if (drawable == false) {
    return;
  }
  //update pmouse x and y for every new mouse press
  pmouseX = mouseX
  pmouseY = mouseY

  //check if mouse is within canvas
  if (mouseX < 0 || mouseX > canvas.width || mouseY < 0 || mouseY > canvas.height) {
    return
  }
  if (fillBucket === false) {//check if fillBucket is pressed
    mouseDragged()//if not, standard drawing mode

  } else { //fillBucket mode
    flood_fill(floor(mouseX), floor(mouseY), color_to_rgba(selectedColor))
    let emitter = username
    socket.emit("new-fill", { mouseX, mouseY, selectedColor, socketID, emitter })
  }

}
function mouseDragged() {
  if (drawable == false) {
    return;
  }
  if (fillBucket == true) { return }//prevent drawing mode when fillBucket is on
  stroke(selectedColor)
  strokeWeight(selectedStrokeWeight)
  line(mouseX, mouseY, pmouseX, pmouseY)
  let emitter = username
  socket.emit("new-line", { mouseX, mouseY, pmouseX, pmouseY, selectedColor, selectedStrokeWeight, socketID, emitter }) // 傳送座標給server
  pmouseX = mouseX //update pmouseX Y manually
  pmouseY = mouseY
}
function keyPressed() {//save canvas as png
  if (key == '`') {
    saveCanvas('myart.png');
  }
}

// Function for fillBucket
function flood_fill(original_x, original_y, color) {
  let mouseRatio = canvas.width / 1000;
  let screenRatio = 1;
  original_x = original_x * mouseRatio;
  original_y = original_y * mouseRatio;
  const width = canvas.width * screenRatio;
  const height = canvas.height * screenRatio;
  // console.log(`CanvasWidth:${canvas.width},CanvasHeight:${canvas.height}`)

  original_color = ctx.getImageData(original_x, original_y, 1, 1).data;
  original_color = {
    r: original_color[0],
    g: original_color[1],
    b: original_color[2],
    a: original_color[3]
  };

  x = original_x;
  y = original_y;
  // console.log("MouseClicked", x, y)

  boundary_pixels = ctx.getImageData(0, 0, width, height);
  // console.log(boundary_pixels)


  // console.log(canvas.width, canvas.height)
  // first we go up until we find a boundary
  linear_cords = (y * width + x) * 4;
  var done = false;
  while (y >= 0 && !done) {
    var new_linear_cords = ((y - 1) * width + x) * 4;
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
  var path = [{ x: x / mouseRatio, y: y / mouseRatio }];
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
        // console.log("^");
      } else if (path[path.length - 1].x - path[path.length - 2].x < 0) {
        orientation = 1;
        // console.log("<-");
      } else if (path[path.length - 1].y - path[path.length - 2].y > 0) {
        orientation = 2;
        // console.log("v");
      } else if (path[path.length - 1].x - path[path.length - 2].x > 0) {
        orientation = 3;
        // console.log("->");
      } else {
        // console.log("we shouldn't be here");
      }
    }

    for (var look_at = 0; !got_it && look_at <= 3; look_at++) {
      var both = (orientation + look_at) % 4;
      if (both == 0) {
        // we try right
        if (!got_it && (x + 1) < width) {
          linear_cords = (y * width + (x + 1)) * 4;
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
          linear_cords = ((y - 1) * width + x) * 4;
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
          linear_cords = (y * width + (x - 1)) * 4;
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
        if (!got_it && (y + 1) < height) {
          linear_cords = ((y + 1) * width + x) * 4;
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
      path.push({ x: x / mouseRatio, y: y / mouseRatio });
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
    // console.log(color)
    return {
      r: color[0],
      g: color[1],
      b: color[2],
      a: color[3] * 255
    };
  } else {
    // console.error("warning: can't convert color to rgba: " + color);
    return {
      r: 0,
      g: 0,
      b: 0,
      a: 0
    };
  }
}

// create Scoreboard element
function createScoreboard() {
  scoreboardInAscendingOrder = playerScore.sort(function (a, b) {
    return parseFloat(b.score) - parseFloat(a.score)
  })
  html = ''
  for (let i = 0; i < scoreboardInAscendingOrder.length; i++) {
    if (scoreboardInAscendingOrder[i].isDrawing == true) {
      html += `<div class="player-info drawing"><img class="scoreBoardIcon" src="${scoreboardInAscendingOrder[i].userIcon}"><img src="./img/arrow.png" id='arrow' alt="">${scoreboardInAscendingOrder[i].name}: ${scoreboardInAscendingOrder[i].score}</div>`
    } else {
      html += `<div class="player-info"><img class="scoreBoardIcon" src="${scoreboardInAscendingOrder[i].userIcon}"><div id='spacing'></div>${scoreboardInAscendingOrder[i].name}: ${scoreboardInAscendingOrder[i].score}</div>`
    }

  }
  document.querySelector("#scrollScore").innerHTML = html
}


function leaveGame() {
  let id = socketID
  socket.emit("leave-game", ({ username, id }))
}


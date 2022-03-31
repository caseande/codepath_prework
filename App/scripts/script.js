// global constants
const cluePauseTime = 333;     // how long to pause in between clues
const nextClueWaitTime = 1000; // how long to wait before starting playback of the clue sequence

// global variables
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.25;             // 50% --must be between 0.0 and 1.0
var guessCounter = 0;
var pattern = [];              // declare empty array
var clueHoldTime = 1000;       // how long to hold each clue's light/sound
var strikes = 0;
var level = 0;                 // var that sets the length of the pattern

/* Function to set difficultly level based on value selected from form */
function setLevel(value)
{
  if (value == "Easy")
  {
    level = 5;                // easy -- 5 clues 
  }
  else if (value == "Medium")
  {
    level = 8;                // medium -- 8 clues
  }
  else if (value == "Hard")
  {
    level = 10;              // hard -- 10 clues
  }
  // default
  else 
  {
    level = 5;
  }
  // show start button
  document.getElementById("startBtn").classList.remove("hidden");
}

/* Function to fill pattern array with random values 1 - 8 */
function randArray () 
{
  pattern = [];
  // level is used here to determine length of array
  for (var i = 0; i < level; i++) 
  {  
    // generate randon integer from 0 - 8
  	var x = (Math.round(Math.random() * 8))
    // if 0, set to 1 (buttons 1 - 8)
    if (x == 0)
      x++;
    pattern.push(x);
  }
}

/* Function to start game, init vars, play first clue sequence */
function startGame()
{
  //init game vars
  progress = 0;
  gamePlaying = true;
  strikes = 0;
  clueHoldTime = 1000;
  
  // generate random array
  randArray();
  
  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  
  // call function to generate clue seq. 
  playClueSequence(1);
}

/* Function to stop game and reset start/stop button */
function stopGame()
{
  gamePlaying = false;
  
  // swap Start and Stop buttons back to default
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}

/* Function to end game in lose state */
function loseGame()
{
  stopGame();
  alert("Game Over. You lost.");
  // reset select form to default none value
  var dropDown = document.getElementById("lvl");
  dropDown.selectedIndex = 0;
}

/* Function to end game in win state */
function winGame()
{
  stopGame();
  alert("Game Over. You won!");
  // reset select form to default none value
  var dropDown = document.getElementById("lvl");
  dropDown.selectedIndex = 0;
}

/* Function to change button to image on click */
function lightButton(btn)
{
  document.getElementById("button"+btn).classList.add("lit")
}

/* Function to reset button back to color after click */
function clearButton(btn)
{
  document.getElementById("button"+btn).classList.remove("lit")
}

/* Function to play a single clue, called from playClueSequence */
function playSingleClue(btn)
{
  if(gamePlaying)
  {
    lightButton(btn);
    playTone(btn,clueHoldTime);
    setTimeout(clearButton,clueHoldTime,btn);
  }
}

/* Function to play clue sequence pattern */
function playClueSequence(x)
{
  context.resume()
  let delay = nextClueWaitTime;                 // set delay to initial wait time
  guessCounter = 0;                             // init counter back to 0
  for(let i = 0; i <= progress; i++)            // for each clue that is revealed so far
  { 
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]) // set a timeout to play that clue
    if (x == 1)                                 // if param, decrease clueHoldTime
      clueHoldTime -= 17;                       // length of pattern array factorial * sub amount
    delay += clueHoldTime;
    delay += cluePauseTime;
  }
}

/* Game logic, determines if guess is correct and if game is won/lost */
function guess(btn)
{
  clearInterval();
  console.log("user guessed: " + btn);
  if(!gamePlaying)
  {
    return;
  }
  // button guess matches value at index in array
  if(pattern[guessCounter] == btn)  
  {
    // index aligns with progress counter
    if(guessCounter == progress)   
    {
      // reached the end of array, game won
      if(progress == pattern.length - 1)  
      {
        winGame();
      }
      // increment progress counter and play next sequence
      else                          
      {
        progress++;
        playClueSequence(1);
      }
    }
    // increment to next guess in sequence
    else                            
    {
      guessCounter++;
    }
  }
  else
  {
    // add strike to counter, if == 3, game over
    strikes++;
    if (strikes == 3)
      loseGame();
    else
    {
      alert("Incorrect guess! " + "Strike: " +strikes + '\n' + "Let me repeat the pattern again");
      // special call to replay clue sequence without decreasing clueHoldTime
      playClueSequence(0);
    }
  }
}

/* Sound Synthesis Functions */
const freqMap = 
{
  1: 261.6,
  2: 293.66,
  3: 329.63,
  4: 349.23,
  5: 392,
  6: 440,
  7: 493.88,
  8: 523.25
}

/* Function to play tone on button press */
function playTone(btn,len)
{ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  context.resume()
  tonePlaying = true
  setTimeout(function()
  {
    stopTone()
  },len)
}

/* Function to start tone */
function startTone(btn)
{
  if(!tonePlaying)
  {
    context.resume()
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    context.resume()
    tonePlaying = true
  }
}

/* Function to stop tone */
function stopTone()
{
  g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
  tonePlaying = false
}

/* Page Initialization
Init Sound Synthesizer */
var AudioContext = window.AudioContext || window.webkitAudioContext 
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)
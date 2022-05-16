let questionNumber = 1; //holds the current question number
let playerScore = 0; //holds the player score
let wrongAttempt = 0; //amount of wrong answers picked by player
let indexNumber = 0; //will be used in displaying next question
let questionareLength = 0; //will track the length of the questionare

//empty array to hold shuffled distractors
let shuffledDistractors = [];
//empty array to hold shuffled selected questions out of all available questions
let shuffledQuestions = [];

async function loadQuiz() {
  let quiz = await fetch("quiz.json").then((response) => response.json());
  // console.log(quiz)
  let questions = [];

  for (let i of quiz.quiz) {
    let questionmcq = Object.keys(i)[0];
    if (questionmcq === "keywords" || questionmcq === "summary") {
      continue;
    }
    let mcq = i[questionmcq];
    let correctOption = mcq.answer;
    let distractors = [];

    let numbers = [];
    while(numbers.length < 4){
    let r = Math.floor(Math.random() * 4) + 1;
    if(numbers.indexOf(r) === -1) numbers.push(r);
    }

    for(number in numbers){

      if (mcq.distractors[number] != correctOption) {
        distractors.push(mcq.distractors[number]);
      }
    }

    questions.push({
      question: mcq.question,
      alternatives: [distractors[0], distractors[1], distractors[2], correctOption]
      
    });
  }
  // console.log(questions);
  return questions;
}


function handleQuestions(shuffledQuestions) {
  // function to shuffle and push questions to shuffledQuestions array
  shuffledQuestions.forEach(element => {
    const random = shuffledQuestions[Math.floor(Math.random() * shuffledQuestions.length)];

    if (!shuffledQuestions.includes(random)) {
      //console.log(shuffledQuestions)
      shuffledQuestions.push(random);
    }
  })
  return shuffledQuestions;
}


// function for displaying next question in the array to dom
//also handles displaying players and quiz information to dom
function NextQuestion(index) {

  const currentQuestion = shuffledQuestions[index];

  document.getElementById("question-number").innerHTML = questionNumber;
  document.getElementById("player-score").innerHTML = playerScore;

  let optionA, optionB, optionC, optionD = null
  //generates for distinct numbers from 1 to 4
  let numbers = [];
  while(numbers.length < 4){
    let r = Math.floor(Math.random() * 4) + 1;
    if(numbers.indexOf(r) === -1) numbers.push(r);
  }

  optionA = currentQuestion.alternatives[numbers[0]];
  optionB = currentQuestion.alternatives[numbers[1]];
  optionC = currentQuestion.alternatives[numbers[2]];
  optionD = currentQuestion.alternatives[numbers[3]];
      
  document.getElementById("display-question").innerHTML = currentQuestion.question;
  document.getElementById("option-one-label").innerHTML = optionA;
  document.getElementById("option-two-label").innerHTML = optionB;
  document.getElementById("option-three-label").innerHTML = optionC;
  document.getElementById("option-four-label").innerHTML = optionD;

  document.getElementById("option-one").value = optionA;
  document.getElementById("option-two").value = optionB;
  document.getElementById("option-three").value = optionC;
  document.getElementById("option-four").value = optionD; 
}

function checkForAnswer() {

  const currentQuestion = shuffledQuestions[indexNumber]; //gets current Question
  const currentQuestionAnswer = currentQuestion.alternatives[3]; //gets current Question's answer

  const options = document.getElementsByName("option"); //gets all elements in dom with name of 'option' (in this the radio inputs)

  options.forEach( (option) => {

    //console.log(option)

    //checking to make sure a radio input has been checked or an option being chosen
  if (
    options[0].checked === false &&
    options[1].checked === false &&
    options[2].checked === false &&
    options[3].checked === false
  ) {
    document.getElementById("option-modal").style.display = "flex";
  }

  if (option.value === currentQuestionAnswer) {
      //get's correct's radio input with correct answer
      correctOption = option.labels[0].id;
    }
  });

  //let chosenOption = null
  //checking if checked radio button is same as answer
  for(let option of options){
    
    if (option.checked === true && option.value === currentQuestionAnswer) {
      const correctLabelId = option.labels[0].id;
      document.getElementById(correctLabelId).style.backgroundColor = "green";
      playerScore++; //adding to player's score
    
  }

    if(option.checked === true && option.value !== currentQuestionAnswer){
      
      //checking which is the correct option
      for(let option of options){
        if (option.value === currentQuestionAnswer) {
        const correctLabelId = option.labels[0].id;
        document.getElementById(correctLabelId).style.backgroundColor = "green";
        }
      }

    const wrongLabelId = option.labels[0].id;
    document.getElementById(wrongLabelId).style.backgroundColor = "red";
    wrongAttempt++; //adds 1 to wrong attempts
    }

  }
  indexNumber++; //adding 1 to index so has to display next question
  //set to delay question number till when next question loads
  setTimeout(() => {
    questionNumber++;
  }, 2000);
}


//called when the next button is called
function handleNextQuestion() {

  checkForAnswer(); //check if player picked right or wrong option
  unCheckRadioButtons();
  //delays next question displaying for a second just for some effects so questions don't rush in on player
  setTimeout(() => {
      
      const nextQuestionExist = shuffledQuestions.at(indexNumber)
      if(nextQuestionExist){
      //displays next question as long as index number isn't greater than 9, remember index number starts from 0, so index 9 is question 10
      //console.log(wrongAttempt)
      NextQuestion(indexNumber);
    } else {
      handleEndGame(); //ends game if index number greater than 9 meaning we're already at the 10th question
    }
    resetOptionBackground();
  }, 1000);

}

function find(position, array) {
  var results = [];
  var idx = array.indexOf(position);
  while (idx != -1) {
      results.push(idx);
      idx = array.indexOf(position, idx + 1);
  }
  return results;
}

//sets options background back to null after display the right/wrong colors
function resetOptionBackground() {
  const options = document.getElementsByName("option");
  options.forEach((option) => {
    document.getElementById(option.labels[0].id).style.backgroundColor = "";
  });
}

// unchecking all radio buttons for next question(can be done with map or foreach loop also)
function unCheckRadioButtons() {
  const options = document.getElementsByName("option");
  for (let i = 0; i < options.length; i++) {
    options[i].checked = false;
  }
}

// function for when all questions being answered
function handleEndGame() {
  let remark = null;
  let remarkColor = null;

  const playerGrade = (playerScore / questionareLength) * 100;

  // condition check for player remark and remark color
  if (playerGrade <= 30) {
    remark = "Bad Grades, Keep Practicing.";
    remarkColor = "red";
  } else if (playerGrade >= 40 && playerGrade < 70) {
    remark = "Average Grades, You can do better.";
    remarkColor = "orange";
  } else if (playerGrade >= 70) {
    remark = "Excellent, Keep the good work going.";
    remarkColor = "green";
  }
  

  //data to display to score board
  document.getElementById("remarks").innerHTML = remark;
  document.getElementById("remarks").style.color = remarkColor;
  document.getElementById("grade-percentage").innerHTML = playerGrade;
  document.getElementById("wrong-answers").innerHTML = wrongAttempt;
  document.getElementById("right-answers").innerHTML = playerScore;
  document.getElementById("score-modal").style.display = "flex";
}

//closes score modal, resets game and reshuffles questions
function closeScoreModal() {
  questionNumber = 1;
  playerScore = 0;
  wrongAttempt = 0;
  indexNumber = 0;
  //shuffledQuestions = [];
  NextQuestion(indexNumber);
  document.getElementById("score-modal").style.display = "none";
}

//function to close warning modal
function closeOptionModal() {
  document.getElementById("option-modal").style.display = "none";
}

async function startQuiz(){

  questionNumber = 1; //holds the current question number
  playerScore = 0; //holds the player score
  wrongAttempt = 0; //amount of wrong answers picked by player
  indexNumber = 0; //will be used in displaying next question

  let questions = await loadQuiz()
  //console.log(questions)

  questionareLength = document.getElementById("score-length").innerHTML = questions.length;
  document.getElementById("questionare-length").innerHTML = questions.length;

  shuffledQuestions = handleQuestions(questions);
  NextQuestion(0)
    
}


//loading animation
//selecting dom element
function animation(){

let btn = document.getElementById("#quizGenerator");

// adding event listener to button
//btn.addEventListener("click", displayLoading());

// selecting loading div
const loader = document.getElementById("#loading");
loader.classList.add("display");



}

// showing loading
function displayLoading() {
  loader.classList.add("display");
  // to stop loading after some time
  // setTimeout(() => {
  //     loader.classList.remove("display");
  // }, 5000);
}

// hiding loading 
function hideLoading() {
  loader.classList.remove("display");
}

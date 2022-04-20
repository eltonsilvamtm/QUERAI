//File Upload
// document.getElementById("myFile").addEventListener('change', function(event){

//   event.preventDefault()

//   const reader = new FileReader();
//   reader.onload = function(){
//     uploadedText = reader.result;
//     console.log(uploadedText);
//     if(typeof uploadedText === 'string'){
//        document.querySelector('#printText').innerHTML = uploadedText
//     }
//   }
//   reader.readAsText(this.files[0])
// });

//API handler
// document.getElementById("quizGenerator").addEventListener('click',function(){
// });


async function loadQuiz() {
  let quiz = await fetch("/quiz.json").then((response) => response.json());
  let questions = [];

  for (let i of quiz.quiz) {
    let questionmcq = Object.keys(i)[0];
    if (questionmcq === "keywords" || questionmcq === "summary") {
      continue;
    }
    let mcq = i[questionmcq];
    let distractors = [mcq.answer];
    
    while (distractors.length != 4) {
      let n = Math.floor(Math.random() * mcq.distractors.length);

      if (mcq.distractors[n] != distractors[0]) {
        distractors.push(mcq.distractors[n]);
      }
    }

    questions.push({
      question: mcq.question,
      optionA: distractors[0],
      optionB: distractors[1],
      optionC: distractors[2],
      optionD: distractors[3],
      correctOption: mcq.answer,
    });
  }
  console.log(questions);
  return questions;
}

//empty array to hold shuffled distractors
let shuffledDistractors = [];
//empty array to hold shuffled selected questions out of all available questions
var shuffledQuestions = [];

//quizzes
function handleDistractors() {
  //function to shuffle and push 10 questions to shuffledQuestions array
  //app would be dealing with 10questions per session
  while (shuffledDistractors.length <= 4) {
    const random = questions[Math.floor(Math.random() * questions.length)];
    if (!shuffledDistractors.includes(random)) {
      shuffledDistractors.push(random);
    }
  }
}

function handleQuestions(shuffledQuestions) {
  //function to shuffle and push questions to shuffledQuestions array
  // while (shuffledQuestions.length <= 9) {
  //   const random = shuffledQuestions[Math.floor(Math.random() * shuffledQuestions.length)];
  //   if (!shuffledQuestions.includes(random)) {
  //     shuffledQuestions.push(random);
  //   }
  // }
  return shuffledQuestions;
}

let questionNumber = 1; //holds the current question number
let playerScore = 0; //holds the player score
let wrongAttempt = 0; //amount of wrong answers picked by player
let indexNumber = 0; //will be used in displaying next question

// function for displaying next question in the array to dom
//also handles displaying players and quiz information to dom
function NextQuestion(index) {
  console.log(shuffledQuestions)
  const currentQuestion = shuffledQuestions[index];
  document.getElementById("question-number").innerHTML = questionNumber;
  document.getElementById("player-score").innerHTML = playerScore;
  document.getElementById("display-question").innerHTML =
    currentQuestion.question;
  document.getElementById("option-one-label").innerHTML =
    currentQuestion.optionA;
  document.getElementById("option-two-label").innerHTML =
    currentQuestion.optionB;
  document.getElementById("option-three-label").innerHTML =
    currentQuestion.optionC;
  document.getElementById("option-four-label").innerHTML =
    currentQuestion.optionD;
  document.getElementById("option-one").value =
    currentQuestion.optionA;
  document.getElementById("option-two").value =
    currentQuestion.optionB;
  document.getElementById("option-three").value =
    currentQuestion.optionC;
  document.getElementById("option-four").value =
    currentQuestion.optionD;
}

function checkForAnswer() {
  const currentQuestion = shuffledQuestions[indexNumber]; //gets current Question
  const currentQuestionAnswer = currentQuestion.correctOption; //gets current Question's answer
  const options = document.getElementsByName("option"); //gets all elements in dom with name of 'option' (in this the radio inputs)
  let correctOption = null;

  options.forEach((option) => {
    if (option.value === currentQuestionAnswer) {
      //get's correct's radio input with correct answer
      correctOption = option.labels[0].id;
    }
  });

  //checking to make sure a radio input has been checked or an option being chosen
  if (
    options[0].checked === false &&
    options[1].checked === false &&
    options[2].checked === false &&
    options[3].checked == false
  ) {
    document.getElementById("option-modal").style.display = "flex";
  }

  //checking if checked radio button is same as answer
  for(let option of options){
    console.log(option.value)
    console.log(currentQuestionAnswer)
    if (option.checked === true && option.value === currentQuestionAnswer) {
      option.style.backgroundColor = "green";
      playerScore++; //adding to player's score
    } else{
      const wrongLabelId = option.labels[0].id;
      document.getElementById(wrongLabelId).style.backgroundColor = "red";
      option.style.backgroundColor = "green";
      wrongAttempt++; //adds 1 to wrong attempts
    }
    
  } 
  indexNumber++; //adding 1 to index so has to display next question
  //set to delay question number till when next question loads
  setTimeout(() => {
    questionNumber++;
  }, 1000);
}

//called when the next button is called
function handleNextQuestion() {
  checkForAnswer(); //check if player picked right or wrong option
  unCheckRadioButtons();
  //delays next question displaying for a second just for some effects so questions don't rush in on player
  setTimeout(() => {
    if (indexNumber <= 9) {
      //displays next question as long as index number isn't greater than 9, remember index number starts from 0, so index 9 is question 10
      NextQuestion(indexNumber);
    } else {
      handleEndGame(); //ends game if index number greater than 9 meaning we're already at the 10th question
    }
    resetOptionBackground();
  }, 1000);
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

  // condition check for player remark and remark color
  if (playerScore <= 3) {
    remark = "Bad Grades, Keep Practicing.";
    remarkColor = "red";
  } else if (playerScore >= 4 && playerScore < 7) {
    remark = "Average Grades, You can do better.";
    remarkColor = "orange";
  } else if (playerScore >= 7) {
    remark = "Excellent, Keep the good work going.";
    remarkColor = "green";
  }
  const playerGrade = (playerScore / 10) * 100;

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
  shuffledQuestions = [];
  NextQuestion(indexNumber);
  document.getElementById("score-modal").style.display = "none";
}

//function to close warning modal
function closeOptionModal() {
  document.getElementById("option-modal").style.display = "none";
}

async function startQuiz(){
  let questions = await loadQuiz()
  console.log(questions)
  shuffledQuestions = handleQuestions(questions);
  NextQuestion(0)
}

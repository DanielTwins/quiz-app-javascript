const question = document.querySelector(".question");
const quizTopic = document.querySelector(".header-topic");
const quizForm = document.querySelector("#quiz-form");
const container = document.querySelector(".container");
/* const answerContainers = document.querySelectorAll('.container-answers fieldset'); */

let questions = [];
let currentQuestionIndex = 0; // start index to track the current question

const questionCounter = document.querySelector("#questionCounter");

const getQuizData = () => {
  const url =
    "https://opentdb.com/api.php?amount=10&category=18&difficulty=easy&type=multiple";

  fetch(url)
    .then((response) => {
      // check if the response is Ok (status 200)
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // parse data to JSON
    })
    .then((loadedData) => {
      console.log(loadedData);

      // map through questions and store them into questions var.
      questions = loadedData.results.map((loadedQuestionObject) => {
        console.log("loaded question: ", loadedQuestionObject);

        /* return {
          question: loadedQuestionObject.question, // store the question text
          correctAnswer: loadedQuestionObject.correct_answer, // correct answer
          incorrectAnswers: loadedQuestionObject.incorrect_answers, // incorrect answers
        }; */
        return {
          question: decodeHtml(loadedQuestionObject.question), // decode right after fetching
          correctAnswer: decodeHtml(loadedQuestionObject.correct_answer),
          incorrectAnswers:
            loadedQuestionObject.incorrect_answers.map(decodeHtml), // decode incorrect answers
        };
      });

      // randomly shuffle the questions array
      //* sort the questions array randomly by comparing pairs of questions (objects)
      //* Math.random() generates a number between 0 and 1. Subtracting 0.5 creates a range from -0.5 to 0.5
      //* if the result is positive, the elements are swapped; if negative, they remain in the same order
      const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

      // select the first 5 questions from the shuffled array
      //* starting extract from index 0 (inclusive) and ending at index 5 (exclusive), so index 0,1,2,3,4
      const selectedQuestions = shuffledQuestions.slice(0, 5);
      // store the 5 shuffled selected questions into the questions array
      questions = selectedQuestions;

      // max number of questions after loading the selected questions
      const MAX_QUESTIONS = questions.length;
      console.log("maxxxx questions: ", MAX_QUESTIONS);
      updateQuestionCounter(currentQuestionIndex + 1, MAX_QUESTIONS);

      console.log("shuffled questions: ", shuffledQuestions);
      console.log("selected 5 random questions: ", selectedQuestions);

      displayQuestion(currentQuestionIndex); // display the first question

      // now that the questions are ready and displayed, remove the 'hidden' class
      document.querySelector(".container").classList.remove("hidden");

      startQuizTimer(); // start the total quiz timer
      startQuestionTimer(); // start the question timer for the first question
    })
    .catch((error) => {
      console.error("Fetch error:", error); // catch and log any errors
    });
};

const updateQuestionCounter = (currentQuestion, maxQuestions) => {
  const questionCounterElement = document.getElementById("questionCounter");
  questionCounterElement.innerHTML = `Question: ${currentQuestion}/${maxQuestions}`;
};

// function to handle form submission
quizForm.addEventListener("submit", function (event) {
  event.preventDefault(); // prevent form from reloading the page

  // Clear feedback classes first, to ensure they don't carry over between questions
  removeFeedbackClasses();

  // get the selected answer
  const selectedAnswer = quizForm.querySelector(
    `input[name="question${currentQuestionIndex}"]:checked`
  );

  if (selectedAnswer) {
    // if there is a selected answer; user checked a radio button
    const userAnswer = selectedAnswer.value;
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;

    // find the parent fieldset of the selected answer
    const selectedFieldset = selectedAnswer.closest("fieldset");

    // find the correct fieldset and add the green background class
    const correctFieldset = Array.from(quizForm.querySelectorAll("input"))
      .find((input) => input.value === correctAnswer)
      .closest("fieldset");

    // remove selected answer classes before setting new classes
    removeChosenAnswerClass();
    // Immediately apply the correct answer feedback
    correctFieldset.classList.add("correct-answer__green-bg");

    // if user's answer is incorrect, highlight the wrong one with red bg
    if (userAnswer !== correctAnswer) {
      // add the wrong answer class to the selected answer fieldset
      selectedFieldset.classList.add("wrong-answer__red-bg");
    }

    // Delay moving to the next question to show feedback
    setTimeout(() => {
      // move to the next question or end the quiz
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        removeFeedbackClasses(); // Remove feedback classes before displaying the next question
        displayQuestion(currentQuestionIndex); // display the next question
        startQuestionTimer(); // start the question timer for the next question
      } else {
        alert("Quiz finished!"); // Quiz completed
        clearInterval(totalQuizTimer); // stop total quiz timer when quiz ends
      }
    }, 1500); // Show feedback for 1.5 seconds
  } else {
    // if no answer selected, ask the user to select one
    alert("Please select an answer!");
  }
});

// Remove feedback classes after moving to the next question
function removeFeedbackClasses() {
  const allFieldsets = document.querySelectorAll("fieldset");
  allFieldsets.forEach((fieldset) => {
    fieldset.classList.remove(
      "correct-answer__green-bg",
      "wrong-answer__red-bg"
    );
  });
}

function removeFeedbackClasses() {
  const allFieldsets = document.querySelectorAll("fieldset");
  allFieldsets.forEach((fieldset) => {
    fieldset.classList.remove(
      "correct-answer__green-bg",
      "wrong-answer__red-bg"
    );
  });
}

// Helper function to decode HTML entities
function decodeHtml(html) {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = html;
  return textArea.value;
}

// function displaying next question along with its answers
const displayQuestion = (index) => {
  removeFeedbackClasses(); // remove old feedback before displaying new question
  removeChosenAnswerClass();

  const questionData = questions[index]; // get the current question by index
  const answers = [
    ...questionData.incorrectAnswers,
    questionData.correctAnswer,
  ]; // combine incorrect and correct answers

  // shuffle the answers for randomness
  const shuffledAnswers = answers.sort(() => Math.random() - 0.5);

  // update the question text in the DOM
  question.textContent = questionData.question;

  // update the answer options
  const answerContainers = document.querySelectorAll(
    ".container-answers fieldset"
  );

  answerContainers.forEach((fieldset, answerIndex) => {
    const input = fieldset.querySelector("input");
    const label = fieldset.querySelector("label");

    // Dynamically set the name attribute for the current question
    input.name = `question${index}`;

    // assign new answers and ensure the input and label reflect it
    input.value = shuffledAnswers[answerIndex];
    label.lastChild.textContent = ` ${shuffledAnswers[answerIndex]}`;

    // Uncheck the radio buttons for the new question
    input.checked = false;
  });

  updateQuestionCounter(index + 1, questions.length);
};

// Listen for changes to the radio buttons and apply the chosen-answer class
quizForm.addEventListener("change", function (event) {
  if (event.target.name === `question${currentQuestionIndex}`) {
    // Remove chosen-answer class from all fieldsets before adding it to the new one
    removeChosenAnswerClass();

    // Get the parent fieldset of the selected radio button
    const selectedFieldset = event.target.closest("fieldset");

    // Add the chosen-answer class to the selected fieldset
    if (selectedFieldset) {
      selectedFieldset.classList.add("chosen-answer");
    }
  }
});

// Function to remove the chosen-answer class from all fieldsets
function removeChosenAnswerClass() {
  const allFieldsets = document.querySelectorAll("fieldset");
  allFieldsets.forEach((fieldset) => {
    fieldset.classList.remove("chosen-answer");
  });
}

getQuizData();

// variables fro timers
let questionTimer;
let quizStartTime = null;
let totalQuizTimer;

const headerQuestionTime = document.querySelector(".header__question-time");
const headerTotalQuizTime = document.querySelector(".header__total-quiz-time");

// function to start the total quiz timer
function startQuizTimer() {
  quizStartTime = Date.now(); // capture the starting time
  totalQuizTimer = setInterval(() => {
    const elapsed = Date.now() - quizStartTime; // calculate time elapsed since quiz started
    const seconds = Math.floor(elapsed / 1000); // convert milliseconds to seconds

    // update the total quiz time in the DOM
    headerTotalQuizTime.textContent = `Quiz total time: ${formatTime(seconds)}`;
  }, 1000); // update every seconds
}

// function to start the question timer (for each question)
function startQuestionTimer() {
  let timeLeft = 60; // 60 seconds per question

  // reset any existing question timer
  if (questionTimer) clearInterval(questionTimer);

  questionTimer = setInterval(() => {
    timeLeft--; // start countdown

    // update the question timer in the DOM
    headerQuestionTime.textContent = `Question time: ${timeLeft} seconds`;

    if (timeLeft <= 0) {
      clearInterval(questionTimer); // stop timer at 0
      /* alert("Time is up for this question!"); */
      moveToNextQuestion();
    }
  }, 1000); // update every 1 second
}

// format seconds into MM:SS format for better readability
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`; // ensure the two digit format like; 09 seconds
}

// move to the next question - or finish the quiz if there are no more questions
function moveToNextQuestion() {
  currentQuestionIndex++;
  if(currentQuestionIndex < questions.length) {
    // reset and start question timer
    startQuestionTimer();
    removeFeedbackClasses()
    displayQuestion(currentQuestionIndex);
  } else {
    clearInterval(totalQuizTimer);
    alert('Quiz finished!')
  }
}

function startQuizTimers() {
  startQuizTimer();
  startQuestionTimer();
}
const question = document.querySelector(".question");
const quizTopic = document.querySelector(".header-topic");
const quizForm = document.querySelector("#quiz-form");
/* const answerContainers = document.querySelectorAll('.container-answers fieldset'); */

let questions = [];
let currentQuetionIndex = 0; // start index to track the current question

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

        return {
          question: loadedQuestionObject.question, // store the question text
          correctAnswer: loadedQuestionObject.correct_answer, // correct answer
          incorrectAnswers: loadedQuestionObject.incorrect_answers, // incorrect answers
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

      console.log("shuffled questions: ", shuffledQuestions);
      console.log("selected 5 random questions: ", selectedQuestions);

      displayQuestion(currentQuetionIndex); // display the first question
    })
    .catch((error) => {
      console.error("Fetch error:", error); // catch and log any errors
    });
};

// function displaying next question along with its answers
const displayQuestion = (index) => {
  const questionData = questions[index]; // get the current question by index from questions arr; the 5 shuffled questions
  const answers = [
    ...questionData.incorrectAnswers,
    questionData.correctAnswer,
  ]; // combine incorrect and correct answers into an array using spread operator

  console.log("qustion data: ", questionData);
  // shuffle the answers for randomness
  const shuffledAnswers = answers.sort(() => Math.random() - 0.5);

  // update the question text into the DOM
  question.textContent = questionData.question;

   // Reset the checked status of radio buttons for the current question
  const currentQuestionRadioButtons = quizForm.querySelectorAll(`input[name="question${index}"]`);
  currentQuestionRadioButtons.forEach(input => {
    input.checked = false; // Uncheck each radio button for this question
  });

  // update the answer options
  const answerContainers = document.querySelectorAll(
    ".container-answers fieldset"
  );
  answerContainers.forEach((fieldset, index) => {
    const input = fieldset.querySelector("input");
    const label = fieldset.querySelector("label");

    input.value = shuffledAnswers[index]; // assign new answers
    label.lastChild.textContent = ` ${shuffledAnswers[index]}`;
  });

};

// function to handle form submition
quizForm.addEventListener("submit", function (event) {
  event.preventDefault(); // prevent form from reloading the page

  // get the selected answer
  const selectedAnswer = quizForm.querySelector(
    'input[name="question1"]:checked'
  );

  if (selectedAnswer) {
    // if there is a selected answer; user checked a radio button
    const userAnswer = selectedAnswer.value;
    const correctAnswer = questions[currentQuetionIndex].correctAnswer;

    // find the parent fieldset of the selected answer
    /* const selectedFieldset = selectedAnswer.closest("fieldset"); */

    if (userAnswer === correctAnswer) {
      alert("Correct!");

      // add chosen-answer active class to the fieldset for the selected answer option
      /* selectedFieldset.classList.add("chosen-answer"); */
    } else {
      alert(`Wrong! The correct answer was: ${correctAnswer}`);

      /* selectedFieldset.classList.add("chosen-answer"); */
    }

    // move to the next question or end the quiz
    currentQuetionIndex++;
    if (currentQuetionIndex < questions.length) {
      // remove any previously added chosen-answer classes before displaying the next question
      removeChosenAnswerClass();

      displayQuestion(currentQuetionIndex); // continue diplaying the next question
    } else {
      alert("Quiz finished!");
    }
  } else {
    // if not selected, ask the user to select an answer option
    alert("Please select an answer!");
  }
});

// function to remove the chosen-answer class from all fieldset; 
// reseting the active class after each submition
function removeChosenAnswerClass() {
  const allFieldsets = document.querySelectorAll('fieldset');
  allFieldsets.forEach(fieldset => {
    fieldset.classList.remove('chosen-answer')
  })
}

// Listen for changes to the radio buttons and apply the chosen-answer class
quizForm.addEventListener("change", function (event) {
  if (event.target.name === "question1") {
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

/* getQuizData(); */

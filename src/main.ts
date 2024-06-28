import { IQuestion } from "./contracts/IQuestion";

const formQuestions = document.getElementById("form") as HTMLFormElement;
const easyQuestions = document.getElementById("easy") as HTMLInputElement;
const hardQuestions = document.getElementById("hard") as HTMLInputElement;
const germanLanguage = document.getElementById("german") as HTMLInputElement;
const englishLanguage = document.getElementById("english") as HTMLInputElement;
const output = document.getElementById("output") as HTMLElement;
const loadingIndicator = document.querySelector(".loader") as HTMLSpanElement;
loadingIndicator.style.display = "none";

let currentQuestionIndex = 0;
let score = 0;
let questions: IQuestion[] = [];

//* Event Listener

formQuestions.addEventListener("submit", (event: Event) => {
  event.preventDefault();
  console.log("Submitted");
  fetchQuestions();
});

function buildFetchQuestionsUrl(): string {
  const BASE_URL = "https://vz-wd-24-01.github.io/typescript-quiz/questions/";
  const easy = easyQuestions.checked;
  const hard = hardQuestions.checked;
  const english = englishLanguage.checked;
  const german = germanLanguage.checked;

  let QUESTION_URL = "";

  if (german && easy) {
    QUESTION_URL = BASE_URL + "leicht.json";
  } else if (german && hard) {
    QUESTION_URL = BASE_URL + "schwer.json";
  } else if (english && easy) {
    QUESTION_URL = BASE_URL + "easy.json";
  } else if (english && hard) {
    QUESTION_URL = BASE_URL + "hard.json";
  }

  return QUESTION_URL;
}

//*
function fetchQuestions(): void {
  fetch(buildFetchQuestionsUrl())
    .then((response: Response) => {
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then((fetchedQuestions: IQuestion[]) => {
      questions = fetchedQuestions;
      currentQuestionIndex = 0;
      score = 0;
      displayQuestion();
    })
    .catch((error: Error) => {
      console.error(error);
      const output = document.getElementById("output");
      if (output) {
        const errorCard = `<div class="errorCard-wrapper"><div class="errorCard"> No questions found!</div></div>`;
        output.innerHTML = errorCard;
      }
    })
    .finally(() => {
      loadingIndicator.style.display = "none";
    });
}

//*
function displayQuestion(): void {
  if (output && questions.length > 0) {
    // loadingIndicator.style.display = "block";
    const question = questions[currentQuestionIndex];
    const answersHtml = question.answers
      .map((answer: string, index: number) => {
        return `<div>
                    <input type="radio" id="answer${index}" name="answer" value="${index}">
                    <label for="answer${index}">${answer}</label>
                  </div>`;
      })
      .join("");

    output.innerHTML = `<div class="question-card">
                            <h2>${question.question}</h2>
                            <form id="answer-form">
                              ${answersHtml}
                              <button type="submit">Submit Answer</button>
                            <div id="questionTimer">Question ${
                              currentQuestionIndex + 1
                            } of ${questions.length} questions </div>
                            </form>
                            <div id="feedback"></div>
                          </div>`;

    const answerForm = document.getElementById(
      "answer-form"
    ) as HTMLFormElement;
    answerForm.addEventListener("submit", handleAnswerSubmit);
  }
}

function handleAnswerSubmit(event: Event): void {
  event.preventDefault();
  const selectedAnswer = document.querySelector(
    'input[name="answer"]:checked'
  ) as HTMLInputElement;

  if (selectedAnswer !== undefined) {
    const answerValue = selectedAnswer.value;
    const isCorrect =
      parseInt(answerValue, 10) === questions[currentQuestionIndex].correct;

    if (isCorrect) {
      score++;
      selectedAnswer.parentElement!.classList.add("correct-answer");
    } else {
      selectedAnswer.parentElement!.classList.add("wrong-answer");

      const correctAnswerIndex = questions[currentQuestionIndex].correct;
      const correctAnswerElement = document.querySelector(
        `input[name="answer"][value="${correctAnswerIndex}"]`
      ) as HTMLInputElement;
      correctAnswerElement.parentElement!.classList.add("correct-answer");
    }

    const feedback = document.getElementById("feedback");
    if (feedback) {
      feedback.innerHTML = isCorrect
        ? '<div id="feedback-correct">Correct</div> '
        : '<div id="feedback-wrong">Wrong</div> ';
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      setTimeout(displayQuestion, 1200);
    } else {
      setTimeout(displayFinalScore, 1000);
    }
  }
}

function displayFinalScore(): void {
  if (output) {
    output.innerHTML = `<div class="final-score"><div class="emoji">🎉</div> You scored ${score} out of ${questions.length} <div>🎉</div></div>`;
  }
}

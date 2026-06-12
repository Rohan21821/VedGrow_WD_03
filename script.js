const startBtn = document.getElementById("startBtn");
const themeBtn = document.getElementById("themeBtn");

const playerNameInput = document.getElementById("playerName");

const startScreen = document.getElementById("start-screen");
const loadingScreen = document.getElementById("loading-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const category = document.getElementById("category");
const difficulty = document.getElementById("difficulty");
const questionCount = document.getElementById("questionCount");

const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");

const bestScoreElement = document.getElementById("bestScore");

const questionCounter = document.getElementById("questionCounter");
const progressBar = document.getElementById("progressBar");

const nextBtn = document.getElementById("nextBtn");

const restartBtn = document.getElementById("restartBtn");

let playerName = "";

let questions = [];
let currentQuestionIndex = 0;

let score = 0;
let correct = 0;
let wrong = 0;

let streak = 0;
let bestStreak = 0;

let quizStartTime;

let timer;
let timeLeft = 15;

let userAnswers = [];

startBtn.addEventListener("click", startQuiz);

function decodeHTML(text) {

    const txt =
    document.createElement("textarea");

    txt.innerHTML = text;

    return txt.value;
}

async function startQuiz() {
playerName =
playerNameInput.value.trim();

document.getElementById("playerDisplay").textContent =
`👤 ${playerName}`;

if(playerName === ""){

    alert("Please enter your name.");

    return;
}

    quizStartTime = Date.now();

    startBtn.disabled = true;

    try{

        startScreen.classList.add("hidden");
        loadingScreen.classList.remove("hidden");

        const url =
        `https://opentdb.com/api.php?amount=${questionCount.value}&category=${category.value}&difficulty=${difficulty.value}&type=multiple`;


        document.getElementById("categoryBadge").textContent =
        category.options[
        category.selectedIndex
        ].text;

        const badge =
        document.getElementById("difficultyBadge");

        badge.textContent =
        difficulty.value.toUpperCase();

        badge.className =
        difficulty.value;

        const response = await fetch(url);

        const data = await response.json();

        questions = data.results;
        if (!questions.length) {
            throw new Error("No questions returned");
}

        loadingScreen.classList.add("hidden");
        quizScreen.classList.remove("hidden");

        showQuestion();
        startBtn.disabled = false;

        console.log(questions);


    }

    catch(error){

        startBtn.disabled = false;

        console.error(error);

        loadingScreen.classList.add("hidden");

        document
         .getElementById("error-screen")
         .classList.remove("hidden");  

    }



}

function startTimer() {

    clearInterval(timer);

    timeLeft = 15;

    const timerElement =
        document.getElementById("timer");

    timerElement.textContent = timeLeft;

    timerElement.classList.remove("danger");

    timer = setInterval(() => {

        timeLeft--;

        timerElement.textContent = timeLeft;

        if(timeLeft <= 5){
            timerElement.classList.add("danger");
        }
if(timeLeft <= 0){

    clearInterval(timer);

    wrong++;

    document.getElementById("wrongCount").textContent =
        wrong;

    // Reset streak because question was missed
    streak = 0;

    document.getElementById("streakCount").textContent =
        streak;

    // Update accuracy
    const totalAnswered =
        correct + wrong;

    document.getElementById("accuracyCount").textContent =
        Math.round((correct / totalAnswered) * 100) + "%";

    currentQuestionIndex++;

    if(currentQuestionIndex < questions.length){
        showQuestion();
    }else{
        showResults();
    }
}

    },1000);
}

function showQuestion() {
    nextBtn.disabled = true;
    
    const currentQuestion =
        questions[currentQuestionIndex];

    questionCounter.textContent =
        `Question ${currentQuestionIndex + 1} / ${questions.length}`;

        if(currentQuestionIndex === questions.length - 1){
           nextBtn.textContent = "Submit Quiz";
        }else{
           nextBtn.textContent = "Next Question";
        }


    questionElement.innerHTML =
    decodeHTML(currentQuestion.question);

    answersElement.innerHTML = "";

    const answers = [
        ...currentQuestion.incorrect_answers,
        currentQuestion.correct_answer
    ].sort(() => Math.random() - 0.5);

    answers.forEach(answer => {

    const btn =
        document.createElement("button");

    btn.classList.add("answer-btn");

    btn.innerHTML =
    decodeHTML(answer);

    btn.addEventListener("click", () => {

        selectAnswer(btn, answer);

    });

    answersElement.appendChild(btn);

});
updateProgressBar();
startTimer();

}

function selectAnswer(selectedBtn, selectedAnswer) {
    clearInterval(timer);

    const currentQuestion =
        questions[currentQuestionIndex];

    const correctAnswer =
        currentQuestion.correct_answer;

    userAnswers.push({
    question: decodeHTML(currentQuestion.question),

    selected: decodeHTML(selectedAnswer),
    correct: decodeHTML(correctAnswer)
    });

    const correctSound =
    document.getElementById("correctSound");

    const wrongSound =
    document.getElementById("wrongSound");
    
    const allButtons =
        document.querySelectorAll(".answer-btn");

    allButtons.forEach(btn => {

        btn.disabled = true;

        if(
            decodeHTML(btn.innerHTML) ===
            decodeHTML(correctAnswer)
        ){
            btn.classList.add("correct");
        }

    });

    if(selectedAnswer === correctAnswer){
        correctSound.currentTime = 0;
        correctSound.play();

        selectedBtn.classList.add("correct");

        correct++;
        score++;
        streak++;

        if(streak > bestStreak){
            bestStreak = streak;
        }

    } else {
        wrongSound.currentTime = 0;
        wrongSound.play();

        selectedBtn.classList.add("wrong");

        wrong++;
        streak = 0;
    }

    document.getElementById("correctCount").textContent =
        correct;

    document.getElementById("wrongCount").textContent =
        wrong;

    document.getElementById("streakCount").textContent =
        streak;

    document.getElementById("bestStreak").textContent =
        bestStreak;

    const totalAnswered =
    correct + wrong;

    const accuracy =
    totalAnswered
    ? Math.round((correct / totalAnswered) * 100)
    : 0;

    document.getElementById("accuracyCount").textContent =
        accuracy + "%";

    nextBtn.disabled = false;
}

nextBtn.addEventListener("click", () => {

    currentQuestionIndex++;

    if(currentQuestionIndex < questions.length){

        showQuestion();

        updateProgressBar();

    } else {

        showResults();

    }

});

function updateProgressBar() {

    const progress =
        ((currentQuestionIndex + 1) / questions.length) * 100;

    progressBar.style.width =
        progress + "%";

}

function showResults() {

    quizScreen.classList.add("hidden");

    resultScreen.classList.remove("hidden");

    const percentage =
        Math.round((correct / questions.length) * 100);

document.getElementById("congratsMessage").textContent =
`🎉 Congratulations, ${playerName}! You have successfully completed the quiz.`;

        if(percentage > savedBestScore){

           savedBestScore = percentage;

           localStorage.setItem(
           "bestScore",
            percentage
        );       

    bestScoreElement.textContent =
        percentage + "%";
    }

    document.getElementById("finalScore").textContent =
        percentage + "%";

    document.getElementById("correctAnswers").textContent =
        `Correct Answers: ${correct}`;

    document.getElementById("wrongAnswers").textContent =
        `Wrong Answers: ${wrong}`;

    const totalSeconds =
    Math.floor(
    (Date.now() - quizStartTime)
    / 1000
    );

    const minutes =
    Math.floor(totalSeconds / 60);

    const seconds =
    totalSeconds % 60;

    document.getElementById("quizTime").textContent =
        `Time Taken: ${minutes}m ${seconds}s`;

    let message = "";

    if(percentage >= 90){
        message = "Outstanding Performance 🏆";
    }
    else if(percentage >= 70){
        message = "Great Job 🎉";
    }
    else if(percentage >= 50){
        message = "Good Effort 👍";
    }
    else{
        message = "Keep Practicing 📚";
    }

    document.getElementById("performanceMessage").textContent =
        message;

    let rank = "";

    if(percentage >= 90){
    rank = "Quiz Master 🏆";
    }
    else if(percentage >= 70){
    rank = "Expert 🎯";
    }
    else if(percentage >= 50){
    rank = "Learner 📚";
    }
    else{
    rank = "Beginner 🚀";
    }

    document.getElementById("rank").textContent =
    `Rank: ${rank}`;

}

document
.getElementById("reviewBtn")
.addEventListener("click", () => {

    const reviewSection =
    document.getElementById("reviewSection");

    reviewSection.innerHTML = "";

    userAnswers.forEach(item => {

        reviewSection.innerHTML += `
        <div class="review-card">

            <p>
                <strong>Question:</strong>
                ${decodeHTML(item.question)}
            </p>

            <p>
                <strong>Your Answer:</strong>
                ${decodeHTML(item.selected)}
            </p>

            <p>
                <strong>Correct Answer:</strong>
                ${decodeHTML(item.correct)}
            </p>

        </div>
        `;
    });

    reviewSection.classList.toggle("hidden");

});

let savedBestScore =
parseInt(
localStorage.getItem("bestScore")
) || 0;

bestScoreElement.textContent =
savedBestScore + "%";

restartBtn.addEventListener("click", () => {
    location.reload();
});

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light-theme");

    if(document.body.classList.contains("light-theme")){
        themeBtn.textContent = "☀️ Light Mode";
    } else {
        themeBtn.textContent = "🌙 Dark Mode";
    }

});

const retryBtn =
document.getElementById("retryBtn");

retryBtn.addEventListener("click", () => {

    document
    .getElementById("error-screen")
    .classList.add("hidden");

    startScreen.classList.remove("hidden");

});



/* Boni Exit Exam - quiz controller */
let current = [];
let course = "";
let index = 0;
let answers = {};
let timeLeft = 0;
let timerInterval = null;
let submitted = false;

const quizMinutes = { business: 100, risk: 120 };
const courseNames = {
  business: "Business Ethics",
  risk: "Risk Management & Insurance"
};
const $ = (id) => document.getElementById(id);

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function startQuiz(name) {
  if (!window.quizzes || !Array.isArray(quizzes[name]) || !quizzes[name].length) {
    alert("The question bank for this course is not available yet.");
    return;
  }
  clearInterval(timerInterval);
  course = name;
  current = quizzes[name];
  index = 0;
  answers = {};
  submitted = false;
  $("home").classList.add("hidden");
  $("result").classList.add("hidden");
  $("quiz").classList.remove("hidden");
  $("courseTitle").textContent = courseNames[name];
  $("totalQuestions").textContent = `OF ${current.length}`;
  buildNav();
  renderQuestion();
  startTimer(quizMinutes[name] || 60);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startTimer(minutes) {
  timeLeft = minutes * 60;
  updateTimer();
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("Time is up. Your quiz will now be submitted.");
      showResult();
    }
  }, 1000);
}

function updateTimer() {
  const mins = Math.floor(Math.max(timeLeft, 0) / 60);
  const secs = Math.max(timeLeft, 0) % 60;
  $("timer").textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  $("timer").style.color = timeLeft <= 300 ? "#c64d54" : "";
}

function buildNav() {
  $("navGrid").innerHTML = current.map((q, i) =>
    `<button type="button" class="nav-btn" data-index="${i}" aria-label="Go to question ${i + 1}">${i + 1}</button>`
  ).join("");
  $("navGrid").querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => goToQuestion(Number(btn.dataset.index)));
  });
}

function renderQuestion() {
  if (!current[index]) return;
  const q = current[index];
  $("counter").textContent = `QUESTION ${index + 1}`;
  $("question").textContent = q.question;
  $("options").innerHTML = Object.entries(q.options).map(([letter, value]) => {
    const selected = answers[index] === letter;
    return `<label class="option ${selected ? "selected" : ""}">
      <input type="radio" name="answer" value="${letter}" ${selected ? "checked" : ""}>
      <span class="option-letter">${letter}.</span><span class="option-text">${escapeHTML(value)}</span>
    </label>`;
  }).join("");
  $("options").querySelectorAll('input[name="answer"]').forEach((input) => {
    input.addEventListener("change", () => {
      answers[index] = input.value;
      $("options").querySelectorAll(".option").forEach((el) => el.classList.remove("selected"));
      input.closest(".option").classList.add("selected");
      updateNav();
    });
  });
  $("prevBtn").disabled = index === 0;
  $("nextBtn").textContent = index === current.length - 1 ? "Finish →" : "Next →";
  updateNav();
}

function updateNav() {
  let answered = Object.keys(answers).length;
  $("answeredCount").textContent = `${answered} answered`;
  $("progressBar").style.width = `${(answered / current.length) * 100}%`;
  $("navGrid").querySelectorAll(".nav-btn").forEach((btn) => {
    const i = Number(btn.dataset.index);
    btn.classList.toggle("answered", answers[i] !== undefined);
    btn.classList.toggle("current", i === index);
    btn.setAttribute("aria-current", i === index ? "step" : "false");
  });
}

function goToQuestion(i) {
  if (i < 0 || i >= current.length || submitted) return;
  index = i;
  renderQuestion();
}

function nextQuestion() {
  if (index < current.length - 1) {
    index += 1;
    renderQuestion();
  } else {
    confirmSubmit();
  }
}

function previousQuestion() {
  if (index > 0) {
    index -= 1;
    renderQuestion();
  }
}

function confirmSubmit() {
  const unanswered = current.length - Object.keys(answers).length;
  const message = unanswered
    ? `You still have ${unanswered} unanswered question(s). Submit your quiz?`
    : "Are you ready to submit your quiz?";
  if (confirm(message)) showResult();
}

function showResult() {
  if (submitted) return;
  submitted = true;
  clearInterval(timerInterval);
  $("quiz").classList.add("hidden");
  $("result").classList.remove("hidden");
  const correct = current.filter((q, i) => answers[i] === q.answer).length;
  const wrong = current.length - correct;
  const percent = Math.round((correct / current.length) * 100);
  $("score").textContent = `${correct} / ${current.length}`;
  $("message").textContent = percent >= 80
    ? "Excellent work! Keep up the great effort."
    : percent >= 50 ? "Good effort. Review the answers and keep practicing."
    : "Keep studying. Review your answers and try again.";
  $("correctStat").textContent = correct;
  $("wrongStat").textContent = wrong;
  $("percentStat").textContent = `${percent}%`;
  $("review").classList.add("hidden");
  $("review").innerHTML = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function reviewAnswers() {
  const review = $("review");
  review.innerHTML = current.map((q, i) => {
    const user = answers[i] || "No answer";
    const isCorrect = user === q.answer;
    const userText = answers[i] ? `${user}. ${q.options[user]}` : "No answer selected";
    return `<article class="review-item">
      <h4>Q${i + 1}. ${escapeHTML(q.question)}</h4>
      <p class="review-answer ${isCorrect ? "correct" : "wrong"}">Your answer: ${escapeHTML(userText)} ${isCorrect ? "✓" : "✗"}</p>
      <p class="review-answer correct">Correct answer: ${q.answer}. ${escapeHTML(q.options[q.answer])}</p>
    </article>`;
  }).join("");
  review.classList.remove("hidden");
  review.scrollIntoView({ behavior: "smooth", block: "start" });
}

function goHome() {
  clearInterval(timerInterval);
  submitted = true;
  $("result").classList.add("hidden");
  $("quiz").classList.add("hidden");
  $("home").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  $("year").textContent = new Date().getFullYear();
  $("businessCount").textContent = quizzes.business.length;
  $("riskCount").textContent = quizzes.risk.length;
  document.querySelectorAll(".start-btn").forEach((btn) => {
    btn.addEventListener("click", () => startQuiz(btn.dataset.course));
  });
  $("prevBtn").addEventListener("click", previousQuestion);
  $("nextBtn").addEventListener("click", nextQuestion);
  $("submitBtn").addEventListener("click", confirmSubmit);
  $("reviewBtn").addEventListener("click", reviewAnswers);
  $("anotherBtn").addEventListener("click", goHome);
  $("backHome").addEventListener("click", () => {
    if (confirm("Leave this quiz? Your current progress will be lost.")) goHome();
  });
});

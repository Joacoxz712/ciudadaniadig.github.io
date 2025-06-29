const dino = document.getElementById('dino');
const game = document.getElementById('game');
const scoreText = document.getElementById('score');
const scr = document.getElementById('SCORE');
scr.style.color = 'yellow';
const mensaje = document.getElementById('mensaje');
const bonus = document.getElementById('bonus');
const overlay = document.getElementById("overlay");
const gameMessage = document.getElementById("game-message");
const quizContainer = document.getElementById("quiz-container");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const fallOverlay = document.getElementById("fall-overlay");
const startMenu = document.getElementById("start-menu");
const startButton = document.getElementById("start-button");
const particlesContainer = document.getElementById("particles");

let isJumping = false;
let isGameOver = false;
let score = 0;
let baseSpeed = 4000;
let puntosAntesQuiz = 0;
let pausaPorQuiz = false;
let preguntasActuales = [];
let nextCiudadaniaPoint = Math.floor(Math.random() * 8) + 3;
let cactusIntervals = [];

const mensajesCiudadania = [
  "¡Ojo! No compartas tu contraseña ni con tu mejor amigo.",
  "¿Sabías que 1 de cada 3 personas no lee las políticas de privacidad?",
  "Lo que subes a internet se queda para siempre. 🍕",
  "Ser amable en línea mejora el día de todos. 🦸‍♂️",
  "Cuidado con los links raros, pueden ser trampas. 🕸️"
];

const mensajesGraciosos = [
  "¡Eres un velociraptor digital!",
  "¡Cuidado con los cactus ninja!",
  "¿Dino o corredor olímpico? 🦖🏃"
];

const mensajesBurla = [
  "¡Ay! ¿Te asustó un cactus? 😂",
  "¡Eso fue muy triste!",
  "¡No eres tan rápido como creías!"
];

const saltoSonido = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
const puntoSonido = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
const collisionSound = new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg');


function showMessage(text, duration = 3000, isGracioso = false) {
  mensaje.innerText = text;
  mensaje.classList.toggle('gracioso', isGracioso);
  mensaje.style.opacity = '1';
  setTimeout(() => mensaje.style.opacity = '0', duration);
}

function jump() {
  if (isJumping || isGameOver || pausaPorQuiz) return;
  
  isJumping = true;
  saltoSonido.currentTime = 0;
  saltoSonido.play();
  
  createParticles(dino.getBoundingClientRect().left + 40, window.innerHeight - 100, 10, '#4CAF50');

  const groundHeight = 100;
  const start = groundHeight;
  const peak = window.innerHeight / 2;
  const duration = 600;
  const startTime = performance.now();

  function animateJump(time) {
    if (isGameOver) return;
    
    let elapsed = time - startTime;
    if (elapsed > duration) elapsed = duration;

    const t = elapsed / duration;
    const height = start + (4 * (peak - start) * t * (1 - t));
    dino.style.bottom = height + 'px';
    
    const rotation = t < 0.5 ? t * 20 : (1 - t) * 20;
    dino.style.transform = `rotate(${rotation}deg) translateZ(0)`;

    if (elapsed < duration) {
      requestAnimationFrame(animateJump);
    } else {
      isJumping = false;
      dino.style.bottom = start + 'px';
      dino.style.transform = 'rotate(0deg) translateZ(0)';
      
      if (parseFloat(dino.style.bottom) < groundHeight - 5) {
        perdistePorCaida();
      } else {
        createParticles(dino.getBoundingClientRect().left + 40, window.innerHeight - groundHeight, 15, '#FFEB3B');
      }
    }
  }

  requestAnimationFrame(animateJump);
}

function crearCactus() {
  if (isGameOver || pausaPorQuiz) return;

  const cactus = document.createElement('div');
  cactus.classList.add('cactus');
  game.appendChild(cactus);

  const height = Math.floor(Math.random() * 50) + 60;
  cactus.style.height = `${height}px`;
  cactus.style.width = `${height / 2}px`;
  cactus.style.bottom = '100px';
  cactus.style.right = '-30px';

  const duracion = Math.max(1500, baseSpeed - score * 15);
  cactus.style.animation = `moveCactus ${duracion}ms linear forwards`;

  cactus.addEventListener('animationend', () => {
    if (!isGameOver && !pausaPorQuiz) {
      aumentarPuntaje();
    }
    cactus.remove();
  });

  const intervalId = setInterval(() => {
    if (isGameOver || !document.body.contains(cactus)) {
      clearInterval(intervalId);
      return;
    }
    
    const dinoRect = dino.getBoundingClientRect();
    const cactusRect = cactus.getBoundingClientRect();
    
    if (
      dinoRect.right > cactusRect.left + 15 &&
      dinoRect.left < cactusRect.right - 15 &&
      dinoRect.bottom > cactusRect.top + 15 &&
      dinoRect.top < cactusRect.bottom - 15
    ) {
      gameOver();
    }
  }, 20);

  cactusIntervals.push(intervalId);

  if (!isGameOver && !pausaPorQuiz) {
    setTimeout(crearCactus, Math.random() * 1000 + 800);
  }
}

function aumentarPuntaje() {
  score++;
  scoreText.textContent = `${score}/50 Points`;
  puntoSonido.currentTime = 0;
  puntoSonido.play();
  
  if (score === nextCiudadaniaPoint) {
    showMessage(mensajesCiudadania[Math.floor(Math.random() * mensajesCiudadania.length)], 4000);
    nextCiudadaniaPoint += Math.floor(Math.random() * 8) + 3;
  }

  if (score % 20 === 0) {
    showMessage(mensajesGraciosos[Math.floor(Math.random() * mensajesGraciosos.length)], 3500, true);
  }

  if (score === 50) {
    bonus.classList.add('show');
  }
  
  verificarQuiz();
}

function gameOver() {
  if (isGameOver) return;
  
  isGameOver = true;
  collisionSound.currentTime = 0;
  collisionSound.play();

  const dinoRect = dino.getBoundingClientRect();
  createParticles(dinoRect.left + dinoRect.width/2, dinoRect.top + dinoRect.height/2, 30, '#FF5722');
  
  dino.style.animation = 'dinoFall 0.5s forwards';
  
  const burla = mensajesBurla[Math.floor(Math.random() * mensajesBurla.length)];
  gameMessage.textContent = burla;
  overlay.style.display = "flex";
  overlay.classList.remove("hidden");
  bonus.classList.remove("show");

  cactusIntervals.forEach(interval => clearInterval(interval));
  cactusIntervals = [];
}

function reanudarJuego() {
  score = 0;
  dino.style.animation = '';
  dino.style.transform = '';
  particlesContainer.innerHTML = '';
  
  overlay.style.display = "none";
  overlay.classList.add("hidden");
  isGameOver = false;
  score = Math.max(0, score);
  scoreText.textContent = `${score}/50 Points`;
  
  document.querySelectorAll('.cactus').forEach(cactus => cactus.remove());
  crearCactus();
}

function createParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.backgroundColor = color;
    particle.style.width = `${Math.random() * 8 + 4}px`;
    particle.style.height = particle.style.width;
    
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 30 + 20;
    
    particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
    particle.style.animationDuration = `${Math.random() * 1000 + 500}ms`;
    
    particlesContainer.appendChild(particle);
    
    particle.addEventListener('animationend', () => {
      particle.remove();
    });
  }
}

function setupEventListeners() {
  document.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowUp'].includes(e.code)) jump();
  });
  document.addEventListener('click', jump);
  document.addEventListener('touchstart', jump);
  
  startButton.addEventListener('click', iniciarJuego);
}

function iniciarJuego() {
  startMenu.style.opacity = '0';
  startMenu.style.display = 'none';
  
  score = 0;
  scoreText.textContent = `${score}/50 Points`;
  isGameOver = false;
  
  dino.style.bottom = '100px';
  dino.style.left = '50px';
  dino.style.transform = 'rotate(0deg)';
  
  document.querySelectorAll('.cactus').forEach(cactus => cactus.remove());
  particlesContainer.innerHTML = '';
  
  crearCactus();
  showMessage("¡Salta con espacio, clic o toque!", 3000);
}

window.onload = function() {
  setupEventListeners();
  
  overlay.classList.add("hidden");
  fallOverlay.classList.add("hidden");
  quizContainer.classList.add("hidden");
  
  startMenu.style.display = 'flex';
  startMenu.style.opacity = '1';
};
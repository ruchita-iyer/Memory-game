"use strict";
var Difficulty;
(function (Difficulty) {
    Difficulty["Easy"] = "easy";
    Difficulty["Medium"] = "medium";
    Difficulty["Hard"] = "hard";
})(Difficulty || (Difficulty = {}));
// Game class
class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.moves = 0;
        this.matchedPairs = 0;
        this.gameStarted = false;
        this.gameTime = 0;
        this.timer = null;
        this.difficulties = {
            [Difficulty.Easy]: 6,
            [Difficulty.Medium]: 8,
            [Difficulty.Hard]: 10
        };
        this.currentDifficulty = Difficulty.Easy;
        // Icons for cards - using simple emojis that are visible on all platforms
        this.icons = ['🚀', '🌟', '🎮', '🎨', '🎵', '🍕', '🏆', '🎯', '🎭', '🛹', '🌈', '🔮'];
        // Handle card click
        this.handleCardClick = (e) => {
            const target = e.target;
            const cardElement = target.closest('.card');
            if (!cardElement)
                return;
            // Start timer on first card click
            if (!this.gameStarted) {
                this.startTimer();
                this.gameStarted = true;
            }
            const cardId = parseInt(cardElement.dataset.id || '0');
            const card = this.cards.find(c => c.id === cardId);
            // Ignore if card is already flipped or matched
            if (!card || card.isFlipped || card.isMatched)
                return;
            // Ignore if two cards are already flipped
            if (this.flippedCards.length >= 2)
                return;
            // Flip the card
            this.flipCard(card, cardElement);
            // Add to flipped cards
            this.flippedCards.push({ card, element: cardElement });
            // Check for match if two cards are flipped
            if (this.flippedCards.length === 2) {
                this.moves++;
                this.updateMovesDisplay();
                this.checkForMatch();
            }
        };
        // Handle window resize
        this.handleResize = () => {
            this.adjustGridLayout();
        };
        // Initialize DOM elements
        this.gameBoard = document.getElementById('game-board');
        this.movesElement = document.getElementById('moves');
        this.timerElement = document.getElementById('timer');
        this.restartBtn = document.getElementById('restart-btn');
        this.victoryModal = document.getElementById('victory-modal');
        this.finalMovesElement = document.getElementById('final-moves');
        this.finalTimeElement = document.getElementById('final-time');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        // Initialize game
        this.initGame();
        this.attachEventListeners();
        // Add resize handler to adjust when viewport changes
        window.addEventListener('resize', this.handleResize);
    }
    // Initialize game
    initGame() {
        this.resetGame();
        this.createCards();
        this.renderCards();
    }
    // Create cards based on difficulty
    createCards() {
        const pairCount = this.difficulties[this.currentDifficulty];
        const gameIcons = this.icons.slice(0, pairCount);
        // Create pairs
        let id = 0;
        gameIcons.forEach(icon => {
            // Create two cards with the same icon (a pair)
            for (let i = 0; i < 2; i++) {
                this.cards.push({
                    id: id++,
                    icon: icon,
                    isFlipped: false,
                    isMatched: false
                });
            }
        });
        // Shuffle cards
        this.shuffleCards();
    }
    // Render cards to the board
    renderCards() {
        if (!this.gameBoard)
            return;
        this.gameBoard.innerHTML = '';
        // Adjust grid columns based on difficulty and viewport
        this.adjustGridLayout();
        this.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.id = card.id.toString();
            if (card.isFlipped)
                cardElement.classList.add('flipped');
            if (card.isMatched)
                cardElement.classList.add('matched');
            cardElement.innerHTML = `
                <div class="card-face card-back">
                    <div class="card-logo">?</div>
                </div>
                <div class="card-face card-front">
                    ${card.icon}
                </div>
            `;
            // We already checked that this.gameBoard is not null above
            this.gameBoard.appendChild(cardElement);
        });
    }
    // Adjust grid layout based on difficulty and viewport
    adjustGridLayout() {
        if (!this.gameBoard)
            return;
        const totalCards = this.difficulties[this.currentDifficulty] * 2;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isLandscape = viewportWidth > viewportHeight;
        // Determine optimal grid layout
        let columns;
        if (this.currentDifficulty === Difficulty.Easy) {
            columns = (viewportWidth < 600 || totalCards <= 12) ? 3 : 4;
        }
        else if (this.currentDifficulty === Difficulty.Medium) {
            columns = (viewportWidth < 600) ? 4 : (isLandscape ? 4 : 4);
        }
        else { // Hard
            columns = (viewportWidth < 600) ? 4 : (isLandscape ? 5 : 4);
        }
        this.gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }
    // Flip a card
    flipCard(card, element) {
        card.isFlipped = true;
        element.classList.add('flipped');
    }
    // Check if flipped cards match
    checkForMatch() {
        const [first, second] = this.flippedCards;
        if (first.card.icon === second.card.icon) {
            // Match found
            setTimeout(() => {
                first.card.isMatched = true;
                second.card.isMatched = true;
                first.element.classList.add('matched');
                second.element.classList.add('matched');
                this.matchedPairs++;
                this.flippedCards = [];
                // Check for victory
                if (this.matchedPairs === this.difficulties[this.currentDifficulty]) {
                    this.endGame();
                }
            }, 500);
        }
        else {
            // No match
            setTimeout(() => {
                first.card.isFlipped = false;
                second.card.isFlipped = false;
                first.element.classList.remove('flipped');
                second.element.classList.remove('flipped');
                this.flippedCards = [];
            }, 1000);
        }
    }
    // Start the timer
    startTimer() {
        this.timer = window.setInterval(() => {
            this.gameTime++;
            this.updateTimerDisplay();
        }, 1000);
    }
    // Update moves display
    updateMovesDisplay() {
        if (this.movesElement) {
            this.movesElement.textContent = `Moves: ${this.moves}`;
        }
    }
    // Update timer display
    updateTimerDisplay() {
        if (this.timerElement) {
            this.timerElement.textContent = `Time: ${this.gameTime}s`;
        }
    }
    // End the game
    endGame() {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
        // Show victory modal
        setTimeout(() => {
            if (this.finalMovesElement) {
                this.finalMovesElement.textContent = this.moves.toString();
            }
            if (this.finalTimeElement) {
                this.finalTimeElement.textContent = this.gameTime.toString();
            }
            if (this.victoryModal) {
                this.victoryModal.classList.add('active');
            }
            // Create confetti effect
            this.createConfetti();
        }, 500);
    }
    // Reset the game
    resetGame() {
        this.cards = [];
        this.flippedCards = [];
        this.moves = 0;
        this.matchedPairs = 0;
        this.gameStarted = false;
        this.gameTime = 0;
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.movesElement) {
            this.movesElement.textContent = 'Moves: 0';
        }
        if (this.timerElement) {
            this.timerElement.textContent = 'Time: 0s';
        }
        if (this.victoryModal) {
            this.victoryModal.classList.remove('active');
        }
    }
    // Shuffle cards using Fisher-Yates algorithm
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    // Create confetti effect
    createConfetti() {
        const colors = ['#ff6b6b', '#4a6fa5', '#ffd166', '#06d6a0', '#118ab2'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = -10 + 'px';
            confetti.style.transform = 'scale(' + (Math.random() + 0.5) + ')';
            document.body.appendChild(confetti);
            const animationDuration = Math.random() * 3 + 2;
            const xPos = (Math.random() - 0.5) * 100;
            // Animate using JS for better control
            const keyframes = [
                { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${xPos}vw, 100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ];
            const options = {
                duration: animationDuration * 1000,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
                fill: 'forwards'
            };
            confetti.animate(keyframes, options);
            // Remove confetti element after animation
            setTimeout(() => {
                confetti.remove();
            }, animationDuration * 1000);
        }
    }
    // Change difficulty
    changeDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        // Update active button
        this.difficultyBtns.forEach(btn => {
            if (btn instanceof HTMLElement && btn.dataset.difficulty === difficulty) {
                btn.classList.add('active');
            }
            else {
                btn.classList.remove('active');
            }
        });
        this.initGame();
    }
    // Attach event listeners
    attachEventListeners() {
        // Card click listener (using event delegation)
        if (this.gameBoard) {
            this.gameBoard.addEventListener('click', this.handleCardClick);
        }
        // Restart button listener
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => this.initGame());
        }
        // Play again button listener
        if (this.playAgainBtn) {
            this.playAgainBtn.addEventListener('click', () => {
                if (this.victoryModal) {
                    this.victoryModal.classList.remove('active');
                }
                this.initGame();
            });
        }
        // Difficulty buttons listeners
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const difficulty = target.dataset.difficulty;
                if (difficulty && Object.values(Difficulty).includes(difficulty)) {
                    this.changeDifficulty(difficulty);
                }
            });
        });
    }
}
// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
//# sourceMappingURL=game.js.map
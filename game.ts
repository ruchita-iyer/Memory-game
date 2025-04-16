// Type definitions
interface CardData {
    id: number;
    icon: string;
    isFlipped: boolean;
    isMatched: boolean;
}

interface FlippedCard {
    card: CardData;
    element: HTMLElement;
}

enum Difficulty {
    Easy = 'easy',
    Medium = 'medium',
    Hard = 'hard'
}

type DifficultyValues = {
    [key in Difficulty]: number;
};

// Game class
class MemoryGame {
    private cards: CardData[] = [];
    private flippedCards: FlippedCard[] = [];
    private moves: number = 0;
    private matchedPairs: number = 0;
    private gameStarted: boolean = false;
    private gameTime: number = 0;
    private timer: number | null = null;
    private difficulties: DifficultyValues = {
        [Difficulty.Easy]: 6,
        [Difficulty.Medium]: 8,
        [Difficulty.Hard]: 12
    };
    private currentDifficulty: Difficulty = Difficulty.Easy;

    // DOM elements
    private gameBoard: HTMLElement | null;
    private movesElement: HTMLElement | null;
    private timerElement: HTMLElement | null;
    private restartBtn: HTMLElement | null;
    private victoryModal: HTMLElement | null;
    private finalMovesElement: HTMLElement | null;
    private finalTimeElement: HTMLElement | null;
    private playAgainBtn: HTMLElement | null;
    private difficultyBtns: NodeListOf<Element>;

    // Icons for cards
    private icons: string[] = ['🚀', '🌟', '🎮', '🎨', '🎵', '🍕', '🏆', '🎯', '🎭', '🛹', '🌈', '🔮'];

    constructor() {
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
    }

    // Initialize game
    private initGame(): void {
        this.resetGame();
        this.createCards();
        this.renderCards();
    }

    // Create cards based on difficulty
    private createCards(): void {
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
    private renderCards(): void {
        if (!this.gameBoard) return;

        this.gameBoard.innerHTML = '';

        // Adjust grid columns based on difficulty
        if (this.currentDifficulty === Difficulty.Easy) {
            this.gameBoard.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else if (this.currentDifficulty === Difficulty.Medium) {
            this.gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
        } else {
            this.gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
        }

        this.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.id = card.id.toString();

            if (card.isFlipped) cardElement.classList.add('flipped');
            if (card.isMatched) cardElement.classList.add('matched');

            cardElement.innerHTML = `
                <div class="card-face card-back">
                    <div class="card-logo">?</div>
                </div>
                <div class="card-face card-front">
                    ${card.icon}
                </div>
            `;

            this.gameBoard!.appendChild(cardElement);
        });
    }

    // Handle card click
    private handleCardClick = (e: Event): void => {
        const target = e.target as HTMLElement;
        const cardElement = target.closest('.card') as HTMLElement;
        if (!cardElement) return;

        // Start timer on first card click
        if (!this.gameStarted) {
            this.startTimer();
            this.gameStarted = true;
        }

        const cardId = parseInt(cardElement.dataset.id || '0');
        const card = this.cards.find(c => c.id === cardId);

        // Ignore if card is already flipped or matched
        if (!card || card.isFlipped || card.isMatched) return;

        // Ignore if two cards are already flipped
        if (this.flippedCards.length >= 2) return;

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
    }

    // Flip a card
    private flipCard(card: CardData, element: HTMLElement): void {
        card.isFlipped = true;
        element.classList.add('flipped');
    }

    // Check if flipped cards match
    private checkForMatch(): void {
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
        } else {
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
    private startTimer(): void {
        this.timer = window.setInterval(() => {
            this.gameTime++;
            this.updateTimerDisplay();
        }, 1000);
    }

    // Update moves display
    private updateMovesDisplay(): void {
        if (this.movesElement) {
            this.movesElement.textContent = `Moves: ${this.moves}`;
        }
    }

    // Update timer display
    private updateTimerDisplay(): void {
        if (this.timerElement) {
            this.timerElement.textContent = `Time: ${this.gameTime}s`;
        }
    }

    // End the game
    private endGame(): void {
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
    private resetGame(): void {
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
    private shuffleCards(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    // Create confetti effect
    private createConfetti(): void {
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
            const keyframes: Keyframe[] = [
                { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${xPos}vw, 100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ];

            const options: KeyframeAnimationOptions = {
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
    private changeDifficulty(difficulty: Difficulty): void {
        this.currentDifficulty = difficulty;

        // Update active button
        this.difficultyBtns.forEach(btn => {
            if (btn instanceof HTMLElement && btn.dataset.difficulty === difficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.initGame();
    }

    // Attach event listeners
    private attachEventListeners(): void {
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
                const target = e.currentTarget as HTMLElement;
                const difficulty = target.dataset.difficulty;
                if (difficulty && Object.values(Difficulty).includes(difficulty as Difficulty)) {
                    this.changeDifficulty(difficulty as Difficulty);
                }
            });
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
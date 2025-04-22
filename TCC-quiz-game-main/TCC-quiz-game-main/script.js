document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const nameInput = document.getElementById('name-input');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const startBtn = document.getElementById('start-btn');
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const menuOverlay = document.getElementById('menu-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    const playerNameDisplay = document.querySelector('.player-name-text');
    const playerLevelDisplay = document.querySelector('.level-number');
    const playerScoreDisplay = document.querySelector('.score-number');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const questionTheme = document.querySelector('.theme-text');
    const questionDifficulty = document.querySelector('.difficulty-text');
    const feedback = document.getElementById('feedback');
    const finalScore = document.getElementById('final-score');
    const correctAnswers = document.getElementById('correct-answers');
    const wrongAnswers = document.getElementById('wrong-answers');
    const finalLevel = document.getElementById('final-level');
    const achievementsGrid = document.getElementById('achievements-grid');
    const wrongAnswersList = document.getElementById('wrong-answers-list');
    const loadingModal = document.getElementById('loading-modal');
    const rewardModal = document.getElementById('reward-modal');
    const rewardTitle = document.getElementById('reward-title');
    const rewardMessage = document.getElementById('reward-message');
    const modalCloseBtns = document.querySelectorAll('.modal-close');
    const progressBar = document.querySelector('.progress');

    // Variáveis do jogo
    let dificuldadeSelecionada = "facil";
    let perguntasAtuais = [];
    let perguntaAtual = null;
    let conquistasParaVerificar = [];
    let totalPerguntas = 10;

    let jogador = {
        nome: "",
        pontuacao: 0,
        nivel: 1,
        acertos: 0,
        erros: 0,
        perguntasRespondidas: 0,
        perguntasAcertadas: [],
        perguntasErradas: [],
        ultimosErros: 0,
        conquistasDesbloqueadas: []
    };

    // Carrega perguntas do arquivo JSON
    async function carregarPerguntas() {
        try {
            const response = await fetch('perguntas.json');
            return await response.json();
        } catch (error) {
            console.error("Erro ao carregar perguntas:", error);
            return {
                facil: [],
                medio: [],
                dificil: []
            };
        }
    }

    // Lista de conquistas
    const conquistas = [
        {
            nome: "Iniciante",
            descricao: "Acertar 2 perguntas",
            condicao: (jogador) => jogador.acertos >= 2,
            icone: "fas fa-award"
        },
        {
            nome: "Expert em Provas",
            descricao: "Acertar 3 perguntas sobre provas",
            condicao: (jogador) => jogador.perguntasAcertadas.filter(p => p.tema === "Provas").length >= 3,
            icone: "fas fa-file-alt"
        },
        {
            nome: "Sem Erros",
            descricao: "Responder 3 perguntas seguidas sem errar",
            condicao: (jogador) => jogador.ultimosErros === 0 && jogador.perguntasRespondidas >= 3,
            icone: "fas fa-check-circle"
        },
        {
            nome: "Mestre do Conhecimento",
            descricao: "Alcançar nível 3",
            condicao: (jogador) => jogador.nivel >= 3,
            icone: "fas fa-graduation-cap"
        },
        {
            nome: "Pontuação Máxima",
            descricao: "Alcançar 1000 pontos",
            condicao: (jogador) => jogador.pontuacao >= 1000,
            icone: "fas fa-star"
        }
    ];

    // Inicializar eventos
    function initEventListeners() {
        // Menu hamburger e overlay
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
        });

        menuOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });

        // Links de navegação
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-target');
                abrirAba(target);
            });
        });

        // Botões de dificuldade
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                difficultyButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                dificuldadeSelecionada = button.dataset.difficulty;
            });
        });

        // Botão iniciar
        startBtn.addEventListener('click', async function() {
            if (nameInput.value.trim() === '') {
                alert('Por favor, insira seu nome para começar!');
                return;
            }
            await iniciarJogo();
        });

        // Botão próxima pergunta
        if (nextBtn) {
            nextBtn.addEventListener('click', carregarProximaPergunta);
        }

        // Botão reiniciar
        if (restartBtn) {
            restartBtn.addEventListener('click', reiniciarJogo);
        }

        // Fechar modais
        modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('show');
                });
            });
        });
    }

    // Criar estrelas para o fundo
    function createStars() {
        const stars = document.getElementById('stars');
        const stars2 = document.getElementById('stars2');
        const stars3 = document.getElementById('stars3');
        
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 5}s`;
            stars.appendChild(star);
            
            if (i < 50) {
                const star2 = star.cloneNode();
                star2.style.animationDuration = `${5 + Math.random() * 10}s`;
                stars2.appendChild(star2);
            }
            
            if (i < 25) {
                const star3 = star.cloneNode();
                star3.style.animationDuration = `${10 + Math.random() * 15}s`;
                stars3.appendChild(star3);
            }
        }
    }

    // Abrir aba específica
    function abrirAba(tab) {
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const tabElement = document.getElementById(`${tab}-tab`);
        if (tabElement) {
            tabElement.classList.add('active');
        }
        
        // Fechar menu lateral em mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    // Mostrar loading
    function showLoading() {
        loadingModal.classList.add('show');
    }

    // Esconder loading
    function hideLoading() {
        loadingModal.classList.remove('show');
    }

    // Mostrar conquista
    function mostrarConquista(conquista) {
        rewardTitle.textContent = conquista.nome;
        rewardMessage.textContent = conquista.descricao;
        rewardModal.classList.add('show');
    }

    // Verificar conquistas
    function verificarConquistas() {
        const novasConquistas = [];
        
        conquistasParaVerificar = conquistasParaVerificar.filter(conquista => {
            if (!jogador.conquistasDesbloqueadas.includes(conquista.nome) && conquista.condicao(jogador)) {
                jogador.conquistasDesbloqueadas.push(conquista.nome);
                novasConquistas.push(conquista);
                return false;
            }
            return true;
        });
        
        if (novasConquistas.length > 0) {
            mostrarConquista(novasConquistas[0]);
        }
    }

    // Formatador de dificuldade
    function formatarDificuldade(dificuldade) {
        const formatos = {
            facil: "Fácil",
            medio: "Médio",
            dificil: "Difícil"
        };
        return formatos[dificuldade] || dificuldade;
    }

    // Iniciar o jogo
    async function iniciarJogo() {
        const nome = nameInput.value.trim() || "Explorador";
        jogador = {
            nome,
            pontuacao: 0,
            nivel: 1,
            acertos: 0,
            erros: 0,
            perguntasRespondidas: 0,
            perguntasAcertadas: [],
            perguntasErradas: [],
            ultimosErros: 0,
            conquistasDesbloqueadas: []
        };
        
        conquistasParaVerificar = [...conquistas];
        
        // Carrega perguntas do JSON
        const perguntas = await carregarPerguntas();
        perguntasAtuais = [...perguntas[dificuldadeSelecionada]];
        totalPerguntas = Math.min(perguntasAtuais.length, 10); // Limita a 10 perguntas
        
        if (perguntasAtuais.length === 0) {
            alert("Não há perguntas disponíveis para esta dificuldade.");
            return;
        }
        
        // Embaralha perguntas
        perguntasAtuais = perguntasAtuais.sort(() => Math.random() - 0.5).slice(0, totalPerguntas);
        
        // Atualizar UI
        playerNameDisplay.textContent = nome;
        playerLevelDisplay.textContent = jogador.nivel;
        playerScoreDisplay.textContent = jogador.pontuacao;
        
        // Resetar barra de progresso
        progressBar.style.width = '0%';
        
        // Mudar para aba do quiz
        abrirAba('quiz');
        
        // Carregar primeira pergunta
        carregarProximaPergunta();
    }

    // Carregar próxima pergunta
    function carregarProximaPergunta() {
        showLoading();
        
        setTimeout(() => {
            nextBtn.disabled = true;
            
            if (perguntasAtuais.length === 0 || jogador.perguntasRespondidas >= totalPerguntas) {
                finalizarJogo();
                hideLoading();
                return;
            }
            
            perguntaAtual = perguntasAtuais.pop();
            
            // Atualizar UI com a pergunta
            questionText.textContent = perguntaAtual.enunciado;
            questionTheme.textContent = perguntaAtual.tema;
            questionDifficulty.textContent = formatarDificuldade(dificuldadeSelecionada);
            
            // Limpar opções anteriores
            optionsContainer.innerHTML = '';
            
            // Adicionar alternativas
            perguntaAtual.alternativas.forEach((alternativa, index) => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.innerHTML = `<i class="fas fa-circle"></i> ${alternativa}`;
                button.addEventListener('click', () => verificarResposta(index));
                optionsContainer.appendChild(button);
            });
            
            // Limpar feedback
            feedback.className = 'feedback-container';
            feedback.style.display = 'none';
            
            // Atualizar barra de progresso
            const percentualCompleto = ((jogador.perguntasRespondidas) / totalPerguntas) * 100;
            progressBar.style.width = percentualCompleto + '%';
            
            hideLoading();
        }, 800);
    }

    // Verificar resposta
    function verificarResposta(respostaIndex) {
        const acertou = respostaIndex === perguntaAtual.respostaCorreta;
        jogador.perguntasRespondidas++;
        
        // Desabilitar todos os botões de opção
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(button => {
            button.disabled = true;
            if (parseInt(button.getAttribute('data-index')) === perguntaAtual.respostaCorreta) {
                button.classList.add('correct');
            } else if (parseInt(button.getAttribute('data-index')) === respostaIndex && !acertou) {
                button.classList.add('incorrect');
            }
        });
        
        // Atualizar dados do jogador
        if (acertou) {
            jogador.acertos++;
            jogador.ultimosErros = 0;
            jogador.perguntasAcertadas.push(perguntaAtual);
            
            // Calcular pontos baseados na dificuldade
            const pontos = {
                facil: 100,
                medio: 200,
                dificil: 300
            }[dificuldadeSelecionada];
            
            jogador.pontuacao += pontos;
            
            // Atualizar nível
            jogador.nivel = Math.floor(jogador.pontuacao / 1000) + 1;
            
            // Mostrar feedback
            feedback.className = 'feedback-container correct';
            feedback.innerHTML = `<i class="fas fa-check-circle"></i> <strong>Correto!</strong> ${perguntaAtual.explicacao}`;
            feedback.style.display = 'block';
        } else {
            jogador.erros++;
            jogador.ultimosErros++;
            jogador.perguntasErradas.push(perguntaAtual);
            
            // Mostrar feedback
            feedback.className = 'feedback-container incorrect';
            feedback.innerHTML = `<i class="fas fa-times-circle"></i> <strong>Incorreto!</strong> ${perguntaAtual.explicacao}`;
            feedback.style.display = 'block';
        }
        
        // Atualizar UI
        playerLevelDisplay.textContent = jogador.nivel;
        playerScoreDisplay.textContent = jogador.pontuacao;
        
        // Verificar conquistas
        verificarConquistas();
        
        // Habilitar botão próxima pergunta
        nextBtn.disabled = false;
    }

    // Finalizar o jogo
    function finalizarJogo() {
        // Atualizar resultados
        finalScore.textContent = jogador.pontuacao;
        correctAnswers.textContent = jogador.acertos;
        wrongAnswers.textContent = jogador.erros;
        finalLevel.textContent = jogador.nivel;
        
        // Mostrar conquistas
        if (jogador.conquistasDesbloqueadas.length > 0) {
            achievementsGrid.innerHTML = '';
            conquistas.forEach(conquista => {
                if (jogador.conquistasDesbloqueadas.includes(conquista.nome)) {
                    const achievementCard = document.createElement('div');
                    achievementCard.className = 'achievement-card';
                    achievementCard.innerHTML = `
                        <i class="${conquista.icone}"></i>
                        <div>
                            <h4>${conquista.nome}</h4>
                            <p>${conquista.descricao}</p>
                        </div>
                    `;
                    achievementsGrid.appendChild(achievementCard);
                }
            });
        }
        
        // Mostrar respostas erradas
        if (jogador.perguntasErradas.length > 0) {
            wrongAnswersList.innerHTML = '';
            jogador.perguntasErradas.forEach(pergunta => {
                const wrongAnswerItem = document.createElement('div');
                wrongAnswerItem.className = 'wrong-answer-item';
                wrongAnswerItem.innerHTML = `
                    <h4>${pergunta.enunciado}</h4>
                    <p>${pergunta.explicacao}</p>
                `;
                wrongAnswersList.appendChild(wrongAnswerItem);
            });
        } else {
            wrongAnswersList.innerHTML = '<div class="no-wrong-answers">Nenhuma resposta errada! Excelente!</div>';
        }
        
        // Mudar para aba de resultados
        abrirAba('resultados');
    }

    // Reiniciar o jogo
    function reiniciarJogo() {
        abrirAba('inicio');
    }

    // Inicialização
    function init() {
        initEventListeners();
        createStars();
        abrirAba('inicio');
    }

    init();
});
let currentSection = 0;

function nextSection() {
    const sections = document.querySelectorAll('.view');
    // Hide the current section
    sections[currentSection].classList.add('hidden');

    // Show the next section
    currentSection++;

    // Loop back to the first section if at the end
    if (currentSection >= sections.length) {
        currentSection = 0;
    }

    sections[currentSection].classList.remove('hidden');
}


// Populate days (1 to 31)
const daySelect = document.getElementById('dob-day');
for (let i = 1; i <= 31; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    daySelect.appendChild(option);
}

// Populate months (January to December)
const monthSelect = document.getElementById('dob-month');
const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];
months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index + 1; // Months as 1 to 12
    option.textContent = month;
    monthSelect.appendChild(option);
});

// Populate years (1980 to 2025)
const yearSelect = document.getElementById('dob-year');
for (let year = 1980; year <= 2024; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
}



// Get data

document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-btn");
    startButton.addEventListener("click", saveUserData);
});

// Função para capturar dados do formulário e salvar na sessão
function saveUserData() {
    const name = document.getElementById("name").value || "Unknown";
    const dobDay = document.getElementById("dob-day").value || "01";
    const dobMonth = document.getElementById("dob-month").value || "01";
    const dobYear = document.getElementById("dob-year").value || "2000";
    const gender = document.getElementById("gender").value || "prefer-not-to-say";
    const medications = document.getElementById("medications").value || "None";
    const diagnosis = document.getElementById("diagnosis").value || "none";

    // Formatar a data de nascimento
    const dob = `${dobYear}-${dobMonth}-${dobDay}`;

    // Criar objeto JSON
    const userData = {
        name: name,
        date_of_birth: dob,
        gender: gender,
        medications: medications,
        diagnosis: diagnosis,
    };

    // Salvar no sessionStorage
    sessionStorage.setItem("userData", JSON.stringify(userData));
}

document.addEventListener("DOMContentLoaded", () => {
    // Exemplo de botão ou evento que envia os dados
    const startAnalysisButton = document.getElementById("start-btn");

    startAnalysisButton.addEventListener("click", () => {
        // Recuperar os dados armazenados no sessionStorage
        const userData = JSON.parse(sessionStorage.getItem("userData"));

        // Verificar se os dados estão disponíveis
        if (!userData) {
            alert("User data is missing! Please complete the previous steps.");
            return;
        }

        // Enviar os dados ao backend
        fetch("/process-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        })
        .then(response => {
            if (response.ok) {
                return response.json(); // Supondo que o backend retorne JSON
            } else {
                throw new Error("Failed to process data.");
            }
        })
        .then(data => {
            // Fazer algo com a resposta (ex.: redirecionar ou exibir dados)
            console.log("Backend response:", data);

            // Redirecionar para a página de análise
            window.location.href = "/page2";
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });
});







// Recuperdar data em page2

document.addEventListener("DOMContentLoaded", () => {
    // Recuperar dados do sessionStorage
    const userData = JSON.parse(sessionStorage.getItem("userData"));

    if (userData) {
        console.log("User Data:", userData);

        // Exibir os dados na página (opcional)
        document.getElementById("user-info").innerText = `Bem-vindo, ${userData.name}!`;
    } else {
        console.log("No user data found.");
    }
});


/* combinando dados do usuário */


document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chat-input");
    const chatSend = document.getElementById("chat-send");
    const chatMessages = document.getElementById("chat-messages");

    // Recuperar user_data do sessionStorage
    const userData = JSON.parse(sessionStorage.getItem("userData")) || {};

    // Exibir informações básicas do usuário
    const userInfoDiv = document.getElementById("user-info");
    userInfoDiv.innerText = `Welcome, ${userData.name || "User"}! Let's analyze your health.`;

    // Perguntas do chatbot
    const questions = [
        "What is your current systolic blood pressure (upper number)?",
        "What is your current diastolic blood pressure (lower number)?",
        "What is your latest blood sugar reading?",
        "Have you experienced any pain or discomfort in the last few days?"
    ];

    // Salvar respostas do usuário
    const userResponses = {};

    let currentQuestionIndex = 0;

    // Função para adicionar mensagens no chat
    function addMessage(sender, text) {
        const message = document.createElement("div");
        message.classList.add(sender);
        message.innerText = text;
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Enviar pergunta inicial
    function askNextQuestion() {
        if (currentQuestionIndex < questions.length) {
            addMessage("bot", questions[currentQuestionIndex]);
        } else {
            // Finalizar e salvar os dados
            const combinedData = { ...userData, responses: userResponses };
            sessionStorage.setItem("userData", JSON.stringify(combinedData));
            addMessage("bot", "Thank you for your responses! Your data has been saved.");
        }
    }

    // Processar envio de resposta
    chatSend.addEventListener("click", () => {
        const userInput = chatInput.value.trim();
        if (userInput === "") return;

        // Adicionar mensagem do usuário ao chat
        addMessage("user", userInput);

        // Salvar resposta e avançar para a próxima pergunta
        const currentQuestion = questions[currentQuestionIndex];
        userResponses[currentQuestion] = userInput;
        currentQuestionIndex++;

        // Limpar o campo de entrada
        chatInput.value = "";

        // Perguntar próxima questão
        askNextQuestion();
    });

    // Iniciar o chat com a primeira pergunta
    askNextQuestion();
});


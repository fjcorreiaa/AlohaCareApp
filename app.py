from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os
import openai

# Carregar variáveis do arquivo .env
load_dotenv()

# Configurar chave de API
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("Index.html")


user_responses = {}
userData = {}

@app.route("/process-data", methods=["POST"])
def process_data():
    userData = request.get_json()  # Receber dados enviados pelo frontend

    if not userData:
        return jsonify({"error": "No user data received"}), 400

    # Opcional: Processar os dados do usuário ou armazená-los
    print("Received user data:", userData)

    # Retornar uma resposta de sucesso ao frontend
    return jsonify({"message": "User data processed successfully"}), 200


# Rota para a página inicial (index.html)
@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/page2", methods=["GET", "POST"])
def health_analysis():
    global user_responses  # Declarar variável global para manter as respostas

    if request.method == "GET":
        user_responses.clear()

    gpt_response = None  # Inicializar gpt_response como None

    # Perguntas padronizadas
    questions = [
        "What is your current systolic blood pressure (highest pressure)?",
        "What is your current diastolic blood pressure (lowest pressure)?",
        "What about the results of your blood glucose test?",
        "Have you had any pain or discomfort in the last few days?"
    ]

    # Obter a pergunta atual
    current_question_index = len(user_responses)
    current_question = None

    if current_question_index < len(questions):
        current_question = questions[current_question_index]

    if request.method == "POST":
        # Obter entrada do formulário
        user_input = request.form.get("userData", "").strip()

        if user_input:
            # Salvar a resposta para a pergunta atual
            if current_question:
                user_responses[current_question] = user_input

            # Incrementar para a próxima pergunta ou finalizar
            current_question_index += 1
            if current_question_index < len(questions):
                current_question = questions[current_question_index]
            else:
                # Verificar normalidade das respostas
                is_normal = True  # Assumir normal até encontrar algo fora do intervalo
                user_diagnosis = userData.get("diagnosis", "unknown")

                for question, answer in user_responses.items():
                    if "systolic" in question.lower():
                        systolic = int(answer)
                        if not (90 <= systolic <= 120):
                            is_normal = False
                    elif "diastolic" in question.lower():
                        diastolic = int(answer)
                        if not (60 <= diastolic <= 80):
                            is_normal = False
                    elif "glycemia" in question.lower():
                        glycemia = int(answer)
                        if not (70 <= glycemia <= 140):
                            is_normal = False
                    elif "pain" in question.lower() or "discomfort" in question.lower():
                        if "yes" in answer.lower():
                            is_normal = False

                # Personalizar resposta final
                if is_normal:
                    response_message = (
                        "Your data is within normal limits! Continue to maintain good health habits and take care of your well-being."
                    )
                else:
                    response_message = (
                        f"Your data indicates some altered values. It is important that you seek a health service for a detailed evaluation, "
                        f"especially due to the {user_diagnosis} diagnosis."
                    )

                gpt_response = response_message

    # Renderizar a página com a pergunta atual e respostas
    return render_template(
        "page2.html",
        current_question=current_question,
        response=gpt_response,
        user_responses=user_responses
    )

def generate_health_analysis(user_responses):
    """
    Função para gerar uma análise baseada nas respostas do usuário.
    """
    analysis = []
    for question, answer in user_responses.items():
        if "systolic" in question.lower():
            if int(answer) > 120:
                analysis.append("Your systolic blood pressure is above normal.")
            elif int(answer) < 90:
                analysis.append("Your systolic blood pressure is below normal.")
            else:
                analysis.append("Your systolic blood pressure is within normal range.")
        elif "diastolic" in question.lower():
            if int(answer) > 80:
                analysis.append("Your diastolic blood pressure is above normal.")
            elif int(answer) < 60:
                analysis.append("Your diastolic blood pressure is below normal.")
            else:
                analysis.append("Your diastolic blood pressure is within normal range.")
        elif "glycemia" in question.lower():
            if int(answer) > 140:
                analysis.append("Your blood glucose level is above normal.")
            elif int(answer) < 70:
                analysis.append("Your blood glucose level is below normal.")
            else:
                analysis.append("Your blood glucose level is within normal range.")
        elif "pain" in question.lower() or "discomfort" in question.lower():
            if "yes" in answer.lower():
                analysis.append("You reported experiencing discomfort or pain.")
            else:
                analysis.append("You reported no discomfort or pain.")
    return "\n".join(analysis)


if __name__ == "__main__":
    app.run(debug=True)

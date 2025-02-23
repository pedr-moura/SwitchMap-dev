function obterDataHoraAtual() {
    const agora = new Date();
    const data = agora.toLocaleDateString();
    const hora = agora.toLocaleTimeString();
    return `${data} ${hora}`;
}

function exibirDataHora() {
    document.getElementById('dataHora').innerText = obterDataHoraAtual();
}

const feedbackDados = document.getElementById('popup')
feedbackDados.style.display = 'none'

function exibirFeedbackDados() {
    feedbackDados.style.display = 'block';
    setTimeout(() => {
        feedbackDados.style.display = 'none';
    }, 3000); // 3 segundos (3000 milissegundos)
}

function fecharFeedbackDados() {
    feedbackDados.style.display = 'none';
}
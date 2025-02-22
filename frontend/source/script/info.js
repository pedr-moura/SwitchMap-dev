function obterDataHoraAtual() {
    const agora = new Date();
    const data = agora.toLocaleDateString();
    const hora = agora.toLocaleTimeString();
    return `${data}, ${hora}`;
}

function exibirDataHora() {
    document.getElementById('dataHora').innerText = obterDataHoraAtual();
}
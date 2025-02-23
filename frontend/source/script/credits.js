const credits = document.getElementById('creditos')
let instancia = 0

function alterarCor() {
    if (instancia == 1) {
        instancia -= 1
        credits.style.color = "#313131"
    }else{
        instancia += 1
        credits.style.color = "#36c725"
    }
}
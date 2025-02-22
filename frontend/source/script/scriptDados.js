async function carregarDados() {
    limparInput()
    
    // 172.16.208.74 -> repo
    // 172.16.197.44 -> 
    // test 192.168.0.8:5000
    const response = await fetch('http://192.168.0.8:5000/status');
    const dados = await response.json();
    console.log('Dados carregados:', dados);

    const tipos = [...new Set(dados.hosts.map(ponto => ponto.tipo))];
    console.log('Tipos únicos:', tipos);


    if (!map) {
        map = L.map('map', {
            maxZoom: 17
        }).setView([-5.41748713266883, -47.567331471508695], 16);
    
        // Camadas de mapa
        const mapaPadrao = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        });
    
        const mapaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri'
        });
    
        // Define o mapa padrão ao iniciar
        mapaPadrao.addTo(map);
    
        markersLayer = L.layerGroup().addTo(map); // Camada para os marcadores
        linesLayer = L.layerGroup(); // Camada para as linhas (não adicionada ao mapa inicialmente)
    
        // Alternar mapa ao mudar o switch
        document.getElementById('mapToggle').addEventListener('change', function () {
            if (this.checked) {
                map.removeLayer(mapaPadrao);
                mapaSatelite.addTo(map);
            } else {
                map.removeLayer(mapaSatelite);
                mapaPadrao.addTo(map);
            }
        });
    
        // Adiciona evento de entrada ao campo de busca
        document.getElementById('ipBusca').addEventListener('input', function () {
            pesquisarPorIP(dados.hosts);
        });
    
        // Adiciona evento ao botão de alternar linhas
        document.getElementById('toggleLinesButton').addEventListener('click', function () {
            linesVisible = !linesVisible;
            if (linesVisible) {
                linesLayer.addTo(map);
                this.textContent = 'Ocultar relação';
            } else {
                map.removeLayer(linesLayer);
                this.textContent = 'Exibir relação';
            }
        });
    } else {
        markersLayer.clearLayers(); // Remove todos os marcadores existentes
        linesLayer.clearLayers(); // Remove todas as linhas existentes
    }

    const listaSemLocalizacao = document.getElementById('sem-localizacao');
    listaSemLocalizacao.innerHTML = ''; // Limpa a lista antes de adicionar novos itens

    const pontosMapeados = {};
    let zindex = '';
    dados.hosts.forEach(ponto => {
        if (ponto.local) {
            const [lat, lng] = ponto.local.split(', ').map(Number);

            if (ponto.ativo == 'red') {
                zindex = 'z-index: 99999999999999999999;'
            }
            // Criando um ícone com uma div para estilização
            const iconeCustomizado = L.divIcon({
                className: 'custom-marker', // Classe CSS
                html: `<img src="./source/sw.png" id="icone-sw" style="border: 2px solid ${ponto.ativo}; ${zindex} box-shadow: inset 0 0 0 1.5px blue;" />`, // Ícone dentro da div
                iconSize: [10, 30],
                iconAnchor: [15, 30], // Ajuste para alinhar corretamente
                popupAnchor: [0, -30]
            });

            const marker = L.marker([lat, lng], { icon: iconeCustomizado }).addTo(markersLayer)
                .bindPopup(`<b class="nomedosw" style="color: ${ponto.ativo};">${ponto.nome} <br> <span class="latitude">${ponto.local}</span></b>`);

            pontosMapeados[ponto.ip] = { lat, lng, marker };
        } else {
            const li = document.createElement('li');
            li.innerHTML = `${ponto.nome} - <span class="latitude" style="color: ${ponto.ativo};">${ponto.ip}<span>`;
            listaSemLocalizacao.appendChild(li);
        }
    });

    // Desenhar linhas entre pontos conectados
    dados.hosts.forEach(ponto => {
        if (ponto.ship) {
            const ships = ponto.ship.split(', ');
            ships.forEach(ship => {
                if (pontosMapeados[ponto.ip] && pontosMapeados[ship]) {
                    const ponto1 = pontosMapeados[ponto.ip];
                    const ponto2 = pontosMapeados[ship];

                    console.log(`Desenhando linha entre ${ponto.ip} e ${ship}`);
                    console.log(`Coordenadas: ${ponto1.lat}, ${ponto1.lng} -> ${ponto2.lat}, ${ponto2.lng}`);

                    const linha = L.polyline([[ponto1.lat, ponto1.lng], [ponto2.lat, ponto2.lng]], { color: `${ponto.ativo}` }).addTo(linesLayer);
                } else {
                    console.log(`Ponto não encontrado para ${ponto.ip} ou ${ship}`);
                }
            });
        }
    });

    exibirDataHora();
    console.log('dados carregados');
}

async function atualizarDados() {
    const response = await fetch('http://192.168.0.8:5000/status');
    const dados = await response.json();

    markersLayer.clearLayers(); // Remove todos os marcadores existentes
    linesLayer.clearLayers(); // Remove todas as linhas existentes

    const listaSemLocalizacao = document.getElementById('sem-localizacao');
    listaSemLocalizacao.innerHTML = ''; // Limpa a lista antes de adicionar novos itens

    const pontosMapeados = {};

    dados.hosts.forEach(ponto => {
        if (ponto.local) {
            const [lat, lng] = ponto.local.split(', ').map(Number);

            if (ponto.ativo == 'red') {
                zindex = 'z-index: 99999999999999999999;'
            }
            // Criando um ícone com uma div para estilização
            const iconeCustomizado = L.divIcon({
                className: 'custom-marker', // Classe CSS
                html: `<img src="./source/sw.png" id="icone-sw" style="border: 2px solid ${ponto.ativo}; ${zindex} box-shadow: inset 0 0 0 1.5px blue;" />`, // Ícone dentro da div
                iconSize: [10, 30],
                iconAnchor: [15, 30], // Ajuste para alinhar corretamente
                popupAnchor: [0, -30]
            });

            const marker = L.marker([lat, lng], { icon: iconeCustomizado }).addTo(markersLayer)
                .bindPopup(`<b class="nomedosw">${ponto.nome} <br> <span class="latitude">${ponto.local}</span></b>`);

            pontosMapeados[ponto.ip] = { lat, lng, marker };
        } else {
            const li = document.createElement('li');
            li.innerHTML = `${ponto.nome} - <span class="latitude">${ponto.ip}<span>`;
            listaSemLocalizacao.appendChild(li);
        }
    });

    // Desenhar linhas entre pontos conectados
    dados.hosts.forEach(ponto => {
        if (ponto.ship) {
            const ships = ponto.ship.split(', ');
            ships.forEach(ship => {
                if (pontosMapeados[ponto.ip] && pontosMapeados[ship]) {
                    const ponto1 = pontosMapeados[ponto.ip];
                    const ponto2 = pontosMapeados[ship];

                    console.log(`Desenhando linha entre ${ponto.ip} e ${ship}`);
                    console.log(`Coordenadas: ${ponto1.lat}, ${ponto1.lng} -> ${ponto2.lat}, ${ponto2.lng}`);

                    const linha = L.polyline([[ponto1.lat, ponto1.lng], [ponto2.lat, ponto2.lng]], { color: `${ponto.ativo}` }).addTo(linesLayer);
                } else {
                    console.log(`Ponto não encontrado para ${ponto.ip} ou ${ship}`);
                }
            });
        }
    });
}

carregarDados();
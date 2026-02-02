/* Neste script, gerencio a interação entre o mapa interativo (Leaflet),
 * a interface de busca (Choices.js) e o meu backend em Django.
 */

let map;
let camadaMunicipios = null; // Armazeno as camadas globalmente para facilitar a limpeza e atualização
let camadaUCs = null;
let choicesInstance = null;

document.addEventListener("DOMContentLoaded", function () {

    // Inicializo o mapa focado nas coordenadas do RJ com um zoom adequado para visão estadual
    map = L.map("map").setView([-22.9, -43.2], 7);

    // Optei por utilizar a camada de satélite da ESRI por oferecer melhor detalhamento 
    // das áreas de preservação ambiental
    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            attribution: "Tiles © Esri"
        }
    ).addTo(map);

    setTimeout(() => {
        map.invalidateSize();
        carregarMunicipios(); // Carrego a base municipal automaticamente
    }, 500);

    // Inicializo os componentes de interface
    carregarListaUCs();

    // Configuro os listeners dos botões de ação
    document.getElementById("btnPesquisar").addEventListener("click", pesquisarUC);
    document.getElementById("btnLimpar").addEventListener("click", limparMapa);
});


function carregarMunicipios() {
    /**
     * Consumo o endpoint GeoJSON que criei no Django.
     * Escolhi manter os municípios como uma camada fixa e discreta (apenas bordas amarelas)
     * para servir de referência espacial sem poluir o visual.
     */
    fetch("/municipios/geojson/")
        .then(res => res.json())
        .then(data => {
            if (camadaMunicipios) {
                map.removeLayer(camadaMunicipios);
            }

            camadaMunicipios = L.geoJSON(data, {
                style: {
                    color: "yellow",
                    weight: 1.2,
                    fillOpacity: 0 // Apenas o contorno para não sobrepor o satélite
                }
            }).addTo(map);

            // Ajusto o enquadramento do mapa para a extensão total dos dados carregados
            setTimeout(() => {
                map.fitBounds(camadaMunicipios.getBounds());
            }, 300);
        })
        .catch(err => console.error("Erro na requisição dos municípios:", err));
}


function carregarListaUCs() {
    /**
     * Para melhorar a experiência do usuário (UX), utilizei a biblioteca Choices.js.
     * Ela permite uma busca fluida em listas grandes, o que é ideal para o volume de UCs do estado.
     */
    fetch("/ucs/lista/")
        .then(res => res.json())
        .then(lista => {
            let select = document.getElementById("choices-select");

            choicesInstance = new Choices(select, {
                searchEnabled: true,
                removeItemButton: true,
                placeholderValue: "Selecione uma UC...",
                noResultsText: 'Nenhuma UC encontrada',
            });

            // Populo o componente com os dados retornados pela API
            lista.forEach(item => {
                choicesInstance.setChoices([
                    { value: item.nome_uc, label: item.nome_uc }
                ], "value", "label", false);
            });
        })
        .catch(err => console.error("Erro ao popular lista de UCs:", err));
}


function pesquisarUC() {
    // Recupero o valor selecionado através da API do Choices.js
    let nome = choicesInstance.getValue(true); 

    if (!nome) {
        alert("Por favor, selecione uma Unidade de Conservação.");
        return;
    }

    // Se já houver uma UC destacada, eu a removo antes de adicionar a nova
    if (camadaUCs) { map.removeLayer(camadaUCs); }
    fetch(`/ucs/geojson/?nome=${encodeURIComponent(nome)}`)
        .then(res => res.json())
        .then(data => {
            if (data.features.length === 0) {
                alert("Geometria não encontrada para esta unidade.");
                return;
            }

            // Estilizo a UC pesquisada com um verde esmeralda para destaque ambiental
            camadaUCs = L.geoJSON(data, {
                style: { color: "#2A9D8F", weight: 3, fillOpacity: 0.5 },
                onEachFeature: (feature, layer) => {
                    layer.bindPopup(`<b>${feature.properties.nome_uc}</b>`);
                    mostrarInfo(feature.properties); // Atualizo o painel lateral
                }
            }).addTo(map);

            // Faço o mapa "viajar" até a localização da UC encontrada
            map.fitBounds(camadaUCs.getBounds());
        })
        .catch(err => console.error("Erro na busca da UC:", err));
}

function mostrarInfo(props) {

    document.getElementById("tabela-info").innerHTML = `
        <div class="detalhe-uc">
            <h3>${props.nome_uc}</h3>
            
            <div class="info-item">
                <span class="info-label">Categoria</span>
                <span class="info-value">${props.categoria}</span>
            </div>

            <div class="info-item">
                <span class="info-label">Município</span>
                <span class="info-value">${props.municipio}</span>
            </div>
        </div>
    `;
}

function limparMapa() {
    // Limpo as camadas de destaque e volto o painel lateral ao estado inicial
    if (camadaUCs) {
        map.removeLayer(camadaUCs);
    }
    choicesInstance.removeActiveItems(); // Reseto o campo de busca

    document.getElementById("tabela-info").innerHTML = `
        <p class="nota-inicial">
            Pesquise uma Unidade de Conservação para destacá-la no mapa.
        </p>
    `;
}

// Garanto que o mapa se adapte corretamente caso o usuário redimensione a janela do navegador
window.addEventListener("resize", function () {
    if (map) {
        map.invalidateSize();
    }
});
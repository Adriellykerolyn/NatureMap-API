let map;
let camadaMunicipios = null; 
let camadaUCs = null;
let choicesInstance = null;

document.addEventListener("DOMContentLoaded", function () {
    map = L.map("map").setView([-22.9, -43.2], 7);

    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Tiles © Esri" }
    ).addTo(map);

    Promise.all([
        carregarMunicipios(),
        carregarListaUCs()
    ])
    .then(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                map.invalidateSize(); 
            }, 500);
        }
    })
    .catch(err => {
        console.error("Erro no carregamento inicial:", err);
        const loader = document.getElementById('loader');
        if (loader) {
            loader.innerHTML = `<p style="color: red; font-family: sans-serif;">Erro ao carregar dados geográficos. Por favor, atualize a página.</p>`;
        }
    });

    document.getElementById("btnPesquisar").addEventListener("click", pesquisarUC);
    document.getElementById("btnLimpar").addEventListener("click", limparMapa);
});


function carregarMunicipios() {
    return fetch("/municipios/geojson/")
        .then(res => res.json())
        .then(data => {
            if (camadaMunicipios) {
                map.removeLayer(camadaMunicipios);
            }
            camadaMunicipios = L.geoJSON(data, {
                style: {
                    color: "yellow",
                    weight: 1.2,
                    fillOpacity: 0 
                }
            }).addTo(map);
            if (camadaMunicipios.getBounds().isValid()) {
                map.fitBounds(camadaMunicipios.getBounds());
            }
        });
}


function carregarListaUCs() {
    return fetch("/ucs/lista/")
        .then(res => res.json())
        .then(lista => {
            let select = document.getElementById("choices-select");

            choicesInstance = new Choices(select, {
                searchEnabled: true,
                removeItemButton: true,
                placeholderValue: "🔍 Digite o nome de uma unidade...", 
                noResultsText: 'Nenhuma UC encontrada',
                shouldSort: false,
                itemSelectText: 'Clique para selecionar',
            });

            const formattedChoices = lista.map(item => ({
                value: item.nome_uc,
                label: item.nome_uc
            }));
            
            choicesInstance.setChoices(formattedChoices, "value", "label", true);
        });
}


function pesquisarUC() {
    let nome = choicesInstance.getValue(true); 

    if (!nome) {
        alert("Por favor, selecione uma Unidade de Conservação.");
        return;
    }
    if (camadaUCs) { map.removeLayer(camadaUCs); }

    fetch(`/ucs/geojson/?nome=${encodeURIComponent(nome)}`)
        .then(res => res.json())
        .then(data => {
            if (!data.features || data.features.length === 0) {
                alert("Geometria não encontrada para esta unidade.");
                return;
            }

            camadaUCs = L.geoJSON(data, {
                style: { 
                    color: "#1abc9c", 
                    weight: 3, 
                    fillOpacity: 0.5 
                },
                onEachFeature: (feature, layer) => {
                    layer.bindPopup(`<b>${feature.properties.nome_uc}</b>`);
                    mostrarInfo(feature.properties);
                }
            }).addTo(map);

            map.fitBounds(camadaUCs.getBounds(), { padding: [50, 50] });
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

    if (camadaUCs) {
        map.removeLayer(camadaUCs);
    }
    choicesInstance.removeActiveItems(); 

    document.getElementById("tabela-info").innerHTML = `
        <p class="nota-inicial">
            Pesquise uma Unidade de Conservação para destacá-la no mapa.
        </p>
    `;
    

    if (camadaMunicipios && camadaMunicipios.getBounds().isValid()) {
        map.fitBounds(camadaMunicipios.getBounds());
    }
}
window.addEventListener("resize", function () {
    if (map) {
        map.invalidateSize();
    }
});
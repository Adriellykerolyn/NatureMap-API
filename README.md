# 🌳 NatureMap_API

Sistema de geovisualização interativa das **Unidades de Conservação do Estado do Rio de Janeiro**, com integração entre backend geoespacial e frontend web.

O projeto permite explorar limites municipais e realizar pesquisas dinâmicas por áreas protegidas através de um mapa interativo.

---

## 🚀 Tecnologias Utilizadas

### Backend
* **Python**
* **Django**
* **Django REST Framework**

### Geoprocessamento
* **GeoPandas**
* **NumPy**
* **Shapely**

### Frontend
* **Leaflet.js**
* **Choices.js**
* **HTML + CSS + JavaScript**

### Dados Geográficos
* **GeoPackage (.gpkg)** — padrão OGC

---

## 🛠️ Funcionalidades

* **Visualização automática** dos limites municipais do RJ.
* **Pesquisa dinâmica** de Unidades de Conservação (UCs).
* **Exibição de detalhes** técnicos das áreas protegidas.
* **Integração** entre API geoespacial e mapa interativo.
* **Interface responsiva** para consulta rápida.

---
# 📂 Fontes de Dados (GeoPackage)

Os arquivos vetoriais utilizados neste projeto foram processados a partir de bases de dados oficiais:

* **IBGE (Instituto Brasileiro de Geografia e Estatística):** Malhas territoriais, limites municipais e divisões regionais.
* **SNUC (Sistema Nacional de Unidades de Conservação):** Delimitação e atributos das Unidades de Conservação (Federal, Estadual e Municipal).
---

## 📦 Como executar o projeto localmente

### 1. Clone o repositório

```
git clone [https://github.com/seu-usuario/NatureMap_API.git](https://github.com/seu-usuario/NatureMap_API.git)
cd NatureMap_API
```
## 2. Crie e ative um ambiente virtual
Windows (PowerShell):
```
python -m venv venv
.\venv\Scripts\Activate
```
Linux/Mac:
```
python3 -m venv venv
source venv/bin/activate
```
## 3. Instale as dependências corretamente
```
pip install -r requirements.txt
```
📌 Dependências principais: Django, djangorestframework, geopandas, numpy, shapely.

## 5. Execute o servidor Django
```
python manage.py runserver
```
## Acesse no navegador:
```
http://127.0.0.1:8000/
```
📁 Estrutura do Projeto
```
NatureMap_API/
│
├── api/                # Endpoints e lógica da API
├── data/               # Dados geográficos (.gpkg)
├── NatureMap_API       # Configurações globais do projeto (settings.py, urls.py)
├── static/             # CSS e JavaScript do frontend
└── manage.py           # Gerenciador do Django
```
👩‍💻 Desenvolvido por
Adrielly Souza Projeto acadêmico e profissional voltado para geotecnologia e desenvolvimento backend.

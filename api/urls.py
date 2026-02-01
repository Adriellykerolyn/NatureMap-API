from django.urls import path
from .views import (
    municipios, ucs, ucs_geojson,
    ucs_lista, uc_detalhe,
    home, mapa
)

urlpatterns = [
    # Página principal com mapa
    path("", mapa),

    # Home da API
    path("api/", home),

    # Rotas API
    path("municipios/", municipios),
    path("ucs/", ucs),
    path("ucs/geojson/", ucs_geojson),
    path("ucs/lista/", ucs_lista),
    path("ucs/<int:id>/", uc_detalhe),
]

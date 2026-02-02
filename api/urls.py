from django.urls import path
from .views import (
    municipios,
    municipios_geojson,
    ucs,
    ucs_lista,
    uc_detalhe,
    ucs_geojson,
    home,
    mapa
)

urlpatterns = [

    # Página principal (mapa)
    path("", mapa),

    # Home API
    path("api/", home),

    # Municípios
    path("municipios/", municipios),
    path("municipios/geojson/", municipios_geojson),

    # UCs
    path("ucs/", ucs),
    path("ucs/lista/", ucs_lista),
    path("ucs/<int:id>/", uc_detalhe),
    path("ucs/geojson/", ucs_geojson),
]

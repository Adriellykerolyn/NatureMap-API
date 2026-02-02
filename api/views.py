import os
import json
import numpy as np
import geopandas as gpd

from django.conf import settings
from django.shortcuts import render

from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def municipios(request):

    caminho = os.path.join(settings.BASE_DIR, "data", "municipios.gpkg")
    gdf = gpd.read_file(caminho)

    nome_busca = request.GET.get("nome")

    if nome_busca:
        gdf = gdf[gdf["NM_MUN"].str.contains(nome_busca, case=False)]

    lista = []

    for _, row in gdf.iterrows():
        lista.append({
            "codigo_ibge": row["CD_MUN"],
            "nome": row["NM_MUN"],
            "area_km2": float(row["AREA_KM2"])
        })

    return Response(lista)

@api_view(["GET"])
def municipios_geojson(request):

    caminho = os.path.join(settings.BASE_DIR, "data", "municipios.gpkg")
    gdf = gpd.read_file(caminho)

    gdf = gdf.to_crs(epsg=4326)

    gdf = gdf[["NM_MUN", "geometry"]]
    gdf = gdf.replace({np.nan: None})

    geojson_dict = json.loads(gdf.to_json())

    return Response(geojson_dict)


@api_view(["GET"])
def ucs(request):

    caminho = os.path.join(settings.BASE_DIR, "data", "ucs.gpkg")
    gdf = gpd.read_file(caminho)

    gdf = gdf.replace({np.nan: None})

    dados = gdf[["uc_id", "nome_uc", "categoria", "municipio"]].to_dict(
        orient="records"
    )

    return Response(dados)

@api_view(["GET"])
def ucs_lista(request):

    caminho = os.path.join(settings.BASE_DIR, "data", "ucs.gpkg")
    gdf = gpd.read_file(caminho)

    dados = gdf[["uc_id", "nome_uc"]].to_dict(
        orient="records"
    )

    return Response(dados)

@api_view(["GET"])
def uc_detalhe(request, id):

    caminho = os.path.join(settings.BASE_DIR, "data", "ucs.gpkg")
    gdf = gpd.read_file(caminho)

    uc = gdf[gdf["uc_id"] == id]

    if uc.empty:
        return Response({"erro": "UC não encontrada"}, status=404)

    dados = uc[["uc_id", "nome_uc", "categoria", "municipio"]].to_dict(
        orient="records"
    )[0]

    return Response(dados)


@api_view(["GET"])
def ucs_geojson(request):
    caminho = os.path.join(settings.BASE_DIR, "data", "ucs.gpkg")
    gdf = gpd.read_file(caminho)
    gdf = gdf.to_crs(epsg=4326)

    nome = request.GET.get("nome")

    if nome:
        gdf = gdf[gdf["nome_uc"].str.strip() == nome.strip()]

    if gdf.empty:
        return Response({"type": "FeatureCollection", "features": []})

    gdf = gdf[["nome_uc", "categoria", "municipio", "geometry"]]
    gdf = gdf.replace({np.nan: None})
    
    return Response(json.loads(gdf.to_json()))

@api_view(["GET"])
def home(request):
    return Response({
        "mensagem": "API NatureMap_API RJ funcionando 🚀",
        "rotas": [
            "/municipios/",
            "/municipios/geojson/",
            "/ucs/",
            "/ucs/lista/",
            "/ucs/geojson/",
            "/ucs/<id>/"
        ]
    })

def mapa(request):
    return render(request, "api/mapa.html")

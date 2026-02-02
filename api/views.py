import os
import json
import numpy as np
import geopandas as gpd

from django.conf import settings
from django.shortcuts import render

from rest_framework.decorators import api_view
from rest_framework.response import Response


def carregar_geodataframe(arquivo):
    caminho = os.path.join(settings.BASE_DIR, "Data", arquivo)
    gdf = gpd.read_file(caminho)
    
    if gdf.crs is None:
        gdf.set_crs(epsg=4674, inplace=True)
    
    return gdf.to_crs(epsg=4326)

@api_view(["GET"])
def municipios(request):
    gdf = carregar_geodataframe("municipios.gpkg")
    nome_busca = request.GET.get("nome")

    if nome_busca:
        gdf = gdf[gdf["NM_MUN"].str.contains(nome_busca, case=False)]

    lista = []
    for _, row in gdf.iterrows():
        lista.append({
            "codigo_ibge": row["CD_MUN"],
            "nome": row["NM_MUN"],
            "area_km2": float(row["AREA_KM2"]) if "AREA_KM2" in row else 0
        })

    return Response(lista)

@api_view(["GET"])
def municipios_geojson(request):
    gdf = carregar_geodataframe("municipios.gpkg")
    gdf = gdf[["NM_MUN", "geometry"]]
    gdf = gdf.replace({np.nan: None})

    return Response(json.loads(gdf.to_json()))

@api_view(["GET"])
def ucs(request):
    gdf = carregar_geodataframe("ucs.gpkg")
    gdf = gdf.replace({np.nan: None})

    dados = gdf[["uc_id", "nome_uc", "categoria", "municipio"]].to_dict(orient="records")
    return Response(dados)

@api_view(["GET"])
def ucs_lista(request):
    """
    Retorna a lista de UCs ordenada. 
    IDs em 'ids_destaque' aparecem primeiro para garantir que o usuário veja
    dados com boa qualidade cartográfica no início da lista.
    """
    gdf = carregar_geodataframe("ucs.gpkg")
    ids_destaque = [10, 25, 5] 
    gdf['prioridade'] = gdf['uc_id'].apply(lambda x: 0 if x in ids_destaque else 1)
    gdf = gdf.sort_values(by=['prioridade', 'nome_uc'])
    
    dados = gdf[["uc_id", "nome_uc"]].to_dict(orient="records")
    return Response(dados)

@api_view(["GET"])
def uc_detalhe(request, id):
    gdf = carregar_geodataframe("ucs.gpkg")
    uc = gdf[gdf["uc_id"] == id]

    if uc.empty:
        return Response({"erro": "UC não encontrada"}, status=404)

    dados = uc[["uc_id", "nome_uc", "categoria", "municipio"]].to_dict(orient="records")[0]
    return Response(dados)

@api_view(["GET"])
def ucs_geojson(request):
    gdf = carregar_geodataframe("ucs.gpkg")
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
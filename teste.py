import os
import json

def gerar_json_imagens(diretorio_base):
    dados = {}
    
    # Caminho absoluto do diretório de imagens
    caminho_imagens = os.path.join(diretorio_base, "imagens")
    
    if not os.path.exists(caminho_imagens):
        print(f"Diretório '{caminho_imagens}' não encontrado.")
        return
    
    # Percorrer as subpastas dentro de 'imagens'
    for pasta in os.listdir(caminho_imagens):
        caminho_pasta = os.path.join(caminho_imagens, pasta)
        
        if os.path.isdir(caminho_pasta):  # Verificar se é uma pasta
            imagens = [os.path.join(pasta, img) for img in os.listdir(caminho_pasta) if img.lower().endswith((".png", ".jpg", ".jpeg", ".gif"))]
            dados[pasta] = imagens
    
    # Guardar os dados num ficheiro JSON
    caminho_json = os.path.join(diretorio_base, "imagens.json")
    with open(caminho_json, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)
    
    print(f"Ficheiro JSON gerado em: {caminho_json}")

# Executar a função
if __name__ == "__main__":
    diretorio_projeto = os.path.dirname(os.path.abspath(__file__))
    gerar_json_imagens(diretorio_projeto)

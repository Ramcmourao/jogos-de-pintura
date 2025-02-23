const canvas = document.getElementById('tela');
const ctx = canvas.getContext('2d');

let corAtual = '#ff6b6b';

// Histórico de estados para o "Desfazer"
let history = [];

// Guarda o estado atual do canvas antes de cada preenchimento
function saveState() {
  const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  history.push(currentImageData);
}

// Restaura o último estado do canvas (Desfazer)
function restoreState() {
  if (history.length > 0) {
    const previousImageData = history.pop();
    ctx.putImageData(previousImageData, 0, 0);
  }
}

// Altera a cor atual e aplica o efeito de "zoom" no círculo clicado
function mudaCor(cor, e) {
  corAtual = cor;
  const cores = document.querySelectorAll('.cor');
  cores.forEach(c => c.style.transform = 'scale(1)');
  e.target.style.transform = 'scale(1.2)';
}

// Botões de ação
document.getElementById('undoBtn').addEventListener('click', restoreState);
document.getElementById('borrachaBtn').addEventListener('click', () => {
  corAtual = '#FFFFFF';
});

// Lê o parâmetro ?imagem=... da URL
function getParametro(nome) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nome);
}

// Carrega o JSON com as imagens e decide qual imagem desenhar
fetch('imagens.json')
  .then(response => response.json())
  .then(json => {
    const imagemParam = getParametro('imagem');
    
    if (!imagemParam) {
      const categorias = Object.keys(json);
      const catAleatoria = categorias[Math.floor(Math.random() * categorias.length)];
      const imagensCat = json[catAleatoria];
      const imgAleatoria = imagensCat[Math.floor(Math.random() * imagensCat.length)];
      carregaImagem('imagens/' + imgAleatoria);
    } else {
      carregaImagem('imagens/' + imagemParam);
    }
  })
  .catch(err => console.error('Erro a carregar JSON: ', err));

// Desenha a imagem no canvas
function carregaImagem(caminho) {
  const imagemFundo = new Image();
  imagemFundo.src = caminho;
  imagemFundo.onload = function() {
    // Desenha a imagem no canvas
    ctx.drawImage(imagemFundo, 0, 0, canvas.width, canvas.height);
    
    // Pega os dados da imagem desenhada
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    
    // Define um limite para considerar "preto"
    const blackThreshold = 50; // Ajuste conforme necessário
    
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      
      // Se estiver próximo de preto, força para preto puro
      if (r < blackThreshold && g < blackThreshold && b < blackThreshold) {
        data[i]     = 0;   // R
        data[i + 1] = 0;   // G
        data[i + 2] = 0;   // B
        data[i + 3] = 255; // A (opacidade total)
      }
    }
    
    // Aplica de volta no canvas
    ctx.putImageData(imageData, 0, 0);
  };
}


// Converte uma cor (nome ou hex) para RGBA
function getRGBA(cor) {
  let tempCanvas = document.createElement('canvas');
  tempCanvas.width = tempCanvas.height = 1;
  let tempCtx = tempCanvas.getContext('2d');
  tempCtx.fillStyle = cor;
  tempCtx.fillRect(0, 0, 1, 1);
  let data = tempCtx.getImageData(0, 0, 1, 1).data;
  return [data[0], data[1], data[2], data[3]];
}

// Implementação do Flood Fill (sem tolerância)
function floodFill(startX, startY, fillColor) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  const fillColorRGBA = getRGBA(fillColor);
  
  // Índice do pixel de partida no array de bytes
  const startIndex = (startY * width + startX) * 4;
  const startColor = [
    data[startIndex],
    data[startIndex + 1],
    data[startIndex + 2],
    data[startIndex + 3]
  ];

  // Se o pixel clicado for contorno (muito escuro), aborta
  if (startColor[0] < 50 && startColor[1] < 50 && startColor[2] < 50) {
    console.log("Clique no contorno detectado. Flood fill abortado para preservar o desenho.");
    return;
  }

  // Se a cor é a mesma, não faz nada
  if (
    startColor[0] === fillColorRGBA[0] &&
    startColor[1] === fillColorRGBA[1] &&
    startColor[2] === fillColorRGBA[2] &&
    startColor[3] === fillColorRGBA[3]
  ) {
    return;
  }

  // Array para marcar se um pixel já foi visitado
  const visited = new Array(width * height).fill(false);

  // Pilha para DFS (Depth-First Search)
  const stack = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    
    // Calcula índice no array data
    const idx = (y * width + x) * 4;

    // Verifica limites, se já visitado e se a cor bate com a original
    if (
      x >= 0 && x < width &&
      y >= 0 && y < height &&
      !visited[y * width + x] &&
      matchColor(data, idx, startColor) // Usa sua matchColor com tolerância
    ) {
      // Marca como visitado
      visited[y * width + x] = true;
      // Pinta o pixel
      colorPixel(data, idx, fillColorRGBA);

      // Empilha vizinhos (4-direções)
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }
  }

  // Atualiza o canvas com a imagem modificada
  ctx.putImageData(imageData, 0, 0);
}


  

// Verifica se o pixel possui a cor original (com tolerância)
function matchColor(data, index, color, tolerance = 200) {
  return (
    Math.abs(data[index]     - color[0]) <= tolerance &&
    Math.abs(data[index + 1] - color[1]) <= tolerance &&
    Math.abs(data[index + 2] - color[2]) <= tolerance &&
    Math.abs(data[index + 3] - color[3]) <= tolerance
  );
}


// Preenche um pixel com a cor definida
function colorPixel(data, index, color) {
  data[index]     = color[0];
  data[index + 1] = color[1];
  data[index + 2] = color[2];
  data[index + 3] = color[3];
}

// Evento de clique no canvas para aplicar o flood fill
canvas.addEventListener('click', function(e) {
  const rect = canvas.getBoundingClientRect();
  // Calcula o fator de escala
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  // Ajusta as coordenadas para a resolução interna do canvas
  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);

  saveState();
  floodFill(x, y, corAtual);
});


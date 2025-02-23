// Função para ler parâmetros da URL
function getParametro(nome) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nome);
  }
  
  const categoria = getParametro('categoria');
  
  fetch('imagens.json')
    .then(response => response.json())
    .then(data => {
      const imagensDaCategoria = data[categoria];
      if (!imagensDaCategoria) return;
  
      const divImagens = document.getElementById('imagens');
      imagensDaCategoria.forEach(caminhoImagem => {
        const img = document.createElement('img');
        img.src = 'imagens/' + caminhoImagem;
        img.className = 'imagem-thumb';
        img.alt = 'Desenho para colorir';
  
        img.onclick = function() {
          window.location.href = 'desenho.html?imagem=' + encodeURIComponent(caminhoImagem);
        };
        divImagens.appendChild(img);
      });
    })
    .catch(err => console.error(err));
  
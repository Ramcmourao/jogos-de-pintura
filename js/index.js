// Carrega o JSON com as imagens
fetch('imagens.json')
  .then(response => response.json())
  .then(data => {
    // data é um objeto onde as chaves são as categorias e o valor é um array de caminhos de imagens
    const listaCategorias = document.getElementById('lista-categorias');

    Object.keys(data).forEach(categoria => {
      const imagensDaCategoria = data[categoria];
      if (imagensDaCategoria.length === 0) return;

      // Escolhe uma imagem aleatória da categoria
      const randomIndex = Math.floor(Math.random() * imagensDaCategoria.length);
      const imagemAleatoria = imagensDaCategoria[randomIndex];

      // Cria um bloco para mostrar a categoria e a imagem
      const divCat = document.createElement('div');
      divCat.className = 'categoria';
      divCat.onclick = () => {
        // Ao clicar, vamos para a página escolha.html passando a categoria
        window.location.href = 'escolha.html?categoria=' + encodeURIComponent(categoria);
      };

      divCat.innerHTML = `
        <img src="imagens/${imagemAleatoria}" alt="${categoria}">
        <h3>✨ ${categoria} ✨</h3>
      `;
      listaCategorias.appendChild(divCat);
    });
  })
  .catch(err => console.error(err));

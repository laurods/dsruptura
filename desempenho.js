const main = () => {
    const elBtLogo = document.getElementById('btLogo');
    elBtLogo.addEventListener('click', () => {       
        buscarHistorico();
    });
}


  async function buscarHistorico() {
    try {
      // Monta a URL com ou sem o filtro de protocolo
      const url = `https://mariadb-api.rbpezf.easypanel.host/api/desempenho`;
      
      const response = await fetch(url);
      const dados = await response.json();
  
      console.log("Histórico carregado:", dados);
      // Aqui você chamaria a função para renderizar na sua lista <ul> ou <table>
      return dados;
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  }


  async function renderizarHistorico() {
    const lista = document.getElementById('lista-historico');
    
    try {
      const response = await fetch('https://mariadb-api.rbpezf.easypanel.host/api/desempenho');
      const dados = await response.json();
  
      if (dados.length === 0) {
        lista.innerHTML = '<li class="lista-feedback">Nenhum registro encontrado.</li>';
        return;
      }
  
      lista.innerHTML = dados.map(item => `
        <li class="lista-item">
          <div class="info-principal">
            <span class="item-protocolo">${item.protocolo}</span>
            <span class="item-tarefa">${item.tarefa}</span>
          </div>
          <div class="info-stats">
            <span class="item-itens">📦 ${item.itens} itens</span>
            <span class="item-ruptura">⚠️ ${item.ruptura} rupturas</span>
          </div>
        </li>
      `).join('');
  
    } catch (error) {
      lista.innerHTML = '<li class="lista-feedback text-red-400">Erro ao carregar dados.</li>';
    }
  }
  
  // Chamar ao carregar a página
  document.addEventListener('DOMContentLoaded', renderizarHistorico);
  // Chamar ao clicar no botão atualizar
  document.getElementById('btLogo').addEventListener('click', renderizarHistorico);
  
  

main();

// Inicializa a lista ao carregar a página
carregarTarefas();


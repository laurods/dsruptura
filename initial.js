const secContainer = document.getElementById('secao-conteiner');
const secHeader = document.getElementById('secao-header');
const elBarcode = document.getElementById('barcode');
const elMsg = document.getElementById('msg');
const elItemsContainer = document.getElementById('items');
const elDescription = document.getElementById('description');
const elTotalItens = document.getElementById('totalItens');
const elEmGondola = document.getElementById('emGondola');
const elemRuptura = document.getElementById('emRuptura');
secContainer.style.display = 'none';
secHeader.style.display = 'none';
let meuGraficoInstancia = null;



const main = () => {
    focusTxtBarcode();
    handleListItems();
    elBarcode.addEventListener('keyup', () => {
        handleTxtBarcode();
    });
    
    const elBtClear = document.getElementById('btClear');
    elBtClear.addEventListener('click', () => {
        if (confirm("Deseja realmente apagar todos os dados da conferência?")) {
            clearAllData();
        }
    });

    const elBtSave = document.getElementById('btSave');
    elBtSave.addEventListener('click', () => {
        if (confirm("A tarefa realizada será salva")) {
            saveData();
        }
    });

    const elBtLogo = document.getElementById('btLogo');
    elBtLogo.addEventListener('click', () => {       
        //buscarHistorico();
    });
}

const focusTxtBarcode = () => {
    elMsg.innerHTML = "";
    elBarcode.value = "";    
    elBarcode.focus();
}

const handleTxtBarcode = () => {
    const code = elBarcode.value.trim();

    if (code.length === 13) {        
            addItem(code);
            renderAll();
            focusTxtBarcode();
            filterProducts(); 
       
    } else {
        elMsg.innerHTML = 'Código de barras inválido (precisa de 13 dígitos).';
    }
    focusTxtBarcode();
}

// Centraliza a renderização para evitar repetição de código
const renderAll = () => {
    elItemsContainer.innerHTML = "";
}

const addItem = (data) => {
    const list = JSON.parse(localStorage.getItem('products')) || [];
    list.push(data);
    localStorage.setItem('products', JSON.stringify(list));
}

const handleListItems = (productsEmRuptura) => {
    if (productsEmRuptura && Array.isArray(productsEmRuptura)) {
        for (let i = 0; i < productsEmRuptura.length; i++){
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `<div class="description">${productsEmRuptura[i].descricao}</div>`;
            elItemsContainer.appendChild(itemDiv);
            
        }        
    }
     /*Pega o ultimo ean lido*/
   const list = JSON.parse(localStorage.getItem('products')) || [];   
    if ( list.length > 0) {
        elDescription.innerHTML =  list[ list.length - 1];
    }  
}


const filterProducts = () => {
    secContainer.style.display = 'block';
    try {
        const itens = JSON.parse(localStorage.getItem('dados')) || []; // itens da tarefa
        const list = JSON.parse(localStorage.getItem('products')) || []; // lista de itens bipados                    
        const itensEmGondolas = ([...list]) => { // compara os produtos do ABC de estoque com os produtos bipados na gondola
            return itens.filter(product => list.includes(product.ean))
        }

        const itensEmRuptura = ([...list]) => { // compara os produtos do ABC de estoque com os produtos bipados na gondola
            return itens.filter(product => !list.includes(product.ean))
        }
        const productsEmGondola = itensEmGondolas(list)
        const productsEmRuptura = itensEmRuptura(list)

        atualizarGrafico(productsEmRuptura.length, productsEmGondola.length)  

        elTotalItens.innerHTML=`<span>Estoque:</span> <span id='vlrItens'>${itens.length}</span> `
        elEmGondola.innerHTML=`<span>Expostos:</span> <span id='vlrGondola'>${productsEmGondola.length}</span>`
        elemRuptura.innerHTML=`<span>Ruptura:</span> <span id='vlrRuptura'>${((productsEmRuptura.length)/(itens.length))*100}%</span>`
        handleListItems(productsEmRuptura);
    } catch (error) {
        console.error('Error:', error);
    }
}


const gerarGrafico = (totalEstoque, totalBipado) => {
    const canvas = document.getElementById('meuGrafico');
    if (!canvas) return; // Segurança caso o elemento não exista

    const ctx = canvas.getContext('2d')

    // Agora o JS já "conhece" a variável, mesmo que seja null
    if (meuGraficoInstancia) {
        meuGraficoInstancia.destroy();
    }

    meuGraficoInstancia = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ruptura', 'Expostos'],
            datasets: [{
                data: [totalEstoque, totalBipado ],
                backgroundColor: ['#dc3545', '#28a745']
            }]
        }
    });
}

const atualizarGrafico = (totalEstoque, totalBipado) => {
    const canvas = document.getElementById('meuGrafico');
    if (!canvas) return; // Segurança caso o elemento não exista

    const ctx = canvas.getContext('2d')

    if (meuGraficoInstancia) {
        // Atualiza apenas os valores no array de dados
        meuGraficoInstancia.data.datasets[0].data = [totalEstoque, totalBipado];
        // Re-renderiza a animação
        meuGraficoInstancia.update();
    } else {
        // Se for a primeira vez, cria o gráfico normalmente
        gerarGrafico(totalEstoque, totalBipado);
    }
}

const clearAllData = () => {
    // 1. Limpa o LocalStorage
    localStorage.removeItem('products');
    localStorage.removeItem('dados');

    // 2. Limpa a lista na tela e as mensagens
    document.getElementById('items').innerHTML = "";
    document.getElementById('msg').innerHTML = "Conferência reiniciada.";
    document.getElementById('description').innerHTML = "";

    // 3. Destrói o gráfico se ele existir
    if (meuGraficoInstancia) {
        meuGraficoInstancia.destroy();
        meuGraficoInstancia = null;
    }

    secContainer.style.display = 'none';
    secHeader.style.display = 'none';
    document.getElementById('secao-tarefas').style.display = 'block';

    // 4. Volta o foco para o campo de barcode
    focusTxtBarcode();
    // 5. Gera novo grafico com valores zerados
    gerarGrafico(0, 0)
}

const saveData = () => {
    let txtTarefa = document.getElementById('txtTarefa').innerHTML;
    let txtProtocolo = document.getElementById('txtProtocolo').innerHTML;
    let txtItens = document.getElementById('vlrItens').innerHTML;
    let txtExpostos = document.getElementById('vlrGondola').innerHTML;
    let txtRuptura = document.getElementById('vlrRuptura').innerHTML;

    let objData = {
        tarefa: txtTarefa,
        protocolo: txtProtocolo,
        itens: txtItens,
        exposto: txtExpostos,
        ruptura: txtRuptura
    }

    salvarDesempenho(objData)
    console.log(objData);

}
// 1. Função para buscar e exibir a lista de tarefas
const carregarTarefas = async () => {
    try {
        const response = await fetch('https://mariadb-api.rbpezf.easypanel.host/api/tarefas');
        const dados = await response.json();
               
       
        const ul = document.getElementById('lista-tarefas');        
        
        ul.innerHTML = ""; // Limpa a lista
        
        dados.protocolo.forEach((item, index) => {
            const codProtocolo = item.protocolo;
            const nomeTarefa = dados.tarefa[index].tarefa;

            const li = document.createElement('li')
            li.classList.add('lista-item');
            li.innerHTML = nomeTarefa.toUpperCase();
            li.style.cursor = "pointer";
            
            // Evento de clique para buscar produtos
            li.onclick = (e) => {
                e.preventDefault();
                buscarProdutosDaTarefa(codProtocolo, nomeTarefa);
            };
            
            ul.appendChild(li);
        });
        
    } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
    }
};

// 2. Função para buscar os produtos da tarefa clicada
const buscarProdutosDaTarefa = async (codProtocolo, nomeTarefa) => {
    try {
        const response = await fetch(`https://mariadb-api.rbpezf.easypanel.host/api/tarefas/${codProtocolo}/produtos`);
        const produtos = await response.json();
        localStorage.setItem('dados', JSON.stringify(produtos));
        document.getElementById('secao-tarefas').style.display = 'none';
        secHeader.style.display = 'block'; 
        console.log('produtos', produtos)
        
        document.getElementById('titulo-produtos').innerHTML = `<p>Tarefa: <span id='txtTarefa'>${nomeTarefa.toUpperCase()}</span></p>`;
        document.getElementById('protocolo-tarefa').innerHTML = `<p>Protocolo: <span id='txtProtocolo'>${codProtocolo}</span></p>`;
        const container = document.getElementById('container-produtos');
        container.innerHTML = "";

        if (produtos.length === 0) {
            container.innerHTML = "<p>Nenhum produto encontrado para esta tarefa.</p>";
            return;
        }

    } catch (error) {
        alert("Erro ao carregar produtos desta tarefa.");
    }
};

async function salvarDesempenho(dados) {
    try {
      const response = await fetch('https://mariadb-api.rbpezf.easypanel.host/api/desempenho', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados) // Envia o objeto formatado
      });
  
      const resultado = await response.json();
      console.log(resultado.mensagem);
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  }


main();

// Inicializa a lista ao carregar a página
carregarTarefas();


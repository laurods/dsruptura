import { itens } from './listaItensEstoque.js'; 

const elBarcode = document.getElementById('barcode');
const elMsg = document.getElementById('msg');
const elItemsContainer = document.getElementById('items');
const elDescription = document.getElementById('description');
const elTotalItens = document.getElementById('totalItens');
const elEmGondola = document.getElementById('emGondola');
const elemRuptura = document.getElementById('emRuptura');
const elBtPrint = document.getElementById('btPrint');
let meuGraficoInstancia = null;



const main = () => {
    focusTxtBarcode();
    handleListItems();
    elBarcode.addEventListener('keyup', () => {
        handleTxtBarcode();
    });
    elBtPrint.addEventListener('click', () => {
        filterProducts();
    });
    
    const elBtClear = document.getElementById('btClear');
    elBtClear.addEventListener('click', () => {
        if (confirm("Deseja realmente apagar todos os dados da conferência?")) {
            clearAllData();
        }
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
    try {
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

        elTotalItens.innerHTML=`<span>Estoque:</span> ${itens.length}`
        elEmGondola.innerHTML=`<span>Expostos:</span> ${productsEmGondola.length}`
        elemRuptura.innerHTML=`<span>Ruptura:</span> ${productsEmRuptura.length}`
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

    // 2. Limpa a lista na tela e as mensagens
    document.getElementById('items').innerHTML = "";
    document.getElementById('msg').innerHTML = "Conferência reiniciada.";
    document.getElementById('description').innerHTML = "";

    // 3. Destrói o gráfico se ele existir
    if (meuGraficoInstancia) {
        meuGraficoInstancia.destroy();
        meuGraficoInstancia = null;
    }

    // 4. Volta o foco para o campo de barcode
    focusTxtBarcode();
    // 5. Gera novo grafico com valores zerados
    gerarGrafico(0, 0)
}
// 1. Função para buscar e exibir a lista de tarefas
const carregarTarefas = async () => {
    try {
        const response = await fetch('https://sua-api.easypanel.host/api/tarefas');
        const tarefas = await response.json();
        const ul = document.getElementById('lista-tarefas');
        
        ul.innerHTML = ""; // Limpa a lista

        tarefas.forEach(t => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            
            link.href = "#";
            link.textContent = t.tarefa;
            link.style.cursor = "pointer";
            link.style.color = "blue";
            
            // Evento de clique para buscar produtos
            link.onclick = (e) => {
                e.preventDefault();
                buscarProdutosDaTarefa(t.tarefa);
            };

            li.appendChild(link);
            ul.appendChild(li);
        });
    } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
    }
};

// 2. Função para buscar os produtos da tarefa clicada
const buscarProdutosDaTarefa = async (nomeTarefa) => {
    try {
        const response = await fetch(`https://sua-api.easypanel.host/api/tarefas/${nomeTarefa}/produtos`);
        const produtos = await response.json();
        
        document.getElementById('titulo-produtos').textContent = `Produtos da Tarefa: ${nomeTarefa}`;
        const container = document.getElementById('container-produtos');
        container.innerHTML = "";

        if (produtos.length === 0) {
            container.innerHTML = "<p>Nenhum produto encontrado para esta tarefa.</p>";
            return;
        }

        // Exibe os produtos em uma lista simples
        produtos.forEach(p => {
            const div = document.createElement('div');
            div.className = 'item-produto';
            div.innerHTML = `<strong>${p.ean}</strong> - ${p.descricao} (${p.categoria})`;
            container.appendChild(div);
        });
        
    } catch (error) {
        alert("Erro ao carregar produtos desta tarefa.");
    }
};

main();

// Inicializa a lista ao carregar a página
//carregarTarefas();


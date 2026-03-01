const divContent = document.getElementById('content');
const divDonutChart = document.getElementById('donut-chart');
const divBolinha = document.getElementById('bolinha');
const sectionTaskList = document.getElementById('task-section');
const sectionBarcode = document.getElementById('barcode-section');
const sectionTaskCard = document.getElementById('task-card');
const btIniciarColeta = document.getElementById('btIniciarColeta');
const btExcluir = document.getElementById('btExcluir');
const inputBarcode = document.getElementById('barcode');
const spanEstoque = document.getElementById('estoque');
const spanExpostos = document.getElementById('expostos');
const spanRuptura = document.getElementById('ruptura');
const spanPercentagem = document.getElementById('percentage');
const pMsg = document.getElementById('msg');
divContent.style.display = 'none';
sectionBarcode.style.display = 'none';
sectionTaskCard.style.display = 'none';
btIniciarColeta.addEventListener('click', () => {
    inputBarcode.focus();    
    divBolinha.classList.add("piscando");
    btIniciarColeta.innerHTML = "TAREFA INICIADA"
});

btExcluir.addEventListener('click', () => {
    clearAllData();
});

/*Se usuario fechar a tela ja tiver iniciado a tarefa */
document.addEventListener("DOMContentLoaded", function() {
    const list = JSON.parse(localStorage.getItem('products')) || [];
    if(list.length > 0) {
        inputBarcode.focus();
        filterProducts();
    }
    console.log("O DOM está pronto!");
    // Seu código aqui
});


/*Pega o codigo de barras bipado*/
document.getElementById('barcodeForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o reload da página
    pMsg.innerHTML = "";
    const code = document.getElementById('barcode').value.trim();      

        if (code.length === 13) {        
                addItem(code);
                this.reset();
                inputBarcode.focus();
                filterProducts(); 
        
        } else {
            pMsg.innerHTML = `${code} | Código de barras inválido.`
            this.reset();
            inputBarcode.focus();
        }          
    
});
const clearAllData = () => {
    // 1. Limpa o LocalStorage
    localStorage.removeItem('products');
    localStorage.removeItem('dados');
    sectionBarcode.style.display = 'none';
    divContent.style.display = 'none';
    sectionTaskList.style.display = 'block';
}

const addItem = (data) => {
    const list = JSON.parse(localStorage.getItem('products')) || [];
    list.push(data);
    localStorage.setItem('products', JSON.stringify(list));
}

const filterProducts = () => {    
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

        spanEstoque.innerHTML= itens.length;
        spanExpostos.innerHTML= productsEmGondola.length;
        spanRuptura.innerHTML=`${(((productsEmRuptura.length)/(itens.length))*100).toFixed(0)}%`;
        spanPercentagem.innerHTML = `${(((productsEmRuptura.length)/(itens.length))*100).toFixed(0)}%`;
        let percRuptura = (((productsEmRuptura.length)/(itens.length))*100).toFixed(0);
        let percExpostos = (100 - percRuptura );
        divDonutChart.style.background = `conic-gradient( #f43f5e 0% ${percRuptura}% , #10b981 ${percExpostos}% 100%)`
        sectionBarcode.style.display = 'block';
        divContent.style.display = 'block';
        sectionTaskList.style.display = 'none';
        //handleListItems(productsEmRuptura);
    } catch (error) {
        console.error('Error:', error);
    }
    
}


const main = () => {
    /*
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
    */
}

/*
const focusTxtBarcode = () => {
    elMsg.innerHTML = "";
    elBarcode.value = "";    
    elBarcode.focus();
}
*/



const handleListItems = (productsEmRuptura) => {
    /*
    if (productsEmRuptura && Array.isArray(productsEmRuptura)) {
        for (let i = 0; i < productsEmRuptura.length; i++){
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `<div class="description">${productsEmRuptura[i].descricao}</div>`;
            elItemsContainer.appendChild(itemDiv);
            
        }        
    }
        */
     /*Pega o ultimo ean lido*/
     /*
   const list = JSON.parse(localStorage.getItem('products')) || [];   
    if ( list.length > 0) {
        elDescription.innerHTML =  list[ list.length - 1];
    }
  */    
}

/*




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
    */
// 1. Função para buscar e exibir a lista de tarefas
const carregarTarefas = async () => {
    try {
        const response = await fetch('https://mariadb-api.rbpezf.easypanel.host/api/tarefas');
        const dados = await response.json();
        const div = document.getElementById('task-info');        
        
        div.innerHTML = ""; // Limpa a lista
        dados.protocolo.forEach((item, index) => {
            const codProtocolo = item.protocolo;
            const nomeTarefa = dados.tarefa[index].tarefa;

            const bt = document.createElement('button')
            bt.classList.add('btn_task');
            bt.innerHTML = nomeTarefa.toUpperCase();
            
            // Evento de clique para buscar produtos
            bt.onclick = (e) => {
                e.preventDefault();
                buscarProdutosDaTarefa(codProtocolo, nomeTarefa);
            };
            
            div.appendChild(bt);
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
        document.getElementById('task-section').style.display = 'none';
        
        sectionTaskCard.style.display = 'block'; 
        sectionBarcode.style.display = 'block'; 
        console.log('produtos', produtos)
        
        document.getElementById('nomeTarefa').innerHTML = `Tarefa: ${nomeTarefa.toUpperCase()}</span>`;
        document.getElementById('protocoloTarefa').innerHTML = `Numero: ${codProtocolo}`;
        
        if (produtos.length === 0) {
            document.getElementById('protocoloTarefa').innerHTML = `Nenhum produto encontrado para esta tarefa.`;            
            return;
        }
           

    } catch (error) {
        alert("Erro ao carregar produtos desta tarefa.");
    }
};
/*
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

*/
//main();

// Inicializa a lista ao carregar a página
carregarTarefas();


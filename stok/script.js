const divTaskCode = document.getElementById('taskCode');
const divContent = document.getElementById('content');
const divDonutChart = document.getElementById('donut-chart');
const divItemRuptura = document.getElementById('item-ruptura');
const header = document.getElementById('header');
const secBarcodeInput = document.getElementById('secBarcodeInput');
const secListRuptura = document.getElementById('list-ruptura');
const inputBarcode = document.getElementById('barcodeInput');
const btTaskSearch = document.getElementById('btTaskSearch');
const btTaskSave = document.getElementById('bt-save-task');
const pMsg = document.getElementById('msg');
const pTxtScan = document.getElementById('txtScan');
const spanEstoque = document.getElementById('estoque');
const spanExpostos = document.getElementById('expostos');
const spanRuptura = document.getElementById('ruptura');
const spanPercentagem = document.getElementById('percentage');
const spanQuantRuptura = document.getElementById('qtd-ruptura');
pTxtScan.innerHTML = 'Leia o codigo'
btTaskSearch.addEventListener('click', () => {
    buscarProdutosDaTarefa('89090240')
});

btTaskSave.addEventListener('click', () => {
    saveTask();
});

document.body.addEventListener('click', () => {
    setTimeout(() => inputBarcode.focus(), 500);
});
const list = [];

const App = {
    // 1. Onde os dados moram na memória (RAM)
    productsABC:[],
    productsBipados: new Set(), // Usar Set evita duplicatas e é muito mais rápido
    productsRuptura:[],
    productsGondola:[], // produto em gondola é diferente de produtos bipados. Bipados pode ser qualquer codigo bipado.
    // 3. Salva qualquer alteração
    persistirBipados(codigo) {
        // Converte o Set em Array para salvar no localStorage
    const listaParaSalvar = Array.from(this.productsBipados);
    localStorage.setItem('estoque_bipados', JSON.stringify(listaParaSalvar));
    },
    // 4. Exemplo de método para atualizar algo
    filtrar() {
       
        // Agora a comparação é instantânea
        this.productsGondola = this.productsABC.filter(p => this.productsBipados.has(p.ean));
        this.productsRuptura = this.productsABC.filter(p => !this.productsBipados.has(p.ean));
        
    },
    resetTotal() {
        // 1. Limpa a Memória RAM (Propriedades do objeto)
        this.productsABC = [];
        this.productsBipados = new Set(); // Ou [] se não mudou para Set
        this.productsRuptura = [];
        this.productsGondola = [];
        // 2. Limpa o LocalStorage (Chaves específicas do seu app)
        localStorage.removeItem('estoque_ABC');
        localStorage.removeItem('estoque_bipados');

        // 3. Reseta a Interface (UI)
        document.getElementById('taskCodeInput').value = '';
        document.getElementById('protocoloTarefa').innerHTML = '';
        divItemRuptura.innerHTML = '';
        divContent.style.display = 'none';
        secBarcodeInput.style.display = 'none';
        secListRuptura.style.display = 'none';
        
        // 4. Volta para a tela inicial
        header.style.display = 'block';
        divTaskCode.style.display = 'block';
        
        console.log("Sistema resetado para nova tarefa.");
    }

} 


document.getElementById('barcodeInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const codigo = event.target.value.trim();
        //const codigo = event.target.value;
        
        if (codigo.length === 13) {
            //App.persistirBipados(codigo);
            App.productsBipados.add(codigo);
            //App.productsBipados.push(codigo);
            App.filtrar();
            
             //processarLeitura(codigo);
            handleChart();
            handleListItems();
            // Limpa para a próxima leitura
            pMsg.innerHTML = `Lido: ${codigo}.`
            event.target.value = '';
        }
    }
});

// 1. Função para buscar os produtos da tarefa com base no protocolo
const buscarProdutosDaTarefa = async (codProtocolo) => {
    
    try {
        const response = await fetch(`https://mariadb-api.rbpezf.easypanel.host/api/tarefas/${codProtocolo}/produtos`);        
        const produtos = await response.json();
        console.log('produtos', produtos)
        App.productsABC = produtos // Persiste na ram
        localStorage.setItem('estoque_ABC', JSON.stringify(produtos)); // Persiste no localhost

        document.getElementById('protocoloTarefa').innerHTML = `Numero: ${codProtocolo}`;
        
        if (produtos.length === 0) {
            document.getElementById('protocoloTarefa').innerHTML = `Nenhum produto encontrado para esta tarefa.`;            
            return;
        }
           

    } catch (error) {
        console.log("Erro ao carregar produtos desta tarefa.");
    }
    header.style.display = 'none';    
    divTaskCode.style.display = 'none';
    secBarcodeInput.style.display = 'block';
    inputBarcode.style.display = 'block';   
    inputBarcode.focus();
};


const handleChart = () => {
    divContent.style.display = 'block';
    spanEstoque.innerHTML= App.productsABC.length;
    spanExpostos.innerHTML= App.productsGondola.length;
    spanRuptura.innerHTML=`${(((App.productsRuptura.length)/(App.productsABC.length))*100).toFixed(0)}%`;
    spanPercentagem.innerHTML = `${(((App.productsRuptura.length)/(App.productsABC.length))*100).toFixed(0)}%`;
    let percRuptura = (((App.productsRuptura.length)/(App.productsABC.length))*100).toFixed(0);
    let percExpostos = (100 - percRuptura );
    divDonutChart.style.background = `conic-gradient( #f43f5e 0% ${percRuptura}% , #10b981 ${percExpostos}% 100%)`
    
}

const handleListItems = () => {
    // 1. Limpa a lista anterior para não duplicar itens na tela
    divItemRuptura.innerHTML = ''; 
    
    // 2. Usa uma string única para atualizar o HTML de uma vez só (mais rápido)
    const htmlLote = App.productsRuptura.map(prod => `
        <div class="product-item">
            <h4>${prod.descricao}</h4>
        </div>
    `).join('');
    
    divItemRuptura.innerHTML = htmlLote;
    spanQuantRuptura.innerHTML = App.productsRuptura.length;
    secListRuptura.style.display = 'block';
}


async function saveTask() {
    let descricaoProducts = App.productsRuptura.map(product => product.descricao);
    const dados = {
        tarefa: 'HAVAIANAS',
        protocolo: '89090',
        itens: document.getElementById('estoque').innerHTML,
        exposto: document.getElementById('expostos').innerHTML,
        ruptura: document.getElementById('ruptura').innerHTML,
        eans:`${descricaoProducts}`
        
    }    
   
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
      enviarWhatsApp(dados); 
    } catch (error) {
      console.error("Erro na requisição:", error);
    }

    
  }
  async function enviarWhatsApp(dados) {
    const instanciaCorreta = "lauro_de_sa"; 
    const urlBase = "https://mariadb-evolution-api.rbpezf.easypanel.host";

    // Remova qualquer caractere especial e garanta que seja uma string
    const payload = {
        "number": "555499572366",
        "text": `*RELATÓRIO DS RUPTURA*\n\n` +
                `*Tarefa:* ${dados.tarefa}\n` +
                `*Protocolo:* ${dados.protocolo}\n` +
                `*Itens:* ${dados.itens}\n` +
                `*Exposto:* ${dados.exposto}\n` +
                `*Ruptura:* ${dados.ruptura}`
    };

    try {
        const response = await fetch(`${urlBase}/message/sendText/${instanciaCorreta}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': '429683C4C977415CAAFCCE10F7D57E11' // Use a chave definida no Easypanel
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorDetail = await response.json();
            console.error("Detalhes do erro 400:", errorDetail);
            alert("Erro 400: Verifique o console para detalhes da Evolution API.");
        } else {
            console.log("Mensagem enviada com sucesso!");
            App.resetTotal();

        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}

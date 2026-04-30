const divTaskCode = document.getElementById('taskCode');
const divContent = document.getElementById('content');
const divDonutChart = document.getElementById('donut-chart');
const header = document.getElementById('header');
const secBarcodeInput = document.getElementById('secBarcodeInput');
const inputBarcode = document.getElementById('barcodeInput');
const btTaskSearch = document.getElementById('btTaskSearch');
const pMsg = document.getElementById('msg');
const pTxtScan = document.getElementById('txtScan');
const spanEstoque = document.getElementById('estoque');
const spanExpostos = document.getElementById('expostos');
const spanRuptura = document.getElementById('ruptura');
const spanPercentagem = document.getElementById('percentage');
pTxtScan.innerHTML = 'Leia o codigo'
btTaskSearch.addEventListener('click', () => {
    buscarProdutosDaTarefa('89090240')
});

document.body.addEventListener('click', () => {
    setTimeout(() => inputBarcode.focus(), 500);
});
const list = [];

const App = {
    // 1. Onde os dados moram na memória (RAM)
    productsABC:[],
    productsBipados:[],
    productsRuptura:[],
    productsGondola:[], // produto em gondola é diferente de produtos bipados. Bipados pode ser qualquer codigo bipado.
    // 3. Salva qualquer alteração
    persistirBipados(codigo) {
        localStorage.setItem('estoque_bipados', JSON.stringify(codigo));
    },
    // 4. Exemplo de método para atualizar algo
    filtrar() {
        let itensEmGondolas = ([...productsBipados]) => { // compara os produtos do ABC de estoque com os produtos bipados na gondola
            return this.productsABC.filter(product => productsBipados.includes(product.ean))
        }
        let itensEmRuptura = ([...productsBipados]) => { // compara os produtos do ABC de estoque com os produtos bipados na gondola
            return this.productsABC.filter(product => !productsBipados.includes(product.ean))
        }
        const productsEmRuptura = itensEmRuptura(this.productsBipados)
        const productsEmGondola = itensEmGondolas(this.productsBipados)
        this.productsRuptura = productsEmRuptura;
        this.productsGondola = productsEmGondola;
        
    }

}    


/*
document.getElementById('barcodeForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o reload da página
    pMsg.innerHTML = "";
    const code = document.getElementById('barcode').value.trim();      

        if (code.length === 13) {
                pMsg.innerHTML = `${code} | Último Código lido.`
                       
                addItem(code);
                this.reset();
                inputBarcode.focus();
                hLastProduct.innerHTML = code;
                filterProducts();
             
        
        } else {
            pMsg.innerHTML = `${code} | Código de barras inválido.`
            this.reset();
            inputBarcode.focus();
        }          
    
});
*/


document.getElementById('barcodeInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const codigo = event.target.value;
        
        if (codigo.length === 13) {
            App.persistirBipados(codigo);
            App.productsBipados.push(codigo);
            App.filtrar();
            //list.push(data);
            //filterProducts(list)
            pMsg.innerHTML = `${codigo} | Último Código lido.`
            handleChart();
            //processarLeitura(codigo);
            
            // Limpa para a próxima leitura
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
        
        //document.getElementById('nomeTarefa').innerHTML = `Tarefa: ${nomeTarefa.toUpperCase()}</span>`;
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

const filterProducts = () => {    
    try {
        /*
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
        handleListItems(productsEmRuptura);
        */
    } catch (error) {
        console.error('Error:', error);
    }
    
}

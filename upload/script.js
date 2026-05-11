const inputTarefa = document.getElementById('tarefa');
const inputFile = document.getElementById('csvFile');
const spanArquivo = document.getElementById('file-name');
const btnUpload = document.getElementById('btn-upload');

// Atualiza o nome do arquivo na tela ao selecionar
inputFile.addEventListener('change', (e) => {
  const name = e.target.files[0]?.name || "Selecione o arquivo CSV";
  spanArquivo.innerText = name;
});

// Função de Upload
btnUpload.addEventListener('click', async () => {
  const tarefa = inputTarefa.value;
  const file = inputFile.files[0];

  if (!tarefa || !file) {
    alert("Por favor, preencha a tarefa e selecione um arquivo!");
    return;
  }


  const formData = new FormData();
  formData.append('csvFile', file);
  formData.append('tarefa', tarefa);
  try {
    const response = await fetch('https://mariadb-api.rbpezf.easypanel.host/api/upload-csv', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      alert("Sucesso! Tarefa enviada.");
      inputTarefa.value = "";
      inputFile.value = "";
    } else {
      alert("Erro no servidor.");
    }
  } catch (error) {
    alert("Erro ao conectar com a API.");
  } finally {
    
  }


});

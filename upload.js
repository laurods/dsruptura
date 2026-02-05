const enviarTarefaECSV = async () => {
    const nomeInput = document.getElementById('inputNomeTarefa').value;
    const fileInput = document.getElementById('inputCSV');
    
    if (!nomeInput || !fileInput.files[0]) {
        alert("Preencha o nome da tarefa e selecione um arquivo.");
        return;
    }

    const formData = new FormData();
    formData.append('nomeTarefa', nomeInput); // Campo de texto
    formData.append('arquivo', fileInput.files[0]); // Campo do arquivo

    try {
        const response = await fetch('https://sua-api.easypanel.host/api/upload-csv', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error("Erro no upload:", error);
    }
};
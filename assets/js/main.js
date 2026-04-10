document.addEventListener('DOMContentLoaded', function() {
    console.log('Projeto IFC carregado com sucesso!');
    
    initProject();
});

function initProject() {
    console.log('Inicializando projeto...');
    
    const container = document.querySelector('.container');
    if (container) {
        container.addEventListener('click', function() {
            alert('Projeto funcionando!');
        });
    }
}


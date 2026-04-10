// Arquivo principal JavaScript do Frontend
document.addEventListener('DOMContentLoaded', function() {
    console.log('Frontend Projeto IFC carregado com sucesso!');
    initFrontend();
});
function initFrontend() {
    const container = document.querySelector('.container');
    if (container) {
        container.addEventListener('click', function() {
            alert('Frontend funcionando!');
        });
    }
}

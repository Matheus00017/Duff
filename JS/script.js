function abrirAlert() {
    let opcao = document.getElementById("opcoes").value;

    if(opcao === "fornecedores") {
        alert("Você selecionou: cadastro de Fornecedores");
    }else if (opcao === "empresas") {
        alert("Você selecionou: Cadastro de Empresa");
    }
}
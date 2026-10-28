
//
// FASE 1: Modelagem dos dados (Classe Base)
//

class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    // Calcula o subtotal do produto
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: Gerenciamento de Estado (Memória)
//

const listaDeProdutos = [];
const CHAVE_STORAGE = "sistema_estoque_produtos";

// null = modo cadastro
// número = índice do produto em edição
let indiceEdicao = null;

//
// FASE 2.1: Persistência com localStorage
//

function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (!dadosSalvos) {
        return;
    }

    try {
        const produtosObjetos = JSON.parse(dadosSalvos);

        if (!Array.isArray(produtosObjetos)) {
            throw new Error("Os dados salvos não são uma lista.");
        }

        produtosObjetos.forEach(function (prod) {
            if (
                prod &&
                typeof prod.nome === "string" &&
                prod.nome.trim() !== "" &&
                Number.isFinite(Number(prod.preco)) &&
                Number(prod.preco) > 0 &&
                Number.isSafeInteger(Number(prod.quantidade)) &&
                Number(prod.quantidade) > 0
            ) {
                const produtoInstanciado = new Produto(
                    prod.nome.trim(),
                    prod.preco,
                    prod.quantidade
                );

                listaDeProdutos.push(produtoInstanciado);
            }
        });
    } catch (erro) {
        console.error("Erro ao carregar os produtos:", erro);
        alert("Não foi possível carregar os produtos salvos.");
    }
}

//
// FASE 3: Captura de Elementos do DOM
//

const formProduto = document.getElementById("produto-form");

const btnLimparTudo = document.getElementById("limpar-tabela");
const btnCancelarEdicao = document.getElementById("cancelar-edicao");

const totalEstoqueEl = document.getElementById("total-estoque");

const nomeInput = document.getElementById("nome");
const precoInput = document.getElementById("preco");
const quantidadeInput = document.getElementById("quantidade");

const btnSalvar = document.getElementById("btn-salvar");

//
// FASE 4: Cadastro e edição de produtos
//

formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    // Captura os dados do formulário
    const nome = nomeInput.value.trim();
    const preco = parseFloat(precoInput.value);
    const quantidade = Number(quantidadeInput.value);

    // Validação do nome
    if (!nome) {
        alert("Por favor, informe um nome válido para o produto.");
        nomeInput.focus();
        return;
    }

    // Validação do preço
    if (!Number.isFinite(preco) || preco <= 0) {
        alert("O preço deve ser um valor numérico maior que zero.");
        precoInput.focus();
        return;
    }

    // Validação da quantidade
    if (
        !Number.isSafeInteger(quantidade) ||
        quantidade <= 0
    ) {
        alert("A quantidade deve ser um número inteiro maior que zero.");
        quantidadeInput.focus();
        return;
    }

    // Cria o produto após validar os dados
    const novoProduto = new Produto(nome, preco, quantidade);

    if (indiceEdicao === null) {
        // CREATE: adiciona um novo produto
        listaDeProdutos.push(novoProduto);

        alert("Produto cadastrado com sucesso!");
    } else {
        // UPDATE: atualiza o produto existente
        listaDeProdutos[indiceEdicao] = novoProduto;

        alert("Produto atualizado com sucesso!");
    }

    // Salva os dados e atualiza a interface
    salvarNoLocalStorage();
    atualizarInterface();

    // Volta ao modo cadastro
    cancelarEdicao();
});

//
// FASE 5: Preparar edição de um produto
//

function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }

    // Preenche os campos com os dados existentes
    nomeInput.value = produto.nome;
    precoInput.value = produto.preco;
    quantidadeInput.value = produto.quantidade;

    // Ativa o modo edição
    indiceEdicao = index;

    // Altera o texto do botão principal
    btnSalvar.textContent = "Salvar Alterações";

    // Mostra o botão para cancelar
    btnCancelarEdicao.hidden = false;

    // Leva o formulário para a área visível
    formProduto.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

//
// FASE 6: Cancelar edição
//

function cancelarEdicao() {
    indiceEdicao = null;

    formProduto.reset();

    btnSalvar.textContent = "Adicionar Produto";
    btnCancelarEdicao.hidden = true;
}

btnCancelarEdicao.addEventListener("click", function () {
    cancelarEdicao();
});

//
// FASE 7: Limpar toda a tabela
//

btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        alert("A tabela já está vazia!");
        return;
    }

    const confirmou = confirm(
        "Tem certeza que deseja remover todos os produtos?"
    );

    if (confirmou) {
        listaDeProdutos.length = 0;

        // Cancela qualquer edição em andamento
        cancelarEdicao();

        // Remove os dados salvos
        localStorage.removeItem(CHAVE_STORAGE);

        atualizarInterface();

        alert("Todos os produtos foram removidos.");
    }
});

//
// FASE 8: Remover um único produto
//

function removerProduto(index) {
    const produto = listaDeProdutos[index];

    if (!produto) {
        return;
    }

    const confirmou = confirm(
        'Deseja remover o produto "' + produto.nome + '"?'
    );

    if (!confirmou) {
        return;
    }

    // Remove o produto da lista
    listaDeProdutos.splice(index, 1);

    // Corrige o índice de edição após a exclusão
    if (indiceEdicao === index) {
        cancelarEdicao();
    } else if (
        indiceEdicao !== null &&
        indiceEdicao > index
    ) {
        indiceEdicao--;
    }

    // Salva a nova lista
    salvarNoLocalStorage();

    atualizarInterface();
}

//
// FASE 9: Calcular o total do estoque
//

function atualizarTotalEstoque() {
    const total = listaDeProdutos.reduce(
        function (acumulador, produto) {
            return acumulador + produto.calcularSubtotal();
        },
        0
    );

    totalEstoqueEl.textContent =
        "Total em Estoque: R$ " + total.toFixed(2);
}

//
// FASE 10: Renderizar a tabela
//

function renderizarTabela() {
    const tabelaBody = document.querySelector(
        "#tabela-produtos tbody"
    );

    tabelaBody.innerHTML = "";

    listaDeProdutos.forEach(function (produto, index) {
        const linha = document.createElement("tr");

        // Coluna Nome
        const celulaNome = document.createElement("td");
        celulaNome.textContent = produto.nome;

        // Coluna Preço
        const celulaPreco = document.createElement("td");
        celulaPreco.textContent =
            "R$ " + produto.preco.toFixed(2);

        // Coluna Quantidade
        const celulaQuantidade = document.createElement("td");
        celulaQuantidade.textContent = produto.quantidade;

        // Coluna Subtotal
        const celulaSubtotal = document.createElement("td");
        celulaSubtotal.textContent =
            "R$ " + produto.calcularSubtotal().toFixed(2);

        // Coluna Ações
        const celulaAcoes = document.createElement("td");

        // Botão Editar
        const btnEditar = document.createElement("button");

        btnEditar.type = "button";
        btnEditar.textContent = "Editar";
        btnEditar.className = "btn-editar";

        btnEditar.addEventListener("click", function () {
            prepararEdicao(index);
        });

        // Botão Remover
        const btnRemover = document.createElement("button");

        btnRemover.type = "button";
        btnRemover.textContent = "Remover";
        btnRemover.className = "btn-remover";

        btnRemover.addEventListener("click", function () {
            removerProduto(index);
        });

        // Adiciona os botões à célula
        celulaAcoes.appendChild(btnEditar);
        celulaAcoes.appendChild(btnRemover);

        // Adiciona as células à linha
        linha.appendChild(celulaNome);
        linha.appendChild(celulaPreco);
        linha.appendChild(celulaQuantidade);
        linha.appendChild(celulaSubtotal);
        linha.appendChild(celulaAcoes);

        // Adiciona a linha à tabela
        tabelaBody.appendChild(linha);
    });
}

//
// FASE 11: Atualizar a interface
//

function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

//
// FASE 12: Inicialização da aplicação
//

carregarDoLocalStorage();
atualizarInterface();

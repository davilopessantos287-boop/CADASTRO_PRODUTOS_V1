
//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    // Método que calcula o subtotal do produto
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: Gerenciamento de Estado (Memória)
//
const listaDeProdutos = [];

//
// 🆕 FASE 2.1: Persistência com localStorage
//
// Definimos uma constante para evitar erros de digitação ao usar a chave do localStorage
const CHAVE_STORAGE = "sistema_estoque_produtos";

// 1. Função para SALVAR os dados no navegador
function salvarNoLocalStorage() {
    // JSON.stringify converte o Array de Objetos JS em uma String JSON
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

// 2. Função para CARREGAR os dados salvos quando a página abrir
function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    // Se existirem dados salvos anteriormente no navegador...
    if (dadosSalvos) {
        // Converte a string JSON de volta para um Array de objetos genéricos
        const produtosObjetos = JSON.parse(dadosSalvos);

        // ATENÇÃO (Conceito POO): Reinstanciamos cada produto com "new Produto()"
        // para garantir que os objetos recuperem o método .calcularSubtotal()
        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

//
// FASE 3: Captura de Elementos do DOM
//
const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");

//
// FASE 4: Escuta de Eventos
//

// 1. Adicionar Produto pelo Formulário
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    const novoProduto = new Produto(nomeInput, precoInput, quantidadeInput);

    listaDeProdutos.push(novoProduto);

    // 🆕 Salva no localStorage sempre que um novo produto for adicionado
    salvarNoLocalStorage();

    atualizarInterface();
    formProduto.reset();
});

// 2. Limpar toda a tabela
btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        alert("A tabela já está vazia!");
        return;
    }

    if (confirm("Tem certeza que deseja remover todos os produtos?")) {
        listaDeProdutos.length = 0;

        // 🆕 Remove a chave inteira do localStorage
        localStorage.removeItem(CHAVE_STORAGE);

        atualizarInterface();
    }
});

//
// FASE 5: Funções de Atualização e Renderização da Interface
//

// Função responsável por remover um único produto pelo índice
function removerProduto(index) {
    listaDeProdutos.splice(index, 1);

    // 🆕 Salva a nova lista (sem o item removido) no localStorage
    salvarNoLocalStorage();

    atualizarInterface();
}

// Função responsável por calcular e renderizar o total geral em estoque
function atualizarTotalEstoque() {
    const total = listaDeProdutos.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

// Função responsável por re-desenhar a tabela
function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    tabelaBody.innerHTML = "";

    listaDeProdutos.forEach((produto, index) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        const btnRemover = linha.querySelector(".btn-remover");
        btnRemover.addEventListener("click", () => removerProduto(index));

        tabelaBody.appendChild(linha);
    });
}

// Função principal que sincroniza a tela com os dados
function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

//
// 🆕 FASE 6: Inicialização da Aplicação
//
// Ao carregar o script pela primeira vez, restaura os dados do localStorage
// e atualiza a interface gráfica.
carregarDoLocalStorage();
atualizarInterface();
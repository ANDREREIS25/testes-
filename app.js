// LOGIN / CRIAR CONTA
function criarConta() {
        const usuarioEl = document.getElementById("novoUsuario");
        const senhaEl = document.getElementById("novaSenha");
        if (!usuarioEl || !senhaEl) return mostrarToast("Campos não encontrados");

        const usuario = usuarioEl.value.trim();
        const senha = senhaEl.value.trim();
        if (!usuario || !senha) return mostrarToast("Preencha todos os campos");

        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        if (usuarios.find(u => u.usuario === usuario)) return mostrarToast("Usuário já existe");

        usuarios.push({ usuario, senha });
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        usuarioEl.value = "";
        senhaEl.value = "";
        mostrarToast("Conta criada! Faça login agora");
    }

    function login() {
        const usuarioEl = document.getElementById("usuario");
        const senhaEl = document.getElementById("senha");
        if (!usuarioEl || !senhaEl) return mostrarToast("Campos não encontrados");

        const usuario = usuarioEl.value.trim();
        const senha = senhaEl.value.trim();
        if (!usuario || !senha) return mostrarToast("Preencha todos os campos");

        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const conta = usuarios.find(u => u.usuario === usuario && u.senha === senha);
        if (conta) {
            localStorage.setItem("usuarioLogado", usuario);
            window.location.href = "index.html";
        } else {
            mostrarToast("Usuário ou senha inválidos");
        }
    }

    function logout() {
        localStorage.removeItem("usuarioLogado");
        window.location.href = "login.html";
    }

    // PROTEÇÃO DE PÁGINAS (case-insensitive)
    if (["index.html", "financeiro.html", "agua.html"].some(p => window.location.pathname.toLowerCase().includes(p))) {
        if (!localStorage.getItem("usuarioLogado")) window.location.href = "login.html";
    }

    // MODO ESCURO
    function alternarTema() { document.body.classList.toggle("dark"); }

    // TOAST (simples)
    function mostrarToast(msg, duration = 2500) {
        let container = document.getElementById("toastContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "toastContainer";
            container.style.position = "fixed";
            container.style.right = "20px";
            container.style.bottom = "20px";
            container.style.zIndex = 9999;
            document.body.appendChild(container);
        }
        const toast = document.createElement("div");
        toast.textContent = msg;
        toast.style.background = "rgba(0,0,0,0.8)";
        toast.style.color = "#fff";
        toast.style.padding = "8px 12px";
        toast.style.marginTop = "6px";
        toast.style.borderRadius = "4px";
        container.appendChild(toast);
        setTimeout(() => { toast.remove(); if (!container.children.length) container.remove(); }, duration);
    }

    // ================= HIDRATAÇÃO =================
    const metaAgua = 2000; // meta diária em ml
    let aguaConsumida = Number(localStorage.getItem("aguaConsumida")) || 0;

    function atualizarBarraAgua() {
        const barra = document.getElementById("aguaBarra");
        const texto = document.getElementById("aguaTexto");
        if (!barra || !texto) return;

        let progresso = (aguaConsumida / metaAgua) * 100;
        if (progresso > 100) progresso = 100;

        barra.style.width = progresso + "%";
        texto.innerText = Math.round(progresso) + "%";
    }

    function beberAgua() {
        aguaConsumida += 250;
        if (aguaConsumida > metaAgua) aguaConsumida = metaAgua;

        localStorage.setItem("aguaConsumida", String(aguaConsumida));
        atualizarBarraAgua();

        mostrarToast("💧 250ml adicionados");
    }

    document.addEventListener("DOMContentLoaded", () => {
        atualizarBarraAgua();
        const btn = document.getElementById("btnBeber");
        if (btn) btn.addEventListener("click", beberAgua);
    });

    // FINANCEIRO
    let contas = JSON.parse(localStorage.getItem("contas")) || [];
    let metas = JSON.parse(localStorage.getItem("metas")) || [];

    let listaContasEl = null;
    let listaMetasEl = null;
    let ctx = null;

    function renderizarListas() {
        if (!listaContasEl || !listaMetasEl) return;
        listaContasEl.innerHTML = "";
        contas.forEach((c, index) => {
            const li = document.createElement("li");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.style.marginRight = "8px";
            checkbox.setAttribute("data-index", index);
            checkbox.className = "conta-checkbox";
            const label = document.createElement("label");
            label.style.cursor = "pointer";
            label.style.display = "flex";
            label.style.alignItems = "center";
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(`${c.nome}: R$ ${c.valor.toFixed(2)}`));
            li.appendChild(label);
            listaContasEl.appendChild(li);
        });
        listaMetasEl.innerHTML = "";
        metas.forEach((m, index) => {
            const li = document.createElement("li");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.style.marginRight = "8px";
            checkbox.setAttribute("data-index", index);
            checkbox.className = "meta-checkbox";
            const label = document.createElement("label");
            label.style.cursor = "pointer";
            label.style.display = "flex";
            label.style.alignItems = "center";
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(`${m.nome}: R$ ${m.valor.toFixed(2)}`));
            li.appendChild(label);
            listaMetasEl.appendChild(li);
        });
    }

    function adicionarConta() {
        const nomeEl = document.getElementById("nomeConta");
        const valorEl = document.getElementById("valorConta");
        if (!nomeEl || !valorEl) return mostrarToast("Campos não encontrados");
        const nome = nomeEl.value.trim();
        const valor = parseFloat(valorEl.value);
        if (!nome || isNaN(valor) || valor <= 0) return mostrarToast("Preencha nome e valor válido");
        contas.push({ nome, valor });
        localStorage.setItem("contas", JSON.stringify(contas));
        nomeEl.value = "";
        valorEl.value = "";
        mostrarToast("Conta adicionada");
        renderizarListas();
        atualizarGrafico();
    }

    function adicionarMeta() {
        const nomeEl = document.getElementById("nomeMeta");
        const valorEl = document.getElementById("valorMeta");
        if (!nomeEl || !valorEl) return mostrarToast("Campos não encontrados");
        const nome = nomeEl.value.trim();
        const valor = parseFloat(valorEl.value);
        if (!nome || isNaN(valor) || valor <= 0) return mostrarToast("Preencha nome e valor válido");
        metas.push({ nome, valor });
        localStorage.setItem("metas", JSON.stringify(metas));
        nomeEl.value = "";
        valorEl.value = "";
        mostrarToast("Meta adicionada");
        renderizarListas();
    }

    function excluirContas() {
        const checkboxes = document.querySelectorAll(".conta-checkbox:checked");
        if (checkboxes.length === 0) return mostrarToast("Selecione contas para excluir");
        
        const indices = Array.from(checkboxes)
            .map(cb => parseInt(cb.getAttribute("data-index")))
            .sort((a, b) => b - a);
        
        indices.forEach(idx => {
            contas.splice(idx, 1);
        });
        
        localStorage.setItem("contas", JSON.stringify(contas));
        mostrarToast(`${indices.length} conta(s) excluída(s)`);
        renderizarListas();
        atualizarGrafico();
    }

    function excluirMetas() {
        const checkboxes = document.querySelectorAll(".meta-checkbox:checked");
        if (checkboxes.length === 0) return mostrarToast("Selecione metas para excluir");
        
        const indices = Array.from(checkboxes)
            .map(cb => parseInt(cb.getAttribute("data-index")))
            .sort((a, b) => b - a);
        
        indices.forEach(idx => {
            metas.splice(idx, 1);
        });
        
        localStorage.setItem("metas", JSON.stringify(metas));
        mostrarToast(`${indices.length} meta(s) excluída(s)`);
        renderizarListas();
    }

    function inicializarFinanceiro() {
        listaContasEl = document.getElementById("listaContas");
        listaMetasEl = document.getElementById("listaMetas");
        ctx = document.getElementById("graficoFinanceiro");
        renderizarListas();
        atualizarGrafico();
    }

    function atualizarGrafico() {
        if (!ctx) return;
        const labels = contas.map(c => c.nome);
        const data = contas.map(c => c.valor);

        const defaultLabels = ["Alimentação", "Contas", "Lazer", "Economia"];
        const defaultData = [500, 800, 300, 600];

        let chartInstance = null;
        if (window.graficoFinanceiro && window.graficoFinanceiro.data) {
            chartInstance = window.graficoFinanceiro;
        } else if (typeof Chart !== 'undefined' && Chart.getChart) {
            chartInstance = Chart.getChart(ctx);
        }

        if (chartInstance) {
            chartInstance.data.labels = labels.length ? labels : defaultLabels;
            if (chartInstance.data.datasets && chartInstance.data.datasets[0]) {
                chartInstance.data.datasets[0].data = data.length ? data : defaultData;
            } else {
                chartInstance.data.datasets = [{ 
                    data: data.length ? data : defaultData, 
                    backgroundColor: ["#4caf50", "#2e7d32", "#81c784", "#a5d6a7"] 
                }];
            }
            chartInstance.update();
            window.graficoFinanceiro = chartInstance;
        } else {
            window.graficoFinanceiro = new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: labels.length ? labels : defaultLabels,
                    datasets: [{
                        data: data.length ? data : defaultData,
                        backgroundColor: ["#4caf50", "#2e7d32", "#81c784", "#a5d6a7"]
                    }]
                }
            });
        }
    }

    // Inicialização por página (case-insensitive)
    document.addEventListener("DOMContentLoaded", () => {
        if (window.location.pathname.toLowerCase().includes("financeiro.html")) {
            inicializarFinanceiro();
        }
    });

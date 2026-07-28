// ========== DATA STORE ==========
const STORE_KEY = 'precocerto_data';

let data = {
  materiais: [],
  receitas: [],
  produtos: [],
  embalagens: [],
  despesasFixas: [],
  despesasVariaveis: [],
  historico: [],
  metas: []
};

// Materiais iniciais (do Base44)
const materiaisIniciais = [
  { id: 'm1', nome: 'Farinha de Trigo', unidade: 'kg', precoUnit: 4.50 },
  { id: 'm2', nome: 'Açúcar', unidade: 'kg', precoUnit: 3.80 },
  { id: 'm3', nome: 'Ovos', unidade: 'un', precoUnit: 0.60 },
  { id: 'm4', nome: 'Manteiga', unidade: 'kg', precoUnit: 28.00 },
  { id: 'm5', nome: 'Leite', unidade: 'L', precoUnit: 4.20 },
  { id: 'm6', nome: 'Chocolate em Pó', unidade: 'kg', precoUnit: 18.00 },
  { id: 'm7', nome: 'Leite Condensado', unidade: 'latas', precoUnit: 5.50 },
  { id: 'm8', nome: 'Creme de Leite', unidade: 'latas', precoUnit: 4.50 }
];

function carregarDados() {
  const saved = localStorage.getItem(STORE_KEY);
  if (saved) {
    try {
      data = JSON.parse(saved);
      // Garantir que campos existam
      if (!data.metas) data.metas = [];
      if (!data.historico) data.historico = [];
      return;
    } catch(e) {}
  }
  // Primeiro uso: dados iniciais
  data.materiais = [...materiaisIniciais];
  data.receitas = [];
  data.produtos = [];
  data.embalagens = [];
  data.despesasFixas = [];
  data.despesasVariaveis = [];
  data.historico = [];
  data.metas = [];
  salvarDados();
}

function salvarDados() {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function gerarId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function formatarMoeda(v) {
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}

// ========== NAVEGAÇÃO ==========
let paginaAtual = 'dashboard';

function navigateTo(pagina) {
  paginaAtual = pagina;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + pagina).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-page="${pagina}"]`);
  if (navItem) navItem.classList.add('active');
  document.getElementById('page-title').textContent = navItem ? navItem.textContent.trim() : pagina;
  fecharSidebar();
  // Renderizar página
  switch(pagina) {
    case 'dashboard': renderDashboard(); break;
    case 'materiais': renderMateriais(); break;
    case 'receitas': renderReceitas(); break;
    case 'produtos': renderProdutos(); break;
    case 'embalagens': renderEmbalagens(); break;
    case 'despesas-fixas': renderDespesasFixas(); break;
    case 'despesas-variaveis': renderDespesasVariaveis(); break;
    case 'calculadora': renderCalculadora(); break;
    case 'historico': renderHistorico(); break;
    case 'metas': renderMetas(); break;
  }
}

// ========== SIDEBAR MOBILE ==========
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('open');
});
document.getElementById('sidebar-overlay').addEventListener('click', fecharSidebar);
function fecharSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

// Navegação sidebar
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(item.dataset.page);
  });
});

// ========== MODAL ==========
let modalContexto = null;
let modalEditandoId = null;

function openModal(tipo, editId) {
  modalContexto = tipo;
  modalEditandoId = editId || null;
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');

  const titleMap = {
    'material': 'Novo Material',
    'receita': 'Nova Receita',
    'produto': 'Novo Produto',
    'embalagem': 'Nova Embalagem',
    'despesa-fixa': 'Nova Despesa Fixa',
    'despesa-variavel': 'Nova Despesa Variável',
    'meta': 'Nova Meta'
  };
  document.getElementById('modal-title').textContent = editId ? 'Editar ' + titleMap[tipo].replace('Nova ', '').replace('Novo ', '') : titleMap[tipo];
  document.getElementById('modal-save').textContent = editId ? 'Atualizar' : 'Salvar';

  const body = document.getElementById('modal-body');
  switch(tipo) {
    case 'material': body.innerHTML = htmlFormMaterial(editId); break;
    case 'receita': body.innerHTML = htmlFormReceita(editId); break;
    case 'produto': body.innerHTML = htmlFormProduto(editId); break;
    case 'embalagem': body.innerHTML = htmlFormEmbalagem(editId); break;
    case 'despesa-fixa': body.innerHTML = htmlFormDespesaFixa(editId); break;
    case 'despesa-variavel': body.innerHTML = htmlFormDespesaVariavel(editId); break;
    case 'meta': body.innerHTML = htmlFormMeta(editId); break;
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  modalContexto = null;
  modalEditandoId = null;
}

function salvarModal() {
  switch(modalContexto) {
    case 'material': salvarMaterial(); break;
    case 'receita': salvarReceita(); break;
    case 'produto': salvarProduto(); break;
    case 'embalagem': salvarEmbalagem(); break;
    case 'despesa-fixa': salvarDespesaFixa(); break;
    case 'despesa-variavel': salvarDespesaVariavel(); break;
    case 'meta': salvarMeta(); break;
  }
}

// ========== MATERIAIS ==========
function htmlFormMaterial(id) {
  const item = id ? data.materiais.find(m => m.id === id) : null;
  return `
    <div class="form-group">
      <label>Nome do Material</label>
      <input type="text" id="mat-nome" value="${item ? item.nome : ''}" placeholder="Ex: Farinha de Trigo">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Unidade</label>
        <select id="mat-unidade">
          ${['kg', 'g', 'L', 'mL', 'un', 'cx', 'pct', 'latas'].map(u =>
            `<option value="${u}" ${item && item.unidade === u ? 'selected' : ''}>${u}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Preço por Unidade (R$)</label>
        <input type="number" id="mat-preco" step="0.01" min="0" value="${item ? item.precoUnit : ''}" placeholder="0,00">
      </div>
    </div>
  `;
}

function salvarMaterial() {
  const nome = document.getElementById('mat-nome').value.trim();
  const unidade = document.getElementById('mat-unidade').value;
  const preco = parseFloat(document.getElementById('mat-preco').value) || 0;
  if (!nome) { alert('Informe o nome do material'); return; }

  if (modalEditandoId) {
    const mat = data.materiais.find(m => m.id === modalEditandoId);
    if (mat) { mat.nome = nome; mat.unidade = unidade; mat.precoUnit = preco; }
  } else {
    data.materiais.push({ id: gerarId(), nome, unidade, precoUnit: preco });
  }
  salvarDados();
  closeModal();
  renderMateriais();
  renderDashboard();
}

function renderMateriais() {
  const termo = (document.getElementById('search-material')?.value || '').toLowerCase();
  const list = document.getElementById('materiais-list');
  const filtrados = data.materiais.filter(m => m.nome.toLowerCase().includes(termo));

  if (filtrados.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><h3>Nenhum material</h3><p>${data.materiais.length === 0 ? 'Cadastre seu primeiro material' : 'Nenhum material encontrado'}</p></div>`;
    return;
  }

  list.innerHTML = filtrados.map(m => `
    <div class="item-card">
      <div class="item-info">
        <div class="item-name">${m.nome}</div>
        <div class="item-details">
          <span class="item-detail">Unidade: <strong>${m.unidade}</strong></span>
          <span class="item-detail">Preço: <strong>${formatarMoeda(m.precoUnit)}</strong></span>
        </div>
      </div>
      <div class="item-actions">
        <button onclick="openModal('material', '${m.id}')">✏️</button>
        <button class="btn-del" onclick="excluirMaterial('${m.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function excluirMaterial(id) {
  if (!confirm('Excluir este material?')) return;
  data.materiais = data.materiais.filter(m => m.id !== id);
  // Remover de receitas
  data.receitas.forEach(r => {
    r.ingredientes = r.ingredientes.filter(i => i.materialId !== id);
  });
  salvarDados();
  renderMateriais();
  renderDashboard();
}

// ========== RECEITAS ==========
function htmlFormReceita(id) {
  const item = id ? data.receitas.find(r => r.id === id) : null;
  const materiais = data.materiais;

  let ingredientesHtml = '';
  if (item) {
    item.ingredientes.forEach((ing, idx) => {
      ingredientesHtml += `{{INGREDIENTE_${idx}}}`;
    });
  }
  if (!item || item.ingredientes.length === 0) {
    ingredientesHtml += `{{INGREDIENTE_NOVO}}`;
  }

  let html = `
    <div class="form-group">
      <label>Nome da Receita</label>
      <input type="text" id="rec-nome" value="${item ? item.nome : ''}" placeholder="Ex: Bolo de Chocolate">
    </div>
    <div class="form-group">
      <label>Rendimento</label>
      <div class="form-row">
        <div class="form-group">
          <input type="number" id="rec-qtd" step="0.01" min="0" value="${item ? item.rendimentoQtd : ''}" placeholder="Quantidade">
        </div>
        <div class="form-group">
          <select id="rec-unidade">
            ${['unidades', 'pedaços', 'fatias', 'kg', 'g', 'L', 'mL', 'copos', 'porções'].map(u =>
              `<option value="${u}" ${item && item.rendimentoUnidade === u ? 'selected' : ''}>${u}</option>`
            ).join('')}
          </select>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label>Ingredientes</label>
      <div class="ingred-list" id="ingred-list">
  `;

  // Substituir placeholders
  if (item) {
    item.ingredientes.forEach((ing, idx) => {
      html += buildIngredRow(idx, ing.materialId, ing.quantidade, ing.unidade);
    });
  }
  if (!item || item.ingredientes.length === 0) {
    html += buildIngredRow(0, '', '', '');
  }

  html += `
      </div>
      <button type="button" class="add-ingred-btn" onclick="addIngredRow()">+ Adicionar ingrediente</button>
    </div>
    <div class="form-group">
      <label>Modo de Preparo (opcional)</label>
      <textarea id="rec-preparo" rows="3" placeholder="Instruções...">${item ? (item.preparo || '') : ''}</textarea>
    </div>
  `;
  return html;
}

function buildIngredRow(idx, materialId, qtd, unidade) {
  const materiais = data.materiais;
  const opts = materiais.map(m =>
    `<option value="${m.id}" ${m.id === materialId ? 'selected' : ''}>${m.nome}</option>`
  ).join('');
  return `
    <div class="ingred-item" data-idx="${idx}">
      <select onchange="atualizarUnidadeIngred(this)">${opts}<option value="">-- Selecione --</option></select>
      <input type="number" step="0.01" min="0" placeholder="Qtd" value="${qtd || ''}" onchange="updateIngredQtd(this)">
      <span class="ingred-unidade">${unidade || ''}</span>
      <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
    </div>
  `;
}

let ingredCounter = 0;

function addIngredRow() {
  const list = document.getElementById('ingred-list');
  ingredCounter++;
  const div = document.createElement('div');
  div.className = 'ingred-item';
  const materiais = data.materiais;
  const opts = materiais.map(m => `<option value="${m.id}">${m.nome}</option>`).join('');
  div.innerHTML = `
    <select onchange="atualizarUnidadeIngred(this)"><option value="">-- Selecione --</option>${opts}</select>
    <input type="number" step="0.01" min="0" placeholder="Qtd">
    <span class="ingred-unidade"></span>
    <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
  `;
  list.appendChild(div);
}

function atualizarUnidadeIngred(select) {
  const matId = select.value;
  const mat = data.materiais.find(m => m.id === matId);
  const span = select.parentElement.querySelector('.ingred-unidade');
  if (span && mat) span.textContent = mat.unidade;
}

function updateIngredQtd(input) {
  // just placeholder
}

function coletarIngredientes() {
  const items = document.querySelectorAll('#ingred-list .ingred-item');
  return Array.from(items).map(item => {
    const select = item.querySelector('select');
    const input = item.querySelector('input[type="number"]');
    return {
      materialId: select ? select.value : '',
      quantidade: parseFloat(input ? input.value : 0) || 0
    };
  }).filter(i => i.materialId && i.quantidade > 0);
}

function salvarReceita() {
  const nome = document.getElementById('rec-nome').value.trim();
  const rendimentoQtd = parseFloat(document.getElementById('rec-qtd').value) || 0;
  const rendimentoUnidade = document.getElementById('rec-unidade').value;
  const preparo = document.getElementById('rec-preparo').value.trim();
  const ingredientes = coletarIngredientes();

  if (!nome) { alert('Informe o nome da receita'); return; }
  if (ingredientes.length === 0) { alert('Adicione pelo menos um ingrediente'); return; }
  if (rendimentoQtd <= 0) { alert('Informe o rendimento'); return; }

  if (modalEditandoId) {
    const rec = data.receitas.find(r => r.id === modalEditandoId);
    if (rec) {
      rec.nome = nome;
      rec.rendimentoQtd = rendimentoQtd;
      rec.rendimentoUnidade = rendimentoUnidade;
      rec.ingredientes = ingredientes;
      rec.preparo = preparo;
    }
  } else {
    data.receitas.push({
      id: gerarId(),
      nome,
      rendimentoQtd,
      rendimentoUnidade,
      ingredientes,
      preparo
    });
  }
  salvarDados();
  closeModal();
  renderReceitas();
  renderDashboard();
}

function renderReceitas() {
  const list = document.getElementById('receitas-list');
  if (data.receitas.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><h3>Nenhuma receita</h3><p>Crie suas receitas com os materiais cadastrados</p></div>`;
    return;
  }

  list.innerHTML = data.receitas.map(r => {
    const ingredHtml = r.ingredientes.map(i => {
      const mat = data.materiais.find(m => m.id === i.materialId);
      return mat ? `<span class="receita-ingrediente">${mat.nome} (${i.quantidade} ${mat.unidade})</span>` : '';
    }).join('');
    return `
      <div class="item-card">
        <div class="item-info">
          <div class="item-name">${r.nome}</div>
          <div class="item-sub">Rende: ${r.rendimentoQtd} ${r.rendimentoUnidade}</div>
          <div class="receita-ingredientes">${ingredHtml}</div>
        </div>
        <div class="item-actions">
          <button onclick="openModal('receita', '${r.id}')">✏️</button>
          <button class="btn-del" onclick="excluirReceita('${r.id}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function excluirReceita(id) {
  if (!confirm('Excluir esta receita?')) return;
  data.receitas = data.receitas.filter(r => r.id !== id);
  // Remover de produtos
  data.produtos.forEach(p => {
    p.receitas = p.receitas.filter(r => r !== id);
  });
  salvarDados();
  renderReceitas();
  renderDashboard();
}

// ========== PRODUTOS ==========
function htmlFormProduto(id) {
  const item = id ? data.produtos.find(p => p.id === id) : null;
  const receitas = data.receitas;

  let receitasSelecionadas = item ? [...item.receitas] : [];
  let embalagensSelecionadas = item ? [...item.embalagens] : [];
  let margemLucro = item ? item.margemLucro : 30;

  let html = `
    <div class="form-group">
      <label>Nome do Produto</label>
      <input type="text" id="prod-nome" value="${item ? item.nome : ''}" placeholder="Ex: Bolo de Chocolate">
    </div>
    <div class="form-group">
      <label>Selecione as Receitas (pode escolher mais de uma)</label>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:4px;" id="prod-receitas">
  `;

  if (receitas.length === 0) {
    html += `<p style="color:var(--gray-400);font-size:13px;">Nenhuma receita cadastrada. Crie receitas primeiro.</p>`;
  } else {
    receitas.forEach(r => {
      const checked = receitasSelecionadas.includes(r.id);
      html += `
        <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;padding:6px 8px;border-radius:6px;background:${checked ? 'var(--primary-light)' : 'var(--gray-50)'};">
          <input type="checkbox" value="${r.id}" ${checked ? 'checked' : ''} onchange="this.parentElement.style.background=this.checked?'var(--primary-light)':'var(--gray-50)'">
          ${r.nome} <span style="color:var(--gray-400);font-size:12px;">(rende ${r.rendimentoQtd} ${r.rendimentoUnidade})</span>
        </label>
      `;
    });
  }

  html += `
      </div>
    </div>
    <div class="form-group">
      <label>Embalagens usadas neste produto</label>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:4px;" id="prod-embalagens">
  `;

  const embalagens = data.embalagens;
  if (embalagens.length === 0) {
    html += `<p style="color:var(--gray-400);font-size:13px;">Nenhuma embalagem cadastrada.</p>`;
  } else {
    embalagens.forEach(e => {
      const checked = embalagensSelecionadas.includes(e.id);
      html += `
        <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;padding:6px 8px;border-radius:6px;background:${checked ? 'var(--primary-light)' : 'var(--gray-50)'};">
          <input type="checkbox" value="${e.id}" ${checked ? 'checked' : ''} onchange="this.parentElement.style.background=this.checked?'var(--primary-light)':'var(--gray-50)'">
          ${e.nome} <span style="color:var(--gray-400);font-size:12px;">(R$ ${e.precoUnitario.toFixed(2)})</span>
        </label>
      `;
    });
  }

  html += `
      </div>
    </div>
    <div class="form-group">
      <label>Margem de Lucro (%)</label>
      <input type="number" id="prod-margem" min="0" max="500" value="${margemLucro}" placeholder="30">
    </div>
  `;
  return html;
}

function salvarProduto() {
  const nome = document.getElementById('prod-nome').value.trim();
  const receitasCheckboxes = document.querySelectorAll('#prod-receitas input[type="checkbox"]:checked');
  const embalagensCheckboxes = document.querySelectorAll('#prod-embalagens input[type="checkbox"]:checked');
  const margem = parseFloat(document.getElementById('prod-margem').value) || 30;

  if (!nome) { alert('Informe o nome do produto'); return; }
  if (receitasCheckboxes.length === 0) { alert('Selecione pelo menos uma receita'); return; }

  const receitasIds = Array.from(receitasCheckboxes).map(c => c.value);
  const embalagensIds = Array.from(embalagensCheckboxes).map(c => c.value);

  if (modalEditandoId) {
    const prod = data.produtos.find(p => p.id === modalEditandoId);
    if (prod) {
      prod.nome = nome;
      prod.receitas = receitasIds;
      prod.embalagens = embalagensIds;
      prod.margemLucro = margem;
    }
  } else {
    data.produtos.push({
      id: gerarId(),
      nome,
      receitas: receitasIds,
      embalagens: embalagensIds,
      margemLucro: margem
    });
  }
  salvarDados();
  closeModal();
  renderProdutos();
  renderDashboard();
}

function renderProdutos() {
  const list = document.getElementById('produtos-list');
  if (data.produtos.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🏷️</div><h3>Nenhum produto</h3><p>Crie produtos combinando múltiplas receitas</p></div>`;
    return;
  }

  list.innerHTML = data.produtos.map(p => {
    const receitasNomes = p.receitas.map(rId => {
      const r = data.receitas.find(rec => rec.id === rId);
      return r ? r.nome : null;
    }).filter(Boolean).join(', ');
    return `
      <div class="item-card">
        <div class="item-info">
          <div class="item-name">${p.nome}</div>
          <div class="item-sub">Margem: ${p.margemLucro}% | ${p.receitas.length} receita(s)</div>
          <div class="item-details">
            <span class="item-detail">Receitas: <strong>${receitasNomes || '—'}</strong></span>
          </div>
        </div>
        <div class="item-actions">
          <button onclick="openModal('produto', '${p.id}')">✏️</button>
          <button class="btn-del" onclick="excluirProduto('${p.id}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function excluirProduto(id) {
  if (!confirm('Excluir este produto?')) return;
  data.produtos = data.produtos.filter(p => p.id !== id);
  salvarDados();
  renderProdutos();
  renderDashboard();
}

// ========== EMBALAGENS ==========
function htmlFormEmbalagem(id) {
  const item = id ? data.embalagens.find(e => e.id === id) : null;
  return `
    <div class="form-group">
      <label>Nome da Embalagem</label>
      <input type="text" id="emb-nome" value="${item ? item.nome : ''}" placeholder="Ex: Caixa de Papelão">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Preço Unitário (R$)</label>
        <input type="number" id="emb-preco" step="0.01" min="0" value="${item ? item.precoUnitario : ''}" placeholder="0,00">
      </div>
      <div class="form-group">
        <label>Quantidade por Produto</label>
        <input type="number" id="emb-qtd" step="0.01" min="0" value="${item ? item.quantidade : '1'}" placeholder="1">
        <div class="form-hint">Quantas unidades desta embalagem por produto</div>
      </div>
    </div>
  `;
}

function salvarEmbalagem() {
  const nome = document.getElementById('emb-nome').value.trim();
  const preco = parseFloat(document.getElementById('emb-preco').value) || 0;
  const qtd = parseFloat(document.getElementById('emb-qtd').value) || 1;
  if (!nome) { alert('Informe o nome da embalagem'); return; }

  if (modalEditandoId) {
    const emb = data.embalagens.find(e => e.id === modalEditandoId);
    if (emb) { emb.nome = nome; emb.precoUnitario = preco; emb.quantidade = qtd; }
  } else {
    data.embalagens.push({ id: gerarId(), nome, precoUnitario: preco, quantidade: qtd });
  }
  salvarDados();
  closeModal();
  renderEmbalagens();
  renderDashboard();
}

function renderEmbalagens() {
  const list = document.getElementById('embalagens-list');
  if (data.embalagens.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><h3>Nenhuma embalagem</h3><p>Cadastre as embalagens que você usa</p></div>`;
    return;
  }
  list.innerHTML = data.embalagens.map(e => `
    <div class="item-card">
      <div class="item-info">
        <div class="item-name">${e.nome}</div>
        <div class="item-details">
          <span class="item-detail">Preço: <strong>${formatarMoeda(e.precoUnitario)}</strong></span>
          <span class="item-detail">Qtd por produto: <strong>${e.quantidade}</strong></span>
          <span class="item-detail">Custo total: <strong>${formatarMoeda(e.precoUnitario * e.quantidade)}</strong></span>
        </div>
      </div>
      <div class="item-actions">
        <button onclick="openModal('embalagem', '${e.id}')">✏️</button>
        <button class="btn-del" onclick="excluirEmbalagem('${e.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function excluirEmbalagem(id) {
  if (!confirm('Excluir esta embalagem?')) return;
  data.embalagens = data.embalagens.filter(e => e.id !== id);
  salvarDados();
  renderEmbalagens();
  renderDashboard();
}

// ========== DESPESAS FIXAS ==========
function htmlFormDespesaFixa(id) {
  const item = id ? data.despesasFixas.find(d => d.id === id) : null;
  return `
    <div class="form-group">
      <label>Nome da Despesa</label>
      <input type="text" id="df-nome" value="${item ? item.nome : ''}" placeholder="Ex: Aluguel">
    </div>
    <div class="form-group">
      <label>Valor Mensal (R$)</label>
      <input type="number" id="df-valor" step="0.01" min="0" value="${item ? item.valor : ''}" placeholder="0,00">
    </div>
  `;
}

function salvarDespesaFixa() {
  const nome = document.getElementById('df-nome').value.trim();
  const valor = parseFloat(document.getElementById('df-valor').value) || 0;
  if (!nome) { alert('Informe o nome da despesa'); return; }

  if (modalEditandoId) {
    const d = data.despesasFixas.find(x => x.id === modalEditandoId);
    if (d) { d.nome = nome; d.valor = valor; }
  } else {
    data.despesasFixas.push({ id: gerarId(), nome, valor });
  }
  salvarDados();
  closeModal();
  renderDespesasFixas();
  renderDashboard();
}

function renderDespesasFixas() {
  const list = document.getElementById('despesas-fixas-list');
  if (data.despesasFixas.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">💰</div><h3>Nenhuma despesa fixa</h3><p>Cadastre aluguel, internet, etc.</p></div>`;
    return;
  }
  const total = data.despesasFixas.reduce((s, d) => s + d.valor, 0);
  list.innerHTML = data.despesasFixas.map(d => `
    <div class="item-card">
      <div class="item-info">
        <div class="item-name">${d.nome}</div>
        <div class="item-details">
          <span class="item-detail">Valor: <strong>${formatarMoeda(d.valor)}</strong></span>
        </div>
      </div>
      <div class="item-actions">
        <button onclick="openModal('despesa-fixa', '${d.id}')">✏️</button>
        <button class="btn-del" onclick="excluirDespesaFixa('${d.id}')">🗑️</button>
      </div>
    </div>
  `).join('') + `
    <div class="item-card" style="border-color:var(--primary);background:var(--primary-light);">
      <div class="item-info">
        <div class="item-name" style="color:var(--primary);">Total Despesas Fixas</div>
        <div class="item-details">
          <span class="item-detail" style="font-size:18px;font-weight:700;color:var(--primary);">${formatarMoeda(total)}</span>
          <span class="item-detail">por mês</span>
        </div>
      </div>
    </div>
  `;
}

function excluirDespesaFixa(id) {
  if (!confirm('Excluir esta despesa?')) return;
  data.despesasFixas = data.despesasFixas.filter(d => d.id !== id);
  salvarDados();
  renderDespesasFixas();
  renderDashboard();
}

// ========== DESPESAS VARIÁVEIS ==========
function htmlFormDespesaVariavel(id) {
  const item = id ? data.despesasVariaveis.find(d => d.id === id) : null;
  return `
    <div class="form-group">
      <label>Nome da Despesa</label>
      <input type="text" id="dv-nome" value="${item ? item.nome : ''}" placeholder="Ex: Taxa do cartão">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Tipo</label>
        <select id="dv-tipo">
          <option value="percentual" ${item && item.tipo === 'percentual' ? 'selected' : ''}>Percentual (%)</option>
          <option value="fixo" ${item && item.tipo === 'fixo' ? 'selected' : ''}>Valor Fixo (R$)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Valor</label>
        <input type="number" id="dv-valor" step="0.01" min="0" value="${item ? item.valor : ''}" placeholder="0,00">
        <div class="form-hint">Se percentual, informe % (ex: 3.5). Se fixo, informe R$</div>
      </div>
    </div>
  `;
}

function salvarDespesaVariavel() {
  const nome = document.getElementById('dv-nome').value.trim();
  const tipo = document.getElementById('dv-tipo').value;
  const valor = parseFloat(document.getElementById('dv-valor').value) || 0;
  if (!nome) { alert('Informe o nome da despesa'); return; }

  if (modalEditandoId) {
    const d = data.despesasVariaveis.find(x => x.id === modalEditandoId);
    if (d) { d.nome = nome; d.tipo = tipo; d.valor = valor; }
  } else {
    data.despesasVariaveis.push({ id: gerarId(), nome, tipo, valor });
  }
  salvarDados();
  closeModal();
  renderDespesasVariaveis();
  renderDashboard();
}

function renderDespesasVariaveis() {
  const list = document.getElementById('despesas-variaveis-list');
  if (data.despesasVariaveis.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📉</div><h3>Nenhuma despesa variável</h3><p>Cadastre taxas e comissões que variam por venda</p></div>`;
    return;
  }
  list.innerHTML = data.despesasVariaveis.map(d => `
    <div class="item-card">
      <div class="item-info">
        <div class="item-name">${d.nome}</div>
        <div class="item-details">
          <span class="item-detail">Tipo: <strong>${d.tipo === 'percentual' ? 'Percentual' : 'Valor Fixo'}</strong></span>
          <span class="item-detail">Valor: <strong>${d.tipo === 'percentual' ? d.valor + '%' : formatarMoeda(d.valor)}</strong></span>
        </div>
      </div>
      <div class="item-actions">
        <button onclick="openModal('despesa-variavel', '${d.id}')">✏️</button>
        <button class="btn-del" onclick="excluirDespesaVariavel('${d.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function excluirDespesaVariavel(id) {
  if (!confirm('Excluir esta despesa?')) return;
  data.despesasVariaveis = data.despesasVariaveis.filter(d => d.id !== id);
  salvarDados();
  renderDespesasVariaveis();
  renderDashboard();
}

// ========== CALCULADORA ==========
function renderCalculadora() {
  const select = document.getElementById('calc-produto');
  select.innerHTML = '<option value="">Escolha um produto...</option>' +
    data.produtos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
  document.getElementById('calc-resultado').classList.add('hidden');
}

function atualizarCalculadora() {
  const prodId = document.getElementById('calc-produto').value;
  const resultado = document.getElementById('calc-resultado');

  if (!prodId) {
    resultado.classList.add('hidden');
    return;
  }

  const prod = data.produtos.find(p => p.id === prodId);
  if (!prod) { resultado.classList.add('hidden'); return; }

  const calculo = calcularCustoProduto(prod);
  resultado.classList.remove('hidden');

  document.getElementById('calc-nome-produto').textContent = prod.nome;
  document.getElementById('calc-preco-final').textContent = formatarMoeda(calculo.precoSugerido);

  // Receitas
  let receitasHtml = '';
  calculo.receitasDetalhes.forEach(rd => {
    receitasHtml += `
      <div class="calc-row"><span class="label">${rd.nome} (${rd.rendimento})</span><span class="value">${formatarMoeda(rd.custoTotal)}</span></div>
    `;
  });
  receitasHtml += `<div class="calc-row" style="border-top:1px solid var(--gray-200);padding-top:6px;margin-top:4px;"><span class="label" style="font-weight:600;">Total receitas</span><span class="value" style="font-weight:700;">${formatarMoeda(calculo.totalReceitas)}</span></div>`;
  document.getElementById('calc-receitas').innerHTML = receitasHtml;

  // Embalagens
  let embHtml = '';
  calculo.embalagensDetalhes.forEach(ed => {
    embHtml += `<div class="calc-row"><span class="label">${ed.nome}</span><span class="value">${formatarMoeda(ed.custo)}</span></div>`;
  });
  if (!embHtml) embHtml = '<p style="font-size:13px;color:var(--gray-400);">Nenhuma embalagem selecionada</p>';
  document.getElementById('calc-embalagens').innerHTML = embHtml;

  // Fixas
  document.getElementById('calc-fixas').innerHTML = `
    <div class="calc-row"><span class="label">Total despesas fixas (mês)</span><span class="value">${formatarMoeda(calculo.totalFixas)}</span></div>
    <div class="calc-row"><span class="label">Rateio por unidade</span><span class="value">${formatarMoeda(calculo.rateioFixo)}</span></div>
  `;

  // Variáveis
  let varHtml = '';
  calculo.variaveisDetalhes.forEach(vd => {
    varHtml += `<div class="calc-row"><span class="label">${vd.nome}</span><span class="value">${vd.tipo === 'percentual' ? vd.valor + '%' : formatarMoeda(vd.valor)}</span></div>`;
  });
  if (!varHtml) varHtml = '<p style="font-size:13px;color:var(--gray-400);">Nenhuma despesa variável</p>';
  document.getElementById('calc-variaveis').innerHTML = varHtml;

  // Totais
  document.getElementById('calc-custo-total').textContent = formatarMoeda(calculo.custoUnitario);
  document.getElementById('calc-margem').textContent = prod.margemLucro + '%';
  document.getElementById('calc-preco-sugerido').textContent = formatarMoeda(calculo.precoSugerido);
}

function calcularCustoProduto(prod) {
  const totalFixas = data.despesasFixas.reduce((s, d) => s + d.valor, 0);

  // Calcular custo total de cada receita
  let totalReceitas = 0;
  const receitasDetalhes = [];

  prod.receitas.forEach(rId => {
    const rec = data.receitas.find(r => r.id === rId);
    if (!rec) return;

    let custoReceita = 0;
    rec.ingredientes.forEach(ing => {
      const mat = data.materiais.find(m => m.id === ing.materialId);
      if (mat) {
        custoReceita += ing.quantidade * mat.precoUnit;
      }
    });

    // Custo por unidade de rendimento
    const custoPorUnidade = custoReceita / rec.rendimentoQtd;
    totalReceitas += custoPorUnidade;
    receitasDetalhes.push({
      nome: rec.nome,
      rendimento: `${rec.rendimentoQtd} ${rec.rendimentoUnidade}`,
      custoTotal: custoPorUnidade, // custo de 1 unidade de rendimento
      custoReceita: custoReceita
    });
  });

  // Embalagens
  let totalEmbalagens = 0;
  const embalagensDetalhes = [];
  prod.embalagens.forEach(eId => {
    const emb = data.embalagens.find(e => e.id === eId);
    if (emb) {
      const custo = emb.precoUnitario * emb.quantidade;
      totalEmbalagens += custo;
      embalagensDetalhes.push({ nome: emb.nome, custo });
    }
  });

  // Rateio de despesas fixas por unidade (estimativa: 300 unidades/mês como base)
  const unidadesMes = 300;
  const rateioFixo = unidadesMes > 0 ? totalFixas / unidadesMes : 0;

  // Custo unitário antes das variáveis
  const custoBase = totalReceitas + totalEmbalagens + rateioFixo;

  // Despesas variáveis
  let totalPercentual = 0;
  let totalFixo = 0;
  const variaveisDetalhes = [];

  data.despesasVariaveis.forEach(dv => {
    if (dv.tipo === 'percentual') {
      totalPercentual += dv.valor;
    } else {
      totalFixo += dv.valor;
    }
    variaveisDetalhes.push({ nome: dv.nome, tipo: dv.tipo, valor: dv.valor });
  });

  // Preço com margem e despesas variáveis
  // Fórmula: Preço = (Custo Base + Desp Fixas) / (1 - (Margem% + DespVar% ) / 100)
  // Para simplificar: preco = custoBase / (1 - (margem + percVar) / 100) + despVarFixo
  const margem = prod.margemLucro || 30;
  const divisor = (100 - margem - totalPercentual) / 100;
  let precoSugerido = divisor > 0 ? (custoBase + totalFixo) / divisor : custoBase + totalFixo + totalFixo;

  return {
    totalReceitas,
    receitasDetalhes,
    totalEmbalagens,
    embalagensDetalhes,
    totalFixas,
    rateioFixo,
    variaveisDetalhes,
    custoUnitario: custoBase + totalFixo,
    precoSugerido
  };
}

function salvarCalculo() {
  const prodId = document.getElementById('calc-produto').value;
  if (!prodId) return;
  const prod = data.produtos.find(p => p.id === prodId);
  if (!prod) return;

  const calculo = calcularCustoProduto(prod);
  data.historico.push({
    id: gerarId(),
    produtoId: prodId,
    produtoNome: prod.nome,
    data: new Date().toISOString(),
    custoUnitario: calculo.custoUnitario,
    precoSugerido: calculo.precoSugerido,
    margem: prod.margemLucro,
    detalhes: {
      receitas: calculo.receitasDetalhes,
      embalagens: calculo.embalagensDetalhes,
      fixas: { total: calculo.totalFixas, rateio: calculo.rateioFixo },
      variaveis: calculo.variaveisDetalhes
    }
  });
  salvarDados();
  alert('Cálculo salvo no histórico! ✅');
}

// ========== HISTÓRICO ==========
function renderHistorico() {
  const list = document.getElementById('historico-list');
  if (data.historico.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">⏱️</div><h3>Nenhum cálculo salvo</h3><p>Use a calculadora e salve seus cálculos aqui</p></div>`;
    return;
  }

  list.innerHTML = [...data.historico].reverse().map(h => {
    const d = new Date(h.data);
    const dataStr = d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
    return `
      <div class="historico-item">
        <div class="historico-header">
          <span class="historico-nome">${h.produtoNome}</span>
          <span class="historico-data">${dataStr}</span>
        </div>
        <div class="historico-preco">${formatarMoeda(h.precoSugerido)}</div>
        <div class="historico-detalhes">
          Custo unitário: ${formatarMoeda(h.custoUnitario)} | Margem: ${h.margem}%
        </div>
      </div>
    `;
  }).join('');
}

// ========== METAS ==========
function htmlFormMeta(id) {
  const item = id ? data.metas.find(m => m.id === id) : null;
  return `
    <div class="form-group">
      <label>Nome da Meta</label>
      <input type="text" id="meta-nome" value="${item ? item.nome : ''}" placeholder="Ex: Comprar novo forno">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Valor Total (R$)</label>
        <input type="number" id="meta-valor" step="0.01" min="0" value="${item ? item.valorTotal : ''}" placeholder="0,00">
      </div>
      <div class="form-group">
        <label>Valor Atual (R$)</label>
        <input type="number" id="meta-atual" step="0.01" min="0" value="${item ? item.valorAtual : '0'}" placeholder="0,00">
      </div>
    </div>
  `;
}

function salvarMeta() {
  const nome = document.getElementById('meta-nome').value.trim();
  const valorTotal = parseFloat(document.getElementById('meta-valor').value) || 0;
  const valorAtual = parseFloat(document.getElementById('meta-atual').value) || 0;
  if (!nome) { alert('Informe o nome da meta'); return; }
  if (valorTotal <= 0) { alert('Informe o valor total'); return; }

  if (modalEditandoId) {
    const m = data.metas.find(x => x.id === modalEditandoId);
    if (m) { m.nome = nome; m.valorTotal = valorTotal; m.valorAtual = valorAtual; }
  } else {
    data.metas.push({ id: gerarId(), nome, valorTotal, valorAtual });
  }
  salvarDados();
  closeModal();
  renderMetas();
}

function renderMetas() {
  const list = document.getElementById('metas-list');
  if (data.metas.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🎯</div><h3>Nenhuma meta</h3><p>Defina metas financeiras para seu negócio</p></div>`;
    return;
  }
  list.innerHTML = data.metas.map(m => {
    const pct = Math.min(100, (m.valorAtual / m.valorTotal) * 100);
    return `
      <div class="meta-card">
        <div class="meta-header">
          <span class="meta-nome">${m.nome}</span>
          <div class="meta-actions" style="display:flex;gap:6px;">
            <button onclick="openModal('meta', '${m.id}')" style="background:none;border:1px solid var(--gray-200);border-radius:6px;padding:4px 8px;cursor:pointer;">✏️</button>
            <button onclick="excluirMeta('${m.id}')" style="background:none;border:1px solid var(--gray-200);border-radius:6px;padding:4px 8px;cursor:pointer;">🗑️</button>
          </div>
        </div>
        <div class="meta-valor">${formatarMoeda(m.valorAtual)} de ${formatarMoeda(m.valorTotal)}</div>
        <div class="meta-progress">
          <div class="meta-progress-bar" style="width:${pct}%"></div>
        </div>
        <div class="meta-info">
          <span>${pct.toFixed(0)}% concluído</span>
          <span>Faltam ${formatarMoeda(m.valorTotal - m.valorAtual)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function excluirMeta(id) {
  if (!confirm('Excluir esta meta?')) return;
  data.metas = data.metas.filter(m => m.id !== id);
  salvarDados();
  renderMetas();
}

// ========== DASHBOARD ==========
function renderDashboard() {
  document.getElementById('dash-materiais').textContent = data.materiais.length;
  document.getElementById('dash-receitas').textContent = data.receitas.length;
  document.getElementById('dash-produtos').textContent = data.produtos.length;
  document.getElementById('dash-calculos').textContent = data.historico.length;

  const totalCustos = data.despesasFixas.reduce((s, d) => s + d.valor, 0);
  document.getElementById('dash-custos').textContent = formatarMoeda(totalCustos);

  // Faturamento estimado (últimos cálculos)
  const faturamento = data.historico.reduce((s, h) => s + h.precoSugerido, 0);
  document.getElementById('dash-faturamento').textContent = formatarMoeda(faturamento);
}

// ========== EXPORT ==========
document.getElementById('export-btn').addEventListener('click', () => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'precocerto_dados.json';
  a.click();
  URL.revokeObjectURL(url);
});

// ========== INIT ==========
carregarDados();
navigateTo('dashboard');
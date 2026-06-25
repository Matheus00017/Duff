// ===== DROPDOWN =====
function toggleDropdown() {
  const menu = document.getElementById('dropdownMenu');
  menu.classList.toggle('open');
}

document.addEventListener('click', function(e) {
  const dropdown = document.querySelector('.dropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    document.getElementById('dropdownMenu').classList.remove('open');
  }
});

// ===== ALERTS ou MODAL =====
let currentEndpoint = '';

function openCadastro(tipo) {
  document.getElementById('dropdownMenu').classList.remove('open');
  const overlay = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const formDiv = document.getElementById('modalForm');
  const msg = document.getElementById('formMsg');
  msg.className = 'form-msg';
  msg.textContent = '';

  if (tipo === 'colaborador') {
    title.textContent = 'CADASTRAR FUNCIONARIO';
    currentEndpoint = '/api/funcionarios';
    formDiv.innerHTML = `
      <div class="form-row">
        <div class="form-group"><label>Nome completo</label><input type="text" id="f_nome" placeholder="Nome completo" required></div>
        <div class="form-group"><label>Cargo</label><input type="text" id="f_cargo" placeholder="Ex: Vendedor"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Email</label><input type="email" id="f_email" placeholder="email@exemplo.com" required></div>
        <div class="form-group"><label>Senha</label><input type="password" id="f_senha" placeholder="Senha" required></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Telefone</label><input type="text" id="f_telefone" placeholder="(11) 99999-9999"></div>
        <div class="form-group"><label>RG</label><input type="text" id="f_rg" placeholder="RG"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>CEP</label><input type="text" id="f_cep" placeholder="00000-000"></div>
        <div class="form-group"><label>Estado</label><input type="text" id="f_estado" placeholder="SP"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Cidade</label><input type="text" id="f_cidade" placeholder="Cidade"></div>
        <div class="form-group"><label>Bairro</label><input type="text" id="f_bairro" placeholder="Bairro"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Rua</label><input type="text" id="f_rua" placeholder="Rua"></div>
        <div class="form-group"><label>Numero</label><input type="text" id="f_numero" placeholder="123"></div>
      </div>
      <div class="form-group"><label>Rede Social</label><input type="text" id="f_rede" placeholder="@usuario"></div>
      <button class="btn-submit" onclick="submitForm()">Cadastrar Colaborador</button>
    `;
  } else {
    title.textContent = 'CADASTRAR EMPRESA';
    currentEndpoint = '/api/afiliados';
    formDiv.innerHTML = `
      <div class="form-row">
        <div class="form-group"><label>Nome do responsavel</label><input type="text" id="f_nome" placeholder="Nome completo" required></div>
        <div class="form-group"><label>Nome da empresa</label><input type="text" id="f_nome_empresa" placeholder="Razao social"></div>
      </div>
      <div class="form-group"><label>CNPJ</label><input type="text" id="f_cnpj" placeholder="00.000.000/0000-00"></div>
      <div class="form-row">
        <div class="form-group"><label>Email</label><input type="email" id="f_email" placeholder="email@empresa.com" required></div>
        <div class="form-group"><label>Senha</label><input type="password" id="f_senha" placeholder="Senha" required></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Telefone</label><input type="text" id="f_telefone" placeholder="(11) 99999-9999"></div>
        <div class="form-group"><label>Rede Social</label><input type="text" id="f_rede" placeholder="@empresa"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>CEP</label><input type="text" id="f_cep" placeholder="00000-000"></div>
        <div class="form-group"><label>Estado</label><input type="text" id="f_estado" placeholder="SP"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Cidade</label><input type="text" id="f_cidade" placeholder="Cidade"></div>
        <div class="form-group"><label>Bairro</label><input type="text" id="f_bairro" placeholder="Bairro"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Rua</label><input type="text" id="f_rua" placeholder="Rua"></div>
        <div class="form-group"><label>Numero</label><input type="text" id="f_numero" placeholder="123"></div>
      </div>
      <button class="btn-submit" onclick="submitForm()">Cadastrar Empresa</button>
    `;
  }

  overlay.classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

async function submitForm() {
  const msg = document.getElementById('formMsg');
  const btn = document.querySelector('.btn-submit');
  const g = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

  const body = {
    nome: g('f_nome'), email: g('f_email'), senha: g('f_senha'),
    telefone: g('f_telefone'), rede_social: g('f_rede'),
    estado: g('f_estado'), cidade: g('f_cidade'), bairro: g('f_bairro'),
    cep: g('f_cep'), rua: g('f_rua'), numero: g('f_numero'),
  };

  if (currentEndpoint === '/api/funcionarios') {
    body.cargo = g('f_cargo');
    body.rg = g('f_rg');
  } else {
    body.nome_empresa = g('f_nome_empresa');
    body.cnpj = g('f_cnpj');
  }

  if (!body.nome || !body.email || !body.senha) {
    msg.className = 'form-msg error';
    msg.textContent = 'Preencha nome, email e senha.';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Enviando...';
  msg.className = 'form-msg';
  msg.textContent = '';

  try {
    const res = await fetch(currentEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      msg.className = 'form-msg success';
      msg.textContent = data.mensagem || 'Cadastrado com sucesso!';
      btn.textContent = 'Cadastrado!';
    } else {
      msg.className = 'form-msg error';
      msg.textContent = data.erro || 'Erro ao cadastrar.';
      btn.disabled = false;
      btn.textContent = 'Tentar novamente';
    }
  } catch (err) {
    msg.className = 'form-msg error';
    msg.textContent = 'Erro de conexao com o servidor.';
    btn.disabled = false;
    btn.textContent = 'Tentar novamente';
  }
}

// ===== CATEGORIAS & PRODUTOS =====
async function loadCategories() {
  try {
    const res = await fetch('/api/tipos-bebida');
    const tipos = await res.json();
    const bar = document.getElementById('categoryBar');
    tipos.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'cat-btn';
      btn.dataset.tipo = t.id;
      btn.innerHTML = `<span class="icon">${t.icone || '🍽'}</span><span>${t.nome}</span>`;
      btn.onclick = () => filterProducts(btn, t.id);
      bar.appendChild(btn);
    });
  } catch (err) {
    console.error('Erro ao carregar categorias:', err);
  }
}

async function loadProducts(tipoId) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '<div class="loading-msg">Carregando produtos...</div>';
  try {
    const url = tipoId ? `/api/produtos?tipo=${tipoId}` : '/api/produtos';
    const res = await fetch(url);
    const produtos = await res.json();

    if (!produtos.length) {
      grid.innerHTML = '<div class="empty-msg">Nenhum produto encontrado.</div>';
      return;
    }

    grid.innerHTML = '';
    produtos.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      if (p.cor) card.style.backgroundColor = p.cor;
      const preco = parseFloat(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const imgContent = p.imagem
        ? `<img class="product-img" src="/${p.imagem}" alt="${p.nome}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">`
        + `<span class="product-emoji" style="display:none">${p.icone || '🍹'}</span>`
        : `<span class="product-emoji">${p.icone || '🍹'}</span>`;
      card.innerHTML = `
        <div class="product-img-wrap">${imgContent}</div>
        <div class="product-info">
          <div class="product-name">${p.nome}</div>
          <div class="product-type">${p.tipo}</div>
          <div class="product-unit">${p.tipo_unidade}</div>
          <div class="product-price">${preco}</div>
          <div class="product-stock">Estoque: ${p.quantidade_estoque}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = '<div class="error-msg">Erro ao carregar produtos. Verifique a API.</div>';
  }
}

function filterProducts(btn, tipoId) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadProducts(tipoId);
}

// ===== CARROSSEL =====
let carouselIndex = 0;
let carouselTimer = null;
const SLIDES_TOTAL = 4;

function updateCarousel() {
  const track = document.getElementById('carouselTrack');
  if (track) track.style.transform = `translateX(-${carouselIndex * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === carouselIndex);
  });
}

function moveCarousel(dir) {
  carouselIndex = (carouselIndex + dir + SLIDES_TOTAL) % SLIDES_TOTAL;
  updateCarousel();
}

function pauseCarousel() { clearInterval(carouselTimer); }

function resumeCarousel() {
  carouselTimer = setInterval(() => moveCarousel(1), 3000);
}

function initCarousel() {
  const dotsDiv = document.getElementById('carouselDots');
  if (!dotsDiv) return;
  for (let i = 0; i < SLIDES_TOTAL; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => { carouselIndex = i; updateCarousel(); };
    dotsDiv.appendChild(dot);
  }
  resumeCarousel();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadProducts('');
  initCarousel();
});


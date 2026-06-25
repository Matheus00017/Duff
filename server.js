require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/tipos-bebida', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, icone FROM tipos_bebida ORDER BY nome');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get('/api/produtos', async (req, res) => {
  try {
    let sql = 'SELECT p.id, p.nome, p.preco, p.quantidade_estoque, p.tipo_unidade, p.imagem, t.nome AS tipo, t.icone FROM produtos p JOIN tipos_bebida t ON p.id_tipo = t.id';
    const params = [];
    if (req.query.tipo) {
      sql += ' WHERE p.id_tipo = ?';
      params.push(req.query.tipo);
    }
    sql += ' ORDER BY t.nome, p.nome';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post('/api/funcionarios', async (req, res) => {
  const { nome, email, senha, telefone, rede_social, estado, cidade, bairro, cep, rua, numero, cargo, rg } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(senha, 10);
    const [u] = await conn.query(
      'INSERT INTO usuarios (nome,email,senha,tipo,telefone,rede_social,estado,cidade,bairro,cep,rua,numero) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [nome, email, hash, 'funcionario', telefone, rede_social, estado, cidade, bairro, cep, rua, numero]
    );
    await conn.query('INSERT INTO funcionarios (id_usuario,cargo,rg) VALUES (?,?,?)', [u.insertId, cargo, rg]);
    await conn.commit();
    res.status(201).json({ mensagem: 'Funcionario cadastrado', id: u.insertId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Email ja cadastrado' });
    res.status(500).json({ erro: err.message });
  } finally { conn.release(); }
});

app.post('/api/afiliados', async (req, res) => {
  const { nome, email, senha, telefone, rede_social, estado, cidade, bairro, cep, rua, numero, nome_empresa, cnpj } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(senha, 10);
    const [u] = await conn.query(
      'INSERT INTO usuarios (nome,email,senha,tipo,telefone,rede_social,estado,cidade,bairro,cep,rua,numero) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [nome, email, hash, 'afiliado', telefone, rede_social, estado, cidade, bairro, cep, rua, numero]
    );
    await conn.query('INSERT INTO afiliados (id_usuario,nome_empresa,cnpj) VALUES (?,?,?)', [u.insertId, nome_empresa, cnpj]);
    await conn.commit();
    res.status(201).json({ mensagem: 'Empresa cadastrada', id: u.insertId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Email ja cadastrado' });
    res.status(500).json({ erro: err.message });
  } finally { conn.release(); }
});

app.post('/api/vendas', async (req, res) => {
  const { id_produto, quantidade, id_usuario } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Busca o preço atual do produto
    const [[produto]] = await conn.query('SELECT preco, quantidade_estoque FROM produtos WHERE id = ?', [id_produto]);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
    if (produto.quantidade_estoque < quantidade) return res.status(400).json({ erro: 'Estoque insuficiente' });

    const total = produto.preco * quantidade;

    // Registra a venda
    await conn.query(
      'INSERT INTO vendas (id_produto, quantidade, preco_unitario, total, id_usuario) VALUES (?,?,?,?,?)',
      [id_produto, quantidade, produto.preco, total, id_usuario || null]
    );

    // Atualiza o estoque
    await conn.query('UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?', [quantidade, id_produto]);

    await conn.commit();
    res.status(201).json({ mensagem: 'Venda registrada', total });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ erro: err.message });
  } finally { conn.release(); }
});

// Dashboard de vendas
app.get('/api/vendas/dashboard', async (req, res) => {
  try {
    const [[totais]] = await pool.query(`
      SELECT 
        COUNT(*) AS total_vendas,
        SUM(total) AS valor_total,
        SUM(quantidade) AS produtos_vendidos
      FROM vendas
    `);

    const [por_categoria] = await pool.query(`
      SELECT t.nome AS categoria, t.icone, SUM(v.quantidade) AS quantidade, SUM(v.total) AS valor
      FROM vendas v
      JOIN produtos p ON v.id_produto = p.id
      JOIN tipos_bebida t ON p.id_tipo = t.id
      GROUP BY t.id, t.nome, t.icone
      ORDER BY valor DESC
    `);

    const [ultimas_vendas] = await pool.query(`
      SELECT 
        v.id, v.quantidade, v.total, v.criado_em,
        p.nome AS produto,
        t.nome AS categoria,
        u.nome AS funcionario
      FROM vendas v
      JOIN produtos p ON v.id_produto = p.id
      JOIN tipos_bebida t ON p.id_tipo = t.id
      LEFT JOIN usuarios u ON v.id_usuario = u.id
      ORDER BY v.criado_em DESC
      LIMIT 20
    `);

    res.json({ totais, por_categoria, ultimas_vendas });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API DUFF rodando em http://localhost:' + PORT));


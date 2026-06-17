const express        = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser   = require('cookie-parser');

const homeRoute      = require('./routes/homeRoute');
const produtoRoute   = require('./routes/produtoRoute');
const marcaRoute     = require('./routes/marcaRoute');
const categoriaRoute = require('./routes/categoriaRoute');
const usuarioRoute   = require('./routes/usuarioRoute');
const perfilRoute    = require('./routes/perfilRoute');
const loginRoute     = require('./routes/loginRoute');
const pedidoRoute    = require('./routes/pedidoRoute');
const servicoRoute   = require('./routes/servicoRoute');
const relatorioRoute = require('./routes/relatorios');
const compraRoute    = require('./routes/compraRoute');
const recebimentoRoute = require('./routes/recebimentoRoute');
const fornecedorRoute = require('./routes/fornecedorRoute');
const descarteRoute = require('./routes/descarteRoute');
const promocaoRoute = require('./routes/promocaoRoute');
const agendamentoRoute = require('./routes/agendamentoRoute');

const AuthMiddleware = require('./middlewares/authMiddleware');

const app = express();

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('layout', './layout');
app.use(expressLayouts);
app.use(cookieParser());

app.use('/login',   loginRoute);
app.use('/',        homeRoute);
app.use('/produto', produtoRoute);
app.use('/pedido',  pedidoRoute);
app.use('/agendamento', agendamentoRoute);

const auth = new AuthMiddleware();
app.use(auth.verificarUsuarioLogado);

app.use('/marcas',        marcaRoute);
app.use('/categorias',    categoriaRoute);
app.use('/usuarios',      usuarioRoute);
app.use('/perfis',        perfilRoute);
app.use('/servicos',      servicoRoute);
app.use('/relatorios',    relatorioRoute);
app.use('/compras',       compraRoute);
app.use('/recebimentos',  recebimentoRoute);
app.use('/fornecedores',  fornecedorRoute);
app.use('/descartes',     descarteRoute);
app.use('/promocoes',     promocaoRoute);
app.use('/agendamentos',  agendamentoRoute);

global.CAMINHO_IMG     = '/img/produtos/';
global.CAMINHO_IMG_ABS = __dirname + '/public/img/produtos/';

app.listen(5000, () => console.log('Servidor Vitalis iniciado em http://localhost:5000'));

const express = require('express');
const HomeController = require('../controllers/homeController');
const AuthMiddleware = require('../middlewares/authMiddleware');

const homeRouter = express.Router();

let ctrl = new HomeController();
let auth = new AuthMiddleware();
homeRouter.get('/', ctrl.homeView);
homeRouter.get("/admin", auth.verificarUsuarioLogado, ctrl.adminHomeView);

module.exports = homeRouter;
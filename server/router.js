const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getCurrentAccount', mid.requiresLogin, controllers.Account.getCurrentAccount);
  app.post('/getDomos', mid.requiresLogin, controllers.Domo.getDomos);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/maker', mid.requiresLogin, controllers.Domo.makerPage);
  app.get('/account', mid.requiresLogin, controllers.Account.accountPage);
  app.get('/history', mid.requiresLogin, controllers.Domo.historyPage);
  app.post('/maker', mid.requiresLogin, controllers.Domo.make);
  app.post('/deleteDomo', mid.requiresLogin, controllers.Domo.delete);
  app.post('/linkAccount', mid.requiresLogin, controllers.Account.linkAccount);
  app.post('/updateCompleted', mid.requiresLogin, controllers.Domo.updateCompleted);
  app.post('/setLinkPass', mid.requiresLogin, controllers.Account.setLinkPass);
  app.post('/getLinked', mid.requiresLogin, controllers.Account.getLinked);
  app.post('/newWeek', mid.requiresLogin, controllers.Domo.newWeek);
  app.post('/changePass', mid.requiresLogin, controllers.Account.changePass);
  app.post('/subscribe', mid.requiresLogin, controllers.Account.subscribe);
  app.post('/unlinkChild', mid.requiresLogin, controllers.Account.unlinkChild);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;

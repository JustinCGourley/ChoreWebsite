const models = require('../models');

const Account = models.Account;

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

const accountPage = (req, res) => {
  res.render('appAccount', { csrfToken: req.csrfToken() });
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (request, responce) => {
  const req = request;
  const res = responce;

  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }
    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/maker' });
  });
};

const signup = (request, responce) => {
  const req = request;
  const res = responce;

  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;
  req.body.type = `${req.body.type}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2 || !req.body.type) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
      type: req.body.type,
      subscription: false,
      currentWeek: 1,
    };

    if (accountData.type === 'Child') {
      accountData.link = 'none';
    } else {
      accountData.linkPass = 'none';
    }

    const newAccount = new Account.AccountModel(accountData);
    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      return res.json({ redirect: '/maker' });
    });
    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      return res.status(400).json({ error: 'An error occured' });
    });
  });
};

const setLinkPass = (request, response) => {
  const req = request;
  const res = response;

  const user = { _id: req.session.account._id };
  const newData = { linkPass: req.body.linkPass };
  Account.AccountModel.findOneAndUpdate(user, newData, (err) => {
    if (err) {
      return res.json({ status: false, error: err });
    }
    return res.json({ status: true });
  });
};

const getCurrentAccount = (request, response) => {
  const req = request;
  const res = response;
  const account = req.session.account;
  Account.AccountModel.findByUsername(account.username, (err, data) => {
    if (err) {
      console.log(`Error: ${err}`);
      return;
    }

    const accountData = {
      user: data.username,
      type: data.type,
      subscription: data.subscription,
      currentWeek: data.currentWeek,
    };

    if (accountData.type === 'Child') {
      accountData.link = data.link;
    }

    res.json({ data: accountData });
  });
};

const linkAccount = (request, response) => {
  const req = request;
  const res = response;

  const user = req.body.name;
  const pass = req.body.pass;
  Account.AccountModel.findByUsername(user, (err, data) => {
    if (err || !data) {
      return res.json({ error: 'No account found', status: false });
    }

    if (data.type === 'Parent') {
      if (pass !== data.linkPass) {
        return res.json({ status: false, error: 'Bad Password Given' });
      }

      const query = { _id: req.session.account._id };
      const newData = { link: data._id, currentWeek: data.currentWeek };
      return Account.AccountModel.findOneAndUpdate(query, newData, (err2, docs) => {
        if (err2) {
          return res.json({ status: false, error: err2 });
        }
        req.session.account = Account.AccountModel.toAPI(docs);
        return res.json({ status: true });
      });
    }
    return res.json({ error: 'Must link to a Parent account', status: false });
  });
};

const getAllLinked = (request, response) => {
  const req = request;
  const res = response;

  const search = { link: req.session.account._id };

  Account.AccountModel.findAllLinked(search, (err, data) => {
    if (err) {
      console.log(err);
      return res.json({ status: false, error: err });
    }

    return res.json({ status: true, data });
  });
};

const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfToken = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfToken);
};

module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.getToken = getToken;
module.exports.getCurrentAccount = getCurrentAccount;
module.exports.linkAccount = linkAccount;
module.exports.accountPage = accountPage;
module.exports.setLinkPass = setLinkPass;
module.exports.getLinked = getAllLinked;

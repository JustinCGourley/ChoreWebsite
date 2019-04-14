const models = require('../models');

const Account = models.Account;

// renders the login page
const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};
// renders the account page
const accountPage = (req, res) => {
  res.render('appAccount', { csrfToken: req.csrfToken() });
};
// logs out current user
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// logs in current user
const login = (request, responce) => {
  const req = request;
  const res = responce;

  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // makes sure user and pass are correct
  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }
    req.session.account = Account.AccountModel.toAPI(account);
    // information pass -> send user to main screen
    return res.json({ redirect: '/maker' });
  });
};

// signs up user based on given info
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

  // setup an account and save to the database
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

// changes users password
const changePass = (request, response) => {
  const req = request;
  const res = response;

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const query = { _id: req.session.account._id };
    const change = { salt, password: hash };
    return Account.AccountModel.findOneAndUpdate(query, change, { new: true }, (err, data) => {
      if (err) {
        console.log('unable to find account');
        return res.status(400).json({ error: err });
      }

      req.session.account = data;
      return res.json({ status: true });
    });
  });
};

// sets the users link password (only available for parent accounts)
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

// returns the user who is currently logged in
// (only returns username, type, week, and subscription status)
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

    // return linked account if current account is a child
    // will also return linked parent subscription status if account is type child
    if (accountData.type === 'Child') {
      accountData.link = data.link;

      if (data.link === 'none') {
        res.json({ data: accountData });
        return;
      }

      const query = { _id: data.link };
      Account.AccountModel.findOne(query, (errG, parentAccount) => {
        if (errG) {
          return res.status(400).json({ error: 'Something went wrong' });
        }

        accountData.subscription = parentAccount.subscription;
        return res.json({ data: accountData });
      });
    } else {
      accountData.linkSet = (data.linkPass !== 'none');

      res.json({ data: accountData });
    }
  });
};

// links a child account to a given parent account if one exists
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

// returns all linked children accounts based on users id
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

// sets subcription to active of current account
const subscribe = (request, response) => {
  const req = request;
  const res = response;

  const query = { _id: req.session.account._id };
  const dataG = { subscription: true };

  Account.AccountModel.findOneAndUpdate(query, dataG, { new: true }, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: err, status: false });
    }
    return res.json({ data, status: true });
  });
};

// returns the current users csrf token
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
module.exports.changePass = changePass;
module.exports.subscribe = subscribe;

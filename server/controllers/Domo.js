const models = require('../models');

const Domo = models.Domo;

// returns the main page (logged in)
const makerPage = (req, res) => {
  Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    return res.render('app', { domos: docs, csrfToken: req.csrfToken() });
  });
};

// returns the history page
const historyPage = (req, res) => {
  Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    return res.render('appHistory', { domos: docs, csrfToken: req.csrfToken() });
  });
};

// create a chore based on input
const makeDomo = (req, res) => {
  if (!req.body.title || !req.body.cost || !req.body.day) {
    return res.status(400).json({ error: 'All *  fields are required.' });
  }

  // setup data based on input and current account
  const domoData = {
    title: req.body.title,
    cost: req.body.cost,
    description: req.body.description,
    owner: req.session.account._id,
    day: req.body.day,
    completed: 'false',
    weekSet: req.session.account.currentWeek,
  };

  const newDomo = new Domo.DomoModel(domoData);
  const domoPromise = newDomo.save();

  domoPromise.then(() => res.json({ redirect: '/maker' }));

  domoPromise.catch((err) => {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists' });
    }

    return res.status(400).json({ error: 'an error occured' });
  });

  return domoPromise;
};

// updates a chore to be completed
const updateCompleted = (request, response) => {
  const req = request;
  const res = response;

  const query = { _id: req.body.id };
  const newData = { completed: req.body.set };

  return Domo.DomoModel.findOneAndUpdate(query, newData, (err) => {
    if (err) {
      console.log('unable to find domo');
      return res.json({ error: err, status: false });
    }
    return res.json({ status: true });
  });
};

// sorts through each chore and gives back only chores of a given week
const sortDomosByWeek = (res, domos, week) => {
  const domosForWeek = [];
  for (let i = 0; i < domos.length; i++) {
    if (`${domos[i].weekSet}` === `${week}`) {
      domosForWeek.push(domos[i]);
    }
  }
  return res.json({ domos: domosForWeek });
};

// returns chore list
const getDomos = (request, response) => {
  const req = request;
  const res = response;

  let accountGrab = req.session.account._id;

  if (req.body.type === 'Child') {
    accountGrab = req.body.link;
  }
  // grab chores from parent if account is child type
  return Domo.DomoModel.findByOwner(accountGrab, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }

    if (req.body.type === 'Child') {
      const searchQuery = { _id: accountGrab };
      return models.Account.AccountModel.findOne(searchQuery, (err2, parentAccount) => {
        if (err2) {
          console.log(`Error: ${err2}`);
          return res.status(400).json({ error: err2, status: false });
        }
        const week = parentAccount.currentWeek;
        return sortDomosByWeek(res, docs, week);
      });
    }

    const week = (req.body.week) ? req.body.week : req.session.account.currentWeek;
    return sortDomosByWeek(res, docs, week);
  });
};

// sets up new week when a week is finished
// duplicates exisiting chores for current week,
// incremenets week and sets all duplicates to new week
const setupNewWeek = (request, response) => {
  const req = request;
  const res = response;

  Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    const domos = [];
    for (let i = 0; i < docs.length; i++) {
      if (docs[i].weekSet === req.session.account.currentWeek) {
        domos.push(docs[i]);
      }
    }
    const error = null;

    for (let i = 0; i < domos.length; i++) {
      const domoData = {
        title: domos[i].title,
        cost: domos[i].cost,
        description: domos[i].description,
        owner: req.session.account._id,
        day: domos[i].day,
        completed: 'false',
        weekSet: req.session.account.currentWeek + 1,
      };

      const newDomo = new Domo.DomoModel(domoData);
      newDomo.save();
    }

    if (error != null) {
      return res.json({ status: false, error });
    }

    const search = { _id: req.session.account._id };
    const newData = { currentWeek: req.session.account.currentWeek + 1 };
    return models.Account.AccountModel.findOneAndUpdate(
      search, newData, { new: true }, (err2, data) => {
        if (err2) {
          console.log(err2);
          return res.json({ status: false, error: err2 });
        }
        req.session.account = data;
        return res.json({ status: true });
      });
  });
};


// deletes a given chore
const deleteDomo = (request, response) => {
  const req = request;
  const res = response;

  const done = Domo.DomoModel.remove(req.body);

  if (done) {
    return res.json({ done });
  }

  return false;
};

module.exports.getDomos = getDomos;
module.exports.makerPage = makerPage;
module.exports.make = makeDomo;
module.exports.delete = deleteDomo;
module.exports.updateCompleted = updateCompleted;
module.exports.newWeek = setupNewWeek;
module.exports.historyPage = historyPage;

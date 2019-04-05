const models = require('../models');

const Domo = models.Domo;

const makerPage = (req, res) => {
  Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    return res.render('app', { domos: docs, csrfToken: req.csrfToken() });
  });
};

const makeDomo = (req, res) => {
  console.log(req.body);
  if (!req.body.title || !req.body.cost || !req.body.description || !req.body.day) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const domoData = {
    title: req.body.title,
    cost: req.body.cost,
    description: req.body.description,
    owner: req.session.account._id,
    day: req.body.day,
    completed: 'false',
  };

  console.log(domoData);

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

const getDomos = (request, response) => {
  const req = request;
  const res = response;

  let accountGrab = req.session.account._id;

  if (req.body.type === 'Child') {
    console.log('grabbing from child');
    accountGrab = req.body.link;
  }

  console.log(`looking from ${accountGrab}`);
  return Domo.DomoModel.findByOwner(accountGrab, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    return res.json({ domos: docs });
  });
};

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
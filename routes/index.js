const express = require('express');
const Negotiator = require('negotiator');
const router = express.Router();
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const optional = require('optional');
const gp = require('g11n-pipeline')
  .getClient(
    optional('./local-config.json') ||
    {appEnv: appEnv});
const gpBundle = gp.bundle(appEnv.name);


console.log('bundle = ', appEnv.name);

gpBundle.getInfo({}, function(err, data) {
  languages = [];
  if(err) {
    console.error('Could not load langs: ' + err);
  } else {
    console.dir(data);
    languages = data.targetLanguages || [];
    languages.push(data.sourceLanguage);
  }
  router.get('/langs', function(req, res, next) {
    res.send(languages);
  });
  /* GET home page. */
  router.get('/', function(req, res, next) {
    var negotiator = new Negotiator(req);
    console.dir(negotiator.languages());
    gpBundle.getStrings({ languageId: negotiator.language(languages)}||'en',
         function (err, result) {
            if(err) return res.send(err);
            res.render('index', { title: result.resourceStrings.title, 
              date: new Date().toLocaleString(negotiator.languages()) });
         });
  });
});

module.exports = router;

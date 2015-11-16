"use strict"
const request = require('request'),
  express = require('express'),
  session = require('express-session'),
  bodyParser = require('body-parser'),
  provisionerType = 'amg'

let app = express()
app.use( session({ secret: 'asdfasdf'}) )
app.set('view engine', 'jade')
app.set('views', './views')

app.use( bodyParser.json() )
  .use( bodyParser.urlencoded({extended: true}) )
  .use( function(err, req, res, next){
    if(err){
      console.log(err)
      res.status(400).send('malformed')
    }
  })
  .use(express.static('public'))

app.listen( process.env.PORT || 3000)

app.get('/', function(req,res){
  req.session.referer = req.header('Referer');
  res.render('index')
})

app.post('/email-exists', function(req,res){
  let email = req.body.email

  if( !email || email.length < 1 ) return res.status(400).send('bad email')
  req.session.email = email

  api( '/service/externalUser/doesUserExist', {email: email, provisionerType: provisionerType})
    .then( function(user){
      req.session.user = user
      if(user != 'not found') {
        req.session.user = user
      }else{
        req.session.user = null
      }

      res.redirect('/sweep')
    })
    .catch( function(err){
      req.session.user = ''
      res.redirect('/')
    })
})

app.get('/sweep', function(req, res){
  let email = req.session.email

  if( !email ) res.redirect('/')

  res.render('sweep', {
    email: req.session.email,
    exists: (req.session.user && req.session.user.exists)
  })
})

app.post('/enter-sweep', function(req,res){
  let body = req.body

  if(body.password){
    let user_req = body
    body.site = "SLF"
    body.provisionerType = 'amg'
    body.registrationSource = 'CNEE_SLF'
    api('/service/externalUser/provision', user_req)
      .then(function(created){
        console.log('created registration', created)
      })
      .catch(function(err){
        console.log('error registration', err)
      })
  }

  body.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  body.referer = req.session.referer
  body.url = 'http://' + req.hostname  + req.url

  sweepStake(body)
    .then(function(entered){
      res.send({
        code: 200
      })
      //res.redirect('/thank-you')
    })
    .catch(function(err){
      //res.redirect('/sweep?error=' + err[0].error['@message'])
      res.send({
        code: 400,
        error: err[0].error
      })
    })
})

app.get('/thank-you', function(req,res){
  res.render('thank-you')
})


function api(url, request_param){
  console.log(url, request_param)
  return new Promise(function(resolve, reject){
    let base_api = 'https://stag-cnid.condenastdigital.com'

    request({
      url: base_api + url,
      method: 'POST',
      oauth: {
        consumer_key: '4ffd9314-37dd-4293-b3ba-903df5a5d0dd',
        consumer_secret: 'f5c99d6b-5154-4e3d-b14e-01c38304eada'
      },
      json: request_param
    }, function(err,res,body){
      if(err) return reject(err)
      if(res.statusCode != 200) return resolve(res.statusMessage)

      resolve(body)
    })
  })
}

function sweepStake(params){
  return new Promise(function(resolve, reject){
    const url = 'https://stag-user-service.condenastdigital.com/open/sweepstake/self_toneitup_stcroix/entries'

    let entry = {
      '@address1': params['@address1'],
      '@city': params['@city'],
      '@countryCode': 'US',
      '@stateCode': params['@state'],
      '@zipCode': params['@zip'],
      '@firstname': params['@firstName'],
      '@lastname': params['@lastName'],
      '@email': params.email
    }

    entry.entryContext = {
      '@application': 'sweep_batch_upload',
      '@formName': 'self-toneup-challenge',
      '@siteCode': 'SLF',
      '@ip': params.ip,
      '@referer': params.referer,
      '@url': params.url
    }

    entry.customFieldValues = {
      '@sponsor_optin': params.optin,
      '@accept_terms': params.rules
    }

    let json = {
        sweepstakeEntry: {
          userEntry: entry
/*          newsletterSubscriptions:{
            newsletterSubscription:[
              {"@newsletterId": "100", "@subscribe": "true"}
            ]
          }*/
        }
      }
    }
    
    console.log(url, json)
    request({
      url: url,
      method: 'POST',
      headers:{
        key: 'q2yDfnAvgzJZjry6cA/WnUxcvPY='
      },
      /*oauth: {
        consumer_key: 'q2yDfnAvgzJZjry6cA/WnUxcvPY=',
        consumer_secret: '9ut1bWIJkH81ihkSoZ1z3e5VOw0='
      },*/
      json: json, function(err,res,body){
      if(err) return reject(err)
      if(res.statusCode != 200 && res.statusCode != 201) return reject(body)

      resolve(body)
    })
  })
}

function apiCreateUser(){
  api('/service/externalUser/provision', {"email":uuid.v4() +"@testnewyorker.com",
    "password": "123123", "site":"SLF", "provisionerType":"amg",
    "address1":"1166 Sixth Ave",
    "registrationSource":"CNEE_SLF"} )

  request(requestObject, function(error, response, rawResponse){
    console.log("Response for user creation call");
    let amgUuid = response.body.externalId;
    console.dir(rawResponse);
    setTimeout(function(){performAPILogin();}, 1000);
  });

};

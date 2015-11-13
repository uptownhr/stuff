"use strict"
const request = require('request'),
  express = require('express'),
  bodyParser = require('body-parser'),
  provisionerType = 'amg'

let app = express()
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

app.post('/email-exists', function(req,res){
  let email = req.body.email
  console.log(req.body)

  if( !email || email.length < 1 ) return res.status(400).send('bad email')

  api( '/service/externalUser/doesUserExist', {email: email, provisionerType: provisionerType})
    .then( function(user){
      console.log(user['@email'], user)
      if(user == 'not found'){
        res.status(400).send(user)
      }else{
        res.send(user)
      }
    })
    .catch( function(err){
      res.status(400).send(err)
    })
})

app.post('enter-sweep', function(req,res){
  let body = this.body
  sweepStake(body)
    .then(function(entered){
      res.send(entered)
    })
    .catch(function(err){
      res.status(400).send(err)
    })
})


function api(url, request_param){
  return new Promise(function(resolve, reject){
    let base_api = 'https://stag-cnid.condenastdigital.com'
    console.log(base_api + url, request_param)
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
      if(res.statusCode != 200) return reject(res.statusMessage)

      resolve(body)
    })
  })
}

function sweepStake(params){
  const url = 'https://stag-user-service.condenastdigital.com/open/sweepstake/self_toneitup_stcroix/entries'

  let entry = params
  entry.entryContext = {
    '@application': 'sweep_batch_upload',
    '@formName': '',
    '@siteCode': '',
    '@ip': '',
    '@referer': '',
    '@url': ''
  }


  request({
    url: url,
    method: 'POST',
    oauth: {
      consumer_key: '',
      consumer_secret: ''
    },
    json: {
      sweepstakeEntry: {
        userEntry: entry
      }
    }
  }, function(err,res,body){
    if(err) return reject(err)
    if(res.statusCode != 200) return reject(res.statusMessage)
  })
}

function apiCreateUser(){
  let requestObject = requestConfigObject();
  createSpacer();
  console.log("Actual user creation");
  requestObject.url = cnidAssembledBaseUrl + "/service/externalUser/provision";
  requestObject.method = "POST";
  requestObject.json = {"email":uuid.v4() +"@testnewyorker.com",
    "password": "123123", "site":"SLF", "provisionerType":"amg",
    "address1":"1166 Sixth Ave",
    "registrationSource":"CNEE_SLF"};

  console.log("Request for user creation");
  console.dir(requestObject);
  request(requestObject, function(error, response, rawResponse){
    console.log("Response for user creation call");
    amgUuid = response.body.externalId;
    console.dir(rawResponse);
    setTimeout(function(){performAPILogin();}, 1000);
  });

};
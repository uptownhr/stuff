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

  request({
    method: "POST",
    url: "http://condenast-specialprojects.com/self/add_info.php",
    form: { email: email }
  }, function(err,res,body){
    if(err) console.log(err)
    console.log('response from specialprojects.com', body)
  })

  api( '/service/externalUser/doesUserExist', {email: email, provisionerType: provisionerType})
    .then( function(user){
      console.log('check user response', user.exists)
      let registered = user.exists? '1':'0'

      res.redirect('/sweep?email=' + email + '&registered=' + registered)
    })
    .catch( function(err){
      res.redirect('/')
    })


  /*
  request params for news letter
   */
  let params = {
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    referer: req.session.referer,
    url: 'http://' + req.hostname,
    email: email
  }

  newsletter(params).then( function(res){
    console.log('newsletter response', res)
  })
})

app.get('/sweep', function(req, res){
  let email = req.query.email,
    registered = req.query.registered

  console.log(email,registered)

  if( !email ) res.redirect('/')

  res.render('sweep', {
    email: email,
    exists: registered
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
        console.log('registration response', created)
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
    })
    .catch(function(err){
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
  return new Promise(function(resolve, reject){
    let base_api = 'https://cnid.condenastdigital.com'

    console.log(base_api + url, JSON.stringify(request_param) )

    request({
      url: base_api + url,
      method: 'POST',
      oauth: {
        consumer_key: '967d4a75-7565-4000-ba8f-99a2ba94e6ae',
        consumer_secret: 'e3351359-bf79-49ac-b145-8c1da1a86224'
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
    const url = 'https://user-service.condenastdigital.com/open/sweepstake/self_toneitup_stcroix/entries'

    let entry = {
      '@address1': params['@address1'],
      '@city': params['@city'],
      '@countryCode': 'US',
      '@stateCode': params['@state'],
      '@zipCode': params['@zip'],
      '@firstName': params['@firstName'],
      '@lastName': params['@lastName'],
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

    entry.customFieldValues = [
      {
        'customFieldValue': {
          '@name': 'optin',
          '@value': params.optin? 'true': 'false',
          '@type': 'TEXT'
        }
      },
      {
        'customFieldValue': {
          '@name': 'rules',
          '@value': 'true',
          '@type': 'TEXT'
        }
      },
      {
        'customFieldValue': {
          '@name': '3rdpartyid',
          '@value': '248721',
          '@type': 'TEXT'
        }
      }
    ]

    let json = {
      sweepstakeEntry: {
        userEntry: entry,
        newsletterSubscriptions:{
          newsletterSubscription:[
            {"@newsletterId": "248721", "@subscribe": "true"}
          ]
        }
      }
    }
    

    console.log(url, JSON.stringify(json) )
    request({
        url: url,
        method: 'POST',
        headers: {
          key: 'JezBoyaQZaYXeEP6KCPnOcz1mP0='
        },
        /*oauth: {
         consumer_key: 'q2yDfnAvgzJZjry6cA/WnUxcvPY=',
         consumer_secret: '9ut1bWIJkH81ihkSoZ1z3e5VOw0='
         },*/
        json: json
      },
      function(err,res,body){
        console.log('sweepstake response', body)
        if(err) return reject(err)
        if(res.statusCode != 200 && res.statusCode != 201) return reject(body)

        resolve(body)
      }
    )
  })
}

function newsletter(params){
  return new Promise(function(resolve, reject) {
    const url = 'https://user-service.condenastdigital.com/open/newsletter/entries'

    let json = {
      "newsletterSubscriptionsRequest":{
        "@email":params.email,
        "entryContext":{
          '@application': 'sweep_batch_upload',
          '@formName': 'self-toneup-challenge',
          '@siteCode': 'SLF',
          "@ip": params.ip,
          "@referer": params.referer,
          "@url": params.url
        },
        "newsletterSubscriptions":{
          "newsletterSubscription":[
            {"@newsletterId":"248719","@subscribe":"true"}
          ]
        }
      }
    }

    console.log(url, JSON.stringify(json) )

    request({
        url: url,
        method: 'POST',
        headers: {
          key: 'JezBoyaQZaYXeEP6KCPnOcz1mP0='
        },
        json: json
      },
      function(err,res,body){
        if(err) return reject(err)
        if(res.statusCode != 200 && res.statusCode != 201) return reject(body)

        resolve(body)
      }
    )
  })
}
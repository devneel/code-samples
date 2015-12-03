 // Devneel Vaidya
 // * Created February 2015
 // * Updated October 2015
 
 // * The code samples below are from HowsMyProfile.com, a node.js/Express.js app where women review mens' online dating profiles
 // * The first sample (postScreener) happens after a potential reviewer from Amazon Turk takes a screener to see if they qualify to provide feedback. 
 // * Only females with a preference for males are allowed to leave feedback. The sample shows use of async to keep callbacks in order.
 // * The second sample shows a mail send function for notifying a user that his feedback report is ready


 // * This app is live at HowsMyProfile.com



 

//////////////
// SAMPLE 1 //
//////////////

// POST survey screener
// The survey screener qualifies the user to see if they are allowed to proceed: they must be female and prefer dating males
// Now that the user has taken the screener, the submission is passed to this function to  see if the user qualifies to actually review the dating profile

exports.postScreener = function(req, res, next) {
    // the submissionID is the id of this screener's submission for this particular user
    var submissionID = req.session.submissionID.toString()

    // if this is the first time the user is on the screener, create the alreadyTriedArray in the session
    if (!req.session.alreadyTriedArray) {
        req.session.alreadyTriedArray = [];
    }

    // create an array to store the user's session if they pass, so they can skip the screener for this particular profile next time
    if (!req.session.alreadyPassedArray) {
        req.session.alreadyPassedArray = [];
    }

    // store the details of the user's answers to the screener in thisQualTestResult
    var thisQualTestResult = new QualTestResult({
            sessionID: req.sessionID,
            date: Date.now(),
            submissionID: submissionID,
            gender: req.body.gender,
            preference: req.body.preference,
            age: req.body.age,
            state: req.body.state
        })
        
    // we must use async because the following functions must execute before we redirect
    async.series([
        // first save the thisQualTestResult if the screener for this has not already been filled
        function(callback) {
            if (req.session.alreadyTriedArray.indexOf(submissionID) < 0) { // user hasn't tried yet
                thisQualTestResult.save(function(err) {
                    if (err) return err;
                    callback(null, 'Saved Qual Test Result')
                })
            } else {
                callback(null, 'Did not save thisQualTestResult because user has already tried on this submission')
            }
        },
        // next, see if the user qualifies
        function(callback) {
            if (req.session.alreadyTriedArray.indexOf(submissionID) < 0) { //if user hasn't already tried
                req.session.alreadyTriedArray.push(submissionID) // save that submission into the session to keep track of the user's try
                if (req.body.gender == 'Female' && req.body.preference == 'Men') { //if user passes screener

                    req.session.alreadyPassedArray.push(submissionID) // user has passed - add them to the alreadyPassedArray so they don't have to take the screener again
                    redirectTo = '/review-start'
                    callback(null, 'User qualifies - redirecting to review-start')
                } else {
                    redirectTo = '/qual'
                    callback(null, 'User didn not qualify because gender is ' + req.body.gender + ' and pref is ' + req.body.preference + ' - redirecting to qual')
                }
            } else if (req.session.alreadyPassedArray.indexOf(submissionID) > -1) {
                redirectTo = '/review-start'
                callback(null, 'User has previously qualified - redirecting to review-start')
            } else {
                redirectTo = '/qual'
                callback(null, 'User has already tried to qualify but did not succeed - redirecting to qual')
            }
        }
    ], function(err, results) {
        if(err) return err;
        // Redirect the user to the appropriate page
        // If the user passed the screener, then redirect to the start page for the review (/review-start)
        // If the user failed the screener, redirect to failure page (/qual)
        console.log('redirecting to')
        console.log(redirectTo)
        res.redirect(redirectTo)
    });
}



//////////////
// SAMPLE 2 //
//////////////

// After the profile uploader's report is ready, an email notification is sent to the profile uploader
// This is the function for sending that email

var path           = require('path') // npm path module for resolving templateDir
  , templatesDir   = path.resolve(__dirname, '../../views', 'templates') // location of templates
  , emailTemplates = require('email-templates') //npm module for email templates


function getDLOSource(dlo_source) {
  // prettify the dlo_source so it looks professional in the email (it will read as "Your dlo_source profile report is ready!")
  switch(dlo_source) {
    case "tinder":
      dlo_source = "Tinder"
      break
    case "okcupid":
      dlo_source = "OKCupid"
      break
    case "pof":
      dlo_source = "PlentyOfFish"
      break
    case "match":
      dlo_source = "Match.com"
      break
    default:
      dlo_source = 'Online Dating'
  }

  return dlo_source;
}

exports.sendMailReportReady = function(req, name, email, dlo_source, callback) {
  var email_template = 'report_ready'

  // Save the email to be sent in the database for reference
  var sentMail = new Mail({
    sessionID : req.sessionID,
    name : name,
    email : email,
    emailTemplate : emailTemplate,
    sendDate : Date.now()

  })
  sentMail.save(function(err) {
    if(err) return err;
    

    // Prepare the report_ready template
    emailTemplates(templatesDir, function(err, template) {

      if (err) {
        console.log('error on templatesDir' + err);
      } else {
   
        // Prepare nodemailer transport object
       var transport = nodemailer.createTransport({
       service: 'Mandrill',
          auth: {
           user: secrets.mandrill.user,
           pass: secrets.mandrill.password
          }
        });
        


        // Prepare the locals to be used in the email
        var locals = {
          email: email,
          name: name,
          firstName: name.substr(0,name.indexOf(' ')),
          dlo_source : getDLOSource(dlo_source),
          appInfo : secrets.appInfo
        };

        // Send the notification email
        template(email_template, locals, function(err, html, text) {
          if (err) {
            console.log(email_template + ' error is ' + err);
          } else {
            transport.sendMail({
              from: secrets.appInfo.name + ' <' + secrets.appInfo.email +'>',
              to: locals.email,
              subject: locals.firstName + ', your ' + locals.dlo_source + ' profile review is ready at ' + secrets.appInfo.name,
              html: html,
              generateTextFromHTML: true,
              text: text
            }, function(err, responseStatus) {
              if (err) {
                console.log('error is : ' + err);
              } else {
                console.dir(responseStatus)
                console.log('Sent email to ' + locals.name + ' at address ' + locals.email)
                callback()
              }
            });
          }
        });
      }
    })
  })
}
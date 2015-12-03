/* This code is from my first node.js/express.js app - HowsMyTrack
// This app provides feedback to musicians
// It is live at howsmytrack.herokuapp.com

// I had my first experience with callback hell in this app
// If I used the async library, or even the Bluebird module for promises, this code would have been much cleaner
// Also, I've combined my logic with my routes, which makes the code more messy and less modular

*/


// Set up Express and get router
var express = require('express');
var cookieParser = require('cookie-parser');
var router = express.Router();
var app = express();
var FeedbackPageMethods = require('../helpers/FeedbackPageMethods'); // custom methods for CRUD+ Feedback Page Methods
var FeedbackFormMethods = require('../helpers/FeedbackFormMethods'); // custom methods for CRUD+ Feedback Form Methods
var userMethods = require('../helpers/UserMethods'); // custom methods for CRUD+ user methods
var mailMethods = require('../helpers/MailMethods'); // custom methods for CRUD+ mail methods
var embedly = require('embedly') // for embedding soundcloud/youtube/etc links to tracks
var util = require('util'); // helps embedly
var ObjectID = require('mongodb').ObjectID
var expstate = require('express-state') // allows us to Share configuration and state data of an Express app with the client-side via JavaScript.
var sc = require('soundclouder') // for embedding sc tracks from sc login
var async = require('async')

expstate.extend(app)


// Create variable ensureLoggedIn that allows us to wall pages behind authentication
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

var EMBEDLY_KEY = 'XXX';



module.exports = function(passport) {

	// Pages requiring auth
	// GET My Songs page
	router.get('/', ensureLoggedIn('/users/login-flash'), function(req, res) {
		var db = req.db;
		console.log('req user is ' + req.user._id)
		FeedbackPageMethods.findAllByUser(req.user._id, function(err, items) {
			res.render('view-submitted-feedback-pages', {
				pageData: items,
				message: req.flash('message'),
				user: req.user,
				activePage : 'myResults'
			})
		});
	});


	// GET page for single track view. This page will also contain the feedback form
	router.get('/view-track-form/:id', function(req, res) {
		auth = require('../config/auth')
		FeedbackPageMethods.findById(req.params.id, function(error, feedbackPageData) {
			res.render('single-feedback-page-form', {
				pageData: feedbackPageData,
				user: req.user,
				message: req.flash('message'),
				nosignin: 'true',
				submessage: req.flash('submessage'),
				scClientID: auth.soundcloudAuthProd.clientID

			})


		})
	});


	// GET page for public giving of feedback. Has buttons for next track
	router.get('/give-feedback', function(req, res) {
		auth = require('../config/auth')

		var currentUserID = req.user ? req.user._id.toString() : ''

		// get all trackids that have been already given feedback for by current user
		req.db.collection('answered').find({
			'feedback_giver': currentUserID
		}).toArray(function(error, alreadyAnsweredSongs) {
			if (error) return error

			// array of trackids already answered by current user
			var alreadyAnsweredSongsIDs = []
			if(alreadyAnsweredSongs.length > 0) {
				for (var i = 0; i < alreadyAnsweredSongs.length; i++) {
					var answeredSongID = ObjectID(alreadyAnsweredSongs[i].track_id.toString())
					alreadyAnsweredSongsIDs.push(answeredSongID)
				}
			}	

			// sort tracklist by users comment balance desc (highest first) and last comment received asc (oldest first)
			req.db.collection('songlist').find({
				_id: {
					$nin: alreadyAnsweredSongsIDs
				},
				user_id: {
					$ne: currentUserID
				}
			}).sort({
				usersCommentBalance: -1,
				lastCommentReceived: 1

			}).toArray(function(err, tracksInDescCommentBalanceOrder) {
				if (err) return err


				// find a track with the user that is at the top of the returned list of users
				if (tracksInDescCommentBalanceOrder.length > 0) {

					//keep looking for a track that the user hasn't already graded
					res.render('single-feedback-page-form-public', {
						pageData: tracksInDescCommentBalanceOrder,
						user: req.user,
						pageOwner: req.flash('pageOwner'),
						nosignin: 'true',
						submessage: req.flash('submessage'),
						scClientID: auth.soundcloudAuthProd.clientID,
						activePage : 'giveFeedback'

					})

				} else {
					console.log('Could not find any users. Returning empty==\'true\'')
					res.render('single-feedback-page-form-public', {
						user: req.user,
						pageOwner: req.flash('pageOwner'),
						nosignin: 'true',
						submessage: req.flash('submessage'),
						scClientID: auth.soundcloudAuthProd.clientID,
						activePage : 'giveFeedback',
						empty: 'true'
					})
				}
			})
		})

	});

	// GET page for single track results view. 
	router.get('/view-track-results/:id', ensureLoggedIn('/users/login-flash'), function(req, res) {
		FeedbackFormMethods.findAllFormsForId(req.params.id, function(error, feedbackFormData) {

			// for sc id
			auth = require('../config/auth')
			// Get all additional feedback and emailsinto a separate array
			var additionalFeedback = []
			var emailsArray = []
			
			// for npsbar chart
			var npsData = []
			for (var i = 0; i <= 10; i++) {
				iString = i.toString()
				npsData.push([iString, 0])
			}

			//keep track of cumulative score
			var cumulativeScore = 0
				// for NPS calculation
			var promoters = 0
			var detractors = 0
			var passives = 0

			for (var i = 0; i < feedbackFormData.length; i++) {

				// additional feedback
				if (feedbackFormData[i].additionalFeedback) {
					additionalFeedback.push({
						'comment': feedbackFormData[i].additionalFeedback,
						'nps': parseInt(feedbackFormData[i].nps)
					})
				}

				// emails
				if (feedbackFormData[i].email) {
					emailsArray.push({
						'email': feedbackFormData[i].email,

					})
				}

				if (parseInt(feedbackFormData[i].nps) >= 9) {
					promoters++
				} else if (parseInt(feedbackFormData[i].nps) <= 6) {
					detractors++
				} else passives++


					// nps bar chart
					
					for (var z = 0; z < npsData.length; z++) {
						if (npsData[z][0].toString() === feedbackFormData[i].nps.toString()) {
							npsData[z][1]++
							cumulativeScore += parseInt(feedbackFormData[i].nps)
							console.log('npsData z 0 is ' + npsData[z][0].toString())
							console.log('feedbackFormData nps ' + feedbackFormData[i].nps.toString())

						}
					}

			}

			// array sorting function
			function sortByKeyDesc(array, key) {
				return array.sort(function(a, b) {
					var x = a[key];
					var y = b[key];
					return ((x > y) ? -1 : ((x < y) ? 1 : 0));
				});
			}

			additionalFeedback = sortByKeyDesc(additionalFeedback, 'nps')


			var npsScore = ((promoters / feedbackFormData.length) - (detractors / feedbackFormData.length)) * 100

			var npsGrades = [
				[-86.7 , 'F-', 'warning'],
				[-73.3 , 'F', 'warning'],
				[-60.0 , 'F+', 'warning'],
				[-46.7 , 'D-', 'warning'],
				[-33.3 , 'D', 'warning'],
				[-20 , 'D+', 'warning'],
				[-6.7 , 'C-', 'warning'],
				[6.7 , 'C', 'warning', ],
				[20 , 'C+', 'warning', 'Not Bad'],
				[33.3 , 'B-', 'success', 'Alright'],
				[46.7 , 'B', 'success','Good job'],
				[60.0 , 'B+', 'success', 'Nice'],
				[73.3 , 'A-', 'success', 'Great!'],
				[86.7 , 'A', 'success', 'Awesome!'],
				[100 , 'A+', 'success','Fantastic!']
			]


			var npsLetterGrade = []
			for(var i = 0; i < npsGrades.length; i++) {
				if(parseInt(npsScore) < parseInt(npsGrades[i][0])) {
					npsLetterGrade.push(npsGrades[i][1])
					npsLetterGrade.push(npsGrades[i][2])
					npsLetterGrade.push(npsGrades[i][3])
					break;
				}
			}

			var promotersPercent = (promoters / feedbackFormData.length) * 100
			var detractorsPercent = (detractors / feedbackFormData.length) * 100


			FeedbackPageMethods.findById(req.params.id, function(error, feedbackPageData) {
				res.render('single-feedback-page-results', {
					trackData: feedbackPageData,
					responsesData: feedbackFormData,
					user: req.user,
					additionalFeedback: additionalFeedback,
					emailsArray: emailsArray,
					npsData: npsData,
					scClientID: auth.soundcloudAuthProd.clientID,
					cumulativeScore: cumulativeScore,
					npsScore: npsScore,
					promotersPercent: promotersPercent,
					detractorsPercent: detractorsPercent,
					promoters: promoters,
					detractors: detractors,
					passives: passives,
					npsLetterGrade: npsLetterGrade
				})
			})
		})
	});

	// GET users uploaded tracks

	/* GET Feedback Submit page. */
	router.get('/add-feedback-page', ensureLoggedIn('/users/login-flash'), function(req, res) {
		if (req.user.soundcloud_token) {
			sc.get('/me/tracks', req.user.soundcloud_token, function(error, scData) {
				res.render('add-feedback-page', {
					title: 'Add Feedback Page',
					frontMessage: req.flash('message'),
					user: req.user,
					trackList: scData,
					activePage : 'getFeedback'
				})
			})
		} else {
			res.render('add-feedback-page', {
				title: 'Add Feedback Page',
				frontMessage: req.flash('message'),
				user: req.user,
				activePage : 'getFeedback'
			})

		}

	});

	/*
		POST to submitted feedback page
	 */
	router.post('/submitted-feedback-page-processing', ensureLoggedIn('/users/login-flash'), function(req, res) {

		var db = req.db;
		req.body.date = Date.now()


		new embedly({
			key: EMBEDLY_KEY
		}, function(err, api) {
			if (!!err) {
				console.error('Error creating Embedly api');
				console.error(err.stack, api);
				return;
			}

			var urls = [req.body.yourSong]
			opts = {
				urls: urls,
				maxWidth: 450,
				wmode: 'transparent',
				method: 'after'
			};

			api.oembed(opts, function(err, objs) {
				if (!!err) {
					console.error('Embedly request failed');
					console.error(err.stack, objs);
					console.log('there is no req body')
					req.flash('message', 'Invalid link provided for your track.')
					res.redirect('/feedback/add-feedback-page')

					return;
				}

				if (!objs[0].html) {
					req.flash('message', "Invalid link provided for your track.")
					res.redirect('/feedback/add-feedback-page')
					console.error('Invalid urls provided')
					return
				}
				console.log('Got the request for ' + req.body.yourSong + ' vs' + req.body.competingSong);

				// all data provided by embedly module for YourSong
				req.body.user_id = req.user._id.toString()
				if (req.user.facebook_id) {
					req.body.user_facebook_id = req.user.facebook_id
				}
				req.body.ys_title = objs[0].title

				req.body.ys_description = objs[0].description
				req.body.ys_givenUrl = objs[0].url

				req.body.ys_author_name = objs[0].author_name
				req.body.ys_author_url = objs[0].author_url

				req.body.ys_height = objs[0].height
				req.body.ys_width = objs[0].width

				req.body.ys_html = objs[0].html

				req.body.ys_provider_name = objs[0].provider_name
				req.body.ys_provider_url = objs[0].provider_url

				req.body.ys_thumbnail_url = objs[0].thumbnail_url
				req.body.ys_thumnbnail_height = objs[0].thumbnail_height
				req.body.ys_thumbnail_width = objs[0].thumbnail_width
				req.body.ys_type = objs[0].type

				req.body.firstName = req.user.firstName
				req.body.lastCommentReceived = new Date()

				// get users comment balance to include with the track
				db.collection('user').findOne({
					_id: ObjectID(req.user._id.toString())
				}, function(err, returnedUser) {
					if (err) return err
					req.body.usersCommentBalance = returnedUser.commentBalance


					FeedbackPageMethods.save(req.body, function(err, docsInserted) {
						if (err) return err;
						FeedbackPageMethods.findLatestOneByUserID(req.body.user_id, function(error, results) {
							if (error) {
								return error
							}
							db.collection('user').update({
								_id: ObjectID(req.user._id.toString())
							}, {
								$inc: {
									numUploads: 1
								}
							}, function(err, updatedUserNumUploads) {
								if (err) return err
							})
							var trackInsertedID = results[0]._id
							res.redirect('/feedback/view-track-form/' + trackInsertedID)
						})
					});
				})
			})
		})
	});

	/*
		POST to submitted feedback page
	 */
	router.post('/submitted-feedback-page-processing-using-sc', ensureLoggedIn('/users/login-flash'), function(req, res) {

		var db = req.db;
		req.body.date = Date.now()
		var trackid = req.body.yourSong_sc_trackid
		sc.get('/tracks/' + trackid, req.user.soundcloud_token, function(error, scData) {
			if (error) return error
			req.body.fromSC = 'true'
			req.body.user_id = req.user._id.toString()
			if (req.user.facebook_id) {
				req.body.user_facebook_id = req.user.facebook_id
			}
			req.body.ys_title = scData.title

			req.body.ys_description = scData.description
			req.body.ys_givenUrl = scData.permalink_url

			req.body.ys_author_name = scData.user.username
			req.body.ys_author_url = scData.user.permalink_url
			req.body.ys_secret_url = scData.secret_uri


			req.body.ys_provider_name = 'Soundcloud'
			req.body.ys_provider_url = 'Soundcloud.com'

			req.body.ys_thumbnail_url = scData.artwork_url ? scData.artwork_url : scData.user.avatar_url
			req.body.ys_thumnbnail_height = scData.thumbnail_height
			req.body.ys_thumbnail_width = scData.thumbnail_width
			req.body.ys_type = scData.type
			req.body.firstName = req.user.firstName
			req.body.lastCommentReceived = new Date()


			// get users comment balance to include with the track
			db.collection('user').findOne({
				_id: ObjectID(req.user._id.toString())
			}, function(err, returnedUser) {
				if (err) return err
				req.body.usersCommentBalance = returnedUser.commentBalance

				FeedbackPageMethods.save(req.body, function(err, docsInserted) {
					if (err) return err;
					FeedbackPageMethods.findLatestOneByUserID(req.body.user_id, function(error, results) {
						if (error) {
							return error
						}
						db.collection('user').update({
							_id: ObjectID(req.user._id.toString())
						}, {
							$inc: {
								numUploads: 1
							}
						}, function(err, updatedUserNumUploads) {
							if (err) return err
						})
						var trackInsertedID = results[0]._id
						console.log("trackInsertedID is " + trackInsertedID)
						console.log("Now redirecting to /view-track-form/" + trackInsertedID)
						req.flash('submessage', "We'll email you in a couple days with the status of your <a href='/view-track-results/" + trackInsertedID + "'>results</a>.")
						res.redirect('/feedback/view-track-form/' + trackInsertedID)
					})
				});
			})
		})
	})


	/*
		POST to submitted feedback form processing
	 */
	router.post('/submitted-feedback-form-processing', function(req, res) {

		var loggedInUser = req.user // currently logged in user
		var fromTheForm = req.body // all data from the feedback page form
		var db = req.db;
		fromTheForm.date = Date.now()

		if (loggedInUser && loggedInUser._id.toString() == fromTheForm.user_id.toString()) {
			req.flash('message', 'You can\'t comment on your own tracks!')
			res.redirect('/feedback/view-track-form/' + fromTheForm.trackid)
		} else {
			FeedbackFormMethods.save(fromTheForm, function(err, insertedFeedbackForm) {
				if (err) return err;

				FeedbackPageMethods.findById(fromTheForm.trackid, function(err, pageLinkedToForm) {	
					if (err) return err;
					var pageOwnersID = pageLinkedToForm[0].user_id // owner of the feedback page that was just commented on
					async.parallel([

						function(callback) {
							// current user has just given feedback for this track. keep track of that
							db.collection('answered').save({
								'track_owner': pageOwnersID,
								'track_id': insertedFeedbackForm.trackid,
								'feedback_giver': loggedInUser ? loggedInUser._id.toString() : '000',
								'given_on': new Date()
							}, function(err, result) {
								if (err) return err;
								callback()
							})
							
						},

						function(callback) {
							// update lastCommentReceived for this track
							pageLinkedToForm[0].lastCommentReceived = new Date()
							FeedbackPageMethods.save(pageLinkedToForm[0], function(err, result) {
								if (err) {return err};
								callback()
							})
							
						},

						function(callback) {
							// add one to comment balance if user is logged in and the current track doesn't belong to that user
							if (loggedInUser && pageOwnersID.toString() != loggedInUser._id.toString()) {
								userMethods.adjustCommentBalance(1, req, loggedInUser._id, function(err, updatedUser) {
									if (err) {return err};
									// update all comment balances in tracklist for logged in  user (comment giver)
									FeedbackPageMethods.updateCommentBalance(loggedInUser._id,updatedUser.commentBalance, function(err,updatedPages) {
										callback()
									})
								})
							} else {
								callback()
							}
						},

						function(callback) {
							// subtract one from comment balance for whichever user uploaded this track
							userMethods.adjustCommentBalance(-1, req, pageOwnersID, function(err, updatedUser) {
								if (err) {return err};
								// update all comment balances in tracklist for comment receving user
								FeedbackPageMethods.updateCommentBalance(pageOwnersID,updatedUser.commentBalance, function(err,updatedPages) {
									callback()	
								})
								
							})
							
						}

					], function(err) {
						if (err) {return next(err)};
						db.collection('user').findOne({
							_id : ObjectID(pageOwnersID.toString())
						}, function(err, pageOwner) {
							if (err) {return next(err)};
							req.flash('pageOwner', pageOwner.firstName)
							res.redirect('/feedback/give-feedback/')
						})

					})

				})

			});
		}

	});
	return router;
}
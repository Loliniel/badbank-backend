const express = require('express');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const app = express();
const cors = require('cors');
const dal = require('./dal.js');
const e = require('express');
const google = require('googleapis').google;
const jwt = require('jsonwebtoken');
const config = require('./config');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var userProfile;


app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: config.JWTsecret
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());



passport.use(new GoogleStrategy({
	clientID: config.CLIENT_ID,
	clientSecret: config.CLIENT_SECRET,
	callbackURL: "/auth/google/callback"
}, function (accessToken, refreshToken, profile, done) {
	console.log(`profile = ${JSON.stringify(profile, null, 4)}`);
	userProfile = profile;
	return done(null, userProfile);
}
));


// used to serve static files from public directory
app.use(express.static('public'));
app.use(cors());



const isLoggedIn = (req, res, next) => {
	if (req.user) {
		next();
	} else {
		res.sendStatus(401);
	}
}

var logout = function () {
	return function (req, res, next) {
		req.logout();
		delete req.session;
		next();
	};
};


/*
 *  Google auth callback routes
 */

app.get('/get_some_data', function (req, res) {
	console.log(`userProfile = ${JSON.stringify(userProfile, null, 4)}`);
	res.send(userProfile);
});


app.get('/logout', function (req, res, next) {
	console.log('logging user out');

	req.session.destroy(function (err) {
		console.log('logging out and destroying session');
		res.clearCookie('username');
		res.clearCookie('email');
		res.clearCookie('accessLevel');
		res.clearCookie('_id');
		//res.clearCookie('__stripe_mid');
		//res.redirect('/');
		return res.status(200).json({
			ok: true,
			data: "use logged out"
		});
	});

	/*req.logout(function(err) {
		if(err) {
			return next(err);
		}
		res.redirect('/');
	});*/
});


app.get('/auth/google', passport.authenticate('google', {
	scope: ['profile', 'email'],
	session: false
}));


app.get('/auth/google/callback',
	passport.authenticate('google', 
		{ session: false, failureRedirect: 'http://localhost:3000' }),
	function(req, res) {
		console.log(`inside authenticate function ${JSON.stringify(req.user, null, 4)}`);
		res.cookie('email', userProfile.emails[0].value, { httpOnly: false, sameSite: true });
		res.cookie('login', 'google', { httpOnly: false, sameSite: true });
		
/*
		dal.find(userProfile.emails[0].value).
		then((users) => {
			console.log(`number of users: ${users.length}`);
			if (users.length > 0) {
				//test = "hello";
				//resolve(users[0]);
/*						_id = users[0]._id;
				user.name = 'hello';
				user._id = users[0]._id;
				console.log(`_id = ${users[0]._id}`);
				//user = (({name, email, accessLevel}) => ({name, email, accessLevel}))(users[0]);
				console.log(`logging user ${users[0].name} in`);
				res.cookie('name', users[0].name, { httpOnly: false, sameSite: true });
				res.cookie('email', users[0].email, { httpOnly: false, sameSite: true });
				res.cookie('_id', users[0]._id, { httpOnly: false, sameSite: true });
				res.cookie('accessLevel', users[0].accessLevel, { httpOnly: false, sameSite: true });*/
				//res.redirect(config.CLIENT_URL);*/
				/*return res.status(200).json({
					ok: true,
					data: user
				});
			}
		});*/
		res.redirect('http://localhost:3000');
	});


app.get('/connect/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// create user account
app.get('/user/create/:name/:email/:password', function (req, res) {

	// check if account exists
	dal.find(req.params.email).
		then((users) => {

			// if user exists, return error message
			if (users.length > 0) {
				console.log('User already in exists');
				res.send('User already in exists');
			}
			else {
				// else create user
				dal.create("local", req.params.name, req.params.email, req.params.password).
					then((user) => {
						console.log(user);
						res.send(user);
					});
			}

		});
});


// login user 
app.post('/user/login', function (req, res, next) {
	const email = req.body.email;
	const password = req.body.password;

	console.log(`email = ${email}`);
	console.log(`password = ${password}`);
	
	console.log(`searching for user: ${email}`);
	dal.find(email).
		then((users) => {
			console.log(`number of users: ${users.length}`);
			if (users.length > 0) {
				if ((users[0].password === password) && (users[0].type === "local")) {
					console.log(`_id = ${users[0]._id}`);
					let user = (({_id, name, email, accessLevel}) => ({_id, name, email, accessLevel}))(users[0]);
					console.log(`logging user ${users[0].name} in`);
					res.cookie('name', user.name, { httpOnly: false, sameSite: true });
					res.cookie('email', user.email, { httpOnly: false, sameSite: true });
					res.cookie('_id', user._id, { httpOnly: false, sameSite: true });
					res.cookie('accessLevel', user.accessLevel, { httpOnly: false, sameSite: true });
					return res.status(200).json({
						ok: true,
						data: user
					});
					//res.redirect('/');
				} else {
					return res.status(200).json({
						ok: false,
						data: "wrong password"
					});
				}
			}
			return res.status(200).json({
				ok: false,
				data: "no user found"
			});
		});
});

// find user account
app.get('/user/find/:email', function (req, res) {
	dal.find(req.params.email).
		then((users) => {
			if(users.length > 0) {
				let user = (({_id, name, email, accessLevel}) => ({_id, name, email, accessLevel}))(users[0]);
				console.log(`User: ${JSON.stringify(user, null, 4)}`);
				return res.status(200).json({
					ok: true,
					data: user
				});
				//res.send(user);
			}

		return res.status(200).json({
			ok: false,
			data: "no user found"
		});
	});
});

// find one user by email - alternative to find
/*app.get('/user/findOne/:email', function (req, res) {

	dal.findOne(req.params.email).
		then((user) => {
			console.log(user);
			res.send(user);
		});
});*/


// update - deposit/withdraw amount
app.get('/user/update/:email/:amount', function (req, res) {

	var amount = Number(req.params.amount);

	dal.update(req.params.email, amount).
		then((response) => {
			console.log(response);
			res.send(response);
		});
});

// all accounts
app.get('/user/all', function (req, res) {

	dal.all().
		then((docs) => {
			console.log(docs);
			res.send(docs);
		});
});


app.get('/accounts/find/:email', function (req, res) {
	console.log(`accounts/${req.params.email}`);
	dal.findAccounts(req.params.email).
		then((accounts) => {
			if(accounts.length > 0) {
				console.log(`${accounts.length} account(s) found.`);
				return res.status(200).json({
					ok: true,
					data: accounts
				});
				//res.send(user);
			}
			return res.status(200).json({
				ok: false,
				data: "no user found"
			});
		});
	});



app.get('/accounts/create/:email/:type', function (req, res) {
	console.log(`accounts/create/${req.params.email}`);
	const email = req.params.email;
	const type = ((req.params.type==='savings') || (req.params.type==='checking'))?req.params.type:'checking';

	dal.accountCreate(email, type)
	.then((account) => {
		console.log(`account = ${JSON.stringify(account, null, 4)}`);
		return res.status(200).json({
			ok: true,
			data: account
		});
	})
	.catch((err) => {
		return res.status(200).json({
			ok: false,
			data: err
		});
	});
});


app.get('/accounts/deposit/:accountNumber/:amount', function (req, res) {
	console.log(`accounts/deposit/${req.params.email}`);
	const accountNumber = req.params.accountNumber;
	const amount = req.params.amount;

	dal.accountDeposit(accountNumber, amount)
	.then((account) => {
		console.log(`account = ${JSON.stringify(account, null, 4)}`);
		//res.send(account);
		return res.status(200).json({
			ok: true,
			data: account.value
		});
	})
	.catch((account) => {
		return res.status(200).json({
			ok: false,
			data: account.value
		});
	});
});


app.get('/accounts/withdraw/:accountNumber/:amount', function (req, res) {
	console.log(`accounts/withdraw/${req.params.accountNumber}`);
	const accountNumber = req.params.accountNumber;
	const amount = req.params.amount;

	dal.accountWithdraw(accountNumber, amount)
	.then((account) => {
		console.log(`account = ${JSON.stringify(account, null, 4)}`);
		return res.status(200).json({
			ok: true,
			data: account
		});
	})
	.catch((account) => {
		return res.status(200).json({
			ok: false,
			data: account
		});
	});
});



app.get('/accounts/highest', function (req, res) {
	console.log(`highest account number`);
	dal.highestAccountNumber()
		.then((account) => {
			console.log(`/accounts/highest111 = ${JSON.stringify(account, null, 4)}`);
			res.send(account);
		});
});


app.get('/accounts/transfer/:accountFrom/:accountTo/:amount', function (req, res) {
	const accountFrom = Number(req.params.accountFrom);
	const accountTo = Number(req.params.accountTo);
	const amount = Number(req.params.amount);

	//Check if all the paramters are actual numbers and return error if so
	if( (Number.isNaN(accountFrom)) ||
		(Number.isNaN(accountTo)) ||
		(Number.isNaN(amount))) {
			console.log(`Error: account transfer, number is not valid`);
			const errString = "Error: account transfer " +
							  (Number.isNaN(accountFrom)?"accountFrom, ":"") + 
							  (Number.isNaN(accountTo)?"accountTo, ":"") +
							  (Number.isNaN(amount)?"amount ":"") + 
							  "is not a valid number.";

			return res.status(200).json({
				ok: false,
				data: errString
			});
	}

	console.log(`account transfer from account #${accountFrom} to account #${accountTo} for $${amount}`);

	const accountFromData = dal.accountInfo(accountFrom)
								.then((data) => {
									if(data == null) {
										console.log(`Error finding account information`);
										return null;
									}
									console.log(`accountInfo returned ${JSON.stringify(data, null, 4)}`);
									return data;
								})
								.catch((err) => {
									console.log(`err = ${err}`);
									return err;
								});

	console.log(`accountFromData = ${accountFromData}`);
	console.log(`accountFromData typeof = ${typeof accountFromData}`);
	if(accountFromData._id === null) {
		return res.status(200).json({
			ok: false,
			data: `Error: accountFrom is not a valid account`
		});
	}

	//Check if account has enough funds for transfer
	console.log(`Balance is ${accountFromData.balance}`);	
	if(Number(accountFromData.balance) < amount) {
		const errString = `Error: not enough funds in account #${accountFrom} for transfer.`
		console.log(errString);

		return res.status(200).json({
			ok: false,
			data: errString
		});
	}

	//Ensure that the target account exists.
	const accountToData = dal.accountInfo(accountTo)
								.then((data) => {
									if(data == null) {
										console.log(`Error finding account information`);
										return null;
									}
									console.log(`accountInfo returned ${JSON.stringify(data, null, 4)}`);
									return data;
								})
								.catch((err) => {
									console.log(`err = ${err}`);
									return err;
								});
								
	console.log(`accountToData = ${accountToData}`);
	console.log(`accountToData typeof = ${typeof accountFromData}`);

	if(accountToData._id === null) {
		return res.status(200).json({
			ok: false,
			data: `Error: accountTo is not a valid account`
		});
	}

	console.log(`accountToData = ${JSON.stringify(accountToData, null, 4)}`);


	//Withdraw funds from origin account
	const withdrawResult = dal.accountWithdraw(accountFrom, amount)
							  .then((data) => { return data })	
							  .catch((err) => { return err });

	const depositResult = dal.accountDeposit(accountTo, amount)
							 .then((data) => { return data })
							 .catch((err) => { return err });

	console.log(`withdrawResult = ${withdrawResult}`);
	console.log(`depositResult = ${depositResult}`);

	return res.status(200).json({
		ok: true,
		data: `account transfer successful`
	});
});



app.get('/accounts/info/:accountNumber', function (req, res) {
	console.log(`account info`);

	dal.accountInfo(req.params.accountNumber)
		.then((account) => {
			//console.log(`account info: ${account}`);//${JSON.stringify(account, null, 4)}`);
			
			if(account === null) {
				console.log(`account info is null`);
				return res.status(200).json({
					ok: false,
					data: null
				});
			}

			return res.status(200).json({
				ok: true,
				data: account
			});
		})
		.catch((account) => {
			return res.status(200).json({
				ok: false,
				data: account
			});
		});
});

//var port = 3001;

app.listen(config.port);
console.log('Running on port: ' + config.port);

passport.serializeUser(function (user, cb) {
	cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
	cb(null, obj);
});
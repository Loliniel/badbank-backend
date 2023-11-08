const config = require('./config');
const MongoClient = require('mongodb').MongoClient;
//const url         = 'mongodb://localhost:27017';
//const url         = 'mongodb://ec2-18-232-152-188.compute-1.amazonaws.com:27017';
let db            = null;
 
// connect to mongo
MongoClient.connect(config.baseURL, {useUnifiedTopology: true}, function(err, client) {
    console.log("Connected successfully to db server");

    // connect to myproject database
    db = client.db('myproject');
});

// create user account
function create(type, name, email, password){
    return new Promise((resolve, reject) => {    
        const collection = db.collection('users');
		const pw = (password!==null?password:"");
        const doc = {type, name, email, password: pw, 'accessLevel': 'user'};
        collection.insertOne(doc, {w:1}, function(err, result) {
            err ? reject(err) : resolve(doc);
        });
    })
}


/*function getId(email) { 
	return new Promise((resolve, reject)) => {
		const customers = db
			.collection('users')
			.findOne({email: email})
			.then((doc) => resolve(doc.data.data._id)/**/

function findAccounts(email) {
	return new Promise((resolve, reject) => {
		const accounts = db
			.collection('accounts')
			.find({user: email})
			.toArray(function(err, docs) {
				resolve(docs);
		});
	});
}


function accountInfo(accountId) {
	return new Promise((res, rej) => {
		const accountInfo = db
			.collection('accounts')
			.findOne({}, {_id: accountId})
            .then((doc) => resolve(doc))
            .catch((err) => reject(err));
	});
}


function highestAccountNumber() {
	return new Promise((resolve, reject) => {
		console.log(`highestAccountNumber()`);
		const accountNumber = db
			.collection('accounts')
			.findOne({ accountNumber: { $gt:0 } }, {sort: { accountNumber: -1 }})
			.then((doc) => resolve(doc))
			.catch((err) => reject(err));
	});
}


function accountInfo(_accountNumber) {
	_accountNumber = Number(_accountNumber);

	return new Promise((resolve, reject) => {
		console.log(`accountInfo()`);
		const accountNumber = db
			.collection('accounts')
			.findOne({ accountNumber: _accountNumber })
			.then((doc) => resolve(doc))
			.catch((err) => reject(err));
	});
}


function accountCreate(email, type) {
	return new Promise((resolve, reject) => {
		const newAccount = db
			.collection('accounts')
			.findOne({ accountNumber: { $gt:0 } }, {sort: { accountNumber: -1 }}, function(err, data) {
				if(data) {
					//console.log(`data = ${JSON.stringify(data, null, 4)}`);
					console.log(`highest account number = ${data.accountNumber}`);
					//const accountNumber = data.accountNumber;
					const doc = { user: email, accountNumber: data.accountNumber+1, balance: 0, type: type };

					db.collection('accounts')
						.insertOne(doc, {w:1}, function(err, result) {
							err ? reject(err) : resolve(doc);
						});
				}
		});

		/*.then((doc) => resolve(doc))
		.catch((err) => reject(err));*/

		//console.log(`accountNumber(accountCreate): ${JSON.stringify(accountNumber, null, 4)}`);
		//console.log(`accountNumber(accountCreate): ${accountNumber}`);
		

			//.findOne({}, {sort: { accountNumber: -1 }});
		
		//console.log(`account number = ${JSON.stringify(accountNumber, null, 4)}`);
	});
}


function accountBalanceUpdate(accountId, amount) {
	return new Promise((resolve, reject) => {
		const deposit = db
			.collection('accounts')
			.findOneAndUpdate(
				{_id: accountId},
				{ $inc: { balance: ammount}},
				{ returnOriginal: false },
				function (err, docs) {
					err ? reject(err) : resolve(docs);
				}
			);
	});

}


function accountDeposit(_accountNumber, amount) {
	console.log(`accountDeposit`);

	amount = Number(amount);
	_accountNumber = Number(_accountNumber);

	return new Promise((res, rej) => {
		const result = db
		.collection('accounts')
		.findOneAndUpdate(
			{accountNumber: _accountNumber},
			{ $inc: { balance: amount}},
			{ returnOriginal: false },
			function (err, docs) {
				err ? rej(err) : res(docs);
			}
		);
	});
}


function accountWithdraw(_accountNumber, amount) {
	console.log(`accountWithdraw`);

	amount = Number(amount);
	_accountNumber = Number(_accountNumber);

	return new Promise((resolve, reject) => {
		//console.log(`highestAccountNumber()`);
		const accountData = db
			.collection('accounts')
			.findOne({}, { accountNumber: _accountNumber }, (err, data) => {
				if(data.balance>=amount) {
					const updated = db
					.collection('accounts')
					.findOneAndUpdate(
						{ accountNumber: _accountNumber },
						{ $inc: { balance: (amount*-1)}},
						{ returnOriginal: false },
						function (err, docs) {
							err ? reject(err) : resolve(docs);
						}
					);					
					resolve(data);//`balace = ${data.balance} and withdrawal amount = ${amount}`);
				} else {
					console.log(`Error: balace = ${data.balance} and withdrawal amount = ${amount}`);
					reject(data)
				}
				reject(data);
			});
	});
}

/*	return new Promise((res, rej) => {
		const result = db
		.collection('accounts')
		.findOneAndUpdate(
			{accountNumber: accountNumber},
			{ $decc: { balance: amount}},
			{ returnOriginal: false },
			function (err, docs) {
				err ? rej(err) : res(docs);
			}
		);
	});*/




function accountTransfer(accountFrom, accountTo, amount) {

	return new Promise((resolve, reject) => {
		//console.log(`highestAccountNumber()`);
		const accountTransferStatus = db
			.collection('accounts')
			.findOne({}, { accountNumber: _accountNumber }, (err, data) => {
				if(data.balance>=amount) {
					const updated = db
					.collection('accounts')
					.findOneAndUpdate(
						{ accountNumber: _accountNumber },
						{ $inc: { balance: (amount*-1)}},
						{ returnOriginal: false },
						function (err, docs) {
							err ? reject(err) : resolve(docs);
						}
					);					
					resolve(data);//`balace = ${data.balance} and withdrawal amount = ${amount}`);
				} else {
					console.log(`Error: balace = ${data.balance} and withdrawal amount = ${amount}`);
					reject(data)
				}
				reject(data);
			});
	});
	/*return new Promise((resolve, reject) => {
	}*/
}


// find user account
function find(email){
    return new Promise((resolve, reject) => {    
        const customers = db
            .collection('users')
            .find({email: email})
            .toArray(function(err, docs) {
                //err ? reject(err) : resolve(docs);
				resolve(docs);
        });    
    })
}

// find user account
function findOne(email){
    return new Promise((resolve, reject) => {    
        const customers = db
            .collection('users')
            .findOne({email: email})
            .then((doc) => resolve(doc))
            .catch((err) => reject(err));    
    })
}

// update - deposit/withdraw amount
function update(email, amount){
    return new Promise((resolve, reject) => {    
        const customers = db
            .collection('users')            
            .findOneAndUpdate(
                {email: email},
                { $inc: { balance: amount}},
                { returnOriginal: false },
                function (err, documents) {
                    err ? reject(err) : resolve(documents);
                }
            );            


    });    
}

// all users
function all(){
    return new Promise((resolve, reject) => {    
        const customers = db
            .collection('users')
            .find({})
            .toArray(function(err, docs) {
                err ? reject(err) : resolve(docs);
        });    
    })
}




module.exports = { create, findOne, findAccounts, find, update,
	all, accountInfo, accountBalanceUpdate, accountTransfer,
	accountCreate, highestAccountNumber, accountWithdraw,
	accountDeposit, accountInfo };
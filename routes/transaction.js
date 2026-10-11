const express = require('express');
const router = express.Router();
const data = require('../data');
const fs = require('fs');
 

router.get('/location', (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({ error: 'city query parameter is required' });
    }

    const transactions = data.filter(transaction => transaction.location.city === city);
    res.json(transactions);
});

 /** give total credit and dibit transtion to a user with name and userId */
 router.get('/user',(req,res)=>{
    const userId = Number(req.query.userId);
    if (Number.isNaN(userId)) {
        return res.status(400).json({ error: 'userId query parameter is required and must be a number' });
    }
    const user = data.find(transaction => transaction.userId === userId);
    if (!user) {
        return res.status(400).json({ error: 'user not found' });
    }   
    const userName = user.userName;
     
    const creditTransactions = data.filter(transaction => transaction.userId === userId && transaction.txnType === 'credit');
    const debitTransactions = data.filter(transaction => transaction.userId === userId && transaction.txnType === 'debit');
    const totalCredit = creditTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount.replace('$', '')), 0);
    const totalDebit = debitTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount.replace('$', '')), 0);
    res.json({userName, userId, totalCredit, totalDebit });
});
//* Get all users with their total credit and dibit transtion  aand with report.json file with name and userId and totalCredit and totalDebit
router.get('/report',(req,res)=>{
    const users = data.map(transaction => transaction.userId);
    const userNames = data.map(transaction => transaction.userName);
    const totalCredit = data.reduce((sum, transaction) => sum + parseFloat(transaction.amount.replace('$', '')), 0);
    const totalDebit = data.reduce((sum, transaction) => sum + parseFloat(transaction.amount.replace('$', '')), 0);
    //fs.writeFileSync('report.json', JSON.stringify({users, userNames, totalCredit, totalDebit}, null, 2));
    res.json({ users, userNames, totalCredit, totalDebit });
});
 
 
module.exports = router;
'use strict';
const mongoose = require('mongoose');
const { response } = require('../server');
const bcrypt = require('bcrypt')
const DB = mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true, ignoreUndefined: true });

const fetch = require('node-fetch'),
      ipSchema = new mongoose.Schema({ ip: String, stocks: [String] }),
      stockSchema = new mongoose.Schema({ stock: String, likes: Number }),
      Ips = mongoose.model('IP', ipSchema),
      Stocks = mongoose.model('Stocks', stockSchema),
      lookUpUrl = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/';

async function getStocks(stocks) {

    const result = fetch(`${lookUpUrl}${stocks}/quote`)
        .then(response => response.json())
        .then(json => json)
    return result
};


async function checkIp(ip, stock) {
    
    const newIp = ip.split('.').slice(0, -1).join('.') + '.0'
    const result = await Ips.findOne({ ip: newIp })
    if (await !result) {
        Ips.create({ ip: newIp, stocks: stock })
        return true;
    }
    if (await result.stocks.includes(stock)) {
        return false}
    else {
        Ips.updateOne({ ip: newIp}, { $push: { 'stocks': stock } }).exec()
        return true;
    }
}

async function findStocks(stock, ip, likes) {


    let result = Stocks.findOne({ stock: stock }).exec()
    if (await result) {
        if (likes) {
            if(await checkIp(ip, stock)) {
            Stocks.updateOne({ stock: stock}, { $inc: { 'likes': 1 } }).exec()
            }
        }
    }
    else {
        likes
            ? await Stocks.create({ stock: stock, likes: 1 })
            : await Stocks.create({ stock: stock, likes: 0 })
        result = await Stocks.findOne({ stock: stock }).exec()
    }
    return result

}

module.exports = function(app) {

    app.route('/api/stock-prices')
        .get(async function(req, res) {
            const { stock, likes } = req.query
            const ip = req.ip
            let stocks = [];

            typeof stock == 'string'
                ? stocks.push(stock)
                : stocks = req.query.stock


            const stockData = { stockData: [] }

            await Promise.all(stocks.map(async e => {
                if (!/^[^\s]+$/.test(e)) {return res.json({ error: 'invalid stock' })
                }

                const foundStock = await findStocks(e, ip, true)
                const stockObject = await getStocks(e)
                
           

                const stockToPush = {}
                stockToPush.stock = stockObject.stock
                stockToPush.price = stockObject.latestPrice



                stockData.stockData.push({
                    stock: stockObject.symbol,
                    price: parseFloat(stockObject.latestPrice),
                    likes: foundStock.likes
                }

                )
            }))
            
            if (stockData.stockData.length > 1) {
                const relLikesOne = (stockData.stockData[0].likes - 
                                     stockData.stockData[1].likes)
                const relLikesTwo = stockData.stockData[1].likes - 
                                    stockData.stockData[0].likes
                
                stockData.stockData.forEach((e, i) => { delete e.likes})
                stockData.stockData[0]['rel_likes'] = relLikesOne
                stockData.stockData[1]['rel_likes'] = relLikesTwo
            }
            else {
                stockData.stockData = stockData.stockData[0]
            }
            return res.json(stockData)
        });

}


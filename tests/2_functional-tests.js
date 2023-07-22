const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

let likedAmount;
let likedAmountTwo;
let GOOG;
let AAPL;

chai.use(chaiHttp);

suite('Functional Tests', function() {
    test('Viewing a Stock', done => {
        chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/?stock=GOOG')
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isObject(res.body)
            assert.isObject(res.body.stockData)
            assert.equal(res.body.stockData.stock, 'GOOG')
            assert.property(res.body.stockData, 'likes')
            assert.property(res.body.stockData, 'price')
            assert.typeOf(res.body.stockData.likes, 'number')
            assert.typeOf(res.body.stockData.price, 'number')
            likedAmount = res.body.stockData.likes
            done()
            
        })
        
    })
    test('Viewing a Stock and liking it', done => {
        chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/?stock=aapl&likes=true')
        .end((err, res) => {
            assert.equal(res.status, 200);
            likedAmountTwo = res.body.stockData.likes
            assert.isObject(res.body)
            assert.isObject(res.body.stockData)
            assert.equal(res.body.stockData.stock, 'AAPL')
            assert.property(res.body.stockData, 'likes')
            assert.property(res.body.stockData, 'price')
            assert.typeOf(res.body.stockData.likes, 'number')
            assert.typeOf(res.body.stockData.price, 'number')
            likedAmountTwo = res.body.stockData.likes
            done()
            
        })
    })
    test('Viewing a Stock and liking it again', done => {
        chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/?stock=aapl&likes=true')
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isObject(res.body)
            assert.isObject(res.body.stockData)
            assert.equal(res.body.stockData.stock, 'AAPL')
            assert.equal(res.body.stockData.likes, likedAmountTwo)
            assert.property(res.body.stockData, 'likes')
            assert.property(res.body.stockData, 'price')
            assert.typeOf(res.body.stockData.likes, 'number')
            assert.typeOf(res.body.stockData.price, 'number')
            done()
            
        })
    })
    test('Viewing two Stocks', done => {
        chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/?stock=GOOG&stock=aapl')
        .end((err, res) => {
            GOOG = res.body.stockData.findIndex(index => {
                return index.stock == 'GOOG'
            })
            AAPL = res.body.stockData.findIndex(index => {
                return index.stock == 'AAPL'
            })
            assert.equal(res.status, 200);
            assert.isObject(res.body)
            assert.isArray(res.body.stockData)
            assert.property(res.body.stockData[GOOG], 'rel_likes')
            assert.property(res.body.stockData[GOOG], 'price')
            assert.property(res.body.stockData[GOOG], 'rel_likes')
            assert.property(res.body.stockData[GOOG], 'price')
            assert.typeOf(res.body.stockData[AAPL]['rel_likes'], 'number')
            assert.typeOf(res.body.stockData[AAPL].price, 'number')
            assert.typeOf(res.body.stockData[AAPL]['rel_likes'], 'number')
            assert.typeOf(res.body.stockData[AAPL].price, 'number')
            assert.equal(res.body.stockData[GOOG]['rel_likes'], likedAmount - likedAmountTwo)
            assert.equal(res.body.stockData[AAPL]['rel_likes'], likedAmountTwo - likedAmount)
            done()
            
        })
    })
    test('View two stocks and like them', done => {
        chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/?stock=GOOG&stock=aapl&likes=true')
        .end((err, res) => {
            GOOG = res.body.stockData.findIndex(index => {
                return index.stock == 'GOOG'
            })
            AAPL = res.body.stockData.findIndex(index => {
                return index.stock == 'AAPL'
            })
            assert.equal(res.status, 200);
            assert.isObject(res.body)
            assert.isArray(res.body.stockData)
            assert.property(res.body.stockData[0], 'rel_likes')
            assert.property(res.body.stockData[1], 'price')
            assert.property(res.body.stockData[1], 'rel_likes')
            assert.property(res.body.stockData[1], 'price')
            assert.typeOf(res.body.stockData[0]['rel_likes'], 'number')
            assert.typeOf(res.body.stockData[0].price, 'number')
            assert.typeOf(res.body.stockData[1]['rel_likes'], 'number')
            assert.typeOf(res.body.stockData[1].price, 'number')
            assert.equal(res.body.stockData[GOOG]['rel_likes'], likedAmount - likedAmountTwo)
            assert.equal(res.body.stockData[AAPL]['rel_likes'], likedAmountTwo - likedAmount)
            done()
            
        })
    })
});

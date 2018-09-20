const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const service = 'https://puzzlr4u.herokuapp.com/api/'
// const service = 'http://localhost:8080/api/'

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/solve', (req, res) => res.render('pages/puzzle/solve', {puzzleDataSource3: service + 'newpuzzle/3/30',
																puzzleDataSource4: service + 'newpuzzle/4/80'}))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

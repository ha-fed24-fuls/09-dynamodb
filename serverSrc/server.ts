import express from 'express'
import type { Express, Request, RequestHandler, Response } from 'express'
import movieRouter from './routes/movies.js'


const port: number = Number(process.env.PORT)
const app: Express = express()
// console.log('PORT = ', port)

// /movies
// /reviews


// Middleware
const logger: RequestHandler = (req, res, next) => {
	console.log(`${req.method}  ${req.url}`)
	next()
}
app.use('/', logger)
app.use('/', express.json())

// Resurser (routermoduler med endpoints)
app.use('/movies', movieRouter)


// Endpoints





// Starta servern
app.listen(port, () => {
	console.log('Server listening on port ' + port)
})
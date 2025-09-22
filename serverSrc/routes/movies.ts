import type { Movie, Review } from "../data/types.js";
import express from 'express'
import type { Request, Response, Router } from 'express'
import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db } from '../data/dynamoDb.js'
import { MovieArraySchema, MovieSchema } from "../data/validation.js";

const router: Router = express.Router()


// Typer och interface
type MovieIdParam = {
	movieId: string;
}

export type GetResult = Record<string, any> | undefined

interface ScanResult<T> {
	Items?: T[];
	Count?: number;
}


const myTable: string = 'movies'


// GET /movies/:movieId
router.get('/:movieId', async (req: Request<MovieIdParam>, res: Response<Movie>) => {
	const movieId: string = req.params.movieId
	let getCommand = new GetCommand({
		TableName: myTable,
		Key: {
			movieId: movieId,  // PK
			reviewId: 'meta'   // SK
		}  // hämta specifik film
	})
	const result: GetResult = await db.send(getCommand)

	// TODO: validera result.Item så vi vet säkert att det är rätt sorts objekt

	const item: Movie | undefined = result.Item
	/* detta fick vi från dynamoDB:
	 Item: {
		movieId: 'm3',
		premiere: 2022,
		title: 'Top Gun Maverick',
		reviewId: 'meta'
	}
	*/

	// console.log('Data from DynamoDB:', result)
	if( item ) {
		res.send(item)
	} else {
		res.sendStatus(404)
	}
})

// GET /movies
router.get('/', async (req, res) => {
	const result = await db.send(new ScanCommand({
		TableName: myTable
	}))
	if( result.Count === undefined || result.Items === undefined ) {
		res.sendStatus(500)  // bad request
		return
	}
	// Validera items
	// const items: Movie[]
	let parseResult = MovieArraySchema.safeParse(result.Items)
	if( !parseResult.success ) {
		console.log('Result from database is not list of movie objects. ', result.Items, parseResult.error)
		res.sendStatus(500)
		return
	}

	const items: (Movie | Review)[] = parseResult.data
	const filtered: Movie[] = items.filter(item => (item as Movie).title) as Movie[]
	console.log(filtered)
	res.send(filtered)
})

export default router

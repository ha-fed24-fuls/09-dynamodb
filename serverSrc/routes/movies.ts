import type { Movie, Review } from "../data/types.js";
import express from 'express'
import type { Request, Response, Router } from 'express'
import { GetCommand, QueryCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db } from '../data/dynamoDb.js'
import { isMovie, isReview, MovieArraySchema, MovieSchema, ReviewSchema } from "../data/validation.js";

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
	const filtered: Movie[] = items.filter(isMovie)
	// console.log(filtered)
	res.send(filtered)
})

interface PutBody {
	title: string;
	premiere: number;
}

router.put('/:movieId', async (req: Request<MovieIdParam, void, PutBody>, res: Response<void>) => {
	const movieId = req.params.movieId
	const newItem: PutBody = req.body

	// TODO: validera newItem. Lägg till ett nytt schema i validation.ts
	// Om body är felaktig: svara med 400 (bad request)
	// Om vi vill svara med ett felmeddelande: ändra "void" till "ErrorResponse | void" (se tidigare kodexempel)

	const result = await db.send(new UpdateCommand({
		TableName: myTable,
		Key: {
			movieId: movieId,
			reviewId: 'meta'
		},
		UpdateExpression: 'SET premiere = :premiere, title = :title',
		ExpressionAttributeValues: {
			':premiere': newItem.premiere,
			':title': newItem.title
		},
		// ReturnValues: "ALL_NEW"
	}))
	// console.log('PUT result:', result)
	// result.Attributes
	res.sendStatus(200)
})


router.get('/:movieId/reviews', async (req: Request<MovieIdParam>, res: Response<Review[] | void>) => {
	const movieId = req.params.movieId

	const result = await db.send(new QueryCommand({
		TableName: myTable,
		KeyConditionExpression: 'movieId = :movieId',  // PK i databasen heter "movieId" - vanligtvis heter den "pk" i stället
		ExpressionAttributeValues: {
			':movieId': movieId
		}
	}))

	// console.log('QueryCommand result: ', result)
	try {
		let items: (Movie | Review)[] = MovieArraySchema.parse(result.Items)
		const filtered: Review[] = items.filter(isReview)
		res.send(filtered)

	} catch(error) {
		console.log('/movies/:id/reviews  - parse error: ', (error as Error).message)
		res.sendStatus(500)
	}
})


export default router

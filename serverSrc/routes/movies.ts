import type { Movie } from "../data/types.js";
import express from 'express'
import type { Request, Response, Router } from 'express'
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { db } from '../data/dynamoDb.js'

const router: Router = express.Router()



type MovieIdParam = {
	movieId: string;
}

export type GetResult = Record<string, any> | undefined


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


export default router

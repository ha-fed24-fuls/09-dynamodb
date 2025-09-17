import type { Movie } from "../data/types.js";
import express from 'express'
import type { Request, Response, Router } from 'express'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const router: Router = express.Router()
const accessKey: string = process.env.ACCESS_KEY || ''
const secret: string = process.env.SECRET_ACCESS_KEY || ''


type MovieIdParam = {
	movieId: string;
}

export type GetResult = Record<string, any> | undefined

// DynamoDB stuff - flyttas till annan fil
const client: DynamoDBClient = new DynamoDBClient({
	region: "eu-north-1",  // se till att använda den region som du använder för DynamoDB
	credentials: {
		accessKeyId: accessKey,
		secretAccessKey: secret,
	},
});
const db: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);
const myTable: string = 'movies'


router.get('/:movieId', async (req: Request<MovieIdParam>, res: Response<Movie>) => {
	const movieId: string = req.params.movieId
	let getCommand = new GetCommand({
		TableName: myTable,
		Key: {
			movieId: movieId,
			reviewId: 'meta'
		}  // hämta olika filmer
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

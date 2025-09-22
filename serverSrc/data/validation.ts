import * as z from 'zod'
import type { Movie, Review } from './types.js'

const movieIdRegex = /^m[0-9]+$/
const reviewIdRegex = /^r[0-9]+$/

const MovieSchema = z.object({
	movieId: z.string().regex(movieIdRegex),  // m1, m2, m11 osv.
	premiere: z.number().gte(1888),  // 1888 eller senare
	title: z.string().min(1),
	reviewId: z.string('meta')  // måste vara 'meta' för Movie-objekt
})

const ReviewSchema = z.object({
	movieId: z.string().regex(movieIdRegex),
	reviewId: z.string().regex(reviewIdRegex),
	score: z.number().gte(0).lte(10)
})

//   type MovieArraySchema = (Movie | Review)[]
const MovieArraySchema = z.array(z.union([MovieSchema, ReviewSchema]))


// Type predicate - används för att filtrera listor med Movie|Review
function isMovie(item: Movie | Review): item is Movie {
	// Enklare variant:
	// return 'title' in item
	try {
		let result = MovieSchema.parse(item)
		return true
	} catch {
		return false
	}
}
function isReview(item: Movie | Review): item is Review {
	try {
		let result = ReviewSchema.parse(item)
		return true
	} catch {
		return false
	}
}


export { MovieSchema, MovieArraySchema, ReviewSchema, isMovie, isReview }

// Regex == reguljära uttryck, ett uttryck som beskriver en sträng
// ^     -> början av strängen
// m     -> bokstaven m
// [0-9] -> siffrorna 0 till 9
// +     -> en eller flera gånger
// $     -> slutet av strängen

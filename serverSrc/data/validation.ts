import * as z from 'zod'

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

export { MovieSchema, MovieArraySchema }

// Regex == reguljära uttryck, ett uttryck som beskriver en sträng
// ^     -> början av strängen
// m     -> bokstaven m
// [0-9] -> siffrorna 0 till 9
// +     -> en eller flera gånger
// $     -> slutet av strängen

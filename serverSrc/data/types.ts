export interface Movie {
	movieId: string;
	premiere: number;
	title: string;
	reviewId: string; //'meta';
}

export interface Review {
	movieId: string;
	reviewId: string;
	score: number;
}

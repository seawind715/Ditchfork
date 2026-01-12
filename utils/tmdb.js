const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function searchMovies(query) {
    if (!query) return [];

    try {
        const res = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=ko-KR&include_adult=false`);
        const data = await res.json();
        return data.results || [];
    } catch (error) {
        console.error("TMDB Search Error:", error);
        return [];
    }
}

export async function getMovieDetails(id) {
    if (!id) return null;

    try {
        const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=ko-KR&append_to_response=credits`);
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("TMDB Details Error:", error);
        return null;
    }
}

export function getPosterUrl(path, size = 'w500') {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

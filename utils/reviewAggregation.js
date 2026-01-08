/**
 * Groups raw reviews by Artist and Album.
 * Returns an array of aggregated album entries.
 */
export function groupReviews(reviews) {
    if (!reviews || reviews.length === 0) return [];

    const groups = {};

    reviews.forEach(review => {
        const key = `${review.artist_name.toLowerCase().trim()}|${review.album_name.toLowerCase().trim()}`;

        if (!groups[key]) {
            groups[key] = {
                id: review.id, // Reference to the "primary" or latest review
                artist_name: review.artist_name,
                album_name: review.album_name,
                cover_image_url: review.cover_image_url,
                is_cover_hidden: review.is_cover_hidden, // Pass through hidden state
                genre: review.genre,
                total_rating: 0,
                review_count: 0,
                release_year: review.release_year, // Include release_year for filtering
                created_at: review.created_at, // To sort by latest
                reviews: [] // Store individual reviews if needed
            };
        }

        groups[key].total_rating += review.rating;
        groups[key].review_count += 1;
        groups[key].reviews.push(review);

        // Keep the most recent data (image, etc.)
        if (new Date(review.created_at) > new Date(groups[key].created_at)) {
            groups[key].id = review.id;
            groups[key].cover_image_url = review.cover_image_url;
            groups[key].is_cover_hidden = review.is_cover_hidden; // Update hidden state
            groups[key].genre = review.genre;
            groups[key].created_at = review.created_at;
            groups[key].release_year = review.release_year; // Update year just in case
            // Note: artist/album name casing might differ slightly in DB, 
            // but we use the first one encountered or the latest.
            groups[key].artist_name = review.artist_name;
            groups[key].album_name = review.album_name;
        }
    });

    return Object.values(groups)
        .map(group => ({
            ...group,
            rating: group.total_rating / group.review_count
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

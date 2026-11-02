// "Top rated" is earned from reviews. The backend's "Top rated" search filter
// uses the same rule (shinapp-backend masters.service.ts) - keep the two in step.
const TOP_RATED_MIN_RATING = 4.5;
const TOP_RATED_MIN_REVIEWS = 1;

export function isTopRated(rating?: number | null, reviewsCount?: number | null): boolean {
  return (reviewsCount ?? 0) >= TOP_RATED_MIN_REVIEWS && (rating ?? 0) >= TOP_RATED_MIN_RATING;
}

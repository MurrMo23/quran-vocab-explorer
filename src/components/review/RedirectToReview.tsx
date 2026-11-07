import { Navigate, useLocation } from 'react-router-dom';

/** Old learning routes (/practice, /quiz, ...) land on /review with their query (collection, words). */
const RedirectToReview = () => {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: '/review', search, hash }} replace />;
};

export default RedirectToReview;

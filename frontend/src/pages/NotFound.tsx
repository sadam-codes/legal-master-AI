import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-[#BB8A28]">404</h1>
        <h2 className="text-3xl font-semibold text-foreground mt-4">Page Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-x-4">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-[#BB8A28] text-white rounded-lg hover:bg-[#BB8A28]/90 transition-colors"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-block px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 
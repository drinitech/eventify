import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-gray-500 mb-6">Faqja nuk u gjet.</p>
      <Link to="/" className="text-violet-600 hover:underline">
        Kthehu ne faqen kryesore
      </Link>
    </div>
  );
}

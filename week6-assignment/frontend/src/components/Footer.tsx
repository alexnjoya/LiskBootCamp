import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              NFT Creator
            </Link>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-indigo-600">Terms</a>
            <a href="#" className="text-gray-600 hover:text-indigo-600">Privacy</a>
            <a href="#" className="text-gray-600 hover:text-indigo-600">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import { Link } from 'react-router-dom';
import { useNFTs } from '../hooks/useNFTs';
import Gallery from '../components/Gallery';

const Home = () => {
  const { allNFTs, loadingNFTs } = useNFTs();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl text-white p-12 mb-16 shadow-xl">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">NFT Creator Marketplace</h1>
          <p className="text-xl md:text-2xl mb-10 text-indigo-100">Mint your own NFTs and earn creator tokens on the Lisk blockchain</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/mint"
              className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Mint an NFT
            </Link>
            <Link
              to="/token-info"
              className="bg-indigo-800/50 hover:bg-indigo-800/70 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
            >
              Learn About Creator Tokens
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="bg-indigo-50 text-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Create NFTs</h3>
            <p className="text-gray-600 leading-relaxed">
              Upload your digital assets and create unique NFTs on the Lisk blockchain with just a few clicks.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="bg-indigo-50 text-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Earn Tokens</h3>
            <p className="text-gray-600 leading-relaxed">
              Get rewarded with Creator Tokens every time you mint a new NFT. Use them for exclusive features and benefits.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="bg-indigo-50 text-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Manage Collection</h3>
            <p className="text-gray-600 leading-relaxed">
              View and manage your NFT collection in one place. Keep track of your creations and tokens.
            </p>
          </div>
        </div>
      </section>

      {/* Recent NFTs Section */}
      <section>
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900">Recent NFTs</h2>
          <Link 
            to="/my-nfts" 
            className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center group"
          >
            View All
            <svg className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <Gallery 
          nfts={allNFTs.slice(0, 8)} 
          isLoading={loadingNFTs} 
          emptyMessage="No NFTs have been minted yet. Be the first to create an NFT!" 
        />

        {/* CTA Section */}
        {!loadingNFTs && allNFTs.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-12 text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Ready to create your own NFT?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
              Join the creators on our platform and mint your own unique NFTs. Earn Creator Tokens with every mint!
            </p>
            <Link
              to="/mint"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-block"
            >
              Start Minting
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
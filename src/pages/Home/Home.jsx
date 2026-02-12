import React, { useEffect, useState } from 'react'
import './Home.css'
import Navbar from '../../components/Navbar/Navbar'
import hero_banner from '../../assets/hero_banner.jpg'
import hero_title from '../../assets/hero_title.png'
import play_icon from '../../assets/play_icon.png'
import info_icon from '../../assets/info_icon.png'
import TitleCards from '../../components/TitleCards/TitleCards'
import Footer from '../../components/Footer/Footer'
import { useAppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'
import SearchResults from '../../components/SearchResults/SearchResults'


const Home = () => {
  const { currentPage, heroContent, addNotification } = useAppContext();
  const [content, setContent] = useState({
    movies: [],
    tvShows: [],
    trending: [],
    myList: []
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        switch (currentPage) {
          case 'tv-shows':
            const tvData = await apiService.getTVShows('popular');
            setContent(prev => ({ ...prev, tvShows: tvData.results || [] }));
            break;
          case 'movies':
            const moviesData = await apiService.getMovies('popular');
            setContent(prev => ({ ...prev, movies: moviesData.results || [] }));
            break;
          case 'new-popular':
            const trendingData = await apiService.getTrending('all', 'week');
            setContent(prev => ({ ...prev, trending: trendingData.results || [] }));
            break;
          case 'my-list':
            // My List is handled by context
            break;
          case 'browse-languages':
            const genresData = await apiService.getGenres('movie');
            // For now, show popular movies by genre
            const genreMovies = await apiService.getByGenre('movie', genresData.genres[0]?.id || 28);
            setContent(prev => ({ ...prev, movies: genreMovies.results || [] }));
            break;
          default:
            // Home page - load default content
            const homeMovies = await apiService.getMovies('now_playing');
            setContent(prev => ({ ...prev, movies: homeMovies.results || [] }));
        }
      } catch (error) {
        console.error('Error loading content:', error);
        addNotification('Error loading content', 'error');
      }
    };

    loadContent();
  }, [currentPage, addNotification]);

  const handlePlay = () => {
    if (heroContent) {
      addNotification(`Playing ${heroContent.title || heroContent.name}`, 'success');
      // You can add navigation to player here
    }
  };

  const handleMoreInfo = () => {
    if (heroContent) {
      addNotification(`Showing details for ${heroContent.title || heroContent.name}`, 'info');
      // You can add a modal or navigation to details page here
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'tv-shows':
        return (
          <div className="more-cards">
            <TitleCards title="Popular TV Shows" category="popular" type="tv" />
            <TitleCards title="Top Rated TV Shows" category="top_rated" type="tv" />
            <TitleCards title="On The Air" category="on_the_air" type="tv" />
            <TitleCards title="Airing Today" category="airing_today" type="tv" />
          </div>
        );
      case 'movies':
        return (
          <div className="more-cards">
            <TitleCards title="Popular Movies" category="popular" />
            <TitleCards title="Top Rated Movies" category="top_rated" />
            <TitleCards title="Upcoming Movies" category="upcoming" />
            <TitleCards title="Now Playing" category="now_playing" />
          </div>
        );
      case 'new-popular':
        return (
          <div className="more-cards">
            <TitleCards title="Trending This Week" category="trending" type="all" />
            <TitleCards title="Trending Movies" category="trending" type="movie" />
            <TitleCards title="Trending TV Shows" category="trending" type="tv" />
          </div>
        );
      case 'my-list':
        return (
          <div className="more-cards">
            <TitleCards title="My List" category="my_list" />
          </div>
        );
      case 'browse-languages':
        return (
          <div className="more-cards">
            <TitleCards title="Action Movies" category="action" />
            <TitleCards title="Comedy Movies" category="comedy" />
            <TitleCards title="Drama Movies" category="drama" />
            <TitleCards title="Horror Movies" category="horror" />
          </div>
        );
      default:
        return (
          <div className="more-cards">
            <TitleCards title="Blockbuster Movies" category="top_rated" />
            <TitleCards title="Only on Netflix" category="popular" />
            <TitleCards title="Upcoming" category="upcoming" />
            <TitleCards title="Top picks for you" category="now_playing" />
          </div>
        );
    }
  };

  return (
    <div className='home'>
      <Navbar />
      <SearchResults />
      <div className="hero">
        <img 
          src={heroContent?.backdrop_path ? `https://image.tmdb.org/t/p/original${heroContent.backdrop_path}` : hero_banner} 
          alt="" 
          className='banner-img'
        />
        <div className="hero-caption">
          <img src={hero_title} alt="" className='caption-img'/>
          <p>{heroContent?.overview || "Discovering his ties to a secret ancient order, a young man living in modern Istanbul embarks on a quest to save the city from an immortal enemy."}</p>
          <div className="hero-btns">
            <button className='btn' onClick={handlePlay}>
              <img src={play_icon} alt="" />Play
            </button>
            <button className='btn dark-btn' onClick={handleMoreInfo}>
              <img src={info_icon} alt="" />More Info
            </button>
          </div>
          {currentPage === 'home' && <TitleCards/>}
        </div>
      </div>
      {renderContent()}
      <Footer/>
    </div>
  )
}

export default Home
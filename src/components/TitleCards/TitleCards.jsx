import React, { useEffect, useRef, useState } from 'react'
import './TitleCards.css'
// cards_data import removed - using API data instead
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { apiService } from '../../services/api';

const TitleCards = ({title, category, type = 'movie'}) => {

  const [apiData, setApiData] = useState([]);
  const cardsRef = useRef();
  const { myList, addToMyList, removeFromMyList, isInMyList, addNotification } = useAppContext();

  // API options moved to api service



const handlewheel = (event)=>{
  event.preventDefault();
  cardsRef.current.scrollLeft += event.deltaY;
}

useEffect(()=>{
  const loadData = async () => {
    try {
      let data;
      
      if (category === 'my_list') {
        setApiData(myList);
        return;
      }
      
      if (category === 'trending') {
        data = await apiService.getTrending(type, 'week');
      } else if (type === 'tv') {
        data = await apiService.getTVShows(category);
      } else {
        data = await apiService.getMovies(category);
      }
      
      if (data && data.results) {
        setApiData(data.results);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      addNotification('Error loading content', 'error');
    }
  };

  loadData();
  cardsRef.current.addEventListener('wheel', handlewheel)
},[category, type, myList, addNotification])

  const handleAddToList = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInMyList(item.id)) {
      removeFromMyList(item.id);
      addNotification(`Removed ${item.title || item.name} from My List`, 'info');
    } else {
      addToMyList(item);
      addNotification(`Added ${item.title || item.name} to My List`, 'success');
    }
  };

  return (
    <div className='tile-cards'>
      <h2>{title?title:"Popular on Netflix"}</h2>
      <div className="card-list" ref={cardsRef}>
        {apiData.map((card, index)=>{
          const isInList = isInMyList(card.id);
          return (
            <Link to={`/player/${card.id}`} className="card" key={index}>
              <img src={`https://image.tmdb.org/t/p/w500${card.backdrop_path || card.poster_path}`} alt="" />
              <p>{card.original_title || card.name}</p>
              <button 
                className={`add-to-list-btn ${isInList ? 'in-list' : ''}`}
                onClick={(e) => handleAddToList(e, card)}
                title={isInList ? 'Remove from My List' : 'Add to My List'}
              >
                {isInList ? '✓' : '+'}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  )
}

export default TitleCards
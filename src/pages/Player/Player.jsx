import React, { useEffect, useState } from 'react'
import './Player.css'
import back_arrow_icon from '../../assets/back_arrow_icon.png'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Player = () => {

  const {id} = useParams();
  const navigate = useNavigate();
  const { addToViewingHistory } = useAppContext();

const [apiData, setApiData] = useState({
  name: "",
  key: "",
  published_at: "",
  type: ""
})

const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjM2FjYzVlOGIxYTljNzM2ZGM3OThjNDllM2M5MDY5ZiIsIm5iZiI6MTc1MTc3NjU5MS4yODEsInN1YiI6IjY4NjlmZDRmOWRiZTkxODkxNjEwMzI4YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.wQarnuqPkkSaKXTyjUmHfFt32hF8O6d828L_pqvi28s'
  }
};

useEffect(()=>{
  // Fetch video data
  fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, options)
  .then(res => res.json())
  .then(res => {
    if (res.results && res.results.length > 0) {
      setApiData(res.results[0]);
    } else {
      setError('No video available for this movie');
    }
    setLoading(false);
  })
  .catch(err => {
    console.error(err);
    setError('Failed to load video');
    setLoading(false);
  });

  // Fetch movie details for history tracking (separate call)
  fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options)
  .then(res => res.json())
  .then(movieInfo => {
    if (movieInfo && movieInfo.success !== false) {
      addToViewingHistory(movieInfo);
    }
  })
  .catch(err => {
    console.log('History tracking failed:', err);
  });
},[])

  return (
    <div className='player'>
      <img src={back_arrow_icon} alt="" onClick={()=>{navigate(-2)}}/>
      
      {loading && (
        <div className="loading-message">
          <p>Loading video...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p>This movie may not have a trailer available.</p>
        </div>
      )}
      
      {!loading && !error && apiData.key && (
        <>
          <iframe 
            width='90%' 
            height='90%' 
            src={`https://www.youtube.com/embed/${apiData.key}`} 
            title='trailer' 
            frameBorder='0' 
            allowFullScreen
          ></iframe>
          <div className="player-info">
            <p>{apiData.published_at ? apiData.published_at.slice(0,10) : 'Date not available'}</p>
            <p>{apiData.name || 'Video'}</p>
            <p>{apiData.type || 'Trailer'}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default Player
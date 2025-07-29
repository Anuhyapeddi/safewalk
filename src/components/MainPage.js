import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';

function MainPage() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });

  const sourceRef = useRef(null);
  const destinationRef = useRef(null);
  const navigate = useNavigate();

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, []);

  const handleSourceChange = () => {
    const place = sourceRef.current.getPlace();
    if (place && place.formatted_address) {
      setSource(place.formatted_address);
    }
  };

  const handleDestinationChange = () => {
    const place = destinationRef.current.getPlace();
    if (place && place.formatted_address) {
      setDestination(place.formatted_address);
    }
  };

  const handleSubmit = () => {
    if (!source || !destination) {
      alert('Please select both source and destination');
      return;
    }
    navigate('/directions', { state: { source, destination } });
  };

  const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${currentLocation.lat},${currentLocation.lng}&zoom=14`;

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 'bold', marginBottom: '1rem' }}>SafeWalk</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}><i>"Safer Streets Start Here."</i></p>

        <Autocomplete onLoad={ref => (sourceRef.current = ref)} onPlaceChanged={handleSourceChange}>
          <input
            placeholder="Source"
            style={{ marginBottom: '1rem', padding: '0.6rem', width: '250px', borderRadius: '50px' , border: '1px solid #ccc'}}
          />
        </Autocomplete>

        <Autocomplete onLoad={ref => (destinationRef.current = ref)} onPlaceChanged={handleDestinationChange}>
          <input
            placeholder="Destination"
            style={{ marginBottom: '1rem', padding: '0.6rem', width: '250px', borderRadius: '50px', border: '1px solid #ccc' }}
          />
        </Autocomplete>

        <button onClick={handleSubmit} style={{ padding: '0.6rem 1rem', borderRadius: '50px', backgroundColor: 'rgba(4, 4, 4, 0.95)', color: 'white', border: '1px solid #ccc' }}>
          Search
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <iframe
          title="Google Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapUrl}
        />
      </div>
    </div>
  );
}

export default MainPage;

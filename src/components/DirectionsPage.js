import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

function DirectionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { source, destination } = location.state || {};

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const [directions, setDirections] = React.useState(null);
  const [center, setCenter] = React.useState({ lat: 37.7749, lng: -122.4194 });
  const [duration, setDuration] = React.useState('');
  const [distance, setDistance] = React.useState('');
  const [eta, setETA] = React.useState('');
  

  React.useEffect(() => {
    if (isLoaded && source && destination) {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: source,
          destination: destination,
          travelMode: window.google.maps.TravelMode.WALKING,
          provideRouteAlternatives: true, 
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);

            const leg = result.routes[0].legs[0];
            setDuration(leg.duration.text);
            setDistance(leg.distance.text);

            const start = leg.start_location;
            setCenter({ lat: start.lat(), lng: start.lng() });

            // ETA Calculation
            const etaTime = new Date();
            etaTime.setMinutes(etaTime.getMinutes() + leg.duration.value / 60); // duration.value is in seconds
            const formattedETA = etaTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            setETA(formattedETA);
          } else {
            alert('Directions request failed: ' + status);
          }
        }
      );
    }
  }, [isLoaded, source, destination]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 2,
          padding: '0.5rem 1rem',
          backgroundColor: '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Back
      </button>

      {/* Info Box */}
      {(duration && distance && eta) && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 2,
            padding: '0.8rem 1rem',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '10px',
            boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
            fontSize: '1rem',
            lineHeight: '1.5',
          }}
        >
          <strong>Walk Time:</strong> {duration} <br />
          <strong>Distance:</strong> {distance} <br />
          <strong>ETA:</strong> {eta}
        </div>
      )}

      {/* Google Map */}
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
}

export default DirectionsPage;

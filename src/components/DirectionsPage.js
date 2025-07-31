import React, { useEffect, useState } from 'react';
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

  const [directions, setDirections] = useState(null);
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [eta, setETA] = useState('');
  const [safeSteps, setSafeSteps] = useState([]);

  useEffect(() => {
    if (isLoaded && source && destination) {
      const fetchSafeRoute = async () => {
        try {
          // First convert addresses to lat/lng using Geocoding API
          const geocode = async (place) => {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();
            const loc = data.results[0].geometry.location;
            return `${loc.lat},${loc.lng}`;
          };

          const sourceLatLng = await geocode(source);
          const destinationLatLng = await geocode(destination);

          const backendResponse = await fetch('http://localhost:8000/route', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              source: sourceLatLng,
              destination: destinationLatLng,
              timestamp: new Date().toISOString(),
            }),
          });

          const data = await backendResponse.json();
          setSafeSteps(data.steps);
          setDuration(data.summary.duration);
          setDistance(data.summary.total_distance);

          // Center the map on the first step
          if (data.steps.length > 0) {
            const firstStep = data.steps[0].end_location;
            setCenter({ lat: firstStep.lat, lng: firstStep.lng });
          }

          // Use DirectionsService to render the path visually
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route(
            {
              origin: source,
              destination: destination,
              travelMode: window.google.maps.TravelMode.WALKING,
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                setDirections(result);

                const leg = result.routes[0].legs[0];
                const etaTime = new Date();
                etaTime.setMinutes(etaTime.getMinutes() + leg.duration.value / 60);
                const formattedETA = etaTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                setETA(formattedETA);
              } else {
                alert('Google directions fetch failed: ' + status);
              }
            }
          );
        } catch (error) {
          console.error('Failed to fetch safe route:', error);
          alert('Something went wrong while fetching the route.');
        }
      };

      fetchSafeRoute();
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

      {/* Safety Steps */}
      {safeSteps.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            zIndex: 2,
            padding: '1rem',
            maxHeight: '30vh',
            overflowY: 'auto',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '10px',
            boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
            fontSize: '0.9rem',
            width: '300px',
          }}
        >
          <h3 style={{ marginBottom: '0.5rem' }}>Steps & Safety</h3>
          {safeSteps.map((step, index) => (
            <div key={index} style={{ marginBottom: '0.6rem' }}>
              <div dangerouslySetInnerHTML={{ __html: step.instruction }} />
              <div><strong>Distance:</strong> {step.distance}</div>
              <div><strong>Safety Score:</strong> {step.safety_score}</div>
            </div>
          ))}
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

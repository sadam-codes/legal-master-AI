const squareConfig = {
  appId: import.meta.env.VITE_SQUARE_APP_ID || 'sq0idp-your-application-id',
  locationId: import.meta.env.VITE_SQUARE_LOCATION_ID || 'LD90N71X3D44Z',
  environment: import.meta.env.VITE_SQUARE_ENV || 'sandbox'
};

export default squareConfig; 
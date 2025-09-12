import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  //  <!-- document.getElementById('root') → finds that <div id="root"></div> in index.html -->
  //    <!-- ReactDOM.createRoot(...).render(<App />) → replaces the empty div with whatever App.jsx returns (your UI). -->
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// // Procedure
// ReactDOM.createRoot(...) → finds <div id="root"> in HTML.

// .render(<App />) → Puts our whole React app inside it.

// <App /> → Main component that controls everything.

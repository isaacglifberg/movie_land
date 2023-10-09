import React from 'react';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LogInForm from './components/loginForm';
import SearchMovies from './components/searchmovies';


export default function App() {
  return (

    <Router>
      <Routes>
        <Route exact path="/login" element={<LogInForm />} /> {/* Server-rendered component */}
        <Route path="/search" element={<SearchMovies />} /> {/* SPA component */}
      </Routes>
    </Router>

  );
}
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
//import Placeholder from './Client/Placeholder';
import reportWebVitals from './reportWebVitals';
import Footer from './Footer';
import AdminLogin from './Admin/AdminLogin';
import VoteClient from './Client/VoteClient';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<VoteClient />} />
        <Route path="/:id" element={<VoteClientWrapper />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/*" element={<VoteClient />} />
      </Routes>
    </BrowserRouter>
    <Footer />

  </React.StrictMode>
);

function VoteClientWrapper() {
  const { id } = useParams(); // Retrieve the "id" parameter from the URL

  return <VoteClient id={id} />;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

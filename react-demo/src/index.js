import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route, } from 'react-router-dom';
import './index.css';
import Login from './components/Login';
import Register from './components/Register';
import NotFind from './components/NotFind';
import Unauthor from './components/Unauthor';
import App from './App';
import Welcome from './pages/Welcome';
import Books from './pages/Books';
import ManageUsers from './pages/Users';
import BorrowList from './pages/BorrowList';
import BorrowBook from './pages/BorrowBook';
import BasicInfo from './pages/BasicInfo';
import Pborrow from './pages/Pborrow';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<App />}>
            <Route index element={<Welcome />} />
            <Route path="/home/welcome" element={<Welcome />}/>
            <Route path="/home/books" element={<Books />}/>
            <Route path="/home/users" element={<ManageUsers />}/>
            <Route path="/home/borrow" element={<BorrowList />}/>
            <Route path="/home/borrowbook" element={<BorrowBook />}/>
            <Route path="/home/basicinfo" element={<BasicInfo />}/>
            <Route path="/home/personalborrow" element={<Pborrow />}/>
          </Route>
          <Route path="/unauthorized" element={<Unauthor />} />
          <Route path="*" element={<NotFind />} />
        </Routes>
    </BrowserRouter>
);

reportWebVitals();
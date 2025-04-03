import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter, Route, Routes} from 'react-router-dom';
import Body from './view/Body';
import store from './store';
import Faded from './effect/Faded';
import {Provider} from 'react-redux';
import Header from './view/Header';
import Footer from './view/Footer';
import UpButton from './effect/UpButton';

import './css/view/header.css';
import './css/view/public.css';
import './css/view/user.css';
import './css/view/modal.css';
import './css/view/product.css';
const App = () => {
  return (
      <Routes>
        <Route path="/*" element={<Body />} />
      </Routes>
  );
};

const container = ReactDOM.createRoot(document.getElementById('container'));
container.render(
  <Provider store={store}>
  <BrowserRouter>
    <Header/>
    <UpButton/>
    <Faded>
      <App/>
    </Faded>
    <Footer/>
  </BrowserRouter>
  </Provider>
);
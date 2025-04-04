import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter, Route, Routes} from 'react-router-dom';
import Body from './view/Body';
import store from './store';
import {Provider} from 'react-redux';

const App = () => {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/*" element={<Body />} />
      </Routes>
    </Provider>
  );
};

const container = ReactDOM.createRoot(document.getElementById('container'));
container.render(
  <BrowserRouter>
    <App/>
  </BrowserRouter>
);
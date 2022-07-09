import React from 'react'
import { Provider } from "react-redux";
import ReactDOM from 'react-dom/client'
import App from './App'
import store from "./store/store";
import './index.css'

declare global {
  interface Window {
    account: string;
    __REDUX_DEVTOOLS_EXTENSION__: any;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)

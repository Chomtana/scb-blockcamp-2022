import { configureStore } from '@reduxjs/toolkit'
import web3ModalReducer from "./web3Modal/reducer";

let devToolsExtension = (f) => f;

/* istanbul ignore if  */
if (process.env.NODE_ENV === "development") {
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__();
  }
}

export default configureStore({
  reducer: {
    web3Modal: web3ModalReducer
  },
});

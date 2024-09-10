import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import store from "./store/index";
import App from "./App";
// import Video from "./components/Ffmpeg/Video";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        {" "}
        <App />
      </DndProvider>
    </Provider>
    {/* <Video /> */}
  </React.StrictMode>
);

import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import Home from "./pages/Home"
import './App.css';
import Template from "./components/Template";
import Financial from "./pages/Financial";
import MyPage from "./pages/MyPage";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <Template>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/financial" element={<Financial />} />
            <Route path="/MyPage" element={<MyPage />} />
          </Routes>
        </Template>
      </Router>
    </DndProvider>
  );
}

export default App;

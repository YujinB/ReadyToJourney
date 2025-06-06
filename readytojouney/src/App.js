import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import Home from "./pages/Home"
import './App.css';
import Template from "./components/Template";
import Financial from "./pages/Financial";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <Template>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/financial" element={<Financial />} />
          </Routes>
        </Template>
      </Router>
    </DndProvider>
  );
}

export default App;

import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Crew from "./pages/Crew";
import { Suspense } from "react";

function AppRoutes() {
  return (
    <Suspense fallback={<div className="bg-amber-800">LOADIIIIIIIIING</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crew" element={<Crew />} />
        <Route path="/shipping" element={<About />} />
        <Route path="/menu" element={<></>} />
        <Route path="/flow" element={<></>} />
        <Route path="/analytics" element={<></>} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;

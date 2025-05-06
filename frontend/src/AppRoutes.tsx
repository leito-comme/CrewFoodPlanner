import { Route, Routes } from 'react-router-dom';
import { Suspense } from 'react';
import Home from '@/pages/Home';
import Crew from '@/pages/Crew';
import Shipping from '@/pages/Shipping';

function AppRoutes() {
  return (
    <Suspense fallback={<div className="bg-amber-800">LOADIIIIIIIIING</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crew" element={<Crew />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/menu" element={<></>} />
        <Route path="/flow" element={<></>} />
        <Route path="/analytics" element={<></>} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;

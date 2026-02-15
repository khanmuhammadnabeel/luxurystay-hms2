import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import './App.css';

function App() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
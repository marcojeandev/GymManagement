import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Add more routes here as needed */}
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
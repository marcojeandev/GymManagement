import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast' ;
import Landing from './pages/Landing';
import Login from './pages/Login';
import Setup from './pages/Setup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Smart redirect gate: checks settings and routes accordingly */}
        <Route path="/" element={<Landing />} />
        {/* First-time gym setup wizard */}
        <Route path="/setup" element={<Setup />} />
        {/* Member login */}
        <Route path="/login" element={<Login />} />
        {/* Add more routes here as needed */}
      </Routes>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' },
        success: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }} />
    </BrowserRouter>
  );
}

export default App;
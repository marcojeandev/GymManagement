import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">Reflect AI</h1>
          <p className="text-gray-600 mt-4 text-lg">Vite + React + TypeScript + Tailwind is working! 🚀</p>
        </div>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  )
}

export default App

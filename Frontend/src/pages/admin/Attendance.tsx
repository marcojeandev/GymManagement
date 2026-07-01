import { useState, useEffect } from 'react';
import { QrCode, CheckCircle, XCircle } from 'lucide-react';

const Attendance = () => {
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [memberScanned, setMemberScanned] = useState<any>(null);

  // Mocking a scan action for demonstration
  const handleMockScan = (success: boolean) => {
    if (success) {
      setScanStatus('success');
      setMemberScanned({ name: 'Marco Jean', type: 'Annual Member', time: new Date().toLocaleTimeString() });
    } else {
      setScanStatus('error');
      setMemberScanned(null);
    }
    
    setTimeout(() => {
      setScanStatus('idle');
      setMemberScanned(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Member Attendance</h1>
        <p className="text-gray-400 mt-2">Scan member QR code to record entry</p>
      </div>

      <div className="bg-gray-800/40 border border-gray-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
        
        {/* Scanner Window Mock */}
        <div className="relative w-72 h-72 rounded-2xl overflow-hidden bg-gray-900 border-2 border-dashed border-gray-600 flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-scan"></div>
          <QrCode size={100} className="text-gray-700" />
          
          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-red-500"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-red-500"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-red-500"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-red-500"></div>
        </div>

        <p className="text-gray-400 mt-6 animate-pulse">Position QR code within the frame to scan</p>

        {/* Mock Controls for Demo */}
        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => handleMockScan(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            Simulate Success Scan
          </button>
          <button 
            onClick={() => handleMockScan(false)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            Simulate Invalid Scan
          </button>
        </div>
      </div>

      {/* Status Overlay/Feedback */}
      {scanStatus === 'success' && memberScanned && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-6 animate-in slide-in-from-bottom-8">
          <div className="bg-emerald-500/20 p-4 rounded-full text-emerald-400">
            <CheckCircle size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-400">Access Granted</h3>
            <p className="text-gray-300 text-lg mt-1">{memberScanned.name} - <span className="text-gray-400">{memberScanned.type}</span></p>
            <p className="text-gray-500 text-sm mt-1">Logged at {memberScanned.time}</p>
          </div>
        </div>
      )}

      {scanStatus === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center gap-6 animate-in slide-in-from-bottom-8">
          <div className="bg-red-500/20 p-4 rounded-full text-red-400">
            <XCircle size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-400">Access Denied</h3>
            <p className="text-gray-300 text-lg mt-1">Invalid or expired membership</p>
            <p className="text-gray-500 text-sm mt-1">Please verify contract status.</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Attendance;

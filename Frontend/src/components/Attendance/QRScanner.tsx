import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
  loading?: boolean;
}

export const QRScanner = ({ onScan, onClose, isOpen, loading }: QRScannerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<any>(null);
  const containerId = 'qr-reader-container';
  const scanLock = useRef(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setProcessing(false);
      setError(null);
      scanLock.current = false;
      // If scanner already exists, clear it
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(() => {});
        } catch (_e) {}
        scannerRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !loading && !processing) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, loading, processing]);

  const startScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId);
      }

      if (isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }

      scanLock.current = false;

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          if (scanLock.current) return;
          scanLock.current = true;
          setProcessing(true);
          // Stop scanner immediately
          stopScanner();
          // Call parent with result
          onScan(decodedText);
        },
        (_errorMessage: string) => {}
      );
      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error('QR Scanner start error:', err);
      setError('Unable to access camera. Please check permissions or upload a photo.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (_e) {}
      setIsScanning(false);
    }
  };


  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
          scannerRef.current.clear().catch(() => {});
        } catch (_e) {}
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 max-w-md w-full p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Scan QR Code</h3>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div id={containerId} className="relative bg-black rounded-xl overflow-hidden aspect-square max-w-[300px] mx-auto" />

        {(loading || processing) && (
          <div className="mt-2 text-center text-white text-sm animate-pulse">
            {processing ? 'Processing scan...' : 'Loading...'}
          </div>
        )}

        <div className="text-center text-gray-400 text-sm mt-4">
          Position the QR code within the frame
        </div>

        {/* <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm mb-2">Or upload a photo</p>
          <label className="cursor-pointer inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
            Choose Image
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div> */}
      </div>
    </div>
  );
};
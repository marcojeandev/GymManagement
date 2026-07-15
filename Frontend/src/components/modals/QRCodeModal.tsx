import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    qr_code: string;
    firstname: string;
    lastname: string;
  } | null;
}

export const QRCodeModal = ({ isOpen, onClose, member }: QRCodeModalProps) => {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-md p-8 shadow-2xl shadow-red-500/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            QR Code
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50"
          >
            <X size={28} />
          </button>
        </div>

        {/* Member Name */}
        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm">Member</p>
          <p className="text-white text-lg font-semibold">
            {member.firstname} {member.lastname}
          </p>
        </div>

        {/* Large QR Code */}
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-xl">
          <QRCodeSVG
            value={member.qr_code}
            size={300}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin
            className="rounded-lg"
          />
          <p className="text-gray-500 text-sm font-mono mt-4 bg-gray-100 px-4 py-2 rounded-lg">
            {member.qr_code}
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-500/20"
        >
          Close
        </button>
      </div>
    </div>
  );
};
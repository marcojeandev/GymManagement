import { useState, useEffect } from 'react';
import { CashierLayout } from '../../layouts/CashierLayout';
import { attendanceApi } from '../../services/cashier/attendanceApi';
import { memberApi } from '../../services/cashier/memberApi';
import type { Attendance } from '../../types/Attendance';
import type { Member } from '../../types/Members';
import { CreateAttendanceModal } from '../../components/cashier/Attendance/CreateAttendanceModal';
// import { UpdateAttendanceModal } from '../../components/cashier/Attendance/UpdateAttendanceModal';
import { ViewAttendanceModal } from '../../components/cashier/Attendance/ViewAttendanceModal';
// import { DeleteAttendanceModal } from '../../components/cashier/Attendance/DeleteAttendanceModal';
import { QRScanner } from '../../components/cashier/Attendance/QRScanner';
import { MemberScanResultModal } from '../../components/cashier/Attendance/MemberScanResultModal';
import toast from 'react-hot-toast';
import { Plus, Search, Eye, Pencil, Trash2, QrCode, Clock } from 'lucide-react';

export const AttendancePage = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanning, setScanning] = useState(false);

  // New states for scan result modal
  const [scanResultModalOpen, setScanResultModalOpen] = useState(false);
  const [scannedMember, setScannedMember] = useState<Member | null>(null);
  const [scanAction, setScanAction] = useState<'clock_in' | 'clock_out' | null>(null);

  useEffect(() => {
    fetchAttendances();
  }, [page, search, dateFilter]);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const response = await attendanceApi.getAttendances({ search, date: dateFilter, per_page: 10, page });
      setAttendances(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (error) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const openView = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setViewOpen(true);
  };

  const handleSuccess = () => {
    fetchAttendances();
  };

  // QR Scan handler – now shows member info modal first
  const handleQRScan = async (qrCode: string) => {
    setScanning(true);
    try {
      // Fetch member by QR code (using the existing memberApi)
      // We need to add a method to search by QR code in memberApi
      // For now, we'll use a workaround: fetch all members and filter
      // Or we can add a dedicated endpoint
      // I'll assume we have a new endpoint: /admin/members/by-qr/{qrCode}
      // Let's add a new method in memberApi: getMemberByQR(qrCode)
      // For now, I'll use a temporary method
      const response = await memberApi.getMemberByQR(qrCode);
      const member = response.data;

      // Check if member can clock in/out (active contract)
      if (member.contract_status !== 'active') {
        toast.error('Member cannot clock in/out. Contract is not active.');
        setScannerOpen(false);
        return;
      }

      // Check if already clocked in today
      // We can check by fetching today's attendance for this member
      const todayAttendances = await attendanceApi.getAttendances({ member_id: member.id, date: new Date().toISOString().split('T')[0] });
      const activeAttendance = todayAttendances.data.find((a: any) => a.time_out === null);

      setScannedMember(member);
      setScanAction(activeAttendance ? 'clock_out' : 'clock_in');
      setScanResultModalOpen(true);
      setScannerOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch member');
    } finally {
      setScanning(false);
    }
  };

  // Confirm clock in/out
  const handleConfirmClock = async () => {
    if (!scannedMember) return;
    setScanning(true);
    try {
      // Use the scan endpoint with the member's QR code
      const response = await attendanceApi.scanQR(scannedMember.qr_code);
      toast.success(response.message);
      setScanResultModalOpen(false);
      setScannedMember(null);
      setScanAction(null);
      handleSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Clock action failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <CashierLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <Clock className="w-7 h-7 text-red-500" />
            Attendance
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-blue-600/20"
            >
              <QrCode size={18} />
              QR Scan
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-600/20"
            >
              <Plus size={18} />
              Manual Entry
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 mb-6 shadow-xl shadow-red-500/5">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Name, email, QR code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#1e242c] border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
              </div>
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl shadow-red-500/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1e242c] text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Time In</th>
                  <th className="px-4 py-3 text-left">Time Out</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-24"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-32"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-32"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-16"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-20"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-20 mx-auto"></div></td>
                    </tr>
                  ))
                ) : attendances.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No attendance records found</td></tr>
                ) : (
                  attendances.map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-700/20 transition group">
                      <td className="px-4 py-3 text-white font-medium">
                        {attendance.member?.firstname} {attendance.member?.lastname}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {new Date(attendance.time_in).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {attendance.time_out ? new Date(attendance.time_out).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          attendance.time_out ? 'bg-green-600/30 text-green-300' : 'bg-yellow-600/30 text-yellow-300'
                        }`}>
                          {attendance.time_out ? 'Clocked Out' : 'Clocked In'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {new Date(attendance.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openView(attendance)} className="p-1.5 text-blue-400 hover:text-white border border-blue-400/30 hover:bg-blue-500/20 rounded-lg transition group-hover:border-blue-400/60" title="View">
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm text-gray-400">
            <span>Page {pagination.current_page} of {pagination.last_page}</span>
            <div className="flex gap-2">
              <button onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="px-4 py-1.5 bg-[#1e242c] rounded-lg disabled:opacity-50 hover:bg-gray-700/30 transition border border-gray-700/30">Previous</button>
              <button onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page} className="px-4 py-1.5 bg-[#1e242c] rounded-lg disabled:opacity-50 hover:bg-gray-700/30 transition border border-gray-700/30">Next</button>
            </div>
          </div>
        )}

        {/* Modals */}
        <CreateAttendanceModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSuccess={handleSuccess} />
        {/* <UpdateAttendanceModal isOpen={updateOpen} onClose={() => { setUpdateOpen(false); setSelectedAttendance(null); }} onSuccess={handleSuccess} attendance={selectedAttendance} /> */}
        <ViewAttendanceModal isOpen={viewOpen} onClose={() => { setViewOpen(false); setSelectedAttendance(null); }} attendance={selectedAttendance} />
        {/* <DeleteAttendanceModal isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); setSelectedAttendance(null); }} onSuccess={handleSuccess} attendance={selectedAttendance} /> */}

        {/* QR Scanner */}
        <QRScanner
          isOpen={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onScan={handleQRScan}
          loading={scanning}
        />

        {/* Member Scan Result Modal */}
        <MemberScanResultModal
          isOpen={scanResultModalOpen}
          onClose={() => { setScanResultModalOpen(false); setScannedMember(null); setScanAction(null); }}
          onConfirm={handleConfirmClock}
          member={scannedMember}
          loading={scanning}
          action={scanAction}
        />
      </div>
    </CashierLayout>
  );
};
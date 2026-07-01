import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface WalkInRecord {
  id: number;
  firstname: string;
  middlename?: string;
  lastname: string;
  suffix?: string;
  email: string;
  contact: string;
  total_visits: number;
}

const WalkIn = () => {
  const [walkins, setWalkins] = useState<WalkInRecord[]>([
    { id: 1, firstname: 'Carlos', lastname: 'Reyes', email: 'carlos@email.com', contact: '09171234567', total_visits: 3 },
    { id: 2, firstname: 'Maria', lastname: 'Santos', email: 'maria@email.com', contact: '09281234567', total_visits: 1 },
  ]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<WalkInRecord | null>(null);
  const [form, setForm] = useState({ firstname: '', middlename: '', lastname: '', suffix: '', email: '', contact: '' });

  const filtered = walkins.filter(w =>
    `${w.firstname} ${w.lastname}`.toLowerCase().includes(search.toLowerCase()) ||
    w.email.toLowerCase().includes(search.toLowerCase()) ||
    w.contact.includes(search)
  );

  const openCreate = () => {
    setEditTarget(null);
    setForm({ firstname: '', middlename: '', lastname: '', suffix: '', email: '', contact: '' });
    setShowModal(true);
  };

  const openEdit = (record: WalkInRecord) => {
    setEditTarget(record);
    setForm({ firstname: record.firstname, middlename: record.middlename || '', lastname: record.lastname, suffix: record.suffix || '', email: record.email, contact: record.contact });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      setWalkins(prev => prev.map(w => w.id === editTarget.id ? { ...w, ...form } : w));
      toast.success('Walk-in record updated!');
    } else {
      setWalkins(prev => [...prev, { id: Date.now(), ...form, total_visits: 1 }]);
      toast.success('Walk-in customer registered!');
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this walk-in record?')) {
      setWalkins(prev => prev.filter(w => w.id !== id));
      toast.success('Record deleted.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Walk-in Customers</h1>
        <button
          onClick={openCreate}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-red-500/20"
        >
          <Plus size={20} /> Register Walk-in
        </button>
      </div>

      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-700/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
              placeholder="Search walk-ins..."
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <span className="text-gray-500 text-sm">{filtered.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900/50 text-xs uppercase text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Total Visits</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <User size={40} className="mx-auto mb-3 opacity-20" />
                    No walk-in records found.
                  </td>
                </tr>
              ) : filtered.map(w => (
                <tr key={w.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-200">
                    {w.firstname} {w.middlename ? w.middlename[0] + '.' : ''} {w.lastname} {w.suffix || ''}
                  </td>
                  <td className="px-6 py-4">{w.email}</td>
                  <td className="px-6 py-4">{w.contact}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md text-xs font-semibold">
                      {w.total_visits} {w.total_visits === 1 ? 'visit' : 'visits'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(w)} className="text-gray-400 hover:text-blue-400 transition-colors p-1.5 bg-gray-800 rounded-md hover:bg-gray-700">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(w.id)} className="text-gray-400 hover:text-red-400 transition-colors p-1.5 bg-gray-800 rounded-md hover:bg-gray-700">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X size={22} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">
              {editTarget ? 'Edit Walk-in Customer' : 'Register Walk-in Customer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">First Name *</label>
                  <input required value={form.firstname} onChange={e => setForm(f => ({ ...f, firstname: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 px-4 text-gray-200 focus:outline-none focus:border-red-500 transition-colors text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Middle Name</label>
                  <input value={form.middlename} onChange={e => setForm(f => ({ ...f, middlename: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 px-4 text-gray-200 focus:outline-none focus:border-red-500 transition-colors text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Last Name *</label>
                  <input required value={form.lastname} onChange={e => setForm(f => ({ ...f, lastname: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 px-4 text-gray-200 focus:outline-none focus:border-red-500 transition-colors text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Suffix</label>
                  <input value={form.suffix} onChange={e => setForm(f => ({ ...f, suffix: e.target.value }))} placeholder="Jr., Sr., III..." className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 px-4 text-gray-200 focus:outline-none focus:border-red-500 transition-colors text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 px-4 text-gray-200 focus:outline-none focus:border-red-500 transition-colors text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Contact *</label>
                <input required value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 px-4 text-gray-200 focus:outline-none focus:border-red-500 transition-colors text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors font-medium shadow-lg shadow-red-500/20">
                  {editTarget ? 'Update' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalkIn;

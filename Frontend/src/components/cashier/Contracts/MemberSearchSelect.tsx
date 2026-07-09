import { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';

interface MemberSearchSelectProps {
  value: number | '';
  onChange: (id: number | '') => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface MemberOption {
  id: number;
  fullName: string;
  email: string;
}

export const MemberSearchSelect = ({
  value,
  onChange,
  placeholder = 'Search member...',
  disabled = false,
  className = '',
}: MemberSearchSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load members on search change
  useEffect(() => {
    if (search.length > 0 || isOpen) {
      fetchMembers();
    }
  }, [search, isOpen]);

  // Replace the fetchMembers function
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/cashier/members?search=${search}&per_page=20`);
      setMembers(response.data.data.data.map((m: any) => ({
        id: m.id,
        fullName: `${m.firstname} ${m.lastname}${m.suffix ? ' ' + m.suffix : ''}`,
        email: m.email,
      })));
    } catch (error) {
      console.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: number) => {
    onChange(id);
    setIsOpen(false);
    // Set the selected member name as display
    const selected = members.find(m => m.id === id);
    if (selected) setSearch(selected.fullName);
  };

  const selectedMember = members.find(m => m.id === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        value={search || (selectedMember ? selectedMember.fullName : '')}
        onChange={(e) => {
          setSearch(e.target.value);
          if (e.target.value === '') onChange('');
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
      />
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-[#1e242c] border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-2 text-gray-400 text-sm">Loading...</div>
          ) : members.length === 0 ? (
            <div className="px-4 py-2 text-gray-400 text-sm">No members found</div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="px-4 py-2 hover:bg-gray-700/30 cursor-pointer text-white transition"
                onClick={() => handleSelect(member.id)}
              >
                <div className="font-medium">{member.fullName}</div>
                <div className="text-xs text-gray-400">{member.email}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
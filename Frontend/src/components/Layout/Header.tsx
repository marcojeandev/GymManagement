import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const Header = () => {
  const navigate = useNavigate();

    const handleLogout = async () => {
    try {
        await authService.logout();
    } catch {
        // ignore
    } finally {
        localStorage.removeItem('token');   // ✅ required
        localStorage.removeItem('user');
        // If you use axios defaults, also:
        // delete api.defaults.headers.Authorization;
        navigate('/login');
        toast.success('Logged out');
    }
    };
};
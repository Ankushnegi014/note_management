import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/auth.slice';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, token } = useSelector((state) => state.auth);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(loginUser(form));
        if (result.meta.requestStatus === 'fulfilled') {
            navigate('/');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <form
                onSubmit={handleSubmit}
                className="p-6 rounded shadow-md w-96 space-y-4"
            >
                <h1 className="text-xl font-bold">Login</h1>
                {error && <p className="text-red-500">{error}</p>}
                <div className='flex flex-col gap-4'>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border-gray-400 rounded border-2 px-2 py-1.5"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border-gray-400 rounded border-2 px-2 py-1.5"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
                <p className="text-sm">
                    Don’t have an account? <Link to="/signup" className="text-blue-500">Sign up</Link>
                </p>
            </form>
        </div>
    );
}

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/auth.slice';
import { useNavigate, Link } from 'react-router-dom';

export default function Sign() {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(registerUser(form));
        if (result.meta.requestStatus === 'fulfilled') {
            navigate('/login');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md w-96 space-y-4"
            >
                <h1 className="text-xl font-bold">Sign Up</h1>
                {error && <p className="text-red-500">{error}</p>}
                <div className='flex flex-col gap-4'>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                    >
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </div>
                <p className="text-sm">
                    Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
                </p>
            </form>
        </div>
    );
}

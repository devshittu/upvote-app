import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = ({ socket }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e) => {
    if (username.trim() && password.trim()) {
      e.preventDefault();
      console.log({ username, password });
      socket.emit('login', { username, password });
      setPassword('');
      setUsername('');
    }
  };
  useEffect(() => {
    socket.on('loginSuccess', (data) => {
      toast.success(data.message);
      //👇🏻 Saves the user's id and email to local storage for easy identification & for making authorized requests
      localStorage.setItem('_id', data.data._id);
      localStorage.setItem('_myEmail', data.data._email);
      //👇🏻 Redirects the user to the Photos component
      navigate('/photos');
    });
    //👇🏻 Notifies the user of the error message
    socket.on('loginError', (error) => {
      toast.error(error);
    });
  }, [socket, navigate]);
  return (
    <div className="login">
      <h2 style={{ marginBottom: '30px' }}>Login</h2>
      <form className="login__form" method="POST" onSubmit={handleSignIn}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          className="input"
          name="username"
          id="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          className="input"
          name="password"
          id="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="loginBtn">LOG IN</button>
        <p style={{ textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Link className="link" to="/register">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;

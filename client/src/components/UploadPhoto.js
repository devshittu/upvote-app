import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UploadPhoto = ({ socket }) => {
  const navigate = useNavigate();
  const [photoURL, setPhotoURL] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    //👇🏻 Gets the id and email from the local storage
    const id = localStorage.getItem('_id');
    const email = localStorage.getItem('_myEmail');
    /*
    👇🏻 triggers an event to the server 
    containing the user's credentials and the image url 
    */
    socket.emit('uploadPhoto', { id, email, photoURL });
  };

  useEffect(() => {
    function authenticateUser() {
      const id = localStorage.getItem('_id');
      /*
        👇🏻 If ID is false, redirects the user to the login page
        */
      if (!id) {
        navigate('/');
      }
    }
    authenticateUser();
  }, [navigate]);

  return (
    <main className="uploadContainer">
      <div className="uploadText">
        <h2>Upload Image</h2>
        <form method="POST" onSubmit={handleSubmit}>
          <label>Paste the image URL</label>
          <input
            type="text"
            name="fileImage"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
          />
          <button className="uploadBtn">UPLOAD</button>
        </form>
      </div>
    </main>
  );
};

export default UploadPhoto;

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [webhooks, setWebhooks] = useState({});
  const [newWebhook, setNewWebhook] = useState({
    email: '',
    webhookUrl: '',
    isCatchall: false
  });
  const [stats, setStats] = useState({
    totalWebhooks: 0,
    activeWebhooks: 0,
    totalProcessed: 0
  });

  // Socket connection
  useEffect(() => {
    const socket = io(process.env.REACT_APP_BACKEND_URL);
    
    // Listen for webhook stats
    socket.on('webhookStats', (data) => {
      setStats({
        totalWebhooks: data.totalWebhooks,
        activeWebhooks: data.activeWebhooks,
        totalProcessed: data.processingStats[0]?.totalProcessed || 0
      });
    });

    // Listen for webhook mapping updates
    socket.on('webhookMappingUpdated', (mapping) => {
      setWebhooks(prev => ({
        ...prev,
        [mapping.email]: mapping.webhookUrl
      }));
    });

    // Listen for webhook mapping deletions
    socket.on('webhookMappingDeleted', (data) => {
      const { key } = data;
      setWebhooks(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    });

    return () => socket.disconnect();
  }, []);

  // Fetch current user and webhooks on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get('/api/auth/me');
        setUser(userResponse.data);

        const webhooksResponse = await axios.get('/api/webhooks');
        setWebhooks(webhooksResponse.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };

    fetchData();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', {
        username: e.target.username.value,
        password: e.target.password.value
      });
      setUser(response.data.user);
    } catch (error) {
      alert('Login failed');
    }
  };

  const handleAddWebhook = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/webhooks', newWebhook);
      setNewWebhook({
        email: '',
        webhookUrl: '',
        isCatchall: false
      });
    } catch (error) {
      alert('Failed to add webhook');
    }
  };

  const handleDeleteWebhook = async (key) => {
    try {
      await axios.delete(`/api/webhooks/${key}`);
    } catch (error) {
      alert('Failed to delete webhook');
    }
  };

  if (!user) {
    return (
      <div>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            name="username" 
            placeholder="Username" 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            required 
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1>Webhook Admin Panel</h1>
      
      <div>
        <h2>Stats</h2>
        <p>Total Webhooks: {stats.totalWebhooks}</p>
        <p>Active Webhooks: {stats.activeWebhooks}</p>
        <p>Total Processed: {stats.totalProcessed}</p>
      </div>

      <div>
        <h2>Current Webhook Mappings</h2>
        <table>
          <thead>
            <tr>
              <th>Email/Type</th>
              <th>Webhook URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(webhooks).map(([key, url]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{url}</td>
                <td>
                  <button onClick={() => handleDeleteWebhook(key)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2>Add New Webhook Mapping</h2>
        <form onSubmit={handleAddWebhook}>
          <input 
            type="text" 
            placeholder="Email (or leave blank for catchall)" 
            value={newWebhook.email}
            onChange={(e) => setNewWebhook(prev => ({
              ...prev, 
              email: e.target.value
            }))}
          />
          <input 
            type="text" 
            placeholder="Webhook URL" 
            value={newWebhook.webhookUrl}
            onChange={(e) => setNewWebhook(prev => ({
              ...prev, 
              webhookUrl: e.target.value
            }))}
            required 
          />
          <label>
            <input 
              type="checkbox" 
              checked={newWebhook.isCatchall}
              onChange={(e) => setNewWebhook(prev => ({
                ...prev, 
                isCatchall: e.target.checked
              }))}
            />
            Catchall Webhook
          </label>
          <button type="submit">Add Webhook</button>
        </form>
      </div>
    </div>
  );
}

export default App;

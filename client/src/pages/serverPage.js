import React, { useState, useEffect } from 'react';
import {QRCodeCanvas} from 'qrcode.react';
import DartCounterServer from '../vibedartServer.js';

function ServerPage() {
  const [networkInfo, setNetworkInfo] = useState({
    ip: 'detecting...',
    port: '',
    connectionUrl: ''
  });

  useEffect(() => {
    // Fetch network info from server
    const fetchNetworkInfo = async () => {
      try {
        const response = await fetch('/network-info');
        const data = await response.json();
        setNetworkInfo(data);
      } catch (error) {
        console.error("Couldn't fetch network info:", error);
        setNetworkInfo({
          ip: 'localhost',
          port: 300,
          connectionUrl: 'http://localhost:3000'
        });
      }
    };

    fetchNetworkInfo();
  }, []);

  return (
    <div className="server-page">
      <h1>Dart Counter - Server Display</h1>
      
      <div className="connection-info">
        <h3>Server Connection Info:</h3>
        <div className="info-grid">
          <div className="info-row">
            <span className="info-label">Local IP:</span>
            <span className="info-value">{networkInfo.ip}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Port:</span>
            <span className="info-value">{networkInfo.port}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Client URL:</span>
            <span className="info-value">
              <a href={networkInfo.connectionUrl + '/client'} target="_blank" rel="noopener noreferrer">
                {networkInfo.connectionUrl + '/client'}
              </a>
            </span>
          </div>

        <div className="qr-code-container">
            {networkInfo.connectionUrl && (
              <>
                <QRCodeCanvas 
  value={networkInfo.connectionUrl + '/client'}
  size={128}
  level="H"
  includeMargin={true}
  fgColor="#2c3e50"
/>
                <p className="qr-instructions">Scan to connect mobile device</p>
              </>
            )}
          </div>
        </div>
        
        <div className="connection-help">
          <p>Mobile devices should connect to this server via the URL above.</p>
          <p>Ensure devices are on the same WiFi network.</p>
        </div>
      </div>

      <DartCounterServer />
    </div>
  );
}

export default ServerPage;
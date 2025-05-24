import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const DartCounterClient = () => {
  const [player, setPlayer] = useState({ 
    id: `player_${Date.now()}`, 
    name: '', 
    score: 0, 
    history: [] 
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameType, setGameType] = useState('');
  const [inputScore, setInputScore] = useState('');
  const [winner, setWinner] = useState(null);
  const socketRef = useRef(null);
  const namePrompted = useRef(false);


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
            port: 3000,
            connectionUrl: 'http://localhost:3000'
          });
        }
      };
  
      fetchNetworkInfo();
    }, []);

  useEffect(() => {
    // Only prompt for name once
    if (!player.name && !namePrompted.current) {
      namePrompted.current = true;
      const playerName = prompt('Enter your name') || `Player_${Math.floor(Math.random() * 1000)}`;
      setPlayer(p => ({ ...p, name: playerName }));
      return;
    }

    // Initialize socket only when we have a name but no socket
    if (player.name && !socketRef.current) {
      const newSocket = io('http://' + networkInfo.ip + ':3001', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      socketRef.current = newSocket;

      newSocket.emit('registerPlayer', { 
        id: player.id, 
        name: player.name 
      });

      newSocket.on('gameStarted', ({ players, gameType }) => {
        const thisPlayer = players.find(p => p.id === player.id);
        if (thisPlayer) {
          setPlayer(thisPlayer);
          setGameStarted(true);
          setGameType(gameType);
        }
      });

      newSocket.on('scoreUpdate', (updatedPlayers) => {
        const thisPlayer = updatedPlayers.find(p => p.id === player.id);
        
        if (thisPlayer) setPlayer(thisPlayer);
        console.log("player ", player.id, " was updated! ", thisPlayer);
      });

      newSocket.on('gameOver', (winningPlayer) => {
        setWinner(winningPlayer);
      });

      newSocket.on('gameReset', ({ players, gameType }) => {
        const thisPlayer = players.find(p => p.id === player.id);
        if (thisPlayer) {
          setPlayer(thisPlayer);
          setGameType(gameType);
          setWinner(null);
        }
      });

      return () => {
        // Only remove listeners, don't disconnect
        newSocket.off('gameStarted');
        newSocket.off('scoreUpdated');
        newSocket.off('gameOver');
        newSocket.off('gameReset');
      };
    }
  }, [player.name, player.id, networkInfo.ip]); // Only depend on name and id

  const handleScoreSubmit = (e) => {
    e.preventDefault();
    if (!inputScore || isNaN(inputScore)) return;
    
    const score = parseInt(inputScore);
    if (socketRef.current) {
      socketRef.current.emit('submitScore', { 
        playerId: player.id, 
        score,
        remaining: player.score - score
      });
    }
    setInputScore('');
  };

  if (winner) {
    return (
      <div className="dart-counter-client">
        <h1>{winner.name} wins the game!</h1>
        <p>Waiting for server to start a new game...</p>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="dart-counter-client">
        <h1>Welcome {player.name}!</h1>
        <p>Waiting for game to start...</p>
      </div>
    );
  }

  return (
    <div className="dart-counter-client">
      <h1>{player.name}</h1>
      <h2>Current Score: {player.score}</h2>
      <h3>Game: {gameType}</h3>
      
      <form onSubmit={handleScoreSubmit}>
        <input
          type="number"
          value={inputScore}
          onChange={(e) => setInputScore(e.target.value)}
          placeholder="Enter your score"
          autoFocus
        />
        <button type="submit">Submit</button>
      </form>
      
      <div className="score-history">
        <h4>Last throws:</h4>
        {player.history.slice().reverse().map((score, index) => (
          <div key={index}>{score}</div>
        ))}
      </div>
    </div>
  );
};

export default DartCounterClient;
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const DartCounterClient = () => {

    const [networkInfo, setNetworkInfo] = useState({
      ip: 'detecting...',
      port: '',
      connectionUrl: ''
    });

  useEffect(() => {
  const fetchNetworkInfo = async () => {
    if(networkInfo.ip === 'detecting...'){
    try {
      // Use full URL in development if proxy isn't working
      const backendUrl = process.env.NODE_ENV === 'development' 
        ? '/network-info' 
        : '/network-info';
      
      const response = await fetch(backendUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Network info received:', data);  // Debug log
      setNetworkInfo(data);
      console.log("Network info: ", networkInfo);
    } catch (error) {
      console.error("Couldn't fetch network info:", error);
      setNetworkInfo({
        ip: 'localhost',
        port: 3000,
        connectionUrl: 'http://localhost:3000/client'  // Added /client path
      });
    }
  }
  };

  fetchNetworkInfo();
}, [networkInfo]);

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




  useEffect(() => {
  console.log('NetworkInfo state updated:', networkInfo);
}, [networkInfo]);

  useEffect(() => {
    // Only prompt for name once
    if (!player.name && !namePrompted.current) {
      namePrompted.current = true;
      const playerName = prompt('Bitte Spielernamen eingeben: ') || `Player_${Math.floor(Math.random() * 1000)}`;
      setPlayer(p => ({ ...p, name: playerName }));
      return;
    }

    // Initialize socket only when we have a name but no socket
    if (player.name && !socketRef.current && networkInfo.ip !== 'detecting...') {
      console.log('trying to connect to socket @ http://' + networkInfo.ip + ':3001');
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
    
    let score = parseInt(inputScore);
    if(score < 0) return; //do not input negatives
    //hier auch logik für nur mit double auuswerfen - irgendwann
    if(player.score - score < 0){
      alert("Überworfen!");
      score = 0;
    }

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
        <h1>{winner.name} gewinnt den Leg!</h1>
        <p>Warte, bis ein neues Spiel gestartet wird...</p>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="dart-counter-client">
        <h1>Willkommen, {player.name}!</h1>
        <p>Warten auf Spielstart...</p>
      </div>
    );
  }

  return (
    <div className="dart-counter-client">
      <h1>{player.name}</h1>
      <h2>Score: {player.score}</h2>
      <h3>Spieltyp: {gameType}</h3>
      
      <form onSubmit={handleScoreSubmit}>
        <input
          type="number"
          value={inputScore}
          onChange={(e) => setInputScore(e.target.value)}
          placeholder="Wurf eintragen"
          autoFocus
        />
        <button type="submit">Eintragen!</button>
      </form>
      
      <div className="score-history">
        <h4>Letzte Würfe (Durchschnitt: {player.history.reduce((accumulator, currentValue) => {
  return accumulator + currentValue
},0)/player.history.length}):</h4>
        {player.history.slice().reverse().map((score, index) => (
          <div key={index}>{score}</div>
        ))}
      </div>
    </div>
  );
};

export default DartCounterClient;
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const DartCounterServer = () => {
  const [players, setPlayers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameType, setGameType] = useState('301');
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Listen for player connections
    newSocket.on('playerConnected', (player) => {
      setPlayers(prev => [...prev, player]);
    });

    // Listen for score updates
    newSocket.on('scoreUpdate', (updatedPlayers) => {
      setPlayers(updatedPlayers);
      
      // Check for winner
      const gameWinner = updatedPlayers.find(p => p.score <= 0);
      if (gameWinner) {
        setWinner(gameWinner);
        newSocket.emit('gameOver', gameWinner);
      }
    });

    return () => newSocket.close();
  }, []);

  const startGame = () => {
    if (players.length === 0) return;
    
    const initialPlayers = players.map(player => ({
      ...player,
      score: parseInt(gameType),
      history: []
    }));
    
    socket.emit('startGame', { players: initialPlayers, gameType });
    setPlayers(initialPlayers);
    setGameStarted(true);
    setWinner(null);
  };

  const resetGame = () => {
    socket.emit('resetGame');
    setPlayers(players.map(p => ({ ...p, score: parseInt(gameType), history: [] })));
    setWinner(null);
  };

  return (
    <div className="dart-counter-server">
      <h1>Dart Counter - Server Display</h1>
      
      {!gameStarted ? (
        <div className="setup-phase">
          <h2>Game Setup</h2>
          <div>
            <label>Game Type: </label>
            <select value={gameType} onChange={(e) => setGameType(e.target.value)}>
              <option value="301">301</option>
              <option value="501">501</option>
              <option value="701">701</option>
            </select>
          </div>
          <button onClick={startGame} disabled={players.length === 0}>
            Start Game ({players.length} players connected)
          </button>
          
          <div className="connected-players">
            <h3>Connected Players:</h3>
            <ul>
              {players.map((player, index) => (
                <li key={index}>{player.name} (ID: {player.id})</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="game-phase">
          {winner ? (
            <div className="winner-message">
              <h2>Game Over! {winner.name} wins!</h2>
              <button onClick={resetGame}>New Game</button>
            </div>
          ) : (
            <>
              <h2>Game: {gameType}</h2>
              <button onClick={resetGame}>Reset Game</button>
              
              <div className="scoreboard">
                {players.map((player, index) => (
                  <div key={index} className="player-score">
                    <h3>{player.name}</h3>
                    <div className="current-score">{player.score}</div>
                    <div className="score-history">
                      {player.history.map((score, i) => (
                        <span key={i}>{score}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DartCounterServer;
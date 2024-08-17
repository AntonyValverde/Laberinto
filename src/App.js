import React, { useState, useEffect } from 'react';

const App = () => {
  const [maze, setMaze] = useState([]);
  const [position, setPosition] = useState({ x: 1, y: 1 });
  const [level, setLevel] = useState(1);
  const [showFullMaze, setShowFullMaze] = useState(false);
  const [attempts, setAttempts] = useState(3); // Tres intentos disponibles para el comodín
  const visionRange = 2;

  useEffect(() => {
    loadMaze(level);
  }, [level]);

  const loadMaze = (level) => {
    fetch(`/maze-levels/level${level}.txt`)
      .then((response) => response.text())
      .then((text) => {
        const rows = text.split('\n').map(row => row.split(''));
        setMaze(rows);
        setPosition({ x: 1, y: 1 });
      });
  };

  const handleKeyDown = (e) => {
    let { x, y } = position;
    if (e.key === 'ArrowUp' && (maze[y - 1][x] === ' ' || maze[y - 1][x] === 'E')) y--;
    if (e.key === 'ArrowDown' && (maze[y + 1][x] === ' ' || maze[y + 1][x] === 'E')) y++;
    if (e.key === 'ArrowLeft' && (maze[y][x - 1] === ' ' || maze[y][x - 1] === 'E')) x--;
    if (e.key === 'ArrowRight' && (maze[y][x + 1] === ' ' || maze[y][x + 1] === 'E')) x++;

    setPosition({ x, y });

    // Verificar si se ha llegado al final del laberinto
    if (maze[y][x] === 'E') {
      setLevel((prevLevel) => prevLevel + 1);
    }
  };

  const useWildcard = () => {
    if (attempts > 0) {
      setShowFullMaze(true);
      setAttempts(attempts - 1);
      setTimeout(() => {
        setShowFullMaze(false);
      }, 5000); // Muestra el laberinto por 5 segundos
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position]);

  return (
    <div className="maze-container">
      {maze.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, cellIndex) => {
            const isWithinVision = 
              showFullMaze || 
              (Math.abs(position.x - cellIndex) <= visionRange &&
              Math.abs(position.y - rowIndex) <= visionRange);

            return (
              <div
                key={cellIndex}
                className={
                  isWithinVision
                    ? cell === '#' ? 'wall' : cell === 'E' ? 'end' : 'path'
                    : 'hidden'
                }
              >
                {isWithinVision && position.x === cellIndex && position.y === rowIndex && (
                  <div className="ball"></div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div className="controls">
        <button onClick={useWildcard} disabled={attempts === 0}>
          Usar comodín ({attempts} intentos restantes)
        </button>
        <div className="level-indicator">Level: {level}</div>
      </div>
    </div>
  );
};

export default App;

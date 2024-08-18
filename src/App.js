import React, { useState, useEffect } from 'react';

const App = () => {
  const [maze, setMaze] = useState([]);
  const [position, setPosition] = useState({ x: 1, y: 1 });
  const [enemies, setEnemies] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [level, setLevel] = useState(1);
  const [showFullMaze, setShowFullMaze] = useState(false);
  const [attempts, setAttempts] = useState(3);
  const [visionRange, setVisionRange] = useState(2);

  useEffect(() => {
    loadMaze(level);
  }, [level]);

  const loadMaze = (level) => {
    fetch(`/maze-levels/level${level}.txt`)
      .then((response) => response.text())
      .then((text) => {
        const rows = text.split('\n').map(row => row.split(''));
        const newEnemies = [];
        const newPowerUps = [];

        rows.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell === 'X') {
              newEnemies.push({ x, y, direction: 'right' });
              rows[y][x] = ' '; // Limpiar la celda después de agregar el enemigo
            } else if (cell === 'P') {
              newPowerUps.push({ x, y });
              rows[y][x] = ' '; // Limpiar la celda después de agregar el poder
            }
          });
        });

        setMaze(rows);
        setPosition({ x: 1, y: 1 });
        setEnemies(newEnemies);
        setPowerUps(newPowerUps);
      });
  };

  const moveEnemies = () => {
    setEnemies(prevEnemies =>
      prevEnemies.map(enemy => {
        let { x, y, direction } = enemy;

        if (direction === 'right' && maze[y][x + 1] !== '#') x++;
        else if (direction === 'right') direction = 'left';

        if (direction === 'left' && maze[y][x - 1] !== '#') x--;
        else if (direction === 'left') direction = 'right';

        if (direction === 'down' && maze[y + 1][x] !== '#') y++;
        else if (direction === 'down') direction = 'up';

        if (direction === 'up' && maze[y - 1][x] !== '#') y--;
        else if (direction === 'up') direction = 'down';

        return { x, y, direction };
      })
    );
  };

  const handleKeyDown = (e) => {
    handleMovement(e.key);
  };

  const handleMovement = (direction) => {
    let { x, y } = position;
    if (direction === 'ArrowUp' && (maze[y - 1][x] === ' ' || maze[y - 1][x] === 'E')) y--;
    if (direction === 'ArrowDown' && (maze[y + 1][x] === ' ' || maze[y + 1][x] === 'E')) y++;
    if (direction === 'ArrowLeft' && (maze[y][x - 1] === ' ' || maze[y][x - 1] === 'E')) x--;
    if (direction === 'ArrowRight' && (maze[y][x + 1] === ' ' || maze[y][x + 1] === 'E')) x++;

    setPosition({ x, y });

    // Verificar si la pelota choca con un enemigo
    if (enemies.some(enemy => enemy.x === x && enemy.y === y)) {
      alert('¡Perdiste! La pelota chocó con un enemigo.');
      setLevel(1);
      loadMaze(1);
    }

    // Verificar si se ha recogido un poder especial
    if (powerUps.some(power => power.x === x && power.y === y)) {
      setVisionRange(5); // Aumentar el rango de visión temporalmente
      setPowerUps(prev => prev.filter(power => !(power.x === x && power.y === y)));
      setTimeout(() => setVisionRange(2), 5000); // Volver al rango normal después de 5 segundos
    }

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
    const enemyInterval = setInterval(moveEnemies, 500); // Mueve enemigos cada 0.5 segundos
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(enemyInterval);
    };
  }, [position, enemies]);

  return (
    <div className="maze-container">
      {maze.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, cellIndex) => {
            const isWithinVision = 
              showFullMaze || 
              (Math.abs(position.x - cellIndex) <= visionRange &&
              Math.abs(position.y - rowIndex) <= visionRange);

            const isEnemy = enemies.some(enemy => enemy.x === cellIndex && enemy.y === rowIndex);
            const isPowerUp = powerUps.some(power => power.x === cellIndex && power.y === rowIndex);

            return (
              <div
                key={cellIndex}
                className={
                  isEnemy ? 'enemy' :
                  isPowerUp ? 'power-up' :
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
      {/* Controles para dispositivos móviles */}
      <div className="mobile-controls">
        <button onClick={() => handleMovement('ArrowUp')}>⬆️</button>
        <div>
          <button onClick={() => handleMovement('ArrowLeft')}>⬅️</button>
          <button onClick={() => handleMovement('ArrowDown')}>⬇️</button>
          <button onClick={() => handleMovement('ArrowRight')}>➡️</button>
        </div>
      </div>
    </div>
  );
};

export default App;

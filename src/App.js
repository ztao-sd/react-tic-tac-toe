import { useState } from "react";

function Square({ value, onSquareClick, highlighted = false }) {
  let styles = "Game-Board-Square";
  if (highlighted) {
    styles = styles.concat(" ", "Game-Board-Square_highlighted");
  }
  return (
    <button className={styles} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, winner, winningSquares }) {
  function handleClick(i) {
    if (squares[i] || winner) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares, i);
  }

  const squaresFactory = squares.map((value, idx) => {
    // map over squares
    return (
      <Square
        key={idx}
        value={value}
        onSquareClick={() => handleClick(idx)}
        highlighted={winningSquares.has(idx)}
      />
    );
  });

  return (
    <>
      <div className="Game-Board">{squaresFactory}</div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [lineHistory, setLineHistory] = useState([Array(8).fill(0)]);
  const [moveHistory, setMoveHistory] = useState(Array(2).fill(null));
  const [winningSquares, setWinningSquares] = useState(new Set());
  const [winner, setWinner] = useState(null);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 == 0;
  const currentSquares = history[currentMove];
  const currentLines = lineHistory[currentMove];

  function calculateWinner(nexthistory, nextMove, idx) {
    const size = 3;
    const row = Math.floor(idx / size);
    const col = idx % size;
    const squares = nexthistory[nextMove];
    const player = squares[idx];
    const nextLines = currentLines.slice();
    const increment = player === "X" ? 1 : -1;
    const winCondition = player === "X" ? 3 : -3;

    // Check horizontal
    nextLines[row] += increment;
    // Check vertical
    nextLines[col + size] += increment;
    // Check diagonal
    if (row === col) {
      nextLines[2 * size] += increment;
    }
    if (row + col === size - 1) {
      nextLines[2 * size + 1] += increment;
    }
    setLineHistory([...lineHistory.slice(0, currentMove + 1), nextLines]);

    // Check win conditions
    if (nextLines[row] === winCondition) {
      setWinningSquares(new Set(Array.from([0, 1, 2], (x) => x + row)));
      return player;
    }
    if (nextLines[col + size] === winCondition) {
      setWinningSquares(new Set(Array.from([0, 1, 2], (x) => x * size + col)));
      return player;
    }
    if (nextLines[2 * size] === winCondition) {
      setWinningSquares(new Set([0, 4, 8]));
      return player;
    }
    if (nextLines[2 * size + 1] === winCondition) {
      setWinningSquares(new Set([2, 4, 6]));
      return player;
    }
    setWinningSquares(new Set());
    return null;
  }

  function handlePlay(nextSquares, idx) {
    const nextMove = currentMove + 1;
    setMoveHistory([
      ...moveHistory.slice(0, currentMove),
      [nextSquares[idx], idx],
    ]);
    const nextHistory = [...history.slice(0, nextMove), nextSquares];
    setCurrentMove(nextMove);
    setHistory(nextHistory);
    const winner = calculateWinner(nextHistory, nextMove, idx);
    setWinner(winner);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    const [, idx] = moveHistory[nextMove];
    setWinner(calculateWinner(history, nextMove, idx));
  }

  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (currentMove > 8) {
    status = "Draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  const moves = history.map((squares, move) => {
    // map over history index
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="Game">
      <div className="Game-Menu">{status}</div>
      <Board
        xIsNext={xIsNext}
        squares={currentSquares}
        onPlay={handlePlay}
        winner={winner}
        winningSquares={winningSquares}
      />
      <div className="Game-Log">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner2(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

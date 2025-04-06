"use client";

import React, { useState, useEffect } from "react";
import { Chess, Move, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { getBestMoveFromStockfish } from "./actions";

interface ChessBoardProps {
  initialPgn?: string;
  playerColor?: "white" | "black";
  onGameEnd?: (result: "win" | "loss" | "draw") => void;
}

type SquareStyles = Record<string, React.CSSProperties>;

export const ChessBoard: React.FC<ChessBoardProps> = ({
  initialPgn = "",
  playerColor = "white",
  onGameEnd,
}) => {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameStatus, setGameStatus] = useState<string>("");
  const [selectedSquare, setSelectedSquare] = useState<Square | "">("");
  const [possibleMoves, setPossibleMoves] = useState<SquareStyles>({});
  const [playerSide, setPlayerSide] = useState<"w" | "b">(
    playerColor.toLowerCase().startsWith("w") ? "w" : "b"
  );
  const [botSide, setBotSide] = useState<"w" | "b">(
    playerColor.toLowerCase().startsWith("w") ? "b" : "w"
  );
  const [gameEvaluation, setGameEvaluation] = useState(0.6);

  useEffect(() => {
    const newGame = new Chess();
    setPlayerSide(playerColor.toLowerCase().startsWith("w") ? "w" : "b");
    setBotSide(playerColor.toLowerCase().startsWith("w") ? "b" : "w");
    try {
      newGame.loadPgn(initialPgn);
      setGame(newGame);
      updateGameStatus(newGame);
    } catch {}
  }, [initialPgn, playerColor]);

  useEffect(() => {
    // Short delay before bot makes a move
    const botMoveTimeout = setTimeout(() => {
      if (game.turn() === botSide && !game.isGameOver()) {
        void makeBotMove();
      }
    }, 500);

    return () => clearTimeout(botMoveTimeout);
  }, [game, botSide]);

  useEffect(() => {
    localStorage.setItem("chessPGN", game.pgn());
    localStorage.setItem("chessPlayer", playerColor);
  }, [game, playerColor]);

  const updateGameStatus = (gameState: Chess) => {
    let status = `${gameState.turn() === "w" ? "White" : "Black"} to move`;
    let gameResult: "win" | "loss" | "draw" | null = null;

    if (gameState.isGameOver()) {
      if (gameState.isCheckmate()) {
        const winnerSide = gameState.turn() === "w" ? "b" : "w";
        status = `Checkmate! ${winnerSide === "w" ? "White" : "Black"} wins!`;

        // Determine if player won or lost
        gameResult = winnerSide === playerSide ? "win" : "loss";
      } else if (gameState.isDraw()) {
        status = "Draw!";
        gameResult = "draw";
      }

      // Log the game result to console
      if (gameResult) {
        console.log(`Game ended: Player ${gameResult}`);
        if (onGameEnd) {
          onGameEnd(gameResult);
        }
      }
    } else if (gameState.isCheck()) {
      status = `${gameState.turn() === "w" ? "White" : "Black"} is in check`;
    }

    setGameStatus(status);
  };

  const makeBotMove = async () => {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return;

    try {
      const { bestMove, evaluation } = await getBestMoveFromStockfish(
        game.fen()
      );

      console.log("Best move", bestMove);

      if (bestMove && evaluation) {
        const newGame = new Chess(game.fen());
        newGame.move(bestMove);
        setGameEvaluation(evaluation);

        setGame(newGame);
        updateGameStatus(newGame);
      } else {
        makeRandomMove();
      }
    } catch (error) {
      console.error("Error getting move from Stockfish:", error);
      makeRandomMove();
    }
  };

  const makeRandomMove = () => {
    const moves = game.moves({ verbose: true });
    if (moves.length > 0) {
      const randomIndex = Math.floor(Math.random() * moves.length);
      const randomMove = moves[randomIndex];

      const newGame = new Chess(game.fen());
      newGame.move({
        from: randomMove.from as Square,
        to: randomMove.to as Square,
        promotion: "q",
      });

      setGame(newGame);
      updateGameStatus(newGame);
    }
  };

  const onSquareClick = (square: Square) => {
    if (game.turn() !== playerSide || game.isGameOver()) return;

    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === playerSide) {
        setSelectedSquare(square);
        highlightPossibleMoves(square);
      }
    } else {
      if (possibleMoves[square]) {
        const move = makeMove({
          from: selectedSquare,
          to: square,
          promotion: "q", // Always promote to queen for simplicity
        });

        if (move) {
          setSelectedSquare("");
          setPossibleMoves({});
        }
      } else {
        const piece = game.get(square);
        if (piece && piece.color === playerSide) {
          setSelectedSquare(square);
          highlightPossibleMoves(square);
        } else {
          setSelectedSquare("");
          setPossibleMoves({});
        }
      }
    }
  };

  const highlightPossibleMoves = (square: Square) => {
    const moves: SquareStyles = {};
    game.moves({ square, verbose: true }).forEach((move) => {
      moves[move.to] = {
        background: "rgba(0, 128, 0, 0.4)",
        borderRadius: "50%",
      };
    });
    setPossibleMoves(moves);
  };

  interface MoveOptions {
    from: Square;
    to: Square;
    promotion?: "q" | "r" | "b" | "n";
  }

  const makeMove = (move: MoveOptions): Move | null => {
    try {
      const result = game.move(move);
      if (result) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        updateGameStatus(newGame);
        return result;
      }
      return null;
    } catch {
      return null;
    }
  };

  const customSquareStyles = (): SquareStyles => {
    const styles: SquareStyles = {};

    if (selectedSquare) {
      styles[selectedSquare] = {
        background: "rgba(255, 255, 0, 0.4)",
      };
    }

    return { ...styles, ...possibleMoves };
  };

  const onDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    if (game.turn() !== playerSide || game.isGameOver()) return false;

    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // Always promote to queen for simplicity
    });

    if (move === null) return false;
    setSelectedSquare("");
    setPossibleMoves({});
    return true;
  };

  // Calculate evaluation bar properties
  const getEvaluationBarProps = () => {
    // Clamp evaluation value between -10 and 10 for display purposes
    const clampedEval = Math.max(Math.min(gameEvaluation, 10), -10);

    // Calculate percentage for white's portion (0-100%)
    // When eval is 0, it's 50/50. When positive, white gets more space.
    let whitePercentage = 50 + clampedEval * 5; // 5% per evaluation point

    // Ensure within bounds (0-100%)
    whitePercentage = Math.max(Math.min(whitePercentage, 100), 0);

    return {
      whitePercentage,
      blackPercentage: 100 - whitePercentage,
    };
  };

  const { whitePercentage, blackPercentage } = getEvaluationBarProps();

  return (
    <div className="flex items-start">
      <div className="flex flex-row mx-auto">
        <div className="mr-4 flex flex-col w-4 h-[400px] mr-2 border border-gray-300 overflow-hidden">
          <div
            className="bg-gray-800"
            style={{ height: `${blackPercentage}%` }}
          ></div>
          <div
            className="bg-white"
            style={{ height: `${whitePercentage}%` }}
          ></div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-fit max-w-lg">
            <Chessboard
              position={game.fen()}
              onSquareClick={onSquareClick}
              onPieceDrop={onDrop}
              customSquareStyles={customSquareStyles()}
              boardWidth={400}
              boardOrientation={playerSide === "w" ? "white" : "black"}
            />
          </div>
          <div className="mt-4 p-2 border rounded-md w-full max-w-lg">
            <div className="flex justify-between items-center">
              <div className="font-medium">{gameStatus}</div>
              <div className="text-sm">
                Evaluation: {gameEvaluation > 0 ? "+" : ""}
                {gameEvaluation.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation Bar */}
    </div>
  );
};

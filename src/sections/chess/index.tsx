"use client";

import { useEffect, useState } from "react";
import { ChessBoard } from "./chess-board";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  PuzzleIcon as ChessPiece,
  Swords,
  Trophy,
  Medal,
  Frown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const MainChess = () => {
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [isGameStarting, setIsGameStarting] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showSurrenderDialog, setShowSurrenderDialog] = useState(false);
  const [gameResult, setGameResult] = useState<"win" | "loss" | "draw" | null>(
    null
  );
  const [gameKey, setGameKey] = useState(0);
  const [initialPgn, setInitialPgn] = useState<string>("");

  useEffect(() => {
    const savedPGN = localStorage.getItem("chessPGN");
    const chessPlayer = localStorage.getItem("chessPlayer");
    if (savedPGN && chessPlayer) {
      setPlayerColor(chessPlayer as "white" | "black");
      setIsGameStarting(true);
      setInitialPgn(savedPGN);
    }
  }, []);

  const handleStartGame = () => {
    setIsGameStarting(true);
    setGameKey((prevKey) => prevKey + 1);
  };

  const handleResetGame = () => {
    setShowSurrenderDialog(true);
  };

  const confirmSurrender = () => {
    console.log("Game ended: Player surrendered (loss)");
    setShowSurrenderDialog(false);
    setIsGameStarting(false);
  };

  const handleGameEnd = (result: "win" | "loss" | "draw") => {
    setGameResult(result);
    setShowResultDialog(true);
  };

  const startNewGame = () => {
    localStorage.setItem("chessPGN", "");
    setInitialPgn("");
    setGameResult(null);
    setShowResultDialog(false);
    setIsGameStarting(false);
    setGameKey((prevKey) => prevKey + 1);
  };

  const continueViewingBoard = () => {
    setShowResultDialog(false);
  };

  const getResultIcon = () => {
    switch (gameResult) {
      case "win":
        return <Trophy className="h-16 w-16 text-amber-500" />;
      case "draw":
        return <Medal className="h-16 w-16 text-blue-500" />;
      case "loss":
        return <Frown className="h-16 w-16 text-slate-500" />;
      default:
        return null;
    }
  };

  const getResultTitle = () => {
    switch (gameResult) {
      case "win":
        return "Victory!";
      case "draw":
        return "Draw!";
      case "loss":
        return "Defeat!";
      default:
        return "";
    }
  };

  const getResultDescription = () => {
    switch (gameResult) {
      case "win":
        return "Congratulations! You've won the game.";
      case "draw":
        return "The game ended in a draw.";
      case "loss":
        return "You've been defeated. Better luck next time!";
      default:
        return "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Chess Master</h1>

      {!isGameStarting ? (
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <ChessPiece className="h-6 w-6" />
              Game Setup
            </CardTitle>
            <CardDescription>
              Configure your game settings and choose your side
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Select Your Color</h3>
              <RadioGroup
                defaultValue={playerColor}
                onValueChange={(value: string) =>
                  setPlayerColor(value as "white" | "black")
                }
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="white" id="white" />
                  <Label
                    htmlFor="white"
                    className="flex items-center gap-2 cursor-pointer p-3 rounded-md border border-transparent hover:bg-accent transition-colors"
                  >
                    <div className="h-6 w-6 rounded-full bg-white border border-gray-300"></div>
                    <span>White</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="black" id="black" />
                  <Label
                    htmlFor="black"
                    className="flex items-center gap-2 cursor-pointer p-3 rounded-md border border-transparent hover:bg-accent transition-colors"
                  >
                    <div className="h-6 w-6 rounded-full bg-black border border-gray-300"></div>
                    <span>Black</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={handleStartGame}
              size="lg"
              className="w-full sm:w-auto"
            >
              <Swords className="mr-2 h-4 w-4" />
              Start Game
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Playing as{" "}
              <span
                className={cn(
                  "font-bold",
                  playerColor === "white" ? "text-slate-800" : "text-slate-950"
                )}
              >
                {playerColor}
              </span>
            </h2>
            <div className="space-x-2">
              {showResultDialog && !showResultDialog && (
                <Button onClick={startNewGame} variant="default">
                  New Game
                </Button>
              )}
              {gameResult === null && (
                <Button variant="outline" onClick={handleResetGame}>
                  Surrender
                </Button>
              )}
              {gameResult !== null && (
                <Button onClick={startNewGame} variant="default">
                  New Game
                </Button>
              )}
            </div>
          </div>

          <Card className="shadow-lg overflow-hidden">
            <CardContent className="p-0 sm:p-4">
              <ChessBoard
                key={gameKey}
                initialPgn={initialPgn}
                playerColor={playerColor}
                onGameEnd={handleGameEnd}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Game Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              {getResultIcon()}
              <DialogTitle className="text-2xl mt-4">
                {getResultTitle()}
              </DialogTitle>
            </div>
            <DialogDescription className="text-center pt-2">
              {getResultDescription()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-center gap-2 pt-4">
            <Button variant="outline" onClick={continueViewingBoard}>
              Continue Viewing
            </Button>
            <Button onClick={startNewGame}>New Game</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Surrender Confirmation Dialog */}
      <AlertDialog
        open={showSurrenderDialog}
        onOpenChange={setShowSurrenderDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-2">
              <X className="h-12 w-12 text-red-500" />
            </div>
            <AlertDialogTitle className="text-center">
              Are you sure you want to surrender?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Surrendering will count as a loss. Do you wish to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex sm:justify-center gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSurrender}
              className="bg-red-500 hover:bg-red-600"
            >
              Surrender
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

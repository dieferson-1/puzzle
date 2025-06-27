
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { Shuffle, RotateCcw, Trophy, Zap, Settings } from 'lucide-react';

function App() {
  const { toast } = useToast();
  
  // Configuración del puzzle
  const [gridSize, setGridSize] = useState(3); // 3x3 por defecto
  const [puzzle, setPuzzle] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [bestScores, setBestScores] = useState({});
  const [isShuffling, setIsShuffling] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Generar puzzle inicial basado en el tamaño de la cuadrícula
  const generateInitialPuzzle = (size) => {
    const totalSpaces = size * size;
    const numbers = Array.from({ length: totalSpaces - 1 }, (_, i) => i + 1);
    return [...numbers, null]; // Solo un espacio vacío al final
  };

  // Inicializar puzzle cuando cambia el tamaño
  useEffect(() => {
    const initialPuzzle = generateInitialPuzzle(gridSize);
    setPuzzle(initialPuzzle);
    setMoves(0);
    setIsWon(false);
  }, [gridSize]);

  // Cargar mejores puntuaciones del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('puzzle-best-scores');
    if (saved) {
      setBestScores(JSON.parse(saved));
    }
  }, []);

  // Verificar si el puzzle está resuelto
  const checkWin = (currentPuzzle) => {
    const winCondition = generateInitialPuzzle(gridSize);
    return JSON.stringify(currentPuzzle) === JSON.stringify(winCondition);
  };

  // Obtener posición de un índice en la cuadrícula
  const getPosition = (index) => ({
    row: Math.floor(index / gridSize),
    col: index % gridSize
  });

  // Verificar si dos posiciones son adyacentes
  const areAdjacent = (pos1, pos2) => {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  // Manejar clic en una pieza
  const handlePieceClick = (clickedIndex) => {
    if (isWon || isShuffling) return;

    const clickedPos = getPosition(clickedIndex);
    const emptyIndex = puzzle.findIndex(piece => piece === null);
    
    if (emptyIndex === -1) return;
    
    const emptyPos = getPosition(emptyIndex);
    
    // Verificar si la pieza clickeada puede moverse al espacio vacío
    const canMove = areAdjacent(clickedPos, emptyPos) && puzzle[clickedIndex] !== null;

    if (canMove) {
      // Intercambiar la pieza con el espacio vacío
      const newPuzzle = [...puzzle];
      newPuzzle[emptyIndex] = puzzle[clickedIndex];
      newPuzzle[clickedIndex] = null;
      
      setPuzzle(newPuzzle);
      setMoves(prev => prev + 1);

      // Verificar victoria
      if (checkWin(newPuzzle)) {
        setIsWon(true);
        const currentMoves = moves + 1;
        const sizeKey = `${gridSize}x${gridSize}`;
        
        // Actualizar mejor puntuación para este tamaño
        const newBestScores = { ...bestScores };
        if (!newBestScores[sizeKey] || currentMoves < newBestScores[sizeKey]) {
          newBestScores[sizeKey] = currentMoves;
          setBestScores(newBestScores);
          localStorage.setItem('puzzle-best-scores', JSON.stringify(newBestScores));
          toast({
            title: "¡Nuevo récord! 🏆",
            description: `¡Increíble! Resolviste el puzzle ${sizeKey} en solo ${currentMoves} movimientos.`,
            duration: 5000,
          });
        } else {
          toast({
            title: "¡Felicitaciones! 🎉",
            description: `¡Excelente trabajo! Completaste el puzzle ${sizeKey} en ${currentMoves} movimientos.`,
            duration: 5000,
          });
        }
      }
    }
  };

  // Mezclar el puzzle de forma aleatoria pero resoluble
  const shufflePuzzle = () => {
    setIsShuffling(true);
    setIsWon(false);
    setMoves(0);

    // Realizar movimientos aleatorios válidos para garantizar que sea resoluble
    let currentPuzzle = [...generateInitialPuzzle(gridSize)];
    const shuffleMoves = gridSize * gridSize * 50; // Más movimientos para puzzles más grandes

    for (let i = 0; i < shuffleMoves; i++) {
      const emptyIndex = currentPuzzle.findIndex(piece => piece === null);
      const emptyPos = getPosition(emptyIndex);

      // Encontrar piezas adyacentes al espacio vacío
      const adjacentPieces = [];
      for (let j = 0; j < gridSize * gridSize; j++) {
        if (currentPuzzle[j] !== null) {
          const piecePos = getPosition(j);
          if (areAdjacent(emptyPos, piecePos)) {
            adjacentPieces.push(j);
          }
        }
      }

      if (adjacentPieces.length > 0) {
        const randomPieceIndex = adjacentPieces[Math.floor(Math.random() * adjacentPieces.length)];
        // Intercambiar
        currentPuzzle[emptyIndex] = currentPuzzle[randomPieceIndex];
        currentPuzzle[randomPieceIndex] = null;
      }
    }

    setTimeout(() => {
      setPuzzle(currentPuzzle);
      setIsShuffling(false);
      const totalNumbers = gridSize * gridSize - 1;
      toast({
        title: "¡Puzzle mezclado! 🎲",
        description: `¡Listo para el desafío! Ordena las piezas del 1 al ${totalNumbers}.`,
        duration: 3000,
      });
    }, 800);
  };

  // Reiniciar el puzzle
  const resetPuzzle = () => {
    const initialPuzzle = generateInitialPuzzle(gridSize);
    setPuzzle(initialPuzzle);
    setMoves(0);
    setIsWon(false);
    toast({
      title: "Puzzle reiniciado 🔄",
      description: "¡Comenzando desde el estado inicial!",
      duration: 2000,
    });
  };

  // Resolver automáticamente
  const solvePuzzle = () => {
    const initialPuzzle = generateInitialPuzzle(gridSize);
    setPuzzle(initialPuzzle);
    setMoves(0);
    setIsWon(true);
    toast({
      title: "¡Puzzle resuelto! ⚡",
      description: "¡Aquí tienes la solución perfecta!",
      duration: 3000,
    });
  };

  // Cambiar tamaño del puzzle
  const changeGridSize = (newSize) => {
    setGridSize(newSize);
    setShowSettings(false);
    toast({
      title: `Puzzle ${newSize}x${newSize} seleccionado! 🎯`,
      description: `¡Nuevo desafío con ${newSize * newSize - 1} piezas!`,
      duration: 3000,
    });
  };

  // Obtener mejor puntuación para el tamaño actual
  const getCurrentBestScore = () => {
    const sizeKey = `${gridSize}x${gridSize}`;
    return bestScores[sizeKey];
  };

  // Calcular tamaño de fuente dinámico
  const getFontSize = () => {
    if (gridSize <= 3) return 'text-2xl';
    if (gridSize <= 4) return 'text-xl';
    if (gridSize <= 5) return 'text-lg';
    return 'text-base';
  };

  // Calcular tamaño máximo del contenedor
  const getMaxWidth = () => {
    if (gridSize <= 3) return 'max-w-md';
    if (gridSize <= 4) return 'max-w-lg';
    if (gridSize <= 5) return 'max-w-xl';
    return 'max-w-2xl';
  };

  const totalNumbers = gridSize * gridSize - 1;
  const currentBestScore = getCurrentBestScore();

  return (
    <>
      <Helmet>
        <title>Puzzle Deslizable - Juego de Números</title>
        <meta name="description" content="Diviértete con nuestro puzzle deslizable interactivo. Elige el tamaño y ordena los números en el menor número de movimientos posible." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Puzzle Deslizable
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Ordena los números del 1 al {totalNumbers} deslizando las piezas
            </p>
            
            {/* Size Selector */}
            <div className="flex justify-center mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 text-white flex items-center gap-2 hover:bg-white/20 transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
                Tamaño: {gridSize}x{gridSize}
              </motion.button>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-6 inline-block"
                >
                  <p className="text-sm text-gray-300 mb-3">Selecciona el tamaño del puzzle:</p>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {[3, 4, 5, 6].map((size) => (
                      <Button
                        key={size}
                        onClick={() => changeGridSize(size)}
                        variant={gridSize === size ? "default" : "outline"}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          gridSize === size 
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                            : 'border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10'
                        }`}
                      >
                        {size}x{size}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Stats */}
            <div className="flex justify-center gap-6 mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20"
              >
                <div className="text-2xl font-bold text-cyan-400">{moves}</div>
                <div className="text-sm text-gray-300">Movimientos</div>
              </motion.div>
              
              {currentBestScore && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-yellow-500/30"
                >
                  <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                    <Trophy className="w-5 h-5" />
                    {currentBestScore}
                  </div>
                  <div className="text-sm text-gray-300">Mejor {gridSize}x{gridSize}</div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Puzzle Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl mb-8"
          >
            <div 
              className={`grid gap-2 ${getMaxWidth()} mx-auto`}
              style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
              {puzzle.map((piece, index) => (
                <motion.div
                  key={`${piece}-${index}`}
                  layout
                  whileHover={piece !== null ? { scale: 1.05 } : {}}
                  whileTap={piece !== null ? { scale: 0.95 } : {}}
                  onClick={() => handlePieceClick(index)}
                  className={`
                    aspect-square rounded-xl flex items-center justify-center ${getFontSize()} font-bold cursor-pointer transition-all duration-200
                    ${piece !== null 
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl border-2 border-cyan-400/50' 
                      : 'bg-transparent border-2 border-dashed border-gray-500/30'
                    }
                    ${isWon && piece !== null ? 'animate-pulse bg-gradient-to-br from-green-500 to-emerald-600' : ''}
                  `}
                >
                  <AnimatePresence>
                    {piece !== null && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {piece}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button
              onClick={shufflePuzzle}
              disabled={isShuffling}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              {isShuffling ? 'Mezclando...' : 'Mezclar'}
            </Button>
            
            <Button
              onClick={resetPuzzle}
              variant="outline"
              className="border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reiniciar
            </Button>
            
            <Button
              onClick={solvePuzzle}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Zap className="w-5 h-5 mr-2" />
              Resolver
            </Button>
          </motion.div>

          {/* Victory Message */}
          <AnimatePresence>
            {isWon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
              >
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-center text-white shadow-2xl border border-green-400/50 max-w-md mx-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">¡Felicitaciones!</h2>
                  <p className="text-lg mb-4">
                    ¡Has resuelto el puzzle {gridSize}x{gridSize} en {moves} movimientos!
                  </p>
                  <Button
                    onClick={() => setIsWon(false)}
                    className="bg-white text-green-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold"
                  >
                    Continuar
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-8 text-gray-400 text-sm"
          >
            <p>💡 Haz clic en una pieza adyacente al espacio vacío para moverla</p>
            <p className="mt-2">🎯 Puzzle actual: {gridSize}x{gridSize} con {totalNumbers} piezas</p>
          </motion.div>
        </div>
        
        <Toaster />
      </div>
    </>
  );
}

export default App;

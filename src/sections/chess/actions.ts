'use server'

export const getBestMoveFromStockfish = async (fen: string): Promise<{ bestMove: string, evaluation: number }> => {
    // You can replace this URL with any chess engine API endpoint
    const apiUrl = `https://stockfish.online/api/s/v2.php?fen=${fen}&depth=${15}`;

    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },

    });

    if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.bestmove) {
        console.error(data)
    }
    return {
        bestMove: data.bestmove,
        evaluation: data.evaluation
    };
};
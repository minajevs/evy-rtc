import { useAsyncSetState } from "utils/useAsyncSetState"
import { UserInfo } from "../users"
import { useCallback, useMemo } from "react"
import { checkWin, checkTie } from "./helpers"
import { updateAt } from 'utils/immutableHelpers'

export enum GameStateEnum {
    NotStarted,
    Running,
    Ended
}

export enum Field {
    Empty,
    X,
    O
}

export type GameState = {
    state: GameStateEnum
    field: Field[][]
    players: [UserInfo | null, UserInfo | null]
    currentMove: UserInfo | null,
    winner: UserInfo | null,
}

export type Cords = {
    x: number
    y: number
}

export const emptyField: Field[][] = [
    [Field.Empty, Field.Empty, Field.Empty],
    [Field.Empty, Field.Empty, Field.Empty],
    [Field.Empty, Field.Empty, Field.Empty],
]

const useTictacState = () => {
    const [gameState, setGameState] = useAsyncSetState<GameState>({
        state: GameStateEnum.NotStarted,
        field: [...[...emptyField]],
        players: [null, null],
        currentMove: null,
        winner: null
    })

    const playersSignedUp = useCallback((state: GameState) =>
        state.players[0] !== null && state.players[1] !== null,
        [])

    const signUpPlayer = useCallback((user: UserInfo) => {
        if (gameState.state !== GameStateEnum.NotStarted)
            return null

        if (gameState.players[0] === null)
            return setGameState(prev => ({ ...prev, players: [user, prev.players[1]] }))

        if (gameState.players[0] !== null && gameState.players[1] === null)
            return setGameState(prev => ({ ...prev, players: [prev.players[0], user] }))

        return null
    }, [setGameState, gameState.state, gameState.players])

    const startGame = useCallback(() => setGameState(prev => {
        if (prev.state !== GameStateEnum.NotStarted ||
            !playersSignedUp(prev)) return prev

        return {
            ...prev,
            state: GameStateEnum.Running,
            currentMove: prev.players[0]!,
            field: [...[...emptyField]]
        }
    }), [setGameState])

    const makeMove = useCallback(async (user: UserInfo, cords: Cords) => {
        if (gameState.state !== GameStateEnum.Running) return
        if (gameState.currentMove === null) return

        const currentPlayerIndex = gameState.players.findIndex(x => x?.userId === user.userId)
        if (currentPlayerIndex === -1) return

        const currentPlayer = gameState.players[currentPlayerIndex]!
        if (gameState.currentMove.userId !== currentPlayer.userId) return

        const currentField = gameState.field[cords.x][cords.y]
        if (currentField !== Field.Empty) return

        // TODO: immutable update
        const newValue = currentPlayerIndex === 0 ? Field.X : Field.O

        const newField = updateAt(
            gameState.field,
            cords.x,
            updateAt(
                gameState.field[cords.x],
                cords.y,
                newValue))

        const winner = checkWin(newField)
        const tie = checkTie(newField)

        // if winner found or game is tied - end game
        if (winner !== null || tie) {
            return setGameState(prev => ({
                ...prev,
                state: GameStateEnum.Ended,
                field: [...[...newField]],
                winner: tie ? null : currentPlayer,
                currentMove: null,
            }))
        }

        const nextPlayerIndex = currentPlayerIndex === 0 ? 1 : 0
        return setGameState(prev => ({
            ...prev,
            field: [...[...newField]],
            currentMove: prev.players[nextPlayerIndex]!
        }))
    }, [gameState.players, gameState.state, gameState.currentMove, gameState.field])

    const restartGame = useCallback(() => {
        if (gameState.state !== GameStateEnum.Ended) return

        return setGameState(prev => ({
            ...prev,
            state: GameStateEnum.NotStarted,
            field: [...[...emptyField]],
            currentMove: null,
            players: [null, null],
            winner: null
        }))
    }, [gameState.state])

    return { gameState, signUpPlayer, startGame, makeMove, restartGame }
}

export default useTictacState
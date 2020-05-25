import useState, { Field, GameStateEnum, emptyField, GameState } from './state'
import useTictacState from './state'
import { UserInfo } from '../users'
import { renderHook, act } from '@testing-library/react-hooks'
import { useAsyncSetState, AsyncSetState } from 'utils/useAsyncSetState'
import { updateAt } from 'utils/immutableHelpers'

let setTestState: AsyncSetState<GameState>

jest.mock('utils/useAsyncSetState', () => {
    const actual = jest.requireActual('utils/useAsyncSetState')
    return {
        ...actual,
        useAsyncSetState: (initialState: GameState) => {
            const { useAsyncSetState: _internalUseSetState } = jest.requireActual('utils/useAsyncSetState')
            const [state, setState] = _internalUseSetState(initialState)
            setTestState = setState
            return [state, setState] as const
        },
    }
})

describe('state', () => {
    it('should init with initial state', () => {
        const { result } = renderHook(() => useTictacState())
        const { gameState } = result.current

        expect(gameState.state).toBe(GameStateEnum.NotStarted)
        expect(gameState.field).toEqual(emptyField)
        expect(gameState.players).toEqual([null, null])
        expect(gameState.currentMove).toBe(null)
        expect(gameState.winner).toBe(null)
    })

    describe('signUpPlayer', () => {
        it('doesn\'t signup players if game is not in "notstarted" state', () => {
            const { result } = renderHook(() => useTictacState())

            const testUser: UserInfo = { userId: 'test-id', username: 'test-name' }

            act(() => {
                setTestState(prev => ({
                    ...prev,
                    state: GameStateEnum.Running
                }))
            })

            act(() => {
                result.current.signUpPlayer(testUser)
            })

            expect(result.current.gameState.players).toEqual([null, null])
        })

        it('signs up first player', () => {
            const { result } = renderHook(() => useTictacState())

            const testUser: UserInfo = { userId: 'test-id', username: 'test-name' }

            act(() => {
                result.current.signUpPlayer(testUser)
            })
            expect(result.current.gameState.players).toEqual([testUser, null])
        })

        it('signs up second player', () => {
            const { result } = renderHook(() => useTictacState())

            const testUser1: UserInfo = { userId: 'test-id-1', username: 'test-name-1' }
            const testUser2: UserInfo = { userId: 'test-id-2', username: 'test-name-2' }

            act(() => {
                result.current.signUpPlayer(testUser1)
            })

            act(() => {
                result.current.signUpPlayer(testUser2)
            })
            expect(result.current.gameState.players).toEqual([testUser1, testUser2])
        })

        it('does not sign up third player', () => {
            const { result } = renderHook(() => useTictacState())

            const testUser1: UserInfo = { userId: 'test-id-1', username: 'test-name-1' }
            const testUser2: UserInfo = { userId: 'test-id-2', username: 'test-name-2' }
            const testUser3: UserInfo = { userId: 'test-id-3', username: 'test-name-3' }

            act(() => {
                result.current.signUpPlayer(testUser1)
            })

            act(() => {
                result.current.signUpPlayer(testUser2)
            })

            act(() => {
                result.current.signUpPlayer(testUser3)
            })

            expect(result.current.gameState.players).toEqual([testUser1, testUser2])
        })
    })

    describe('startGame', () => {
        it('doesn\'t start game if game is not in "not started" state', () => {
            const { result } = renderHook(() => useTictacState())

            act(() => {
                setTestState(prev => ({
                    ...prev,
                    state: GameStateEnum.Ended,
                }))
            })

            act(() => {
                result.current.startGame()
            })

            expect(result.current.gameState.state).toEqual(GameStateEnum.Ended)
        })

        it('doesn\'t start game if no signed up players', () => {
            const { result } = renderHook(() => useTictacState())

            act(() => {
                result.current.startGame()
            })

            expect(result.current.gameState.state).toEqual(GameStateEnum.NotStarted)
        })

        it('starts game if conditions met', async () => {
            const { result } = renderHook(() => useTictacState())

            const testUser1: UserInfo = { userId: 'test-id-1', username: 'test-name-1' }
            const testUser2: UserInfo = { userId: 'test-id-2', username: 'test-name-2' }

            await act(async () => {
                await result.current.signUpPlayer(testUser1)
                await result.current.signUpPlayer(testUser2)
            })

            act(() => {
                result.current.startGame()
            })

            expect(result.current.gameState.players).toEqual([testUser1, testUser2])
            expect(result.current.gameState.state).toEqual(GameStateEnum.Running)
            expect(result.current.gameState.currentMove).toEqual(testUser1)
            expect(result.current.gameState.field).toEqual(emptyField)
        })
    })

    describe('makeMove', () => {
        it('doesn\'t make move if game is not running', () => {
            const { result } = renderHook(() => useTictacState())

            const testUser1: UserInfo = { userId: 'test-id-1', username: 'test-name-1' }

            act(() => {
                result.current.makeMove(testUser1, { x: 0, y: 0 })
            })

            expect(result.current.gameState.field[0][0]).toEqual(Field.Empty)
        })

        it('doesn\'t make move if currentMove is null', async () => {
            const { result } = renderHook(() => useTictacState())

            const testUser1: UserInfo = { userId: 'test-id-1', username: 'test-name-1' }
            const testUser2: UserInfo = { userId: 'test-id-2', username: 'test-name-2' }

            await act(async () => {
                await result.current.signUpPlayer(testUser1)
                await result.current.signUpPlayer(testUser2)
                result.current.startGame()
                setTestState(prev => ({
                    ...prev,
                    currentMove: null
                }))
            })

            act(() => {
                result.current.makeMove(testUser1, { x: 0, y: 0 })
            })

            expect(result.current.gameState.field[0][0]).toEqual(Field.Empty)
        })

        it('doesn\'t make move if not participating user is calling it', async () => {
            const { result } = renderHook(() => useTictacState())

            const testUser1: UserInfo = { userId: 'test-id-1', username: 'test-name-1' }
            const testUser2: UserInfo = { userId: 'test-id-2', username: 'test-name-2' }

            await act(async () => {
                await result.current.signUpPlayer(testUser1)
                await result.current.signUpPlayer(testUser2)
                result.current.startGame()
            })

            act(() => {
                result.current.makeMove(
                    { userId: 'non-existing-user', username: 'username' },
                    { x: 0, y: 0 })
            })

            expect(result.current.gameState.field[0][0]).toEqual(Field.Empty)
        })

        it('doesn\'t make move if not current move user is calling it', async () => {
            const { result } = renderHook(() => useTictacState())

            const testUser1: UserInfo = { userId: 'test-id-1', username: 'test-name-1' }
            const testUser2: UserInfo = { userId: 'test-id-2', username: 'test-name-2' }

            await act(async () => {
                await result.current.signUpPlayer(testUser1)
                await result.current.signUpPlayer(testUser2)
                result.current.startGame()
            })

            act(() => {
                result.current.makeMove(
                    testUser2,
                    { x: 0, y: 0 })
            })

            expect(result.current.gameState.field[0][0]).toEqual(Field.Empty)
        })

        it('doesn\'t make move if field is not empty', async () => {
            const { result } = renderHook(() => useTictacState())

            const testUser1: UserInfo = { userId: 'test-id-1', username: 'test-name-1' }
            const testUser2: UserInfo = { userId: 'test-id-2', username: 'test-name-2' }

            await act(async () => {
                await result.current.signUpPlayer(testUser1)
                await result.current.signUpPlayer(testUser2)
                result.current.startGame()
                setTestState(prev => {
                    const newField = updateAt(
                        prev.field,
                        0,
                        updateAt(
                            prev.field[0],
                            0,
                            Field.O))
                    return { ...prev, field: newField }
                })
            })

            act(() => {
                result.current.makeMove(
                    testUser1,
                    { x: 0, y: 0 })
            })

            expect(result.current.gameState.field[0][0]).toEqual(Field.O)
        })

        it('makes a move if all conditions met', async () => {
            const { result } = renderHook(() => useTictacState())

            const testUser1: UserInfo = { userId: 'test-id-1', username: 'test-name-1' }
            const testUser2: UserInfo = { userId: 'test-id-2', username: 'test-name-2' }

            await act(async () => {
                await result.current.signUpPlayer(testUser1)
                await result.current.signUpPlayer(testUser2)
                result.current.startGame()
            })

            act(() => {
                result.current.makeMove(
                    testUser1,
                    { x: 0, y: 0 })
            })

            expect(result.current.gameState.field[0][0]).toEqual(Field.X)
            expect(result.current.gameState.currentMove).toEqual(testUser2)
        })

        it('ends the game if there\'s a winner', async () => {
            const { result } = renderHook(() => useTictacState())

            const testUser1: UserInfo = { userId: 'test-id-1', username: 'test-name-1' }
            const testUser2: UserInfo = { userId: 'test-id-2', username: 'test-name-2' }

            await act(async () => {
                await result.current.signUpPlayer(testUser1)
                await result.current.signUpPlayer(testUser2)
                result.current.startGame()
                setTestState(prev => {
                    const newField = updateAt(prev.field, 0, [Field.Empty, Field.X, Field.X])
                    return { ...prev, field: newField }
                })
            })

            act(() => {
                result.current.makeMove(
                    testUser1,
                    { x: 0, y: 0 })
            })

            expect(result.current.gameState.field[0][0]).toEqual(Field.X)
            expect(result.current.gameState.state).toEqual(GameStateEnum.Ended)
            expect(result.current.gameState.winner).toEqual(testUser1)
            expect(result.current.gameState.currentMove).toBeNull()
        })

        it('ends the game if there\'s a tie', async () => {
            const { result } = renderHook(() => useTictacState())

            const testUser1: UserInfo = { userId: 'test-id-1', username: 'test-name-1' }
            const testUser2: UserInfo = { userId: 'test-id-2', username: 'test-name-2' }

            await act(async () => {
                await result.current.signUpPlayer(testUser1)
                await result.current.signUpPlayer(testUser2)
                result.current.startGame()
                setTestState(prev => {
                    const newField: Field[][] = [
                        [Field.Empty, Field.O, Field.X],
                        [Field.X, Field.O, Field.O],
                        [Field.O, Field.X, Field.X],
                    ]
                    return { ...prev, field: newField }
                })
            })

            act(() => {
                result.current.makeMove(
                    testUser1,
                    { x: 0, y: 0 })
            })

            expect(result.current.gameState.field[0][0]).toEqual(Field.X)
            expect(result.current.gameState.state).toEqual(GameStateEnum.Ended)
            expect(result.current.gameState.winner).toBeNull()
            expect(result.current.gameState.currentMove).toBeNull()
        })
    })

    describe('restartGame', () => {
        it('doesn\'t restart with game has not ended', async () => {
            const { result } = renderHook(() => useTictacState())

            const testUser1: UserInfo = { userId: 'test-id-1', username: 'test-name-1' }
            const testUser2: UserInfo = { userId: 'test-id-2', username: 'test-name-2' }

            await act(async () => {
                await result.current.signUpPlayer(testUser1)
                await result.current.signUpPlayer(testUser2)
                result.current.startGame()
            })

            act(() => {
                result.current.restartGame()
            })

            expect(result.current.gameState.state).toEqual(GameStateEnum.Running)
        })

        it('restarts the game if all conditions met', () => {
            const { result } = renderHook(() => useTictacState())

            const testUser1: UserInfo = { userId: 'test-id-1', username: 'test-name-1' }
            const testUser2: UserInfo = { userId: 'test-id-2', username: 'test-name-2' }

            act(() => {
                result.current.signUpPlayer(testUser1)
                result.current.signUpPlayer(testUser2)
                result.current.startGame()
                setTestState(prev => ({
                    ...prev,
                    state: GameStateEnum.Ended
                }))
            })

            act(() => {
                result.current.restartGame()
            })

            expect(result.current.gameState.state).toBe(GameStateEnum.NotStarted)
            expect(result.current.gameState.field).toEqual(emptyField)
            expect(result.current.gameState.currentMove).toBeNull()
            expect(result.current.gameState.players).toEqual([null, null])
            expect(result.current.gameState.winner).toBeNull()
        })
    })
})
import createStoreContext from 'react-concise-state'
import { useEffect, useContext, useCallback, useMemo } from 'react'
import { createAction, ActionCreator } from 'typesafe-actions'

import { usePeer, useDataListen } from 'p2p/usePeerState'
import { UserInfo, context as usersContext } from 'app/modules/users'
import { useAsyncSetState } from 'utils/useAsyncSetState'
import useTictacState, { GameStateEnum, Cords } from './state'

const actions = {
    signUpRequest: createAction('tictac/signup/request')(),
    signUpResponse: createAction('tictac/signup/response')<UserInfo>(),
    successSignUpResponse: createAction('tictac/signup-success/response')(),
    startGame: createAction('tictac/game/start')(),
    restartGame: createAction('tictac/game/restart')(),
    moveRequest: createAction('tictac/move/request')<Cords>(),
    moveResponse: createAction('tictac/move/response')<{ user: UserInfo, cords: Cords }>(),
}

export const useTictac = () => {
    const [peerState, events, dispatch, broadcast] = usePeer()
    const userStore = useContext(usersContext)
    const { gameState, signUpPlayer, startGame, makeMove, restartGame } = useTictacState()

    // TODO: Move state verifies to `useTictacState` and return result from state actions
    const signUp = useCallback(() => dispatch(actions.signUpRequest()), [dispatch])

    useDataListen(events, actions.signUpRequest, (peer, action) => {
        const newPlayer = userStore.users.find(x => x.userId === peer.id)!
        broadcast(actions.signUpResponse(newPlayer))
    }, [userStore.users, broadcast])

    useDataListen(events, actions.signUpResponse, async (peer, action) => {
        const result = await signUpPlayer(action.payload)
        if (result)
            broadcast(actions.successSignUpResponse())
    }, [signUpPlayer, broadcast])

    useDataListen(events, actions.successSignUpResponse, (peer, action) => {
        broadcast(actions.startGame())
    }, [gameState.state, broadcast])

    useDataListen(events, actions.startGame, (peer, action) => {
        startGame()
    }, [startGame])

    // Game
    const move = useCallback((cords: Cords) => dispatch(actions.moveRequest(cords)), [dispatch])

    useDataListen(events, actions.moveRequest, async (peer, action) => {
        const user = userStore.users.find(x => x.userId === peer.id)!
        broadcast(actions.moveResponse({ cords: action.payload, user }))
    }, [gameState.players, gameState.state, broadcast])

    useDataListen(events, actions.moveResponse, (peer, action) => {
        makeMove(action.payload.user, action.payload.cords)
    }, [makeMove])

    const restart = useCallback(() => {
        dispatch(actions.restartGame())
    }, [dispatch, peerState.peer])

    useDataListen(events, actions.restartGame, (peer, action) => {
        restartGame()
        broadcast(actions.restartGame(), peer)
    }, [restartGame, broadcast])

    return { gameState, signUp, move, restart }
}
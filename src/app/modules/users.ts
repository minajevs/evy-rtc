import { useCallback, useContext, useEffect } from 'react'
import { createAction } from 'typesafe-actions'

import { usePeer, useDataListen } from 'p2p/usePeerState'
import createStoreContext from 'react-concise-state'

const actions = {
    // user asks to login
    login: createAction('login')<string>(),
    // server answering to login request
    loginResponse: createAction('login/response')<UsersState>(),
    newUser: createAction('login/new')<UserInfo>(),
}

export type UserInfo = {
    username: string
    userId: string
}

type UsersState = {
    currentUser: UserInfo | null
    users: UserInfo[]
}

export const [context, Provider] = createStoreContext({
    currentUser: null,
    users: []
} as UsersState, ({ setState }) => ({
    addUser: (user: UserInfo) => setState(prev => ({ ...prev, users: [...prev.users, user] })),
    initState: (state: UsersState) => setState(state)
}))

export const useUsers = () => {
    const store = useContext(context)
    const [peerState, events, dispatch, broadcast] = usePeer()

    const login = useCallback((username: string) => {
        dispatch(actions.login(username))
    }, [dispatch])

    useEffect(() => {
        // TODO: remove user on conn close
        //events.on('host/open', () => setState(prev => ({ ...prev, connecting: false })))
        //events.on('open', () => setState(prev => ({ ...prev, connecting: false })))
    }, [])

    useDataListen(events, actions.login, (peer, action) => {
        console.log('on login')
        const newUser: UserInfo = { userId: peer.id, username: action.payload }
        const newState: UsersState = { ...store, users: [...store.users, newUser] }
        peer.send(actions.loginResponse({ ...newState, currentUser: newUser }))
        broadcast(actions.newUser(newUser), peer)
    }, [store, broadcast])

    useDataListen(events, actions.newUser, (peer, action) => {
        console.log('on new user')
        store.addUser(action.payload)
    }, [store.addUser])

    useDataListen(events, actions.loginResponse, (peer, action) => {
        console.log('on login resp')
        store.initState(action.payload)
    }, [store.initState])

    return [store, login] as const
}
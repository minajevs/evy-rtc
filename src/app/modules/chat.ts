import { usePeer, PeerEmmiter, PeerEvents, PeerDataEvent, useDataListen } from "p2p/usePeerState"
import { createAction, isActionOf, Action, ActionType } from "typesafe-actions"
import { useState, useCallback, useEffect } from "react"
import { useEventListener } from "utils/useEventListener"
import StrictEventEmitter from "strict-event-emitter-types/types/src"
import { EventEmitter } from "events"
import { ActionCreator } from "typesafe-actions/dist/is-action-of"
import Peer from "peerjs"

const actions = {
    // user asks to login
    login: createAction('login')<string>(),
    // server answering to login request
    loginResponse: createAction('login/response')<ChatState>(),
    newUser: createAction('login/new')<UserInfo>(),

    sendMessage: createAction('message/send')<string>(),
    receiveMessage: createAction('message/receive')<Message>(),
}

type UserInfo = {
    username: string
    userId: string
}

type Message = {
    text: string
    author: UserInfo
}

type ChatState = {
    connecting: boolean
    currentUser: UserInfo | null
    users: UserInfo[]
    messages: Message[]
}

export const useChat = () => {
    const [state, setState] = useState<ChatState>({ connecting: true, currentUser: null, messages: [], users: [] })
    const [peerState, events, dispatch, broadcast] = usePeer()

    const login = useCallback((username: string) => {
        dispatch(actions.login(username))
    }, [dispatch])

    const sendMessage = useCallback((message: string) => {
        dispatch(actions.sendMessage(message))
    }, [dispatch])

    useEffect(() => {
        events.on('host/open', () => setState(prev => ({ ...prev, connecting: false })))
        events.on('open', () => setState(prev => ({ ...prev, connecting: false })))
    }, [])

    useDataListen(events, actions.login, (peer, action) => {
        console.log('on login')
        const newUser: UserInfo = { userId: peer.id, username: action.payload }
        const newState: ChatState = { ...state, users: [...state.users, newUser] }
        peer.send(actions.loginResponse({ ...newState, currentUser: newUser }))
        broadcast(actions.newUser(newUser), peer)
    }, [state, broadcast])

    useDataListen(events, actions.newUser, (peer, action) => {
        console.log('on new user')
        setState(prev => ({ ...prev, users: [...prev.users, action.payload] }))
    }, [state])

    useDataListen(events, actions.loginResponse, (peer, action) => {
        console.log('on login resp')
        setState(action.payload)
    }, [])

    useDataListen(events, actions.sendMessage, (peer, action) => {
        console.log('on send msg')
        const newMessage: Message = { author: state.users.find(x => x.userId === peer.id)!, text: action.payload }
        broadcast(actions.receiveMessage(newMessage))
    }, [state.users, broadcast])

    useDataListen(events, actions.receiveMessage, (peer, action) => {
        console.log('on receive')
        setState(prev => ({ ...prev, messages: [...prev.messages, action.payload] }))
    }, [])

    return [state, login, sendMessage] as const
}
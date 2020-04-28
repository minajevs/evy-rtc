import { useState, useCallback, useEffect, useContext } from 'react'
import { createAction } from 'typesafe-actions'

import { usePeer, useDataListen } from 'p2p/usePeerState'
import { UserInfo, context } from 'app/modules/users'

const actions = {
    sendMessage: createAction('message/send')<string>(),
    receiveMessage: createAction('message/receive')<Message>(),
}

type Message = {
    text: string
    author: UserInfo
}

type ChatState = {
    connecting: boolean
    messages: Message[]
}

export const useChat = () => {
    const [state, setState] = useState<ChatState>({ connecting: true, messages: [] })
    const [peerState, events, dispatch, broadcast] = usePeer()
    const userStore = useContext(context)

    const sendMessage = useCallback((message: string) => {
        dispatch(actions.sendMessage(message))
    }, [dispatch])

    useEffect(() => {
        events.on('host/open', () => setState(prev => ({ ...prev, connecting: false })))
        events.on('open', () => setState(prev => ({ ...prev, connecting: false })))
    }, [])

    useDataListen(events, actions.sendMessage, (peer, action) => {
        console.log('on send msg')
        const newMessage: Message = { author: userStore.users.find(x => x.userId === peer.id)!, text: action.payload }
        broadcast(actions.receiveMessage(newMessage))
    }, [userStore.users, broadcast])

    useDataListen(events, actions.receiveMessage, (peer, action) => {
        console.log('on receive')
        setState(prev => ({ ...prev, messages: [...prev.messages, action.payload] }))
    }, [])

    return [state, sendMessage] as const
}
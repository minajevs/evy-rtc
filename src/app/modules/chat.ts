import { useState, useCallback, useEffect, useContext } from 'react'
import { createAction } from 'typesafe-actions'

import { usePeer, useDataListen } from 'p2p/usePeerState'
import { UserInfo, context as usersContext } from 'app/modules/users'
import createStoreContext from 'react-concise-state'

const actions = {
    sendMessage: createAction('message/send')<string>(),
    receiveMessage: createAction('message/receive')<Message>(),
}

type Message = {
    text: string
    author: UserInfo
}

type ChatState = {
    messages: Message[]
}

export const [context, Provider] = createStoreContext({
    messages: []
} as ChatState, ({ setState }) => ({
    addMessage: (message: Message) => setState(prev => ({ ...prev, messages: [...prev.messages, message] }))
}))

export const useChat = () => {
    const chatStore = useContext(context)
    const [peerState, events, dispatch, broadcast] = usePeer()
    const userStore = useContext(usersContext)

    const sendMessage = useCallback((message: string) => {
        dispatch(actions.sendMessage(message))
    }, [dispatch])

    useDataListen(events, actions.sendMessage, (peer, action) => {
        const newMessage: Message = { author: userStore.users.find(x => x.userId === peer.id)!, text: action.payload }
        broadcast(actions.receiveMessage(newMessage))
    }, [userStore.users, broadcast])

    useDataListen(events, actions.receiveMessage, (peer, action) => {
        chatStore.addMessage(action.payload)
    }, [])

    return [chatStore, sendMessage] as const
}
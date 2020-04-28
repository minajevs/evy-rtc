import React, { useEffect, useCallback } from 'react'

import { useRouteMatch, useHistory } from 'react-router-dom'

import { Button, TextField } from '@material-ui/core'
import { usePeerConnection } from 'p2p/usePeerState'
import { useChat } from 'app/modules/chat'

export type Props = {}

export const Team: React.FC<Props> = ({ }) => {
    const [textState, setState] = React.useState('')
    const [chatState, log, sendMessage] = useChat()

    const login = useCallback((name: string) => {
        log(name)
        setState('')
    }, [log])

    const send = useCallback((msg: string) => {
        sendMessage(msg)
        setState('')
    }, [sendMessage])

    if (chatState.connecting)
        return (<>Connecting...</>)

    if (chatState.currentUser === null)
        return (
            <>
                <div>Choose username:</div>
                <TextField value={textState} onChange={event => setState(event.currentTarget.value)}></TextField>
                <Button onClick={() => login(textState)}>Send</Button>
            </>
        )
    return (
        <>
            {chatState.messages.map((msg, key) => <p key={key}>[{msg.author.username}]{msg.text}</p>)}
            <TextField value={textState} onChange={event => setState(event.currentTarget.value)}></TextField>
            <Button onClick={() => send(textState)}>Send</Button>
        </>
    )
}

export default Team
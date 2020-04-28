import React, { useEffect, useCallback, useContext } from 'react'

import { Button, TextField } from '@material-ui/core'
import { useChat } from 'app/modules/chat'
import { context, useUsers } from 'app/modules/users'

export type Props = {}

export const Team: React.FC<Props> = ({ }) => {
    const [textState, setState] = React.useState('')
    const [chatState, sendMessage] = useChat()
    const [usersState, userLogin] = useUsers()

    const login = useCallback((name: string) => {
        userLogin(name)
        setState('')
    }, [userLogin])

    const send = useCallback((msg: string) => {
        sendMessage(msg)
        setState('')
    }, [sendMessage])

    if (chatState.connecting)
        return (<>Connecting...</>)

    if (usersState.currentUser === null)
        return (
            <>
                <div>Choose username:</div>
                <TextField value={textState} onChange={event => setState(event.currentTarget.value)}></TextField>
                <Button onClick={() => login(textState)}>Send</Button>
            </>
        )
    return (
        <>
            Current user: {usersState.currentUser.username}
            <br />
            Users in the room: {usersState.users.map((user, i) => <p key={i}>{user.username} : {user.userId}</p>)}
            <hr />
            {chatState.messages.map((msg, key) => <p key={key}>[{msg.author.username}]{msg.text}</p>)}
            <TextField value={textState} onChange={event => setState(event.currentTarget.value)}></TextField>
            <Button onClick={() => send(textState)}>Send</Button>
        </>
    )
}

export default Team
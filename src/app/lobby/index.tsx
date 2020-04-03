import React from 'react'
import { useHistory } from 'react-router-dom'

import { TextField, Button } from '@material-ui/core'
import { usePeerHost } from '../../p2p/usePeerState'

import { reducer, actions } from '../../basicChat/basicChatStore'

export type Props = {}

export const Lobby: React.FC<Props> = ({ }) => {
    const [state, dispatch, peer] = usePeerHost({ messages: [] }, reducer)
    const [textState, setState] = React.useState('')

    const send = React.useCallback((msg: string) => {
        dispatch(actions.addMessage(msg))
        setState('')
    }, [dispatch])

    if (!peer.host.ready)
        return (<p>Loading...</p>)

    return (
        <>
            <div>Your id: <code>{peer.host.id}</code></div>
            <div>Connected: <code>{peer.connections.map(x => x.label).join(', ')}</code></div>
            {state.messages.map(msg => <p>{msg}</p>)}
            <TextField value={textState} onChange={event => setState(event.currentTarget.value)}></TextField>
            <Button onClick={() => send(textState)}>Send</Button>
        </>
    )
}

export default Lobby
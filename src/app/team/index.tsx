import React, { useEffect } from 'react'

import { useRouteMatch, useHistory } from 'react-router-dom'

import { Button, TextField } from '@material-ui/core'
import { usePeer, useCommonPeer } from '../../p2p/usePeerState'

import { reducer, actions } from '../../basicChat/basicChatStore'

export type Props = {}

export const Team: React.FC<Props> = ({ }) => {
    const match = useRouteMatch<{ id: string }>('/t/:id')
    const history = useHistory()
    const [textState, setState] = React.useState('')

    const [state, dispatch, peer] = useCommonPeer(match?.params.id ?? null, { messages: [] }, reducer)

    const send = React.useCallback((msg: string) => {
        dispatch(actions.addMessage(msg))
        setState('')
    }, [dispatch])

    useEffect(() => {
        if (match?.params.id === undefined && peer.host.id !== null) history.push(`/t/${peer.host.id}`)
    }, [match, peer.host.id])

    if (peer.error !== null)
        return (<code>{peer.error.message}</code>)

    if (!peer.host.ready)
        return (<p>Loading...</p>)

    if (state === null)
        return (<p>No state</p>)

    return (
        <>
            <div>Current peer id: <code>{peer.peer.id}</code> Ready {peer.peer.ready}</div>
            <div>Host id: <code>{peer.host.id}</code> Ready {peer.host.ready}</div>
            <div>Connected to me: <code>{peer.connections.map(x => x.label).join(', ')}</code></div>

            {state.messages.map((msg, key) => <p key={key}>{msg}</p>)}
            <TextField value={textState} onChange={event => setState(event.currentTarget.value)}></TextField>
            <Button onClick={() => send(textState)}>Send</Button>
        </>
    )
}

export default Team
import React from 'react'
import { useHistory } from 'react-router-dom'

import { TextField, Button } from '@material-ui/core'
import { usePeerHost } from '../../p2p/usePeerState'

export type Props = {}

export const Lobby: React.FC<Props> = ({ }) => {
    const [state, dispatch, peer] = usePeerHost<string[]>(['hello', 'world'])

    if (!peer.host.ready)
        return (<p>Loading...</p>)

    return (
        <>
            <div>Your id: <code>{peer.host.id}</code></div>
            <div>Connected: <code>{peer.connections.map(x => x.label).join(', ')}</code></div>
            {state.map(msg => <p>{msg}</p>)}
        </>
    )
}

export default Lobby
import React, { useEffect, createContext } from 'react'
import { useRouteMatch, useHistory, HashRouter } from 'react-router-dom'

import { usePeerConnection, context } from 'p2p/usePeerState'

type Props = {
    route?: string
}

export const PeerProvider: React.FC<Props> = ({ route = 'peer', children }) => {
    const match = useRouteMatch<{ id: string }>(`/${route}/:id`)
    const history = useHistory()

    const peer = usePeerConnection(match?.params.id ?? null)
    const [peerState, events, dispatch] = peer

    useEffect(() => {
        if (match?.params.id === undefined && peerState.host.id !== null)
            history.push(`/${route}/${peerState.host.id}`)
    }, [match, peerState.host.id, history])

    return (
        <context.Provider value={peer}>
            {children}
        </context.Provider>
    )
}

export default PeerProvider
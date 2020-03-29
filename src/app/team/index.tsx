import React from 'react'

import { useRouteMatch } from 'react-router-dom'

import { Button } from '@material-ui/core'
import { usePeer } from '../../p2p/usePeerState'

export type Props = {}

export const Team: React.FC<Props> = ({ }) => {
    const match = useRouteMatch<{ id: string }>('/t/:id')

    const [state, peer] = usePeer<string[]>(match?.params.id ?? '')

    if (!peer.host.ready)
        return (<p>Loading...</p>)

    if (state === null)
        return (<p>No state</p>)

    return (
        <>
            {state.map(msg => <p>{msg}</p>)}
        </>
    )
}

export default Team
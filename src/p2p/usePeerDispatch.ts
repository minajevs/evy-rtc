import { Dispatch } from 'react'
import Peer from 'peerjs'

export const usePeerDispatch = <TAction>(
    host: Peer.DataConnection | null,
    connections: ReadonlyArray<Peer.DataConnection>,
    dispatch: Dispatch<TAction>) =>
    (action: TAction, source: Peer.DataConnection | null = null) => {
        if (host !== null) {
            // Send action to host
            host.send(action)
            // TODO: verify host received?
        }
        // Send action to all connection except for source connection
        connections.forEach(connection => source?.label !== connection.label
            ? connection.send(action) : void (0))

        // TODO: verify connection sends completed?

        dispatch(action)
    }
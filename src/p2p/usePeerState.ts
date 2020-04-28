import { useEffect, useState, useReducer, useCallback, Reducer, useMemo, useContext, createContext, DependencyList } from 'react'
import Peer from 'peerjs'
import { Action, isActionOf } from 'typesafe-actions'
import { EventEmitter } from 'events'
import { StrictEventEmitter } from 'strict-event-emitter-types'
import { createPeer } from 'p2p/core'
import { useEventListener } from 'utils/useEventListener'
import { ActionCreator } from 'typesafe-actions/dist/is-action-of'

type PeerHost = {
    id: string | null,
    ready: boolean
}

type PeerState = {
    readonly peer: PeerHost
    readonly host: PeerHost
    readonly connections: ReadonlyArray<InternalPeerReference>
    readonly isHost: boolean
    readonly error: Error | null
}

export type InternalPeerReference = {
    id: string
    send: <T extends Action = Action>(action: T) => void
}

export type PeerDataEvent<T extends Action = Action> = (peer: InternalPeerReference, action: T) => void

export type PeerEvents = {
    'any/data': PeerDataEvent

    'open': () => void
    'peer/open': (peer: InternalPeerReference) => void
    'peer/data': PeerDataEvent

    'host/open': (perr: InternalPeerReference) => void
    'host/data': PeerDataEvent
}

export type PeerEmmiter = StrictEventEmitter<EventEmitter, PeerEvents>

type PeerDispatch = (action: Action, source?: InternalPeerReference) => void

export const context = createContext<ReturnType<typeof usePeerConnection>>(null as any) // fix dis?

export const usePeer = () => {
    return useContext(context)
}

const toInternalPeer = (connection: Peer.DataConnection): InternalPeerReference => ({
    id: connection.peer,
    send: action => connection.send(action)
})

const selfEmit = (events: PeerEmmiter, selfPeer: Peer, action: Action) => {
    const selfRefAsHost: InternalPeerReference = {
        id: selfPeer.id,
        send: action => {
            events.emit('host/data', selfRefAsPeer, action)
            events.emit('any/data', selfRefAsPeer, action)
        }
    }
    const selfRefAsPeer: InternalPeerReference = {
        id: selfPeer.id,
        send: action => {
            events.emit('peer/data', selfRefAsHost, action)
            events.emit('any/data', selfRefAsHost, action)
        }
    }
    events.emit('host/data', selfRefAsPeer, action)
    events.emit('any/data', selfRefAsPeer, action)
}

export const usePeerConnection = (
    hostId: string | null,  // broker id to connect. If null - create a new host
): [PeerState, PeerEmmiter, PeerDispatch, PeerDispatch] => {
    const [events] = useState<PeerEmmiter>(new EventEmitter())
    const [peerState, setState] = useState<PeerState>({
        peer: { id: null, ready: false },
        host: { id: null, ready: false },
        connections: [],
        isHost: false,
        error: null
    })

    const [peer, setPeer] = useState<Peer | null>(null)
    const [host, setHost] = useState<Peer.DataConnection | null>(null)

    const { connections } = peerState

    const peerDispatch = useCallback((action: Action) => {
        console.log('dispatch to host', host)
        if (host !== null) {
            // Send action to host
            host.send(action)
            // TODO: verify host received?
        }

        if (peerState.isHost)
            selfEmit(events, peer!, action)
    }, [host, peerState.isHost])

    const peerBroadcast = useCallback((action: Action, source: InternalPeerReference | null = null) => {
        console.log('dispatch to connections', connections)
        // Send action to all connection except for source connection
        connections.forEach(connection => source?.id !== connection.id
            ? connection.send(action) : void (0))

        if (peerState.isHost && source?.id !== peer!.id)
            selfEmit(events, peer!, action)
    }, [connections, peerState.isHost])

    useEffect(
        () => {
            import('peerjs').then(({ default: peerConstructor }) => {
                const peer = createPeer(peerConstructor)
                setPeer(peer)

                console.log('peer created', peer)

                const connectToHost = (hostId: string) => {
                    console.log('connecting to host')
                    const host = peer.connect(hostId, { serialization: 'json' })
                    setHost(host)
                    host.on('open', () => {
                        console.log('host is open')
                        setState(prev => ({ ...prev, host: ({ id: hostId, ready: true }) }))
                        events.emit('host/open', toInternalPeer(host))
                    })

                    host.on('data', (action: any) => {
                        console.log('receive data from host')
                        events.emit('host/data', toInternalPeer(host), action)
                        events.emit('any/data', toInternalPeer(host), action)
                    })
                }

                const createHost = (hostId: string) => {
                    console.log('creating a host')
                    events.emit('open')

                    setState(prev => ({ ...prev, isHost: true, host: { ...prev.host, id: hostId, ready: true } }))
                    peer.on('connection', conn => {
                        console.log('peer connected to host')

                        setState(prev => ({ ...prev, connections: [...prev.connections, toInternalPeer(conn)] }))
                        conn.on('open', () => events.emit('peer/open', toInternalPeer(conn)))

                        conn.on('data', (action: any) => {
                            console.log('receive data from peer')

                            events.emit('peer/data', toInternalPeer(conn), action)
                            events.emit('any/data', toInternalPeer(conn), action)
                        })

                        // Remove connection from active connections
                        conn.on('close', () => setState(prev => ({ ...prev, connections: prev.connections.filter(x => x.id !== toInternalPeer(conn).id) })))
                    })
                }

                peer.on('error', error => {
                    console.log('error happened', error)
                    if (error.type === 'unavailable-id') return createHost(peerState.peer.id!)
                    setState(prev => ({ ...prev, error: new Error(error.type) }))
                })

                peer.on('open', id => {
                    setState(prev => ({ ...prev, peer: { ...prev.peer, id, ready: true } }))
                    if (hostId === null) createHost(id)
                    else connectToHost(hostId)
                })
            })

            return () => {
                peer && peer.destroy()
            }
        }, []
    )

    return [peerState, events, peerDispatch, peerBroadcast]
}

export const useDataListen = <
    AC extends ActionCreator<Action>
>(
    events: PeerEmmiter,
    actionCreator: AC,
    handler: PeerDataEvent<ReturnType<AC>>,
    deps: DependencyList
) => {
    useEventListener('any/data', events, (conn, action) => {
        if (isActionOf(actionCreator, action)) {
            handler(conn, action)
        }
    }, [actionCreator, ...deps])
}
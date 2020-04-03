import { useEffect, useState, useReducer, useCallback, Reducer, useMemo } from 'react'
import Peer from 'peerjs'
import { Action } from 'typesafe-actions'

import { combineReducers } from '../utils/reducerHelpers'
import { createPeer } from './core'
import { EventEmitter } from 'events'

type PeerHost = {
    id: string | null,
    ready: boolean
}

type PeerState = {
    readonly peer: PeerHost
    readonly host: PeerHost
    readonly connections: ReadonlyArray<Peer.DataConnection>
    readonly isHost: boolean
    readonly error: Error | null
}

export const usePeerHost = <TState, TAction extends Action = any>(
    initialState: TState,
    reducer?: Reducer<TState, TAction>
): [TState, React.Dispatch<TAction>, PeerState] => {
    const [state, _dispatch] = useReducer(reducer ?? emptyReducer, initialState)
    const [peerState, setState] = useState<PeerState>({
        peer: { id: null, ready: false },
        host: { id: null, ready: false },
        connections: [],
        isHost: true,
        error: null
    })

    const [peer, setPeer] = useState<Peer | null>(null)
    const { connections } = peerState

    const dispatch = useCallback((action: TAction, source: Peer.DataConnection | null = null) => {
        // Send action to all connection except for source connection
        connections.forEach(connection => source?.label !== connection.label
            ? connection.send(action) : void (0))

        // TODO: verify connection sends completed?
        _dispatch(action)
    }, [connections, _dispatch])

    useEffect(
        () => {
            import('peerjs').then(({ default: peerConstructor }) => {
                const peer = createPeer(peerConstructor)
                setPeer(peer)

                peer.on('error', error => setState(prev => ({ ...prev, error })))
                peer.on('open', id => setState(prev => ({ ...prev, host: ({ id, ready: true }) })))

                peer.on('connection', conn => {
                    setState(prev => ({ ...prev, connections: [...prev.connections, conn] }))
                    console.log(conn)
                    // Send full state on open
                    const action: InitialAction<TState> = {
                        type: 'initialState',
                        payload: state
                    }
                    conn.on('open', () => conn.send(action))

                    conn.on('data', (data: TAction) => dispatch(data, conn))

                    // Remove connection from active connections
                    conn.on('close', () => setState(prev => ({ ...prev, connections: prev.connections.filter(x => x.label !== conn.label) })))
                })
            })

            return () => {
                peer && peer.destroy()
            }
        }, []
    )

    return [state, dispatch, peerState]
}

export const usePeer = <TState, TAction extends Action = any>(
    hostId: string,
    reducer?: Reducer<TState, TAction>
): [TState, React.Dispatch<TAction>, PeerState] => {
    const combinedReducer = combineReducers<TState, TAction>(initialStateReducer, reducer ?? emptyReducer)
    const [state, _dispatch] = useReducer(combinedReducer, null as any as TState) // TODO: fix dis type
    const [peerState, setState] = useState<PeerState>({
        peer: { id: null, ready: false },
        host: { id: null, ready: true },
        connections: [],
        isHost: false,
        error: null
    })
    const [peer, setPeer] = useState<Peer | null>(null)
    const [host, setHost] = useState<Peer.DataConnection | null>(null)

    const dispatch = useCallback((action: TAction) => {
        if (host === null) throw new Error('Not connected to any host')

        // Send action to host
        host.send(action)

        // TODO: verify host received?
        _dispatch(action)
    }, [host, _dispatch])

    useEffect(
        () => {
            import('peerjs').then(({ default: peerConstructor }) => {
                const peer = createPeer(peerConstructor)
                setPeer(peer)

                peer.on('error', error => setState(prev => ({ ...prev, error })))
                peer.on('open', id => {
                    const host = peer.connect(hostId)
                    setHost(host)

                    host.on('open', () => {
                        setState(prev => ({ ...prev, host: ({ id: hostId, ready: true }) }))
                    })

                    host.on('data', (action: TAction) => {
                        _dispatch(action)
                    })
                })
            });

            return () => {
                peer && peer.destroy()
                setState(prev => ({ ...prev, host: ({ id: null, ready: false }) }))
            }
        }, []
    )

    return [state, dispatch, peerState]
}

const events = new EventEmitter()

export const useCommonPeer = <TState, TAction extends Action = any>(
    hostId: string | null,  // broker id to connect. If null - create a new host
    initialState?: TState,
    reducer?: Reducer<TState, TAction>
): [TState, React.Dispatch<TAction>, PeerState] => {
    const combinedReducer = combineReducers<TState, TAction>(initialStateReducer, reducer ?? emptyReducer)

    const [state, _dispatch] = useReducer(combinedReducer, initialState ?? null as any as TState) // TODO: fix this type
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

    const dispatch = useCallback((action: TAction, source: Peer.DataConnection | null = null) => {
        console.log('dispatching', action)
        if (host !== null) {
            // Send action to host
            host.send(action)
            // TODO: verify host received?
        }
        // Send action to all connection except for source connection
        connections.forEach(connection => source?.label !== connection.label
            ? connection.send(action) : void (0))

        // TODO: verify connection sends completed?

        _dispatch(action)
    }, [host, connections, _dispatch])

    const sendToConnection = useCallback((connection: Peer.DataConnection, action: Action) => {
        connection.send(action)
        console.log('sending to connection', action)
    }, [])

    useEffect(() => {
        console.log('update initialstate dispatcher')
        events.removeAllListeners()
        // Send full state on open
        const action: InitialAction<TState> = {
            type: 'initialState',
            payload: state
        }
        events.on('send-open-action', (connection: Peer.DataConnection) => sendToConnection(connection, action))
    }, [state])

    useEffect(
        () => {
            import('peerjs').then(({ default: peerConstructor }) => {
                console.log('creating a new peer')
                const peer = createPeer(peerConstructor)
                setPeer(peer)

                const connectToHost = (hostId: string) => {
                    console.log('connection to a host')
                    const host = peer.connect(hostId)
                    setHost(host)
                    host.on('open', () => {
                        console.log('connection to host open')
                        setState(prev => ({ ...prev, host: ({ id: hostId, ready: true }) }))
                    })

                    host.on('data', (action: TAction) => {
                        console.log('received data on client', action)
                        _dispatch(action)
                    })
                }

                const createHost = (hostId: string) => {
                    console.log('creating a host')
                    setState(prev => ({ ...prev, isHost: true, host: { ...prev.host, id: hostId, ready: true } }))
                    peer.on('connection', conn => {
                        console.log('new connection to host', conn)
                        setState(prev => ({ ...prev, connections: [...prev.connections, conn] }))
                        conn.on('open', () => events.emit('send-open-action', conn))

                        conn.on('data', (data: TAction) => {
                            console.log('received data on host', data)
                            dispatch(data, conn)
                        })

                        // Remove connection from active connections
                        conn.on('close', () => setState(prev => ({ ...prev, connections: prev.connections.filter(x => x.label !== conn.label) })))
                    })
                }

                peer.on('error', error => {
                    console.log('error happened', error)
                    if (error.type === 'unavailable-id') return createHost(peerState.peer.id!)
                    setState(prev => ({ ...prev, error: new Error(error.type) }))
                })

                peer.on('open', id => {
                    console.log('peer with id is open', id)
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

    return [state, dispatch, peerState]
}

type InitialAction<TState> = {
    type: 'initialState',
    payload: TState
}

const assertInitialStateAction = <TState, TAction extends Action>(action: TAction | InitialAction<TState>): action is InitialAction<TState> =>
    action.type === 'initialState'

const emptyReducer = <TState, TAction extends Action>(state: TState, action: TAction) => state

const initialStateReducer = <TState, TAction extends Action>(state: TState, action: TAction) => {
    return assertInitialStateAction<TState, TAction>(action)
        ? action.payload
        : state
}
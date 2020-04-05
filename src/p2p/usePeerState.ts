import { useEffect, useState, useReducer, useCallback, Reducer, useMemo } from 'react'
import Peer from 'peerjs'
import { Action } from 'typesafe-actions'
import { EventEmitter } from 'events'

import { combineReducers, initialStateReducer, emptyReducer, InitialAction } from 'utils/reducerHelpers'
import { createPeer } from 'p2p/core'
import { usePeerDispatch } from 'p2p/usePeerDispatch'
import { useEventListener } from 'utils/useEventListener'

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

const events = new EventEmitter()

export const usePeer = <TState, TAction extends Action = any>(
    hostId: string | null,  // broker id to connect. If null - create a new host
    initialState: TState,
    reducer?: Reducer<TState, TAction>
): [TState, React.Dispatch<TAction>, PeerState] => {
    const combinedReducer = combineReducers<TState, TAction>(initialStateReducer, reducer ?? emptyReducer)
    const [state, dispatch] = useReducer(combinedReducer, initialState)

    const [peerState, setState] = useState<PeerState>({
        peer: { id: null, ready: false },
        host: { id: null, ready: false },
        connections: [],
        isHost: false,
        error: null
    })

    const [peer, setPeer] = useState<Peer | null>(null)
    const [host, setHost] = useState<Peer.DataConnection | null>(null)

    const peerDispatch = useCallback(
        usePeerDispatch(host, peerState.connections, dispatch),
        [host, peerState.connections, dispatch])

    const sendToConnection = useCallback((connection: Peer.DataConnection, action: Action) => {
        connection.send(action)
    }, [])

    const initialAction = useMemo<InitialAction<TState>>(() => ({
        type: 'initialState',
        payload: state
    }), [state])
    useEventListener('send-open-action', (connection: Peer.DataConnection) => sendToConnection(connection, initialAction))

    useEffect(
        () => {
            import('peerjs').then(({ default: peerConstructor }) => {
                const peer = createPeer(peerConstructor)
                setPeer(peer)

                const connectToHost = (hostId: string) => {
                    const host = peer.connect(hostId, { serialization: 'json' })
                    setHost(host)
                    host.on('open', () => {
                        setState(prev => ({ ...prev, host: ({ id: hostId, ready: true }) }))
                    })

                    host.on('data', (action: TAction) => {
                        dispatch(action)
                    })
                }

                const createHost = (hostId: string) => {
                    setState(prev => ({ ...prev, isHost: true, host: { ...prev.host, id: hostId, ready: true } }))
                    peer.on('connection', conn => {
                        setState(prev => ({ ...prev, connections: [...prev.connections, conn] }))
                        conn.on('open', () => events.emit('send-open-action', conn))

                        conn.on('data', (data: TAction) => {
                            peerDispatch(data, conn)
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
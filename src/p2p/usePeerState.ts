import { useEffect, useState, useRef, useReducer, Reducer } from 'react'
import Peer from 'peerjs'
import { combineReducers } from '../utils/reducerHelpers'

export type Action<T = any> = {
    type: string
} | InitialAction<T>

type InitialAction<TState> = {
    type: 'initialState',
    payload: TState
}

type PeerHost = {
    id: string | null,
    ready: boolean
}

type PeerState = {
    readonly host: PeerHost
    readonly connections: ReadonlyArray<Peer.DataConnection>
    readonly isHost: boolean
    readonly error: Error | null
}

export const usePeerHost = <TState, TAction extends Action = any>(
    initialState: TState,
    reducer?: Reducer<TState, TAction>
): [TState, React.Dispatch<TAction>, PeerState] => {
    const [state, dispatch] = useReducer(reducer ?? emptyReducer, initialState)
    const [peerState, setState] = useState<PeerState>({
        host: { id: null, ready: false },
        connections: [],
        isHost: true,
        error: null
    })

    const [connections, setConnections] = useState<ReadonlyArray<Peer.DataConnection>>([])
    const [peer, setPeer] = useState<Peer | null>(null)

    useEffect(
        () => {
            import('peerjs').then(({ default: Peer }) => {
                const peer = new Peer()
                setPeer(peer)

                peer.on('error', error => setState(prev => ({ ...prev, error })))
                peer.on('open', id => setState(prev => ({ ...prev, host: ({ id, ready: true }) })))

                peer.on('connection', conn => {
                    setConnections(prev => ([...prev, conn]))
                    // Send full state on open
                    const action: InitialAction<TState> = {
                        type: 'initialState',
                        payload: state
                    }
                    conn.on('open', () => conn.send(action))

                    // Remove connection from active connections
                    conn.on('close', () => setConnections(prev => prev.filter(x => x.label !== conn.label)))
                });
            });

            return () => {
                peer && peer.destroy()
            }
        }, []
    )

    return [state, dispatch, peerState]
}

export const usePeer = <TState, TAction extends Action = any>(
    hostId: string,
    reducer?: Reducer<TState | null, TAction>
): [TState | null, PeerState] => {
    const combinedReducer = combineReducers<TState | null, TAction>(initialStateReducer, reducer ?? emptyReducer)
    const [state, dispatch] = useReducer(combinedReducer, null)
    const [peerState, setState] = useState<PeerState>({
        host: { id: null, ready: true },
        connections: [],
        isHost: false,
        error: null
    })
    const [peer, setPeer] = useState<Peer | null>(null)
    useEffect(
        () => {
            import('peerjs').then(({ default: Peer }) => {
                const peer = new Peer()
                setPeer(peer)

                peer.on('error', error => setState(prev => ({ ...prev, error })))
                peer.on('open', id => {
                    const connection = peer.connect(hostId)

                    connection.on('open', () => {
                        setState(prev => ({ ...prev, host: ({ id: hostId, ready: true }) }))
                    })

                    connection.on('data', (action: TAction) => {
                        dispatch(action)
                    })
                })
            });

            return () => {
                peer && peer.destroy()
                setState(prev => ({ ...prev, host: ({ id: null, ready: false }) }))
            }
        }, []
    )

    return [state, peerState]
}

const assertInitialStateAction = <TState, TAction extends Action>(action: TAction | InitialAction<TState>): action is InitialAction<TState> =>
    action.type === 'initialState'

const emptyReducer = <TState, TAction extends Action>(state: TState, action: TAction) => state

const initialStateReducer = <TState, TAction extends Action>(state: TState, action: TAction) => {
    return assertInitialStateAction<TState, TAction>(action)
        ? action.payload
        : state
}
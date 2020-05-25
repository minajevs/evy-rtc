import { usePeer } from 'p2p/usePeerState'
import createStoreContext from 'react-concise-state'
import { useEffect, useContext } from 'react'

export const [context, Provider] = createStoreContext({
    connecting: true
}, ({ setState }) => ({
    setConnected: () => setState({ connecting: false })
}))

export const useConnection = () => {
    const [peerState, events, dispatch, broadcast] = usePeer()
    const connectionStore = useContext(context)

    useEffect(() => {
        events.on('host/open', () => connectionStore.setConnected())
        events.on('open', () => connectionStore.setConnected())
    }, [])

    return [connectionStore.connecting]
}
import Peer from 'peerjs'

const server = 'peerjs-test-server.herokuapp.com'

export const createPeer = (peerConsturctor: typeof Peer) => new peerConsturctor({
    host: server,
    secure: true,
}) 
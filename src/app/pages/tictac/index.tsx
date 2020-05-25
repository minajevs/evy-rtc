import React, { useCallback } from 'react'
import { TextField, Button, Grid } from '@material-ui/core'

import { useConnection } from 'app/modules/connection'
import { useUsers } from 'app/modules/users'
import { useChat } from 'app/modules/chat'
import { useTictac } from 'app/modules/tictac'

import Game from 'app/pages/tictac/Game'
import Field from 'app/pages/tictac/Field'
import { GameStateEnum } from 'app/modules/tictac/state'

export type Props = {}

export const Tictac: React.FC<Props> = ({ }) => {
    const [textState, setState] = React.useState('')
    const [chatState, sendMessage] = useChat()
    const [usersState, userLogin] = useUsers()
    const { gameState, signUp, move, restart } = useTictac()
    const [connecting] = useConnection()

    const login = useCallback((name: string) => {
        userLogin(name)
        setState('')
    }, [userLogin])

    const send = useCallback((msg: string) => {
        sendMessage(msg)
        setState('')
    }, [sendMessage])

    if (connecting)
        return (<>Connecting...</>)

    if (usersState.currentUser === null)
        return (
            <>
                <div>Choose username:</div>
                <TextField value={textState} onChange={event => setState(event.currentTarget.value)}></TextField>
                <Button onClick={() => login(textState)}>Send</Button>
            </>
        )

    return (
        <Grid container>
            <Grid item xs={3}>
                Current user: {usersState.currentUser.username}
                <br />
                Users in the room: {usersState.users.map((user, i) => <p key={i}>{user.username} : {user.userId}</p>)}
                <hr />
                {chatState.messages.map((msg, key) => <p key={key}>[{msg.author.username}]{msg.text}</p>)}
                <TextField value={textState} onChange={event => setState(event.currentTarget.value)}></TextField>
                <Button onClick={() => send(textState)}>Send</Button>
            </Grid>
            <Grid item xs={9}>
                <p>State: {GameStateEnum[gameState.state]}</p>
                <p>Players: {gameState.players.filter(x => x !== null).map(x => x?.username ?? "").join(',')}</p>
                {
                    gameState.state == GameStateEnum.NotStarted
                        ? <Button onClick={signUp}>Signup for the game</Button>
                        : null
                }
                {
                    gameState.state == GameStateEnum.Running
                        ? <Game
                            field={gameState.field}
                            onMove={move}
                            currentMove={gameState.currentMove!}
                        />
                        : null
                }
                {
                    gameState.state == GameStateEnum.Ended
                        ? <>
                            <p>Game ended</p>
                            {
                                gameState.winner !== null
                                    ? <p>Winner: {gameState.winner!.username}!</p>
                                    : <p>Tie!</p>
                            }
                            <Button onClick={restart}>Restart game</Button>
                            <Field
                                field={gameState.field}
                                onMove={() => { }}
                            />
                        </>
                        : null
                }
            </Grid>
        </Grid>
    )
}

export default Tictac
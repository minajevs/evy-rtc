import React from 'react'

import { Field, Cords } from 'app/modules/tictac/state'
import TictacField from 'app/pages/tictac/Field'
import { UserInfo, useUsers } from 'app/modules/users'

export type Props = {
    field: Field[][]
    onMove: (cords: Cords) => void
    currentMove: UserInfo
}

export const Game: React.FC<Props> = ({ field, onMove, currentMove }) => {
    const [usersState] = useUsers()

    const { currentUser } = usersState

    return (
        <>
            <p>Game running!</p>
            {currentUser!.userId == currentMove.userId
                ? <p>Your move: </p>
                : <p>Opponents move...</p>}
            <TictacField field={field} onMove={onMove} />
        </>
    )
}

export default Game
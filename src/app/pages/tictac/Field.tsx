import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { Field, Cords } from 'app/modules/tictac/state'

const useStyles = makeStyles({
    field: {

    },
    row: {
        display: 'flex',
        flexDirection: 'row'
    },
    cell: {
        border: '1px solid black',
        height: '3em',
        width: '3em',
        boxSizing: 'border-box',
        '&:hover': {
            border: '2px solid black'
        }
    }
})

export type Props = {
    field: Field[][]
    onMove: (cords: Cords) => void
}

type CellProps = {
    field: Field
    onClick: () => void
}

const Cell: React.FC<CellProps> = ({ field, onClick = () => { } }) => {
    const classes = useStyles()
    return (
        <div className={classes.cell} onClick={onClick}>
            {field !== Field.Empty
                ? Field[field]
                : null}
        </div>
    )
}

export const TictacField: React.FC<Props> = ({ field, onMove }) => {
    const classes = useStyles()

    const handleClick = useCallback((cords: Cords) => () => onMove(cords), [onMove])

    return (
        <div className={classes.field}>
            <div className={classes.row}>
                <Cell field={field[0][0]} onClick={handleClick({ x: 0, y: 0 })} />
                <Cell field={field[0][1]} onClick={handleClick({ x: 0, y: 1 })} />
                <Cell field={field[0][2]} onClick={handleClick({ x: 0, y: 2 })} />
            </div>
            <div className={classes.row}>
                <Cell field={field[1][0]} onClick={handleClick({ x: 1, y: 0 })} />
                <Cell field={field[1][1]} onClick={handleClick({ x: 1, y: 1 })} />
                <Cell field={field[1][2]} onClick={handleClick({ x: 1, y: 2 })} />
            </div>
            <div className={classes.row}>
                <Cell field={field[2][0]} onClick={handleClick({ x: 2, y: 0 })} />
                <Cell field={field[2][1]} onClick={handleClick({ x: 2, y: 1 })} />
                <Cell field={field[2][2]} onClick={handleClick({ x: 2, y: 2 })} />
            </div>
        </div>
    )
}


export default TictacField
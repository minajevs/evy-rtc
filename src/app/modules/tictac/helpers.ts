import { Field } from "./state"

const winConditions = [
    // rows
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    // cols
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    // diags
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
]

export const checkWin = (field: Field[][]) => winConditions
    .reduce((winner, [[x1, y1], [x2, y2], [x3, y3]]) => {
        // if winner found - do not check any further
        if (winner !== null) return winner

        // check if current winCondition is winner
        if (field[x1][y1] !== Field.Empty
            && field[x1][y1] === field[x2][y2]
            && field[x1][y1] === field[x3][y3])
            return field[x1][y1]

        // not a winner, so return null
        return null
    }, null as Field | null)

export const checkTie = (field: Field[][]) =>
    !field
        .some(row => row
            .some(cell => cell === Field.Empty))


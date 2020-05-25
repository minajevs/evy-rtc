import { Field } from './state'
import { checkTie, checkWin } from './helpers'

describe('checkTie', () => {
    it('returns true if field is tied', () => {
        const tiedField: Field[][] = [
            [Field.X, Field.O, Field.X],
            [Field.O, Field.X, Field.O],
            [Field.X, Field.O, Field.X],
        ]

        const result = checkTie(tiedField)

        expect(result).toBe(true)
    })

    it('returns false if field is not tied', () => {
        const tiedField: Field[][] = [
            [Field.X, Field.O, Field.X],
            [Field.O, Field.Empty, Field.O],
            [Field.X, Field.O, Field.X],
        ]

        const result = checkTie(tiedField)

        expect(result).toBe(false)
    })
})

describe('checkWin', () => {
    describe('win conditions', () => {
        describe('rows', () => {
            it('returns true if first row matches', () => {
                const field: Field[][] = [
                    [Field.X, Field.X, Field.X],
                    [Field.Empty, Field.Empty, Field.Empty],
                    [Field.Empty, Field.Empty, Field.Empty],
                ]
                const result = checkWin(field)
                expect(result).toBe(Field.X)
            })

            it('returns true if second row matches', () => {
                const field: Field[][] = [
                    [Field.Empty, Field.Empty, Field.Empty],
                    [Field.X, Field.X, Field.X],
                    [Field.Empty, Field.Empty, Field.Empty],
                ]
                const result = checkWin(field)
                expect(result).toBe(Field.X)
            })

            it('returns true if third row matches', () => {
                const field: Field[][] = [
                    [Field.Empty, Field.Empty, Field.Empty],
                    [Field.Empty, Field.Empty, Field.Empty],
                    [Field.X, Field.X, Field.X],
                ]
                const result = checkWin(field)
                expect(result).toBe(Field.X)
            })
        })

        describe('columns', () => {
            it('returns true if first column matches', () => {
                const field: Field[][] = [
                    [Field.X, Field.Empty, Field.Empty],
                    [Field.X, Field.Empty, Field.Empty],
                    [Field.X, Field.Empty, Field.Empty],
                ]
                const result = checkWin(field)
                expect(result).toBe(Field.X)
            })

            it('returns true if second column matches', () => {
                const field: Field[][] = [
                    [Field.Empty, Field.X, Field.Empty],
                    [Field.Empty, Field.X, Field.Empty],
                    [Field.Empty, Field.X, Field.Empty],
                ]
                const result = checkWin(field)
                expect(result).toBe(Field.X)
            })

            it('returns true if third column matches', () => {
                const field: Field[][] = [
                    [Field.Empty, Field.Empty, Field.X],
                    [Field.Empty, Field.Empty, Field.X],
                    [Field.Empty, Field.Empty, Field.X],
                ]
                const result = checkWin(field)
                expect(result).toBe(Field.X)
            })
        })

        describe('diagonals', () => {
            it('returns true if first diagonal matches', () => {
                const field: Field[][] = [
                    [Field.X, Field.Empty, Field.Empty],
                    [Field.Empty, Field.X, Field.Empty],
                    [Field.Empty, Field.Empty, Field.X],
                ]
                const result = checkWin(field)
                expect(result).toBe(Field.X)
            })

            it('returns true if second diagonal matches', () => {
                const field: Field[][] = [
                    [Field.Empty, Field.Empty, Field.X],
                    [Field.Empty, Field.X, Field.Empty],
                    [Field.X, Field.Empty, Field.Empty],
                ]
                const result = checkWin(field)
                expect(result).toBe(Field.X)
            })
        })
    })

    it('returns false if game tied', () => {
        const tiedField: Field[][] = [
            [Field.O, Field.X, Field.X],
            [Field.X, Field.O, Field.O],
            [Field.O, Field.O, Field.X],
        ]

        const result = checkWin(tiedField)

        expect(result).toBe(null)
    })
})
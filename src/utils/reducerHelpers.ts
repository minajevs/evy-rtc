import { Reducer } from "react"
import { Action } from "typesafe-actions"

export const combineReducers = <TState, TActions>(...reducers: Reducer<TState, TActions>[]): Reducer<TState, TActions> => (state: TState, action: TActions) =>
    reducers.reduce(
        (state, reducer) => reducer(state, action),
        state)

export type InitialAction<TState> = {
    type: 'initialState',
    payload: TState
}

export const assertInitialStateAction = <TState, TAction extends Action>(action: TAction | InitialAction<TState>): action is InitialAction<TState> =>
    action.type === 'initialState'

export const emptyReducer = <TState, TAction extends Action>(state: TState, action: TAction) => state

export const initialStateReducer = <TState, TAction extends Action>(state: TState, action: TAction) => {
    return assertInitialStateAction<TState, TAction>(action)
        ? action.payload
        : state
}
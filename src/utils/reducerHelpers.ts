import { Reducer } from "react"

export const combineReducers = <TState, TActions>(...reducers: Reducer<TState, TActions>[]): Reducer<TState, TActions> => (state: TState, action: TActions) =>
    reducers.reduce(
        (state, reducer) => reducer(state, action),
        state)
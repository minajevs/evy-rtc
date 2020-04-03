import { createAction, createReducer, ActionType } from 'typesafe-actions'

export const actions = {
    addMessage: createAction('message/add')<string>()
}

export const reducer = createReducer<{ messages: string[] }, ActionType<typeof actions>>({ messages: [] }, {
    "message/add": (state, action) => ({ ...state, messages: [...state.messages, action.payload] }),
})

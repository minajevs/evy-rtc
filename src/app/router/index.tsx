import React from 'react'

import { BrowserRouter } from "react-router-dom"

export type Props = {}

export const RouterOutlet: React.FC<Props> = ({ children }) => {
    return (
        <BrowserRouter>
            {children}
        </BrowserRouter>
    )
}

export default RouterOutlet
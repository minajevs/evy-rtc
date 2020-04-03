import React from 'react'

import { BrowserRouter } from "react-router-dom"

export type Props = {}

export const RouterOutlet: React.FC<Props> = ({ children }) => {
    return (
        // needs /evy because hosted on gh-pages
        <BrowserRouter basename="/evy">
            {children}
        </BrowserRouter>
    )
}

export default RouterOutlet
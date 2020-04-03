import React from 'react'

import { HashRouter } from "react-router-dom"

export type Props = {}

export const RouterOutlet: React.FC<Props> = ({ children }) => {
    return (
        // needs /evy because hosted on gh-pages
        <HashRouter>
            {children}
        </HashRouter>
    )
}

export default RouterOutlet
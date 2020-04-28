import React from 'react'

import { HashRouter } from 'react-router-dom'

export const RouterOutlet: React.FC = ({ children }) => {
    return (
        <HashRouter>
            {children}
        </HashRouter>
    )
}

export default RouterOutlet
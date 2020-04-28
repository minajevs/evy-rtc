import React from 'react'

import { Switch, Route, Redirect } from 'react-router-dom'
import Team from './team'
import { PeerProvider } from './PeerProvider'

function App() {
  return (
    <Switch>
      <Route path="/t/:id">
        <PeerProvider>
          <Team />
        </PeerProvider>
      </Route>
      <Route path="/">
        <PeerProvider>
          <Team />
        </PeerProvider>
      </Route>
    </Switch>
  )
}

export default App

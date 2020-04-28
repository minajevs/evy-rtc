import React from 'react'

import { Switch, Route, Redirect } from 'react-router-dom'
import Team from './team'
import { PeerProvider } from './PeerProvider'
import { Provider } from 'app/modules/users'

function App() {
  return (
    <Switch>
      <Route path="/t/:id">
        <PeerProvider>
          <Provider>
            <Team />
          </Provider>
        </PeerProvider>
      </Route>
      <Route path="/">
        <PeerProvider>
          <Provider>
            <Team />
          </Provider>
        </PeerProvider>
      </Route>
    </Switch>
  )
}

export default App

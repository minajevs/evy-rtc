import React from 'react'

import { Switch, Route, Redirect } from 'react-router-dom'
import Team from './team'
import { PeerProvider } from './PeerProvider'
import { Provider as UsersProvider } from 'app/modules/users'
import { Provider as ChatProvider } from 'app/modules/chat'
import { Provider as ConnectionProvider } from 'app/modules/connection'
import CombineProviders from 'app/CombineProviders'
import Tictac from 'app/pages/tictac'

function App() {
  return (
    <Switch>
      <Route path="/tictac">
        <PeerProvider route="tictac">
          <CombineProviders providers={[ChatProvider, UsersProvider, ConnectionProvider]}>
            <Tictac />
          </CombineProviders>
        </PeerProvider>
      </Route>
      <Route path="/t">
        <PeerProvider>
          <CombineProviders providers={[ChatProvider, UsersProvider, ConnectionProvider]}>
            <Team />
          </CombineProviders>
        </PeerProvider>
      </Route>
    </Switch>
  )
}

export default App

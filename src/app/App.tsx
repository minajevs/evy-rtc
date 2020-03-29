import React from 'react'

import { Switch, Route } from 'react-router-dom'
import Lobby from './lobby'
import Team from './team'

function App() {
  return (
    <Switch>
      <Route path="/t/:id">
        <Team />
      </Route>
      <Route path="/">
        <Lobby />
      </Route>
    </Switch>
  )
}

export default App

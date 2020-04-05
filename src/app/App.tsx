import React from 'react'

import { Switch, Route, Redirect } from 'react-router-dom'
import Team from './team'

function App() {
  return (
    <Switch>
      <Route path="/t/:id">
        <Team />
      </Route>
      <Route path="/">
        <Team />
      </Route>
    </Switch>
  )
}

export default App

import React from 'react'
import ReactDOM from 'react-dom'
import App from './app/App'
import * as serviceWorker from './serviceWorker'
import RouterOutlet from './app/router'

ReactDOM.render(
  <React.StrictMode>
    <RouterOutlet>
      <App />
    </RouterOutlet>
  </React.StrictMode>,
  document.getElementById('root')
)

serviceWorker.unregister()

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { FluentProvider, teamsLightTheme } from '@fluentui/react-components'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FluentProvider theme={teamsLightTheme}>
      <App />
    </FluentProvider>
  </React.StrictMode>,
)

import { useState } from 'react'
import './App.scss'
import GameMenuApp from './views/GameList'
import { Route, Routes, HashRouter } from 'react-router-dom'
import ModList from './views/ModList'
import NotFound from './views/404'

export function App() {
  const [state, setState] = useState({
    active: true,
  })
  const RouterView = () => {
    return (
      <Routes>
        <Route path="/" element={<GameMenuApp />} />
        <Route path="/Mod/:id" element={<ModList />}></Route>
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    )
  }
  return (
    <HashRouter>
      {/* <button
        style={{ color: 'red' }}
        onClick={() => {
          setState({
            active: !state.active,
          })
        }}
      >
        active
      </button> */}
      {state.active ? <RouterView /> : null}
    </HashRouter>
  )
}

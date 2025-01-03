import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Drawing from './components/tldraw'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/draw" element={<Drawing />} />
      </Routes>
    </Router>
  )
}

export default App

import { BrowserRouter as Router } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import HomePage from './components/HomePage'
import ChallengePage from './components/ChallengePage'
import ChallengeDetailPage from './components/ChallengeDetailPage'
import AboutPage from './components/AboutPage'

function App() {
  return (
      <Router>
        <div>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/challenges" element={<ChallengePage />} />
            <Route path="/challenge/:id" element={<ChallengeDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </div>
      </Router>
  )
}

export default App
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import HomePage from './components/HomePage'
import ChallengeList from './components/ChallengeList'
import ChallengeDetailPage from './components/ChallengeDetailPage'
import AboutPage from './components/AboutPage'
import './gh-fork-ribbon.css';

function App() {
    return (
        <Router>
            <div className="app-container">
                <NavBar/>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/challenges" element={<ChallengeList/>}/>
                    <Route path="/challenge/:id" element={<ChallengeDetailPage/>}/>
                    <Route path="/about" element={<AboutPage/>}/>
                </Routes>
            </div>
        </Router>
    )
}

export default App
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import HomePage from './components/HomePage'
import ChallengeListPage from './components/ChallengeListPage'
import ChallengeDetailPage from './components/ChallengeDetailPage'
import AboutPage from './components/AboutPage'
import './gh-fork-ribbon.css';

const App = () => {
    return (
        <Router>
            <div className="App">
                <div className="github-fork-ribbon-wrapper right">
                    <div className="github-fork-ribbon" data-ribbon="Fork me on GitHub">
                        <a href="https://github.com/JSREP/crawler-leetcode" target="_blank" rel="noopener noreferrer">Fork me on GitHub</a>
                    </div>
                </div>
                <NavBar/>
                <div style={{ padding: '20px' }}>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/challenges" element={<ChallengeListPage/>}/>
                        <Route path="/challenge/:id" element={<ChallengeDetailPage/>}/>
                        <Route path="/about" element={<AboutPage/>}/>
                        <Route path="*" element={<HomePage/>}/>
                    </Routes>
                </div>
            </div>
        </Router>
    )
}

export default App
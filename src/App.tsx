import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import HomePage from './components/HomePage'
import ChallengeListPage from './components/ChallengeListPage'
import ChallengeDetailPage from './components/ChallengeDetailPage'
import ChallengeContributePage from './components/ChallengeContributePage'
import AboutPage from './components/AboutPage'
import GitHubRibbon from './components/GitHubRibbon'
import './gh-fork-ribbon.css';
import './styles/github-ribbon-fix.css';

const App = () => {
    return (
        <Router>
            <div className="App">
                <GitHubRibbon repositoryUrl="https://github.com/JSREP/crawler-leetcode" />
                <NavBar/>
                <div className="content-wrapper" style={{ padding: '20px 0' }}>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/challenges" element={<ChallengeListPage/>}/>
                        <Route path="/challenge/:id" element={<ChallengeDetailPage/>}/>
                        <Route path="/challenge/contribute" element={<ChallengeContributePage />}/>
                        <Route path="/about" element={<AboutPage/>}/>
                        <Route path="*" element={<HomePage/>}/>
                    </Routes>
                </div>
            </div>
        </Router>
    )
}

export default App
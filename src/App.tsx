import {HashRouter as Router, Route, Routes} from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import HomePage from './components/HomePage'
import ChallengeListPage from './components/ChallengeListPage'
import ChallengeDetailPage from './components/ChallengeDetailPage'
import ChallengeContributePage from './components/ChallengeContributePage'
import AboutPage from './components/AboutPage'
import GitHubRibbon from './components/GitHubRibbon'
import PageTitle from './components/PageTitle'
import './gh-fork-ribbon.css';
import './styles/github-ribbon-fix.css';
import BaiduAnalytics from './components/BaiduAnalytics'

const App = () => {
    return (
        <Router>
            <div className="App">
                <PageTitle />
                <GitHubRibbon repositoryUrl="https://github.com/JSREP/crawler-leetcode" />
                <BaiduAnalytics siteId="b4fcc22834ded2c9864e661e6a5a634d" />
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
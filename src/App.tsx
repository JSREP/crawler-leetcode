import {HashRouter, BrowserRouter, Route, Routes} from 'react-router-dom'
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

// 根据环境选择路由器
const Router = import.meta.env.VERCEL ? BrowserRouter : HashRouter;

const App = () => {
    return (
        <Router>
            <div className="App">
                <PageTitle />
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
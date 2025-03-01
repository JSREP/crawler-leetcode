// src/components/NavBar.tsx
import {Link, useLocation} from 'react-router-dom';
import {Layout, Menu, Space, Typography, Select} from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
// @ts-ignore
import logo from '../assets/logo.png';

const {Header} = Layout;
const {Title} = Typography;
const { Option } = Select;

const NavBar = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const items = [
        {label: <Link to="/">{t('nav.home')}</Link>, key: '/'},
        {label: <Link to="/challenges">{t('nav.challenges')}</Link>, key: '/challenges'},
        {label: <Link to="/about">{t('nav.about')}</Link>, key: '/about'},
    ];

    const handleLanguageChange = (value: string) => {
        changeLanguage(value);
    };

    return (
        <Header style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'space-between'
            }}>
                <Space size="middle">
                    <img src={logo} alt="logo" style={{height: 40}}/>
                    <Title level={3} style={{margin: 0, color: '#2c3e50'}}>
                        LeetCode Crawler
                    </Title>
                </Space>

                <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginLeft: '24px' }}>
                    <Menu
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={items}
                        style={{
                            borderBottom: 'none',
                            flex: 1
                        }}
                    />
                    <Space size="middle">
                        <Select
                            defaultValue={localStorage.getItem('language') || 'en'}
                            style={{ width: 120 }}
                            bordered={false}
                            onChange={handleLanguageChange}
                        >
                            <Option value="zh">简体中文</Option>
                            <Option value="en">English</Option>
                        </Select>
                        <a 
                            href="https://github.com/JSREP/crawler-leetcode"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '24px', color: '#2c3e50' }}
                        >
                            <GithubOutlined />
                        </a>
                    </Space>
                </div>
            </div>
        </Header>
    );
};

export default NavBar;
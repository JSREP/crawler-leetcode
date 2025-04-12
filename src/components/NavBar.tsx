// src/components/NavBar.tsx
import { useState } from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Layout, Menu, Space, Typography, Select} from 'antd';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
// @ts-ignore
import faviconLogo from '../assets/favicon.png';

const {Header} = Layout;
const {Title} = Typography;
const { Option } = Select;

/**
 * 导航栏组件
 * 包含网站Logo、导航菜单和语言切换
 */
const NavBar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [ribbonHovered, setRibbonHovered] = useState(false);

    // 导航菜单项
    const items = [
        {label: <Link to="/">{t('nav.home')}</Link>, key: '/'},
        {label: <Link to="/challenges">{t('nav.challenges')}</Link>, key: '/challenges'},
        {label: <Link to="/about">{t('nav.about')}</Link>, key: '/about'},
    ];

    // 处理语言变更
    const handleLanguageChange = (value: string) => {
        changeLanguage(value);
    };

    return (
        <Header style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            overflow: 'visible',
            padding: '0',
            height: '70px', // 增加导航栏高度
            lineHeight: '70px' // 匹配行高
        }}>
            <div className="navbar-container" style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'space-between',
                maxWidth: '1200px',
                width: '100%',
                margin: '0 auto',
                padding: '0 16px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    {/* Logo */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        height: '100%',
                        marginRight: '40px'
                    }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                            <img 
                                src={faviconLogo} 
                                alt="LeetCode Crawler" 
                                style={{
                                    height: '46px',
                                    width: 'auto',
                                    marginRight: '12px'
                                }}
                            />
                            <Title level={3} style={{margin: 0, color: '#2c3e50', whiteSpace: 'nowrap'}}>
                                LeetCode Crawler
                            </Title>
                        </Link>
                    </div>

                    {/* 导航菜单 */}
                    <Menu
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={items}
                        style={{
                            borderBottom: 'none',
                            flex: 'none',
                            fontSize: '16px',
                            fontWeight: 500,
                            lineHeight: '70px',
                            height: '70px'
                        }}
                    />
                </div>

                {/* 语言选择器 */}
                <Select
                    defaultValue={localStorage.getItem('language') || 'en'}
                    style={{
                        width: 120,
                        background: 'transparent',
                        fontSize: '14px'
                    }}
                    variant="borderless"
                    onChange={handleLanguageChange}
                >
                    <Option value="zh">简体中文</Option>
                    <Option value="en">English</Option>
                </Select>
            </div>
        </Header>
    );
};

export default NavBar;
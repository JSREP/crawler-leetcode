// src/components/NavBar.tsx
import { useState, useEffect, useRef } from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Layout, Menu, Typography, Select} from 'antd';
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
    const [contentPadding, setContentPadding] = useState(16); // 与CSS中定义的内边距一致

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
            height: '70px',
            lineHeight: '70px'
        }}>
            <div className="navbar-container" style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                maxWidth: '80%',
                width: '100%',
                margin: '0 auto',
                position: 'relative',
                paddingLeft: '16px', // 与挑战列表使用相同的左内边距
                paddingRight: '16px'
            }}>
                {/* Logo区域 */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    height: '100%'
                }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <img 
                            src={faviconLogo} 
                            alt="Crawler LeetCode" 
                            style={{
                                height: '46px',
                                width: 'auto',
                                marginRight: '12px'
                            }}
                        />
                        <Title level={3} style={{margin: 0, color: '#2c3e50', whiteSpace: 'nowrap'}}>
                            Crawler LeetCode
                        </Title>
                    </Link>
                </div>

                {/* 导航菜单和语言选择器容器 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flex: 1,
                    marginLeft: '40px'
                }}>
                    <Menu
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={items}
                        style={{
                            borderBottom: 'none',
                            fontSize: '16px',
                            fontWeight: 500,
                            lineHeight: '70px',
                            height: '70px',
                            overflow: 'visible'
                        }}
                        disabledOverflow={true}
                    />
                    
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
            </div>
        </Header>
    );
};

export default NavBar;
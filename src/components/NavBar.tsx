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
            overflow: 'visible',  // 修复溢出裁剪问题
            padding: '0'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'space-between',
                maxWidth: '1200px',
                width: '100%',
                margin: '0 auto',
                padding: '0 24px'
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
                        marginRight: '32px'
                    }}>
                        <img 
                            src={faviconLogo} 
                            alt="LeetCode Crawler" 
                            style={{
                                height: '80%', // 自适应导航栏高度
                                maxHeight: '50px',
                                width: 'auto',
                                marginRight: '12px'
                            }}
                        />
                        <Title level={3} style={{margin: 0, color: '#2c3e50'}}>
                            LeetCode Crawler
                        </Title>
                    </div>

                    {/* 导航菜单 */}
                    <Menu
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={items}
                        style={{
                            borderBottom: 'none',
                            flex: 'none',
                        }}
                    />
                </div>

                {/* 语言选择器 */}
                <Select
                    defaultValue={localStorage.getItem('language') || 'en'}
                    style={{
                        width: 120,
                        background: 'transparent',
                        border: '1px solid #e8e8e8',
                        borderRadius: '4px'
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
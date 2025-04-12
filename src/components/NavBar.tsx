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
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentPadding, setContentPadding] = useState(24); // 默认内容区域左内边距

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

    // 在组件挂载和窗口大小改变时，获取内容区域的实际左边距
    useEffect(() => {
        const updateContentPadding = () => {
            // 延迟获取，确保DOM已经更新
            setTimeout(() => {
                // 查找搜索框元素作为参考
                const searchBox = document.querySelector('input[placeholder*="搜索"]') || 
                                 document.querySelector('input[placeholder*="Search"]');
                if (searchBox) {
                    const rect = searchBox.getBoundingClientRect();
                    const padding = rect.left;
                    if (padding > 0) {
                        setContentPadding(padding);
                    }
                }
            }, 100);
        };

        // 初始化时和窗口大小改变时更新
        updateContentPadding();
        window.addEventListener('resize', updateContentPadding);
        
        return () => {
            window.removeEventListener('resize', updateContentPadding);
        };
    }, []);

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
                position: 'relative'
            }}>
                {/* Logo区域 */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    height: '100%',
                    paddingLeft: '24px'
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

                {/* 导航菜单 - 绝对定位，与内容区域精确对齐 */}
                <div style={{
                    position: 'absolute',
                    left: `${contentPadding}px`, // 精确对齐内容区域左边距
                    top: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: 'calc(100% - 48px)', // 两侧总边距24px
                    alignItems: 'center'
                }}>
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
                            height: '70px',
                            overflow: 'visible'
                        }}
                        disabledOverflow={true}
                    />
                </div>
                
                {/* 语言选择器 - 绝对定位，靠右对齐 */}
                <div style={{
                    position: 'absolute',
                    right: '24px',
                    top: 0,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center'
                }}>
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
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
                maxWidth: '80%', // 增加导航栏宽度以容纳英文菜单
                width: '100%',
                margin: '0 auto',
                padding: '0'
            }}>
                {/* Logo区域 */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    height: '100%',
                    marginRight: '24px',
                    flexShrink: 0, // 防止Logo区域被压缩
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

                {/* 导航菜单 - 放在单独的容器中，确保其位置与内容区域对齐 */}
                <div style={{
                    display: 'flex',
                    flex: 1,
                    justifyContent: 'space-between',
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
                            minWidth: '300px', // 确保菜单有最小宽度
                            overflow: 'visible', // 确保菜单不会被截断
                            paddingLeft: '0' // 移除左内边距，确保与内容区域左对齐
                        }}
                        disabledOverflow={true} // 禁用溢出处理，防止菜单项变为省略号
                    />
                    
                    {/* 语言选择器 */}
                    <Select
                        defaultValue={localStorage.getItem('language') || 'en'}
                        style={{
                            width: 120,
                            background: 'transparent',
                            fontSize: '14px',
                            flexShrink: 0, // 防止语言选择器被压缩
                            paddingRight: '24px'
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
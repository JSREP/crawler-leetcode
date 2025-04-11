// src/components/NavBar.tsx
import { useState } from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Layout, Menu, Space, Typography, Select} from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
// @ts-ignore
import logo from '../assets/logo.jpeg';

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
            overflow: 'visible'  // 修复溢出裁剪问题
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'space-between',
                position: 'relative'  // 为徽标提供定位上下文
            }}>
                <Space size="middle">
                    <img src={logo} alt="logo" style={{height: 40}}/>
                    <Title level={3} style={{margin: 0, color: '#2c3e50'}}>
                        LeetCode Crawler
                    </Title>
                </Space>

                {/* GitHub徽标组件 - 使用github-fork-ribbon CSS类 */}
                <a className="github-fork-ribbon right-top" 
                   href="https://github.com/JSREP/crawler-leetcode" 
                   data-ribbon="Fork me on GitHub" 
                   title="Fork me on GitHub"
                   target="_blank" 
                   rel="noopener noreferrer">
                    Fork me on GitHub
                </a>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    marginLeft: '24px',
                    paddingRight: '80px' // 为徽标预留空间
                }}>
                    <Menu
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={items}
                        style={{
                            borderBottom: 'none',
                            flex: 1,
                            minWidth: '400px' // 防止菜单挤压
                        }}
                    />
                    <Space size="middle">
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
                    </Space>
                </div>
            </div>
        </Header>
    );
};

export default NavBar;
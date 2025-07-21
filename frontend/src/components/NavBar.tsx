// src/components/NavBar.tsx
import { useState, useEffect } from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {Layout, Menu, Typography, Select, Row, Col, Button, Drawer, MenuProps, Space} from 'antd';
import { PlusOutlined, MenuOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
import { useMediaQuery } from 'react-responsive';
import GitHubStarCounter from './GitHubStarCounter';
import { LoginButton } from './LoginButton';
// @ts-ignore
import faviconLogo from '../assets/favicon.png';
// @ts-ignore
import logoPng from '../assets/logo.png';
// @ts-ignore
import bannerPng from '../assets/banner.png';

const {Header} = Layout;
const {Title} = Typography;
const { Option } = Select;

/**
 * 导航栏组件
 * 包含网站Logo、导航菜单和语言切换
 */
const NavBar = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 768 });

    // 监听语言变化
    useEffect(() => {
        const handleLanguageChanged = () => {
            setCurrentLanguage(i18n.language);
        };
        
        // 添加语言变化监听器
        i18n.on('languageChanged', handleLanguageChanged);
        
        // 清理函数
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, [i18n]);

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

    // 跳转到题目编辑页面
    const goToContributePage = () => {
        navigate('/challenge/contribute');
        if (isMobile) {
            setDrawerVisible(false);
        }
    };

    // 抽屉菜单点击处理
    const handleMenuClick: MenuProps['onClick'] = (e) => {
        navigate(e.key);
        setDrawerVisible(false);
    };

    // 显示抽屉菜单
    const showDrawer = () => {
        setDrawerVisible(true);
    };

    // 关闭抽屉菜单
    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    return (
        <Header style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
            {/* Logo区域 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginRight: '24px'
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={faviconLogo}
                        alt="Logo"
                        style={{
                            height: '32px',
                            marginRight: '8px'
                        }}
                    />
                    {!isMobile && (
                        <Title
                            level={4}
                            style={{
                                margin: 0,
                                background: 'linear-gradient(120deg, #1890ff, #722ed1)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {t('nav.home')}
                        </Title>
                    )}
                </Link>
            </div>

            {/* 桌面端导航 */}
            {!isMobile && (
                <>
                    <Menu
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={items}
                        style={{ flex: 1, minWidth: 0, border: 'none' }}
                    />
                    <Space size="middle">
                        <LoginButton />
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            onClick={goToContributePage}
                        >
                            {t('nav.contribute')}
                        </Button>
                        <Select
                            value={currentLanguage}
                            style={{width: 120}}
                            onChange={handleLanguageChange}
                        >
                            <Option value="zh">简体中文</Option>
                            <Option value="en">English</Option>
                        </Select>
                        <GitHubStarCounter owner="JSREP" repo="crawler-leetcode"/>
                    </Space>
                </>
            )}

            {/* 移动端菜单按钮 */}
            {isMobile && (
                <Button
                    type="text"
                    icon={<MenuOutlined/>}
                    onClick={showDrawer}
                    style={{marginLeft: 'auto'}}
                />
            )}

            {/* 移动端抽屉菜单 */}
            <Drawer
                title="菜单"
                placement="right"
                onClose={closeDrawer}
                open={drawerVisible}
                width={250}
            >
                <Menu
                    mode="vertical"
                    selectedKeys={[location.pathname]}
                    items={items}
                    onClick={handleMenuClick}
                    style={{ border: 'none' }}
                />
                <div style={{ marginTop: 24, padding: '0 16px' }}>
                    <LoginButton />
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={goToContributePage}
                        style={{ marginBottom: 16, width: '100%' }}
                    >
                        {t('nav.contribute')}
                    </Button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                        <span style={{ marginRight: 8 }}>语言:</span>
                        <Select
                            value={currentLanguage}
                            style={{ width: 120 }}
                            onChange={handleLanguageChange}
                        >
                            <Option value="zh">简体中文</Option>
                            <Option value="en">English</Option>
                        </Select>
                    </div>

                    {/* 移动端GitHub Star计数 */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                        <GitHubStarCounter owner="JSREP" repo="crawler-leetcode" />
                    </div>
                </div>
            </Drawer>
        </Header>
    );
};

export default NavBar;
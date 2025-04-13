// src/components/NavBar.tsx
import { useState, useEffect } from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {Layout, Menu, Typography, Select, Row, Col, Button, Drawer, MenuProps} from 'antd';
import { PlusOutlined, MenuOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
import { useMediaQuery } from 'react-responsive';
import GitHubStarCounter from './GitHubStarCounter';
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
            zIndex: 1000,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            padding: 0,
            height: '70px',
            lineHeight: '70px'
        }}>
            {/* 固定宽度的外层容器 */}
            <div className="navbar-container" style={{ padding: isMobile ? '0 16px' : '0' }}>
                {/* 网格布局，确保精确对齐 */}
                <Row style={{ height: '100%' }} align="middle" justify="space-between">
                    {/* Logo区域，确保与内容区域左边缘对齐 */}
                    <Col style={{ paddingLeft: '0px' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', height: '70px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                marginRight: '12px',
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '8px',
                                height: '46px',
                                width: '46px',
                                background: 'transparent'
                            }}>
                                <img 
                                    src={logoPng} 
                                    alt="Web Crawler Challenge Platform" 
                                    style={{
                                        height: '46px',
                                        width: '46px',
                                        objectFit: 'contain',
                                        padding: 0,
                                        margin: 0
                                    }}
                                />
                            </div>
                            <Title level={3} style={{
                                margin: 0, 
                                color: '#2c3e50', 
                                whiteSpace: 'nowrap',
                                fontSize: isMobile ? '18px' : '24px'
                            }}>
                                Crawler LeetCode
                            </Title>
                        </Link>
                    </Col>

                    {/* 移动端显示菜单按钮 */}
                    {isMobile ? (
                        <Col>
                            <Button 
                                icon={<MenuOutlined />} 
                                onClick={showDrawer}
                                type="text"
                                style={{ fontSize: '18px', height: '32px', padding: '0 8px' }}
                            />
                        </Col>
                    ) : (
                        /* 弹性布局的菜单区域 - 桌面端 */
                        <Col flex="auto" style={{ display: 'flex', justifyContent: 'space-between' }}>
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
                                    marginLeft: '40px'
                                }}
                                disabledOverflow={true}
                            />
                            
                            {/* 右侧工具栏 */}
                            <div style={{ 
                                paddingRight: '0px', 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {/* 贡献题目按钮 */}
                                <Button 
                                    type="primary" 
                                    size="small" 
                                    icon={<PlusOutlined />}
                                    onClick={goToContributePage}
                                    style={{ fontSize: '12px', height: '28px' }}
                                >
                                    {t('nav.contribute')}
                                </Button>
                                
                                {/* 语言选择器 */}
                                <Select
                                    value={currentLanguage}
                                    style={{
                                        width: 95,
                                        background: 'transparent',
                                        fontSize: '14px'
                                    }}
                                    variant="borderless"
                                    onChange={handleLanguageChange}
                                >
                                    <Option value="zh">简体中文</Option>
                                    <Option value="en">English</Option>
                                </Select>

                                {/* GitHub Star计数 */}
                                <GitHubStarCounter owner="JSREP" repo="crawler-leetcode" />
                            </div>
                        </Col>
                    )}
                </Row>
            </div>

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
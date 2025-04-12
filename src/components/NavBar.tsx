// src/components/NavBar.tsx
import { useState, useEffect } from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Layout, Menu, Typography, Select, Row, Col} from 'antd';
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
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

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
            <div className="navbar-container">
                {/* 网格布局，确保精确对齐 */}
                <Row style={{ height: '100%' }}>
                    {/* Logo区域，确保与内容区域左边缘对齐 */}
                    <Col className="logo-container" style={{ paddingLeft: '0px' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', height: '70px' }}>
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
                    </Col>

                    {/* 弹性布局的菜单区域 */}
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
                        
                        {/* 语言选择器 */}
                        <div style={{ paddingRight: '0px' }}>
                            <Select
                                value={currentLanguage}
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
                    </Col>
                </Row>
            </div>
        </Header>
    );
};

export default NavBar;
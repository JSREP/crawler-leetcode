import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * 页面标题组件
 * 根据当前路由自动设置文档标题
 */
const PageTitle = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  useEffect(() => {
    let title = t('titles.default');
    
    // 根据路径设置不同的标题
    if (location.pathname === '/') {
      title = t('titles.home');
    } else if (location.pathname === '/challenges') {
      title = t('titles.challenges');
    } else if (location.pathname === '/about') {
      title = t('titles.about');
    } else if (location.pathname === '/challenge/contribute') {
      title = t('titles.contribute');
    } else if (location.pathname.startsWith('/challenge/')) {
      title = t('titles.challenge');
    }
    
    // 设置文档标题
    document.title = title;
  }, [location.pathname, t]);
  
  // 此组件不渲染任何内容
  return null;
};

export default PageTitle; 
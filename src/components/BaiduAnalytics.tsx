import { useEffect } from 'react';

declare global {
    interface Window {
        _hmt: any[];
    }
}

interface BaiduAnalyticsProps {
    siteId: string;
}

const BaiduAnalytics: React.FC<BaiduAnalyticsProps> = ({ siteId }) => {
    useEffect(() => {
        // 初始化_hmt数组
        window._hmt = window._hmt || [];

        // 创建百度统计脚本
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://hm.baidu.com/hm.js?${siteId}`;
        
        // 添加脚本到页面
        document.head.appendChild(script);

        // 清理函数
        return () => {
            document.head.removeChild(script);
        };
    }, [siteId]);

    return null;
};

export default BaiduAnalytics; 
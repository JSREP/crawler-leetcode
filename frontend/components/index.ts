/**
 * 组件统一导出
 */

// 布局组件
export { default as Header } from './layout/Header';
export { default as Footer } from './layout/Footer';

// Provider组件
export { default as AntdProvider } from './providers/AntdProvider';

// 上传组件
export { default as FileUpload } from './upload/FileUpload';
export { default as AvatarUpload } from './upload/AvatarUpload';

// 认证组件
export { default as AuthProvider } from './auth/AuthProvider';
export { default as GitHubLoginButton } from './auth/GitHubLoginButton';
export { default as UserProfile } from './auth/UserProfile';

/**
 * Markdown编辑器样式工具
 * 提供Markdown编辑器所需的所有样式定义
 */

// 编辑器主样式
export const markdownEditorStyles = `
  /* 在全屏模式下隐藏GitHub徽标 */
  .rc-md-editor.full ~ .github-fork-ribbon-wrapper,
  .rc-md-editor.full ~ div > .github-fork-ribbon-wrapper,
  .rc-md-editor.full ~ * > .github-fork-ribbon-wrapper,
  .rc-md-editor.full ~ * > * > .github-fork-ribbon-wrapper {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
    z-index: -1 !important;
  }

  /* 修复全屏控制按钮样式 */
  .rc-md-editor .full-screen {
    z-index: 9999 !important;
  }
  
  /* 在全屏模式下添加自己的样式 */
  .rc-md-editor.full {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9999 !important;
    background: white !important;
  }

  /* 确保全屏模式下编辑器在最上层 */
  .rc-md-editor.full .rc-md-navigation {
    z-index: 10000 !important;
  }

  /* 简化base64图片显示 */
  .rc-md-editor .editor-container .sec-md .input {
    position: relative;
  }

  .rc-md-editor .editor-container .sec-md .input img[src^="data:"] {
    display: none;
  }

  .rc-md-editor .editor-container .sec-md .input p:has(img[src^="data:"]),
  .rc-md-editor .editor-container .sec-md .input p > img[src^="data:"] {
    position: relative;
    display: inline-block;
    min-width: 50px;
    min-height: 30px;
    background: #f0f0f0;
    border-radius: 4px;
    margin: 4px 0;
  }

  .rc-md-editor .editor-container .sec-md .input p:has(img[src^="data:"]):before,
  .rc-md-editor .editor-container .sec-md .input p > img[src^="data:"]:before {
    content: "[图片]";
    position: absolute;
    left: 0;
    top: 0;
    padding: 2px 8px;
    color: #666;
    font-size: 12px;
    background: #f0f0f0;
    border-radius: 4px;
    z-index: 1;
  }
`;

// 编辑器预览区样式
export const customEditorStyles = `
  /* 在编辑器中简化base64显示 */
  .rc-md-editor .editor-container .sec-md .input {
    position: relative;
  }
  
  .rc-md-editor .editor-container .sec-md .input {
    font-size: 14px;
    line-height: 1.6;
  }

  /* 使用CSS省略号效果 */
  .rc-md-editor .editor-container .sec-md .input a[href^="data:image"] {
    display: inline-block;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }

  /* 添加提示 */
  .rc-md-editor .editor-container .sec-md .input a[href^="data:image"]:hover::after {
    content: "[图片数据已省略]";
    position: absolute;
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
    margin-left: 8px;
  }
`;

// 编辑器配置
export const getEditorConfig = () => ({
  view: { 
    menu: true, 
    md: true, 
    html: true 
  },
  canView: { 
    menu: true, 
    md: true, 
    html: true, 
    fullScreen: true, 
    hideMenu: true 
  },
  plugins: ['full-screen'],
  imageAccept: '.jpg,.jpeg,.png,.gif',
  onImageUpload: true
}); 
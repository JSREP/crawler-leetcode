import * as fs from 'fs';
import * as path from 'path';
import { ImageProcessResult } from './types';

/**
 * 处理图片路径
 * @param imgPath 图片路径
 * @returns 处理后的路径
 */
export function processImgPath(imgPath: string): string {
    console.log(`[DEBUG] 处理图片路径: ${imgPath}`);
    
    // 如果是以assets/开头的相对路径，确保正确处理
    if (imgPath.startsWith('assets/')) {
        // 在开发模式下，保持assets路径不变
        // 图片将从public目录或相对于Markdown文件的目录正确加载
        return imgPath;
    }
    
    return imgPath;
}

/**
 * 将图片转换为Base64格式或保持原路径
 * @param imgPath 图片路径
 * @param basePath 基础路径
 * @param isBuild 是否为构建模式
 * @returns 处理结果
 */
export function convertImgToBase64(imgPath: string, basePath: string, isBuild: boolean): ImageProcessResult {
    console.log(`[DEBUG] 准备处理图片: ${imgPath}`);
    const result: ImageProcessResult = {
        success: false,
        data: '',
        mimeType: '',
        fullPath: imgPath
    };
    
    // 检查是否已经是Base64格式，如果是则直接返回
    if (imgPath.startsWith('data:image/')) {
        console.log(`[DEBUG] 检测到Base64图片，跳过处理`);
        return {
            success: true,
            data: '',
            mimeType: '',
            fullPath: imgPath // 保持原始Base64
        };
    }
    
    // 如果是assets/开头的路径，保持路径不变，不转为Base64
    if (imgPath.startsWith('assets/')) {
        console.log(`[DEBUG] 检测到assets路径，保持原样: ${imgPath}`);
        return {
            success: true,
            data: '',
            mimeType: '',
            fullPath: imgPath // 保持assets路径
        };
    }
    
    try {
        // 获取图片的完整路径，用于读取文件
        const fullImgPath = path.isAbsolute(imgPath) 
            ? imgPath 
            : path.join(basePath, imgPath);
        
        console.log(`[DEBUG] 图片完整路径: ${fullImgPath}`);
        
        if (!fs.existsSync(fullImgPath)) {
            console.warn(`[WARN] 图片文件不存在: ${fullImgPath}`);
            return result;
        }
        
        // 获取文件扩展名和MIME类型
        const ext = path.extname(fullImgPath).toLowerCase();
        let mimeType = getMimeType(ext);
        
        // 构建模式下，保持相对路径
        if (isBuild) {
            return {
                success: true,
                data: '',
                mimeType,
                fullPath: imgPath // 保持原始相对路径
            };
        }
        
        // 开发模式下，对于非assets的图片可以转换为Base64
        try {
            // 读取图片文件并直接转换为Base64字符串
            const imgBuffer = fs.readFileSync(fullImgPath);
            // 使用Buffer.from().toString('base64')方法转换
            const base64Img = imgBuffer.toString('base64');
            
            console.log(`[DEBUG] 成功读取图片，大小: ${imgBuffer.length} 字节`);
            
            return {
                success: true,
                data: base64Img,
                mimeType,
                fullPath: imgPath // 保持原始相对路径
            };
        } catch (imgError) {
            console.error(`读取图片文件出错: ${fullImgPath}`, imgError);
            return result;
        }
    } catch (error) {
        console.error(`处理图片路径出错:`, error);
        return result;
    }
}

/**
 * 根据文件扩展名获取 MIME 类型
 * @param ext 文件扩展名
 * @returns MIME 类型
 */
export function getMimeType(ext: string): string {
    let mimeType = 'image/png'; // 默认MIME类型
    
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            mimeType = 'image/jpeg';
            break;
        case '.png':
            mimeType = 'image/png';
            break;
        case '.gif':
            mimeType = 'image/gif';
            break;
        case '.svg':
            mimeType = 'image/svg+xml';
            break;
        case '.webp':
            mimeType = 'image/webp';
            break;
    }
    
    return mimeType;
} 
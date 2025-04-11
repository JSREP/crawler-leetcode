# 样例题目详细说明

这是一个样例题目，用于展示如何创建包含图片的挑战描述。

## 问题背景

在这个挑战中，你需要解决一个JavaScript逆向难题。下面是网站截图，展示了需要破解的保护机制。

![网站截图](./assets/website-screenshot.png)

## 挑战要求

1. 分析下面的代码片段
2. 找出加密算法的关键部分
3. 编写解密函数

```javascript
function obfuscated(input) {
    let result = '';
    for (let i = 0; i < input.length; i++) {
        result += String.fromCharCode(input.charCodeAt(i) ^ 42);
    }
    return btoa(result);
}
```

## 关键点解析

JavaScript混淆通常使用以下技术:

![混淆技术图解](./assets/obfuscation-techniques.png)

## 提交要求

请提交可以解密以下内容的JavaScript函数:

```
SGVsbG8sIFdvcmxkIQ==
```

成功解密后，应该得到原始消息。

## 附加提示

如果你遇到困难，可以参考下面的分步骤提示:

1. 首先需要进行Base64解码
2. 然后对每个字符执行XOR运算
3. 关键是找到正确的异或值

祝你好运！ 
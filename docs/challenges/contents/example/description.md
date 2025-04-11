# 样例题目：JavaScript混淆分析与WASM逆向

## 挑战背景

本题目旨在展示一个典型的JavaScript逆向工程挑战。这类挑战在CTF比赛和真实Web安全评估中非常常见。攻击者经常需要分析混淆后的JavaScript代码，以及逆向WebAssembly模块，来理解其中的逻辑并找出潜在的漏洞。

在这个示例中，你将遇到一个使用了多种混淆技术的网站：
- JavaScript代码混淆
- WebAssembly模块加载
- 基于JSVMP的代码保护

![网站截图](assets/website-screenshot.png)

## 技术要点

混淆是一种代码保护技术，它通过以下方式使代码变得难以理解：

1. **变量名混淆** - 将有意义的变量名替换为无意义的短字符
2. **控制流扁平化** - 破坏代码的正常执行顺序
3. **字符串加密** - 对字符串常量进行加密
4. **死代码注入** - 添加不会执行的代码段

![混淆技术](assets/obfuscation-techniques.png)

## 挑战任务

1. 分析网站加载的主要JavaScript文件，找出其中的混淆方式
2. 提取并分析WebAssembly模块
3. 找出验证逻辑中的弱点
4. 绕过前端验证，成功提交flag

## 解题思路

对于JavaScript混淆，你可以使用以下工具：
- Chrome DevTools的Sources面板
- [JavaScript Deobfuscator](https://deobfuscate.io/)
- [AST Explorer](https://astexplorer.net/)

分析WebAssembly模块时可以使用：
- Wasm2C
- wabt (WebAssembly Binary Toolkit)
- wasm-decompile

## 代码分析示例

以下是一个典型的混淆后JavaScript代码片段：

```javascript
var _0x1a2b = ['value', 'check', 'getElementById', 'flag', 'addEventListener', 'click', 'substring', 'length'];
(function(_0x2f7dx1, _0x2f7dx2) {
    var _0x2f7dx3 = function(_0x2f7dx4) {
        while (--_0x2f7dx4) {
            _0x2f7dx1['push'](_0x2f7dx1['shift']());
        }
    };
    _0x2f7dx3(++_0x2f7dx2);
}(_0x1a2b, 0x126));

var _0x2f7d = function(_0x2f7dx1, _0x2f7dx2) {
    _0x2f7dx1 = _0x2f7dx1 - 0x0;
    var _0x2f7dx3 = _0x1a2b[_0x2f7dx1];
    return _0x2f7dx3;
};

document[_0x2f7d('0x2')]('submit-btn')[_0x2f7d('0x4')](_0x2f7d('0x5'), function() {
    var _0x2f7dx1 = document[_0x2f7d('0x2')](_0x2f7d('0x3'))[_0x2f7d('0x0')];
    if (_0x2f7dx1[_0x2f7d('0x6')](0x0, 0x4) === 'flag' && _0x2f7dx1[_0x2f7d('0x7')] === 0x14) {
        alert('Success!');
    } else {
        alert('Try again!');
    }
});
```

解混淆后的代码大致如下：

```javascript
document.getElementById('submit-btn').addEventListener('click', function() {
    var input = document.getElementById('flag').value;
    if (input.substring(0, 4) === 'flag' && input.length === 20) {
        alert('Success!');
    } else {
        alert('Try again!');
    }
});
```

## 小提示

> 在分析混淆代码时，寻找关键的API调用和字符串常量通常是一个好的起点。

恭喜你完成了这个示例挑战的学习！希望这个例子能帮助你理解JavaScript逆向工程的基础知识，以及如何应对真实挑战。 
# Web应用API安全分析挑战

## 挑战背景

在现代Web应用中，前后端分离架构已成为主流，前端通过API与后端服务交互。不安全的API实现可能导致严重的安全漏洞，包括未授权访问、敏感信息泄露和业务逻辑绕过等问题。本挑战要求参与者分析一个存在安全漏洞的REST API实现。

![API安全示例图](assets/website-screenshot.png)

## 技术要点

API安全测试通常关注以下几个方面：

1. **认证与授权** - 确保用户只能访问他们有权限的资源
2. **输入验证** - 防止注入攻击和其他常见的Web安全漏洞
3. **敏感信息保护** - 确保API不会泄露敏感信息
4. **速率限制** - 防止滥用和拒绝服务攻击
5. **API文档审查** - 检查是否有敏感信息或调试端点暴露

## 挑战任务

1. 对目标REST API进行黑盒测试，找出可能的安全漏洞
2. 绕过API的认证机制，获取未授权访问
3. 使用API文档中暴露的开发端点收集敏感信息
4. 通过操纵API请求参数，实现业务逻辑绕过
5. 编写一份完整的测试报告，描述发现的漏洞和利用方法

## 测试方法

安全研究人员通常使用以下工具和技术来测试API安全性：

- **抓包工具**: Burp Suite、Charles、Fiddler
- **API测试工具**: Postman、Insomnia
- **自动化扫描**: OWASP ZAP、Nikto
- **模糊测试**: 使用各种边界输入和特殊字符测试API参数

## 代码分析示例

以下是一个存在问题的API端点实现示例：

```javascript
// 不安全的API实现示例
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;
  
  // 没有进行访问控制检查
  // 没有验证当前用户是否有权限访问请求的用户ID
  
  db.query(`SELECT * FROM users WHERE id = ${userId}`, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // 直接返回数据库结果，可能包含敏感信息
    res.json(results[0]);
  });
});
```

更安全的实现应该是：

```javascript
app.get('/api/user/:id', authenticate, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  
  // 确保当前用户只能访问自己的数据或具有管理员权限
  if (req.user.id !== userId && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }
  
  // 使用参数化查询防止SQL注入
  db.query('SELECT id, name, email FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // 只返回必要的非敏感字段
    res.json({
      id: results[0].id,
      name: results[0].name,
      email: results[0].email
    });
  });
});
```

## 安全提示

> 测试API安全性时，始终确保你有明确的授权进行测试。未经授权的安全测试可能违反法律法规。

祝你在挑战中取得好成绩！请记住，安全研究的目的是帮助组织改进其系统，而不是利用发现的漏洞进行非法活动。 
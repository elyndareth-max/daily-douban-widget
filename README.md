# Daily Douban 远程脚本

## 快速开始

### 1. 获取远程脚本URL

您需要将 `remote.tsx` 文件上传到一个可以公开访问的静态文件托管服务。

**推荐服务：**

| 服务 | 优点 | 如何获取URL |
|------|------|------------|
| **GitHub Gist** | 免费、简单、支持版本控制 | 创建Gist → 点击"Raw"按钮 |
| **Vercel** | 快速、免费、支持自定义域名 | 部署项目 → 获取部署URL |
| **Netlify** | 免费、简单、支持HTTPS | 拖拽文件部署 → 获取URL |
| **GitHub Pages** | 免费、与GitHub集成 | 启用Pages → 获取URL |

### 2. 在Scripting中使用远程脚本

#### 方法A：直接运行远程脚本

创建新脚本，粘贴以下代码：

```typescript
import { fetch, Script, FileManager } from 'scripting'

// 替换为您的远程脚本URL
const REMOTE_URL = 'https://your-url.com/daily-douban.tsx'

async function main() {
  try {
    // 1. 获取远程脚本
    const response = await fetch(REMOTE_URL)
    const scriptContent = await response.text()
    
    // 2. 保存到本地
    const localPath = FileManager.local().joinPath(
      FileManager.local().documentsDirectory(),
      'daily-douban-remote.tsx'
    )
    FileManager.local().writeString(localPath, scriptContent)
    
    // 3. 提示用户运行
    console.log('脚本已保存，请在Scripting应用中运行它')
    
  } catch (error) {
    console.error('加载失败:', error)
  }
}

main()
```

#### 方法B：使用示例脚本

1. 复制 `example-remote.tsx` 文件
2. 修改 `REMOTE_URL` 变量为您的远程URL
3. 运行脚本

### 3. 添加小组件到主屏幕

1. 运行脚本后，返回主屏幕
2. 长按空白区域 → 点击"+"按钮
3. 搜索"Scripting"
4. 选择"Daily Douban"小组件
5. 选择尺寸（小号或中号）
6. 点击"添加小组件"

## 文件说明

| 文件 | 用途 |
|------|------|
| `remote.tsx` | 可以远程加载的单文件版本（核心文件） |
| `example-remote.tsx` | 远程加载示例脚本 |
| `publish.ts` | 发布到GitHub Gist的脚本 |
| `loader.tsx` | 远程加载器脚本 |
| `REMOTE.md` | 详细使用说明 |
| `README-REMOTE.md` | 本文件，快速开始指南 |

## 示例URL格式

### GitHub Gist
```
https://gist.githubusercontent.com/username/gist-id/raw/filename.tsx
```

**如何获取：**
1. 访问 https://gist.github.com
2. 创建新Gist，文件名：`daily-douban.tsx`
3. 粘贴 `remote.tsx` 的内容
4. 点击 "Create public gist"
5. 点击 "Raw" 按钮
6. 复制浏览器地址栏的URL

### Vercel
```
https://project-name.vercel.app/daily-douban.tsx
```

**如何部署：**
1. 安装Vercel CLI: `npm i -g vercel`
2. 创建项目目录
3. 将 `remote.tsx` 复制到目录
4. 运行 `vercel --prod`
5. 获取部署URL

### Netlify
```
https://project-name.netlify.app/daily-douban.tsx
```

**如何部署：**
1. 访问 https://app.netlify.com
2. 拖拽包含 `remote.tsx` 的文件夹
3. 获取部署URL

## 高级用法

### 使用查询参数

您可以在URL中添加查询参数来自定义行为：

```
https://your-url.com/daily-douban.tsx?theme=dark&showDate=true
```

在脚本中读取参数：

```typescript
const theme = Script.queryParameters?.theme || 'light'
const showDate = Script.queryParameters?.showDate !== 'false'
```

### 自动更新

设置定时任务自动更新脚本：

1. 使用iOS快捷指令
2. 设置每天运行一次
3. 脚本会自动检查更新

### 多版本管理

为不同版本创建不同的URL：

```
https://your-url.com/daily-douban-v1.tsx
https://your-url.com/daily-douban-v2.tsx
```

## 故障排除

### 问题：无法加载远程脚本

**检查清单：**
- [ ] URL是否正确
- [ ] 网络连接是否正常
- [ ] 远程服务器是否可访问
- [ ] 文件是否存在
- [ ] 是否需要认证

**调试步骤：**
1. 在浏览器中打开URL
2. 检查是否能正常下载
3. 查看Scripting控制台日志

### 问题：小组件不显示

**解决方案：**
1. 确保脚本已正确运行
2. 重新添加小组件
3. 检查小组件尺寸设置
4. 重启Scripting应用

### 问题：数据加载失败

**可能原因：**
- 豆瓣API限制
- 网络连接问题
- 代理/VPN设置

**解决方案：**
1. 检查网络连接
2. 尝试使用VPN
3. 查看控制台错误信息

## 安全注意事项

1. **只从可信来源加载脚本**
2. **使用HTTPS确保传输安全**
3. **定期检查脚本更新**
4. **不要在公共URL中暴露敏感信息**

## 技术支持

- Scripting应用文档
- GitHub Issues
- 开发者社区

## 更新日志

### v1.0.0 (2026-05-13)
- 初始版本发布
- 支持远程加载
- 支持多种托管服务
- 包含完整文档
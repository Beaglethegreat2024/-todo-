@echo off
chcp 65001 > nul
title 拼豆桌宠 (Bead Pet) - 快速启动器
echo ==================================================
echo         欢迎来到 拼豆桌宠 (Bead Pet)！
echo ==================================================
echo.
echo 正在检测运行环境...

:: 检测 Node.js 是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js 环境！
    echo --------------------------------------------------
    echo 这是一个全栈网页桌宠应用，需要 Node.js 支持。
    echo 请前往官方网站下载并安装 (推荐安装 LTS 长期支持版)：
    echo 👉 https://nodejs.org/
    echo --------------------------------------------------
    echo 安装完成后，请重新双击运行此文件。
    echo.
    pause
    exit
)

echo [成功] 已检测到 Node.js，正在为您启动游戏...
echo.
echo (如果是解压后第一次运行，系统会自动安装运行所需的依赖包，大约需要 30秒 - 1分钟)
echo.

:: 安装依赖项并启动开发服务器
call npm install
echo.
echo --------------------------------------------------
echo [OK] 依赖检查完毕，正在启动桌面服务器并打开浏览器...
echo --------------------------------------------------
echo.

:: 自动打开默认浏览器访问游戏
start http://localhost:3000

:: 启动本地服务
call npm run dev

pause

---
title: Photoshop 基础教程
published: 2025-05-20
description: “从0开始的PS基础教学”
image: ""
tags: ["Photoshop"]
category: Adobe
draft: false 

---

# 初识Adobe Photoshop（简称：PS）

Adobe是企业名称。PS是其旗下的一款专业的图像处理软件。

------

# 一、PS的安装

## **安装途径：**
ε(*･ω･)_/ﾟ:･☆ 
- 论坛或社区网站会有安装教程以及资源分享（例如：Github，bilibili，CSDN博客...）
- 也可以选择购买远程下载（常见的购物软件例如淘宝、拼多多...都可以）
- 如果你是相关专业的学生可以咨询老师获取安装包。（很多软件的安装包都可以向老师索取✧｡٩(ˊᗜˋ*)و✧｡）

##  **版本选择**：
- 优先选择最新版本的上一版本，个人认为这样比较稳定。（如果有特殊需求，可以自行选择其他版本。）
-  （记得下载前把电脑的防火墙和杀毒软件关闭喔~）

------

 ————现在你已经安装好PS啦！＼＼\\٩( 'ω' )و //／／，顺带一提，咱用的是ps2024，但基础使用工具不论哪个版本都大不相同啦~
 
 ------

# 二、项目的 创建 与 保存
## 创建

- **新文件**：直接新建空白项。自定义画布px长宽，dpi通常设为300，颜色模式建议选择RGB。

<details>
<summary>px 和 dpi 原理说明</summary>

  “px“ 即像素，是数字图像最小单位，决定画布像素数量。

  “dpi`“即分辨率，衡量打印精度。屏幕显示常用72dpi，印刷建议300dpi，影响打印尺寸与清晰度。 

</details>

 - **打开**：从文件夹中选择要打开的文件。

 ## 保存

- **直接保存** 用快捷键 `Ctrl + S` 或点击文件-保存。
- **另存为** 用 `Ctrl + Shift + S` 或文件-存储为。
- 设置文件格式 一般为 PSD 格式，支持多种格式，如 JPG、PNG、GIF 等。

<details>
<summary>PS常见存储格式</summary> 

 ”PSD”：PS源文件，保留图层、通道等信息，方便后续编辑。

 “JPG“：压缩率高，适合网页和社交媒体分享，但为有损压缩。

 “PNG“：支持透明背景，无损压缩，常用于图标和透明图片。

 “GIF“：支持动画，适合简单动图。

</details>

<div style="display: flex; align-items: center;">
  <img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/pic/1a7712b2ab4f6928b17c6fd5eb0d2e1f.png" alt="返回初始界面按钮">
  <p style="margin-left: 10px;">！！٩(๑•ω•́๑)۶工作页面的这个小图标是返回初始界面的按钮，再次点击可回到工作页面~</p>
</div>

------

 ————现在你已经创建并保存好了你的第一个项目！！

 ------

 # 三、ps的基础使用

*以下内容可以帮助我们快速上手ps，日常使用是没问题的啦~——* (ゝω・´★)

## 工具

这里以绘画工具为例————

- <div style="display: flex; align-items: center; gap: 10px;">
    <img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/pic/b077adfdc245d853a80b0dc8e073abd2.png" alt="画笔工具图片">

    <span>画笔工具，快捷键：
    `B`
    - 使用画笔工具时，按住`SHIFT`可以绘制直线。
    </span>
  </div>

- <div style="display: flex; align-items: center; gap: 10px;">
    <img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/pic/543ea11f75f91e389f0907ab36d73a91.png" alt="画笔工具图片">

    <span>橡皮工具，快捷键：
    `E`
    - 同理，按住`SHIFT`橡皮也可以直线行走~</span>
  </div>

- <div style="display: flex; align-items: center; gap: 10px;">
    <img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/pic/21b30883649a465b64f5216b95ac38ba.jpg" alt="相关图片">
    <span>界面上部有个图标，仅在打开画笔工具时显示。点击该图标，右侧会展示画笔相关设置及 PS 自带笔刷。</span>
  </div>

- **左侧工具栏中**，将鼠标放在图标上，会出现工具的快捷键以及相应的功能说明~

------

*当图标右下角出现一个类似于三角形▲的符号时，说明该工具还具有扩展功能，右键该图标即可查看该工具的其他功能。自己去探索吧~*

------

## 抠图

抠图可分离主体与背景，用于合成、换背景等。 

<div class="抠图工具介绍">
    <img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/pic/710e7fdfee26d9d8d6f641b5cd69fe0e.png" alt="抠图工具图标">
    <p>这些图标存在于左侧工具栏中，是我们重要的抠图工具。当然，这些工具只能简单的进行抠图，想要更高级的抠图，我们还需要学习一些高级技巧。后面会总结一些修图技巧的教程~(ゝω・´★)</p>
</div>
<style>
    .抠图工具介绍 {
        display: flex;
        align-items: center;
        gap: 20px; /* 设置图片和文字之间的间距 */
    }
    .抠图工具介绍 p {
        flex: 1; /* 让文字部分占据剩余空间 */
    }
    @media (max-width: 768px) {
        .抠图工具介绍 {
            flex-direction: column; /* 在手机屏幕上垂直排列 */
            align-items: flex-start;
        }
    }
</style>

- <div class="image-text-container">
    <div class="image-group">
        <img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/pic/b4a0d4dd766e45bfa0b45bba01f29216.png" alt="图片1" style="margin-right: 10px;">
        <img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/pic/aae9a40c8ebfb48bb42dc45b23f1e143.png" alt="图片2" style="margin-right: 10px;">
        <img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/pic/a4a839c3f1c9c58aa50b937be7ef3016.png" alt="图片3">
    </div>
    <div class="text-description">这三个图标分别是：矩形选框工具、套索工具、钢笔工具</div>
</div>
<style>
    .image-text-container {
        display: flex;
        align-items: center;
    }
    .image-group {
        display: flex;
    }
    .text-description {
        margin-left: 20px;
    }
    @media (max-width: 768px) {
        .image-text-container {
            flex-direction: column;
        }
        .text-description {
            margin-left: 0;
            margin-top: 20px;
        }
    }
</style>

*仅可以使用工具抠图，我们还可以进行选区抠图，这种抠图方式更加灵活，而且可以进行一些高级操作。*

**操作流程**：

- 进行选区后，点击键盘上写着BackSpace的按键（Delete键）对选区里的内容进行删除。

- 若想删除选区外的内容，可以用快捷键`CTRL + SHIFT + I`进行反选，再操作删除。

------

   o( ❛ᴗ❛ )o一定要注意，钢笔工具的使用需要我们多加练习，具体使用方法可以在网络上搜索视频教程~

   ------

## 调色

调色能修改图片局部颜色，也能让整个画面更协调。

在 PS 上方菜单栏里，点击“**图像 - 调整**”，有很多调色功能。但你目前只需要了解以下内容(。-`ω´-)：

- **亮度/对比度**

    作用 ：改变图片整体亮暗程度和颜色鲜明对比。

    调高亮度，图片变亮；调高对比度，亮处更亮，暗处更暗，更有层次感。

- **色相/饱和度**

    色相 ：改变图片颜色种类，比如把红色变成蓝色。

    饱和度 ：让颜色更鲜艳或更暗淡。想让图片颜色鲜艳，就调高饱和度。

- **曝光度**

     作用 ：调整图片曝光情况。图片太暗，提高曝光度；太亮，降低曝光度。
     
     处理明暗对比大的图片时很好用。

     ------

# 快捷键

- `CTRL + Z ` ：撤销

- `CTRL + SHIFT + Z ` ：重做  （这里可能会与搜狗输入法的快捷键冲突，在设置中可以找到修改快捷键）

- `[` `]` :画笔&橡皮的 放大 和 缩小

- 

- `CTRL + T` ：自由变换 （选中后点击鼠标右键有扩展内容，具体作用上手一试便知）

- `CTRL + SHIFT + I` ：反选选区

- `CTRL + D` ：取消选择

- `CTRL + C` ：复制

- `CTRL + V` ：粘贴

- 

- `CTRL + SHIFT + N` ：新建图层

- `CTRl + J` ：复制当前图层

- `CTRL + E` ：向下合并图层

- `CTRL + SHIFT + E` ：合并可见图层

- `CTRL + G` ：在当前图层设置图层组

- 

- `CTRl +` ：屏幕放大

- `CTRL -` ：屏幕缩小

- `CTRL + 0` ：还原屏幕大小

- `ALT + 鼠标滚轮` ：屏幕放大缩小

- `空格键 + 鼠标左键` ： （抓手）移动屏幕

- 

- `ALT + delete` ：填充前景色

- `ALT + CTRL` ：填充后景色

- `X` ：前景色与后景色交换

------

 以上展示的是win系统的快捷键，mac系统的快捷键可能会有些许不同，请自行搜索。熟练的使用快捷键可以更好的提升我们的工作效率~*使用快捷键时请使用英文输入法喔~*


------

 ### 小tips~♡

- <div style="display: flex; align-items: center;">
    <img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/pic/687c7db6d793078b2cc25d67888036e2.png" alt="描述图片的文字" style="margin-right: 10px;">
    <span>当你不小心把工作区弄得乱七八糟时，点击这个小图标可以复位基本功能，还可以在这里自定义工作区。</span>
</div>

- <div style="display: flex; align-items: center; gap: 10px;">
    <img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/pic/8ad5b3190671f62d7c993d78e0074258.png" alt="相关图片">
    <span>处理图像出错时，可撤销到之前任意状态，也能恢复已撤销操作，免重复繁琐步骤。如果你关闭了ps文件后重新打开，历史记录栏将不会保留之前的记录。历史记录栏的内容仅在当前会话中有效。</span>
</div>

- <div style="display: flex; align-items: center; gap: 10px;">
    <img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/pic/a13385791d606d802aafabf8abe72e37.jpg" alt="帮助功能图片">
    <span>当你知晓所需工具或功能的名称，却在软件界面中找不到时，不妨借助这个帮助功能，它能帮你快速精准地定位到目标工具或功能。 </span>
  </div>

------

————那么，基础篇就到这里结束啦~ 快打开你的ps试着操作一下吧~(ઇ〃•ω‹〃)wink♡

------



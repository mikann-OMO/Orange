---
title: 波普圆点怎么做？Illustrator矢量图形
published: 2026-08-10
description: "干货分享，总结一些用的到的adobe illustrator技巧。含部分解释，适合新手。"
image: "https://mikann-1359996823.cos.ap-beijing.myqcloud.com/md/教程/ai/a (5).jpg"
tags:
  - illustrator技巧
category: 软件教程
draft: false

---

# 方法一：利用彩色半调

*核心流程：*   
*黑白渐变图形--→效果→像素化→彩色半调--→对象→栅格化--→图像描摹→扩展*

## 第一步：准备黑白渐变图形

- 拿圆形举例（按住 Shift 可绘制正圆）

颜色必须纯黑和纯白，因为彩色半调的四个通道对应 [CMYK](https://baike.baidu.com/item/%E5%8D%B0%E5%88%B7%E5%9B%9B%E5%88%86%E8%89%B2%E6%A8%A1%E5%BC%8F/4302001) 模式。

渐变方向建议从中心黑色向外白色——白色部分之后会被删掉，所以不用纠结。

<img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/md/教程/ai/a (2).jpg" alt="a (2).jpg"/>

## 第二步：应用彩色半调

- **选中图形，点击菜单：效果 → 像素化 → 彩色半调**

四个通道的数值保持默认（0 就行），不用管它。

唯一要调的是 **最大半径** ——它控制小圆点的大小。

<img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/md/教程/ai/a (3).jpg" alt="a (3).jpg"/>

> 亲测好用的公式：  
> 画布高度（像素）÷ 10 ÷ 6，出来的圆点疏密最舒服。  
> 比如画布高 1080px，算下来就是 18，效果刚刚好。  

## 第三步：栅格化 + 描摹扩展

- **对象 → 栅格化**  
（弹窗保持默认，背景选白色或透明都行）

<img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/md/教程/ai/a (4).jpg" alt="a (4).jpg"/>

- **图像描摹→扩展**  
（在控制栏或属性面板里）

描摹预设选 默认 或 剪影 都可以——  
选默认，后面需要手动删掉白色部分；选剪影，一步到位，白色自动去除，更省事。

<img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/md/教程/ai/a (5).jpg" alt="a (5).jpg"/>

（选择性）删除白色部分

<img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/md/教程/ai/a (1).jpg" alt="a (1).jpg"/>

---

# 方法二：利用混合工具

## 第一步：画一条曲线

- 用钢笔工具随意拉一条弧线，描边加粗  
（填充分明要关掉，不然会挡住效果）

<img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/md/教程/ai/a1 (1).jpg" alt="a1 (1).jpg"/>

## 第二步：设置虚线圆头 + 复制并变细

- 打开描边面板，端点改成“圆头”，再勾选“虚线”  
——第一个数值填 0，第二个数值调大，直到虚线变成一串分离的小圆点（间距看着顺眼就行）。

- 按住 Alt 拖出第二条线，  
同时按住 Shift 可以垂直对齐。然后把这条新线的描边粗细改小，让它比第一条细。

<img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/md/教程/ai/a1 (3).jpg" alt="a1 (3).jpg"/>

## 第三步：混合出过渡

- 同时选中两条线，双击混合工具，  
选择“指定步数”，数值先设个 30 左右（后面可以随时改）。

- 最后按 Ctrl+Alt+B  
（或点菜单 对象 → 混合 → 建立），圆点就会从粗到细平滑渐变，波普感瞬间拉满。

<img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/md/教程/ai/a1 (2).jpg" alt="a1 (2).jpg"/>

- 最终效果展示如下  
调步数或粗细还有用直接选择工具改变曲线都能改变节奏，可以多试几下

<img src="https://mikann-1359996823.cos.ap-beijing.myqcloud.com/md/教程/ai/a1（4）.jpg" alt="a1（4）.jpg"/>

---

后续会断断续续更新设计用的到的软件应用技巧，分享给大家。也写给自己，忘记的时候可以翻翻⌯ᵔᗜᵔ⌯

---
# 完
---
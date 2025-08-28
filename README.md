## 简介

这是一个基于cocos creator 自动图集生成的预览效果图的修复方案，为了解决不打包直接运行时看不到合图drawcall效果的问题。

## 注意1

每次更新都需要点击预览，更新creator生成的合图。
这是基于预览效果的合图，仅供参考，不代表最终打包效果。因为打包的一些过滤选项在预览时不会生效，导致合图会变大，包含一些其他图片。

## 使用方法

先预览自动合图，然后右键点击自动合图资源，选择刷新自动图集，然后运行，就会生效。

## 技术实现

遍历项中自动合图的资源，将其uuid添加到在library中缓存的自动合图的信息中，这样，在项目中加载自动合图，就会加载这些SpriteFrame。
接着插件会自动创建 一个名为 auto_atlas_temp 的 bundle ，并将 temp 目录中生成的预览效果图和信息复制到 auto_atlas_temp/atlas 目录下，然后更新AutoAtlasPatch.ts中保存的uuid。
AutoAtlasPatch.ts 是插件自动生成的代码，添加了一个管道到creator的pipeline中，加载atlas中存储的图片信息，并处理SpriteAtlas和SpriteFrame的数据关系。
在打包前，会备份并删除auto_atlas_temp，在打包结束后，会恢复auto_atlas_temp，以保证不会影响到打包。备份在auto_atlas_temp_dir目录下。

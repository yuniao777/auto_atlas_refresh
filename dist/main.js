"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = void 0;
exports.load = load;
exports.unload = unload;
exports.onAssetMenu = onAssetMenu;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    /**
     * @en A method that can be triggered by message
     * @zh 通过 message 触发的方法
     */
    showLog() {
        console.log('Hello World');
    },
};
const AutoAltasPatch = fs_extra_1.default.readFileSync(path_1.default.join(__dirname, '..', 'res', 'AutoAtlasPatch.txt'), 'utf-8');
async function refreshPac(assetInfo) {
    // console.log(assetInfo);
    let pacDir = path_1.default.dirname(assetInfo.url);
    let spriteFrameFormat = pacDir + "/**/*.png";
    let subImgs = await Editor.Message.request("asset-db", "query-assets", { pattern: spriteFrameFormat });
    let destPath = path_1.default.join(Editor.Project.path, "library", assetInfo.uuid.substring(0, 2), assetInfo.uuid + ".json");
    var data = fs_extra_1.default.readFileSync(destPath);
    var pacConfig = JSON.parse(data.toString());
    pacConfig.content.spriteFrames = [];
    for (let j = 0; j < subImgs.length; j++) {
        let subImg = subImgs[j];
        if (subImg.subAssets && subImg.subAssets["f9941"]) {
            pacConfig.content.spriteFrames.push(subImg.subAssets["f9941"].displayName);
            pacConfig.content.spriteFrames.push(subImg.subAssets["f9941"].uuid);
        }
    }
    fs_extra_1.default.writeFileSync(destPath, JSON.stringify(pacConfig));
    let uuidTempPath = path_1.default.join(Editor.Project.path, 'temp', 'asset-db', 'assets', assetInfo.uuid.substring(0, 2), assetInfo.uuid);
    if (!fs_extra_1.default.existsSync(uuidTempPath)) {
        console.error('未查找到预览文件，请确保预览后再执行此操作');
        return;
    }
    let dirs = fs_extra_1.default.readdirSync(uuidTempPath);
    let buildPath = dirs.find(dir => dir.startsWith('build') && fs_extra_1.default.existsSync(path_1.default.join(uuidTempPath, dir, 'texture-packerpreview')));
    if (!buildPath) {
        console.error('未查找到预览文件，请确保预览后再执行此操作');
        return;
    }
    let previewPath = path_1.default.join(uuidTempPath, buildPath, 'texture-packerpreview');
    if (!fs_extra_1.default.existsSync(previewPath)) {
        console.error('未查找到预览文件，请确保预览后再执行此操作');
        return;
    }
    // let temp = path.join(Editor.Project.path, 'assets', 'auto_atlas_temp');
    // if (!fs.existsSync(temp)) {
    //     fs.mkdirSync(temp);
    //     // console.warn('请将temp文件夹添加到bundle过滤配置中');
    //     let tempUrl = temp.replace(Editor.Project.path, '');
    //     tempUrl = tempUrl.replace(/\\/g, '/');
    //     tempUrl = 'db://' + tempUrl.replace('/', '');
    //     // console.warn(tempUrl);
    //     await Editor.Message.request('asset-db', 'refresh-asset', tempUrl);
    //     let metaPath = temp + '.meta';
    //     if (fs.existsSync(metaPath)) {
    //         let meta = fs.readFileSync(metaPath);
    //         let metaJson = JSON.parse(meta.toString());
    //         if (!metaJson.userData) {
    //             metaJson.userData = {};
    //         }
    //         metaJson.userData.isBundle = true;
    //         fs.writeFileSync(metaPath, JSON.stringify(metaJson));
    //         await Editor.Message.request('asset-db', 'refresh-asset', tempUrl);
    //     }
    // }
    let mainDir = path_1.default.join(Editor.Project.path, 'assets', 'main');
    let scriptsPath = path_1.default.join(mainDir, 'scripts');
    if (!fs_extra_1.default.existsSync(scriptsPath)) {
        fs_extra_1.default.mkdirSync(scriptsPath);
    }
    let patchPath = path_1.default.join(scriptsPath, 'AutoAtlasPatch.ts');
    let code = '';
    if (!fs_extra_1.default.existsSync(patchPath)) {
        code = AutoAltasPatch;
    }
    else {
        code = fs_extra_1.default.readFileSync(patchPath, 'utf-8');
    }
    // 查找图集
    let pacFormat = "db://assets/**/*.pac";
    let pacs = await Editor.Message.request("asset-db", "query-assets", { pattern: pacFormat });
    let bundles = {};
    for (let pac of pacs) {
        let pacPath = await Editor.Message.request("asset-db", "query-url", pac.uuid);
        console.log(pacPath);
        let assets = 'db://assets/';
        let bundle = pacPath.substring(pacPath.indexOf(assets) + assets.length);
        bundle = bundle.substring(0, bundle.indexOf('/'));
        bundles[pac.uuid] = bundle;
    }
    // 生成新的uuids数组字符串
    let newUuidsStr = pacs.map(pac => {
        let pacBuildPath = path_1.default.join(Editor.Project.path, 'temp', 'asset-db', 'assets', pac.uuid.substring(0, 2), pac.uuid, buildPath, 'texture-packerpreview');
        let pacInfo = path_1.default.join(pacBuildPath, 'pac-info.json');
        let pacInfoData = JSON.parse(fs_extra_1.default.readFileSync(pacInfo, 'utf-8'));
        return `{ uuid: '${pac.uuid}', info: ${JSON.stringify(pacInfoData)}, bundle: '${bundles[pac.uuid]}' }`;
    }).join(', ');
    // 删除原有的uuids赋值行，直接用新的 uuid 值插入
    code = code.replace(/let\s+uuids\s*=.*?;\s*\n/, `let uuids = [${newUuidsStr}];\n`);
    fs_extra_1.default.writeFileSync(patchPath, code);
    // // 删除atlas中的无用资源
    // let atlasDirs = fs.readdirSync(path.join(temp, 'atlas'));
    // atlasDirs.forEach(dir => {
    //     if (!pacs.find(pac => pac.uuid === dir) && !dir.endsWith('.meta')) {
    //         fs.removeSync(path.join(temp, 'atlas', dir));
    //         fs.removeSync(path.join(temp, 'atlas', dir + '.meta'));
    //     }
    // });
    Editor.Message.request('asset-db', 'refresh-asset', 'db://assets/auto_atlas_temp/scripts/AutoAtlasPatch.ts');
    // uuidTempPath = path.join(temp, 'atlas', assetInfo.uuid);
    // if (!fs.existsSync(uuidTempPath)) {
    //     fs.mkdirSync(uuidTempPath, { recursive: true });
    // }
    // fs.copySync(previewPath, uuidTempPath, { overwrite: true });
    // let imgDir = fs.readdirSync(path.join(temp, 'atlas', assetInfo.uuid));
    // let pacInfo = path.join(temp, 'atlas', assetInfo.uuid, 'pac-info.json');
    // let pacInfoData = JSON.parse(fs.readFileSync(pacInfo, 'utf-8'));
    // let atlases: any[] = pacInfoData.result.atlases;
    // for (let atlas of atlases) {
    //     let imageUuid = atlas.imageUuid;
    // }
    // imgDir.forEach((img) => {
    //     if (!img.endsWith('.png')) {
    //         return;
    //     }
    //     if (!atlases.find(atlas => atlas.imageUuid === path.basename(img, '.png'))) {
    //         fs.removeSync(path.join(temp, 'atlas', assetInfo.uuid, img));
    //         fs.removeSync(path.join(temp, 'atlas', assetInfo.uuid, img + '.meta'));
    //     }
    // });
    // let tempUrl = await Editor.Message.request('asset-db', 'query-url', temp) as string;
    // await Editor.Message.request('asset-db', 'refresh-asset', tempUrl);
    console.log(`${assetInfo.url}自动图集刷新成功（请确保预览后再执行此操作）`);
}
/**
 * @en Method Triggered on Extension Startup
 * @zh 扩展启动时触发的方法
 */
function load() { }
/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
function unload() { }
function onAssetMenu(assetInfo) {
    return [
        {
            label: '刷新自动图集',
            visible: assetInfo.importer == 'auto-atlas',
            click() {
                refreshPac(assetInfo);
            }
        }
    ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQThKQSxvQkFBMEI7QUFNMUIsd0JBQTRCO0FBRzVCLGtDQVVDO0FBaExELGdEQUF3QjtBQUN4Qix3REFBMEI7QUFFMUI7OztHQUdHO0FBQ1UsUUFBQSxPQUFPLEdBQTRDO0lBQzVEOzs7T0FHRztJQUNILE9BQU87UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQy9CLENBQUM7Q0FDSixDQUFDO0FBR0YsTUFBTSxjQUFjLEdBQUcsa0JBQUUsQ0FBQyxZQUFZLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxvQkFBb0IsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBR3pHLEtBQUssVUFBVSxVQUFVLENBQUMsU0FBb0I7SUFDMUMsMEJBQTBCO0lBQzFCLElBQUksTUFBTSxHQUFHLGNBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pDLElBQUksaUJBQWlCLEdBQUcsTUFBTSxHQUFHLFdBQVcsQ0FBQztJQUM3QyxJQUFJLE9BQU8sR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBRXZHLElBQUksUUFBUSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDO0lBQ25ILElBQUksSUFBSSxHQUFHLGtCQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FB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LENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRWxDLG1CQUFtQjtJQUNuQiw0REFBNEQ7SUFDNUQsNkJBQTZCO0lBQzdCLDJFQUEyRTtJQUMzRSx3REFBd0Q7SUFDeEQsa0VBQWtFO0lBQ2xFLFFBQVE7SUFDUixNQUFNO0lBRU4sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSx1REFBdUQsQ0FBQyxDQUFDO0lBRTdHLDJEQUEyRDtJQUMzRCxzQ0FBc0M7SUFDdEMsdURBQXVEO0lBQ3ZELElBQUk7SUFDSiwrREFBK0Q7SUFFL0QseUVBQXlFO0lBQ3pFLDJFQUEyRTtJQUMzRSxtRUFBbUU7SUFDbkUsbURBQW1EO0lBQ25ELCtCQUErQjtJQUMvQix1Q0FBdUM7SUFDdkMsSUFBSTtJQUNKLDRCQUE0QjtJQUM1QixtQ0FBbUM7SUFDbkMsa0JBQWtCO0lBQ2xCLFFBQVE7SUFDUixvRkFBb0Y7SUFDcEYsd0VBQXdFO0lBQ3hFLGtGQUFrRjtJQUNsRixRQUFRO0lBQ1IsTUFBTTtJQUVOLHVGQUF1RjtJQUN2RixzRUFBc0U7SUFFdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLHdCQUF3QixDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUNEOzs7R0FHRztBQUNILFNBQWdCLElBQUksS0FBSyxDQUFDO0FBRTFCOzs7R0FHRztBQUNILFNBQWdCLE1BQU0sS0FBSyxDQUFDO0FBRzVCLFNBQWdCLFdBQVcsQ0FBQyxTQUFvQjtJQUM1QyxPQUFPO1FBQ0g7WUFDSSxLQUFLLEVBQUUsUUFBUTtZQUNmLE9BQU8sRUFBRSxTQUFTLENBQUMsUUFBUSxJQUFJLFlBQVk7WUFDM0MsS0FBSztnQkFDRCxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDekIsQ0FBQztTQUNKO0tBQ0osQ0FBQztBQUNOLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBc3NldEluZm8gfSBmcm9tIFwiQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2Fzc2V0LWRiL0B0eXBlcy9wdWJsaWNcIjtcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XHJcblxyXG4vKipcclxuICogQGVuIFJlZ2lzdHJhdGlvbiBtZXRob2QgZm9yIHRoZSBtYWluIHByb2Nlc3Mgb2YgRXh0ZW5zaW9uXHJcbiAqIEB6aCDkuLrmianlsZXnmoTkuLvov5vnqIvnmoTms6jlhozmlrnms5VcclxuICovXHJcbmV4cG9ydCBjb25zdCBtZXRob2RzOiB7IFtrZXk6IHN0cmluZ106ICguLi5hbnk6IGFueSkgPT4gYW55IH0gPSB7XHJcbiAgICAvKipcclxuICAgICAqIEBlbiBBIG1ldGhvZCB0aGF0IGNhbiBiZSB0cmlnZ2VyZWQgYnkgbWVzc2FnZVxyXG4gICAgICogQHpoIOmAmui/hyBtZXNzYWdlIOinpuWPkeeahOaWueazlVxyXG4gICAgICovXHJcbiAgICBzaG93TG9nKCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdIZWxsbyBXb3JsZCcpO1xyXG4gICAgfSxcclxufTtcclxuXHJcblxyXG5jb25zdCBBdXRvQWx0YXNQYXRjaCA9IGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAncmVzJywgJ0F1dG9BdGxhc1BhdGNoLnR4dCcpLCAndXRmLTgnKTtcclxuXHJcblxyXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoUGFjKGFzc2V0SW5mbzogQXNzZXRJbmZvKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhhc3NldEluZm8pO1xyXG4gICAgbGV0IHBhY0RpciA9IHBhdGguZGlybmFtZShhc3NldEluZm8udXJsKTtcclxuICAgIGxldCBzcHJpdGVGcmFtZUZvcm1hdCA9IHBhY0RpciArIFwiLyoqLyoucG5nXCI7XHJcbiAgICBsZXQgc3ViSW1ncyA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXCJhc3NldC1kYlwiLCBcInF1ZXJ5LWFzc2V0c1wiLCB7IHBhdHRlcm46IHNwcml0ZUZyYW1lRm9ybWF0IH0pO1xyXG5cclxuICAgIGxldCBkZXN0UGF0aCA9IHBhdGguam9pbihFZGl0b3IuUHJvamVjdC5wYXRoLCBcImxpYnJhcnlcIiwgYXNzZXRJbmZvLnV1aWQuc3Vic3RyaW5nKDAsIDIpLCBhc3NldEluZm8udXVpZCArIFwiLmpzb25cIik7XHJcbiAgICB2YXIgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhkZXN0UGF0aCk7XHJcbiAgICB2YXIgcGFjQ29uZmlnID0gSlNPTi5wYXJzZShkYXRhLnRvU3RyaW5nKCkpO1xyXG4gICAgcGFjQ29uZmlnLmNvbnRlbnQuc3ByaXRlRnJhbWVzID0gW107XHJcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHN1YkltZ3MubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBsZXQgc3ViSW1nID0gc3ViSW1nc1tqXTtcclxuICAgICAgICBpZiAoc3ViSW1nLnN1YkFzc2V0cyAmJiBzdWJJbWcuc3ViQXNzZXRzW1wiZjk5NDFcIl0pIHtcclxuICAgICAgICAgICAgcGFjQ29uZmlnLmNvbnRlbnQuc3ByaXRlRnJhbWVzLnB1c2goc3ViSW1nLnN1YkFzc2V0c1tcImY5OTQxXCJdLmRpc3BsYXlOYW1lKTtcclxuICAgICAgICAgICAgcGFjQ29uZmlnLmNvbnRlbnQuc3ByaXRlRnJhbWVzLnB1c2goc3ViSW1nLnN1YkFzc2V0c1tcImY5OTQxXCJdLnV1aWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZzLndyaXRlRmlsZVN5bmMoZGVzdFBhdGgsIEpTT04uc3RyaW5naWZ5KHBhY0NvbmZpZykpO1xyXG5cclxuICAgIGxldCB1dWlkVGVtcFBhdGggPSBwYXRoLmpvaW4oRWRpdG9yLlByb2plY3QucGF0aCwgJ3RlbXAnLCAnYXNzZXQtZGInLCAnYXNzZXRzJywgYXNzZXRJbmZvLnV1aWQuc3Vic3RyaW5nKDAsIDIpLCBhc3NldEluZm8udXVpZCk7XHJcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmModXVpZFRlbXBQYXRoKSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+acquafpeaJvuWIsOmihOiniOaWh+S7tu+8jOivt+ehruS/nemihOiniOWQjuWGjeaJp+ihjOatpOaTjeS9nCcpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxldCBkaXJzID0gZnMucmVhZGRpclN5bmModXVpZFRlbXBQYXRoKTtcclxuICAgIGxldCBidWlsZFBhdGggPSBkaXJzLmZpbmQoZGlyID0+IGRpci5zdGFydHNXaXRoKCdidWlsZCcpICYmIGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHV1aWRUZW1wUGF0aCwgZGlyLCAndGV4dHVyZS1wYWNrZXJwcmV2aWV3JykpKTtcclxuICAgIGlmICghYnVpbGRQYXRoKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcign5pyq5p+l5om+5Yiw6aKE6KeI5paH5Lu277yM6K+356Gu5L+d6aKE6KeI5ZCO5YaN5omn6KGM5q2k5pON5L2cJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgbGV0IHByZXZpZXdQYXRoID0gcGF0aC5qb2luKHV1aWRUZW1wUGF0aCwgYnVpbGRQYXRoLCAndGV4dHVyZS1wYWNrZXJwcmV2aWV3Jyk7XHJcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMocHJldmlld1BhdGgpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcign5pyq5p+l5om+5Yiw6aKE6KeI5paH5Lu277yM6K+356Gu5L+d6aKE6KeI5ZCO5YaN5omn6KGM5q2k5pON5L2cJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGxldCB0ZW1wID0gcGF0aC5qb2luKEVkaXRvci5Qcm9qZWN0LnBhdGgsICdhc3NldHMnLCAnYXV0b19hdGxhc190ZW1wJyk7XHJcbiAgICAvLyBpZiAoIWZzLmV4aXN0c1N5bmModGVtcCkpIHtcclxuICAgIC8vICAgICBmcy5ta2RpclN5bmModGVtcCk7XHJcbiAgICAvLyAgICAgLy8gY29uc29sZS53YXJuKCfor7flsIZ0ZW1w5paH5Lu25aS55re75Yqg5YiwYnVuZGxl6L+H5ruk6YWN572u5LitJyk7XHJcbiAgICAvLyAgICAgbGV0IHRlbXBVcmwgPSB0ZW1wLnJlcGxhY2UoRWRpdG9yLlByb2plY3QucGF0aCwgJycpO1xyXG4gICAgLy8gICAgIHRlbXBVcmwgPSB0ZW1wVXJsLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcclxuICAgIC8vICAgICB0ZW1wVXJsID0gJ2RiOi8vJyArIHRlbXBVcmwucmVwbGFjZSgnLycsICcnKTtcclxuICAgIC8vICAgICAvLyBjb25zb2xlLndhcm4odGVtcFVybCk7XHJcbiAgICAvLyAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncmVmcmVzaC1hc3NldCcsIHRlbXBVcmwpO1xyXG4gICAgLy8gICAgIGxldCBtZXRhUGF0aCA9IHRlbXAgKyAnLm1ldGEnO1xyXG4gICAgLy8gICAgIGlmIChmcy5leGlzdHNTeW5jKG1ldGFQYXRoKSkge1xyXG4gICAgLy8gICAgICAgICBsZXQgbWV0YSA9IGZzLnJlYWRGaWxlU3luYyhtZXRhUGF0aCk7XHJcbiAgICAvLyAgICAgICAgIGxldCBtZXRhSnNvbiA9IEpTT04ucGFyc2UobWV0YS50b1N0cmluZygpKTtcclxuICAgIC8vICAgICAgICAgaWYgKCFtZXRhSnNvbi51c2VyRGF0YSkge1xyXG4gICAgLy8gICAgICAgICAgICAgbWV0YUpzb24udXNlckRhdGEgPSB7fTtcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICBtZXRhSnNvbi51c2VyRGF0YS5pc0J1bmRsZSA9IHRydWU7XHJcbiAgICAvLyAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMobWV0YVBhdGgsIEpTT04uc3RyaW5naWZ5KG1ldGFKc29uKSk7XHJcbiAgICAvLyAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3JlZnJlc2gtYXNzZXQnLCB0ZW1wVXJsKTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9XHJcbiAgICBsZXQgbWFpbkRpciA9IHBhdGguam9pbihFZGl0b3IuUHJvamVjdC5wYXRoLCAnYXNzZXRzJywgJ21haW4nKTtcclxuICAgIGxldCBzY3JpcHRzUGF0aCA9IHBhdGguam9pbihtYWluRGlyLCAnc2NyaXB0cycpO1xyXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHNjcmlwdHNQYXRoKSkge1xyXG4gICAgICAgIGZzLm1rZGlyU3luYyhzY3JpcHRzUGF0aCk7XHJcbiAgICB9XHJcbiAgICBsZXQgcGF0Y2hQYXRoID0gcGF0aC5qb2luKHNjcmlwdHNQYXRoLCAnQXV0b0F0bGFzUGF0Y2gudHMnKTtcclxuICAgIGxldCBjb2RlID0gJyc7XHJcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMocGF0Y2hQYXRoKSkge1xyXG4gICAgICAgIGNvZGUgPSBBdXRvQWx0YXNQYXRjaDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29kZSA9IGZzLnJlYWRGaWxlU3luYyhwYXRjaFBhdGgsICd1dGYtOCcpO1xyXG4gICAgfVxyXG4gICAgLy8g5p+l5om+5Zu+6ZuGXHJcbiAgICBsZXQgcGFjRm9ybWF0ID0gXCJkYjovL2Fzc2V0cy8qKi8qLnBhY1wiO1xyXG4gICAgbGV0IHBhY3MgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFwiYXNzZXQtZGJcIiwgXCJxdWVyeS1hc3NldHNcIiwgeyBwYXR0ZXJuOiBwYWNGb3JtYXQgfSk7XHJcbiAgICBsZXQgYnVuZGxlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xyXG4gICAgZm9yIChsZXQgcGFjIG9mIHBhY3MpIHtcclxuICAgICAgICBsZXQgcGFjUGF0aCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXCJhc3NldC1kYlwiLCBcInF1ZXJ5LXVybFwiLCBwYWMudXVpZCkgYXMgc3RyaW5nO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHBhY1BhdGgpO1xyXG4gICAgICAgIGxldCBhc3NldHMgPSAnZGI6Ly9hc3NldHMvJztcclxuICAgICAgICBsZXQgYnVuZGxlID0gcGFjUGF0aC5zdWJzdHJpbmcocGFjUGF0aC5pbmRleE9mKGFzc2V0cykgKyBhc3NldHMubGVuZ3RoKTtcclxuICAgICAgICBidW5kbGUgPSBidW5kbGUuc3Vic3RyaW5nKDAsIGJ1bmRsZS5pbmRleE9mKCcvJykpO1xyXG4gICAgICAgIGJ1bmRsZXNbcGFjLnV1aWRdID0gYnVuZGxlO1xyXG4gICAgfVxyXG4gICAgLy8g55Sf5oiQ5paw55qEdXVpZHPmlbDnu4TlrZfnrKbkuLJcclxuICAgIGxldCBuZXdVdWlkc1N0ciA9IHBhY3MubWFwKHBhYyA9PiB7XHJcbiAgICAgICAgbGV0IHBhY0J1aWxkUGF0aCA9IHBhdGguam9pbihFZGl0b3IuUHJvamVjdC5wYXRoLCAndGVtcCcsICdhc3NldC1kYicsICdhc3NldHMnLCBwYWMudXVpZC5zdWJzdHJpbmcoMCwgMiksIHBhYy51dWlkLCBidWlsZFBhdGgsICd0ZXh0dXJlLXBhY2tlcnByZXZpZXcnKTtcclxuICAgICAgICBsZXQgcGFjSW5mbyA9IHBhdGguam9pbihwYWNCdWlsZFBhdGgsICdwYWMtaW5mby5qc29uJyk7XHJcbiAgICAgICAgbGV0IHBhY0luZm9EYXRhID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGFjSW5mbywgJ3V0Zi04JykpO1xyXG4gICAgICAgIHJldHVybiBgeyB1dWlkOiAnJHtwYWMudXVpZH0nLCBpbmZvOiAke0pTT04uc3RyaW5naWZ5KHBhY0luZm9EYXRhKX0sIGJ1bmRsZTogJyR7YnVuZGxlc1twYWMudXVpZF19JyB9YFxyXG4gICAgfSkuam9pbignLCAnKTtcclxuXHJcbiAgICAvLyDliKDpmaTljp/mnInnmoR1dWlkc+i1i+WAvOihjO+8jOebtOaOpeeUqOaWsOeahCB1dWlkIOWAvOaPkuWFpVxyXG4gICAgY29kZSA9IGNvZGUucmVwbGFjZSgvbGV0XFxzK3V1aWRzXFxzKj0uKj87XFxzKlxcbi8sIGBsZXQgdXVpZHMgPSBbJHtuZXdVdWlkc1N0cn1dO1xcbmApO1xyXG4gICAgZnMud3JpdGVGaWxlU3luYyhwYXRjaFBhdGgsIGNvZGUpO1xyXG5cclxuICAgIC8vIC8vIOWIoOmZpGF0bGFz5Lit55qE5peg55So6LWE5rqQXHJcbiAgICAvLyBsZXQgYXRsYXNEaXJzID0gZnMucmVhZGRpclN5bmMocGF0aC5qb2luKHRlbXAsICdhdGxhcycpKTtcclxuICAgIC8vIGF0bGFzRGlycy5mb3JFYWNoKGRpciA9PiB7XHJcbiAgICAvLyAgICAgaWYgKCFwYWNzLmZpbmQocGFjID0+IHBhYy51dWlkID09PSBkaXIpICYmICFkaXIuZW5kc1dpdGgoJy5tZXRhJykpIHtcclxuICAgIC8vICAgICAgICAgZnMucmVtb3ZlU3luYyhwYXRoLmpvaW4odGVtcCwgJ2F0bGFzJywgZGlyKSk7XHJcbiAgICAvLyAgICAgICAgIGZzLnJlbW92ZVN5bmMocGF0aC5qb2luKHRlbXAsICdhdGxhcycsIGRpciArICcubWV0YScpKTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdyZWZyZXNoLWFzc2V0JywgJ2RiOi8vYXNzZXRzL2F1dG9fYXRsYXNfdGVtcC9zY3JpcHRzL0F1dG9BdGxhc1BhdGNoLnRzJyk7XHJcblxyXG4gICAgLy8gdXVpZFRlbXBQYXRoID0gcGF0aC5qb2luKHRlbXAsICdhdGxhcycsIGFzc2V0SW5mby51dWlkKTtcclxuICAgIC8vIGlmICghZnMuZXhpc3RzU3luYyh1dWlkVGVtcFBhdGgpKSB7XHJcbiAgICAvLyAgICAgZnMubWtkaXJTeW5jKHV1aWRUZW1wUGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcbiAgICAvLyB9XHJcbiAgICAvLyBmcy5jb3B5U3luYyhwcmV2aWV3UGF0aCwgdXVpZFRlbXBQYXRoLCB7IG92ZXJ3cml0ZTogdHJ1ZSB9KTtcclxuXHJcbiAgICAvLyBsZXQgaW1nRGlyID0gZnMucmVhZGRpclN5bmMocGF0aC5qb2luKHRlbXAsICdhdGxhcycsIGFzc2V0SW5mby51dWlkKSk7XHJcbiAgICAvLyBsZXQgcGFjSW5mbyA9IHBhdGguam9pbih0ZW1wLCAnYXRsYXMnLCBhc3NldEluZm8udXVpZCwgJ3BhYy1pbmZvLmpzb24nKTtcclxuICAgIC8vIGxldCBwYWNJbmZvRGF0YSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhY0luZm8sICd1dGYtOCcpKTtcclxuICAgIC8vIGxldCBhdGxhc2VzOiBhbnlbXSA9IHBhY0luZm9EYXRhLnJlc3VsdC5hdGxhc2VzO1xyXG4gICAgLy8gZm9yIChsZXQgYXRsYXMgb2YgYXRsYXNlcykge1xyXG4gICAgLy8gICAgIGxldCBpbWFnZVV1aWQgPSBhdGxhcy5pbWFnZVV1aWQ7XHJcbiAgICAvLyB9XHJcbiAgICAvLyBpbWdEaXIuZm9yRWFjaCgoaW1nKSA9PiB7XHJcbiAgICAvLyAgICAgaWYgKCFpbWcuZW5kc1dpdGgoJy5wbmcnKSkge1xyXG4gICAgLy8gICAgICAgICByZXR1cm47XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gICAgIGlmICghYXRsYXNlcy5maW5kKGF0bGFzID0+IGF0bGFzLmltYWdlVXVpZCA9PT0gcGF0aC5iYXNlbmFtZShpbWcsICcucG5nJykpKSB7XHJcbiAgICAvLyAgICAgICAgIGZzLnJlbW92ZVN5bmMocGF0aC5qb2luKHRlbXAsICdhdGxhcycsIGFzc2V0SW5mby51dWlkLCBpbWcpKTtcclxuICAgIC8vICAgICAgICAgZnMucmVtb3ZlU3luYyhwYXRoLmpvaW4odGVtcCwgJ2F0bGFzJywgYXNzZXRJbmZvLnV1aWQsIGltZyArICcubWV0YScpKTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvLyBsZXQgdGVtcFVybCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LXVybCcsIHRlbXApIGFzIHN0cmluZztcclxuICAgIC8vIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3JlZnJlc2gtYXNzZXQnLCB0ZW1wVXJsKTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhgJHthc3NldEluZm8udXJsfeiHquWKqOWbvumbhuWIt+aWsOaIkOWKn++8iOivt+ehruS/nemihOiniOWQjuWGjeaJp+ihjOatpOaTjeS9nO+8iWApO1xyXG59XHJcbi8qKlxyXG4gKiBAZW4gTWV0aG9kIFRyaWdnZXJlZCBvbiBFeHRlbnNpb24gU3RhcnR1cFxyXG4gKiBAemgg5omp5bGV5ZCv5Yqo5pe26Kem5Y+R55qE5pa55rOVXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbG9hZCgpIHsgfVxyXG5cclxuLyoqXHJcbiAqIEBlbiBNZXRob2QgdHJpZ2dlcmVkIHdoZW4gdW5pbnN0YWxsaW5nIHRoZSBleHRlbnNpb25cclxuICogQHpoIOWNuOi9veaJqeWxleaXtuinpuWPkeeahOaWueazlVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVubG9hZCgpIHsgfVxyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvbkFzc2V0TWVudShhc3NldEluZm86IEFzc2V0SW5mbykge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAn5Yi35paw6Ieq5Yqo5Zu+6ZuGJyxcclxuICAgICAgICAgICAgdmlzaWJsZTogYXNzZXRJbmZvLmltcG9ydGVyID09ICdhdXRvLWF0bGFzJyxcclxuICAgICAgICAgICAgY2xpY2soKSB7XHJcbiAgICAgICAgICAgICAgICByZWZyZXNoUGFjKGFzc2V0SW5mbylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIF07XHJcbn1cclxuIl19
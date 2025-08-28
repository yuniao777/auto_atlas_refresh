import { AssetInfo } from "@cocos/creator-types/editor/packages/asset-db/@types/public";
import path from 'path';
import fs from 'fs-extra';

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    /**
     * @en A method that can be triggered by message
     * @zh 通过 message 触发的方法
     */
    showLog() {
        console.log('Hello World');
    },
};


const AutoAltasPatch = fs.readFileSync(path.join(__dirname, '..', 'res', 'AutoAtlasPatch.txt'), 'utf-8');


async function refreshPac(assetInfo: AssetInfo) {
    // console.log(assetInfo);
    let pacDir = path.dirname(assetInfo.url);
    let spriteFrameFormat = pacDir + "/**/*.png";
    let subImgs = await Editor.Message.request("asset-db", "query-assets", { pattern: spriteFrameFormat });

    let destPath = path.join(Editor.Project.path, "library", assetInfo.uuid.substring(0, 2), assetInfo.uuid + ".json");
    var data = fs.readFileSync(destPath);
    var pacConfig = JSON.parse(data.toString());
    pacConfig.content.spriteFrames = [];
    for (let j = 0; j < subImgs.length; j++) {
        let subImg = subImgs[j];
        if (subImg.subAssets && subImg.subAssets["f9941"]) {
            pacConfig.content.spriteFrames.push(subImg.subAssets["f9941"].displayName);
            pacConfig.content.spriteFrames.push(subImg.subAssets["f9941"].uuid);
        }
    }
    fs.writeFileSync(destPath, JSON.stringify(pacConfig));

    let uuidTempPath = path.join(Editor.Project.path, 'temp', 'asset-db', 'assets', assetInfo.uuid.substring(0, 2), assetInfo.uuid);
    if (!fs.existsSync(uuidTempPath)) {
        console.error('未查找到预览文件，请确保预览后再执行此操作');
        return;
    }
    let dirs = fs.readdirSync(uuidTempPath);
    let buildPath = dirs.find(dir => dir.startsWith('build') && fs.existsSync(path.join(uuidTempPath, dir, 'preview', 'texture-packer', 'preview')));
    if (!buildPath) {
        console.error('未查找到预览文件，请确保预览后再执行此操作');
        return;
    }
    let previewPath = path.join(uuidTempPath, buildPath, 'preview', 'texture-packer', 'preview');
    if (!fs.existsSync(previewPath)) {
        console.error('未查找到预览文件，请确保预览后再执行此操作');
        return;
    }

    let temp = path.join(Editor.Project.path, 'assets', 'auto_atlas_temp');
    if (!fs.existsSync(temp)) {
        fs.mkdirSync(temp);
        // console.warn('请将temp文件夹添加到bundle过滤配置中');
        let tempUrl = temp.replace(Editor.Project.path, '');
        tempUrl = tempUrl.replace(/\\/g, '/');
        tempUrl = 'db://' + tempUrl.replace('/', '');
        // console.warn(tempUrl);
        await Editor.Message.request('asset-db', 'refresh-asset', tempUrl);
        let metaPath = temp + '.meta';
        if (fs.existsSync(metaPath)) {
            let meta = fs.readFileSync(metaPath);
            let metaJson = JSON.parse(meta.toString());
            if (!metaJson.userData) {
                metaJson.userData = {};
            }
            metaJson.userData.isBundle = true;
            fs.writeFileSync(metaPath, JSON.stringify(metaJson));
            await Editor.Message.request('asset-db', 'refresh-asset', tempUrl);
        }
    }

    let scriptsPath = path.join(temp, 'scripts');
    if (!fs.existsSync(scriptsPath)) {
        fs.mkdirSync(scriptsPath);
    }
    let patchPath = path.join(scriptsPath, 'AutoAtlasPatch.ts');
    let code = '';
    if (!fs.existsSync(patchPath)) {
        code = AutoAltasPatch;
    } else {
        code = fs.readFileSync(patchPath, 'utf-8');
    }
    // 查找图集
    let pacFormat = "db://assets/**/*.pac";
    let pacs = await Editor.Message.request("asset-db", "query-assets", { pattern: pacFormat });

    // 生成新的uuids数组字符串
    let newUuidsStr = pacs.map(pac => {
        return `{ uuid: '${pac.uuid}' }`
    }).join(', ');

    // 替换代码中的uuids数组
    let uuidPattern = /let\s+uuids\s*=\s*\[(.*?)\]/;
    code = code.replace(uuidPattern, `let uuids = [${newUuidsStr}]`);
    fs.writeFileSync(patchPath, code);

    // 删除atlas中的无用资源
    let atlasDirs = fs.readdirSync(path.join(temp, 'atlas'));
    atlasDirs.forEach(dir => {
        if (!pacs.find(pac => pac.uuid === dir) && !dir.endsWith('.meta')) {
            fs.removeSync(path.join(temp, 'atlas', dir));
            fs.removeSync(path.join(temp, 'atlas', dir + '.meta'));
        }
    });

    Editor.Message.request('asset-db', 'refresh-asset', 'db://assets/auto_atlas_temp/scripts/AutoAtlasPatch.ts');

    uuidTempPath = path.join(temp, 'atlas', assetInfo.uuid);
    if (!fs.existsSync(uuidTempPath)) {
        fs.mkdirSync(uuidTempPath, { recursive: true });
    }
    fs.copySync(previewPath, uuidTempPath, { overwrite: true });

    let imgDir = fs.readdirSync(path.join(temp, 'atlas', assetInfo.uuid));
    let pacInfo = path.join(temp, 'atlas', assetInfo.uuid, 'pac-info.json');
    let pacInfoData = JSON.parse(fs.readFileSync(pacInfo, 'utf-8'));
    let atlases: any[] = pacInfoData.result.atlases;
    // for (let atlas of atlases) {
    //     let imageUuid = atlas.imageUuid;
    // }
    imgDir.forEach((img) => {
        if (!img.endsWith('.png')) {
            return;
        }
        if (!atlases.find(atlas => atlas.imageUuid === path.basename(img, '.png'))) {
            fs.removeSync(path.join(temp, 'atlas', assetInfo.uuid, img));
            fs.removeSync(path.join(temp, 'atlas', assetInfo.uuid, img + '.meta'));
        }
    });

    let tempUrl = await Editor.Message.request('asset-db', 'query-url', temp) as string;
    await Editor.Message.request('asset-db', 'refresh-asset', tempUrl);

    console.log(`${assetInfo.url}自动图集刷新成功（请确保预览后再执行此操作）`);
}
/**
 * @en Method Triggered on Extension Startup
 * @zh 扩展启动时触发的方法
 */
export function load() { }

/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
export function unload() { }


export function onAssetMenu(assetInfo: AssetInfo) {
    return [
        {
            label: '刷新自动图集',
            visible: assetInfo.importer == 'auto-atlas',
            click() {
                refreshPac(assetInfo)
            }
        }
    ];
}

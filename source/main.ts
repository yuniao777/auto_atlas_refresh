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
    let buildPath = dirs.find(dir => dir.startsWith('build') && fs.existsSync(path.join(uuidTempPath, dir, 'texture-packerpreview')));
    if (!buildPath) {
        console.error('未查找到预览文件，请确保预览后再执行此操作');
        return;
    }
    let previewPath = path.join(uuidTempPath, buildPath, 'texture-packerpreview');
    if (!fs.existsSync(previewPath)) {
        console.error('未查找到预览文件，请确保预览后再执行此操作');
        return;
    }

    let mainDir = path.join(Editor.Project.path, 'assets', 'main');
    let scriptsPath = path.join(mainDir, 'scripts');
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
    let bundles: Record<string, string> = {};
    for (let pac of pacs) {
        let pacPath = await Editor.Message.request("asset-db", "query-url", pac.uuid) as string;
        console.log(pacPath);
        let assets = 'db://assets/';
        let bundle = pacPath.substring(pacPath.indexOf(assets) + assets.length);
        bundle = bundle.substring(0, bundle.indexOf('/'));
        bundles[pac.uuid] = bundle;
    }
    // 生成新的uuids数组字符串
    let newUuidsStr = pacs.map(pac => {
        let pacBuildPath = path.join(Editor.Project.path, 'temp', 'asset-db', 'assets', pac.uuid.substring(0, 2), pac.uuid, buildPath, 'texture-packerpreview');
        let pacInfo = path.join(pacBuildPath, 'pac-info.json');
        let pacInfoData = JSON.parse(fs.readFileSync(pacInfo, 'utf-8'));
        return `{ uuid: '${pac.uuid}', info: ${JSON.stringify(pacInfoData)}, bundle: '${bundles[pac.uuid]}' }`
    }).join(', ');

    // 删除原有的uuids赋值行，直接用新的 uuid 值插入
    code = code.replace(/let\s+uuids\s*=.*?;\s*\n/, `let uuids = [${newUuidsStr}];\n`);
    fs.writeFileSync(patchPath, code);


    Editor.Message.request('asset-db', 'refresh-asset', 'db://assets/auto_atlas_temp/scripts/AutoAtlasPatch.ts');

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

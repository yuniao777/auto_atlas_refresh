import path from 'path';
import fs from 'fs-extra';
import { BuildHook } from '../@types';

export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options, result) {
    // console.log('onBeforeBuild', options, result);
    let temp = path.join(Editor.Project.path, 'assets', 'auto_atlas_temp');
    if (!fs.existsSync(temp)) {
        return;
    }
    let tempUrl = await Editor.Message.request('asset-db', 'query-url', temp) as string;
    let outTemp = path.join(Editor.Project.path, 'auto_atlas_temp_dir', 'auto_atlas_temp');
    if (!fs.existsSync(outTemp)) {
        fs.mkdirSync(outTemp, { recursive: true });
    }
    fs.moveSync(temp, outTemp, { overwrite: true });
    fs.moveSync(temp + '.meta', outTemp + '.meta', { overwrite: true });
    await Editor.Message.request('asset-db', 'refresh-asset', tempUrl);
    console.log('auto_atlas_temp 已移动到' + path.dirname(outTemp));
};


export const onAfterBuild: BuildHook.onAfterBuild = async function (options, result) {
    // console.log('onAfterBuild', options, result);
    try {
        let outTemp = path.join(Editor.Project.path, 'auto_atlas_temp_dir', 'auto_atlas_temp');
        if (!fs.existsSync(outTemp)) {
            return;
        }
        let temp = path.join(Editor.Project.path, 'assets', 'auto_atlas_temp');
        if (!fs.existsSync(temp)) {
            fs.mkdirSync(temp, { recursive: true });
        }
        fs.moveSync(outTemp, temp, { overwrite: true });
        fs.moveSync(outTemp + '.meta', temp + '.meta', { overwrite: true });
        // console.warn(tempUrl);
        fs.removeSync(outTemp);
        console.log('auto_atlas_temp已恢复');
        let tempUrl = temp.replace(Editor.Project.path, '');
        tempUrl = tempUrl.replace(/\\/g, '/');
        tempUrl = 'db://' + tempUrl.replace('/', '');
        Editor.Message.request('asset-db', 'refresh-asset', tempUrl);
    } catch (e) {
        console.error(e);
    }

};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAfterBuild = exports.onBeforeBuild = void 0;
const onBeforeBuild = async function (options, result) {
    // console.log('onBeforeBuild', options, result);
    // try {
    //     let temp = path.join(Editor.Project.path, 'assets', 'auto_atlas_temp');
    //     if (!fs.existsSync(temp)) {
    //         return;
    //     }
    //     let tempUrl = await Editor.Message.request('asset-db', 'query-url', temp) as string;
    //     let outTemp = path.join(Editor.Project.path, 'auto_atlas_temp_dir', 'auto_atlas_temp');
    //     if (!fs.existsSync(outTemp)) {
    //         fs.mkdirSync(outTemp, { recursive: true });
    //     }
    //     fs.moveSync(temp, outTemp, { overwrite: true });
    //     fs.moveSync(temp + '.meta', outTemp + '.meta', { overwrite: true });
    //     await Editor.Message.request('asset-db', 'refresh-asset', tempUrl);
    //     console.log('auto_atlas_temp 已移动到' + path.dirname(outTemp));
    // } catch (e) {
    //     console.error(e);
    // }
};
exports.onBeforeBuild = onBeforeBuild;
const onAfterBuild = async function (options, result) {
    // console.log('onAfterBuild', options, result);
    // try {
    //     let outTemp = path.join(Editor.Project.path, 'auto_atlas_temp_dir', 'auto_atlas_temp');
    //     if (!fs.existsSync(outTemp)) {
    //         return;
    //     }
    //     let temp = path.join(Editor.Project.path, 'assets', 'auto_atlas_temp');
    //     if (!fs.existsSync(temp)) {
    //         fs.mkdirSync(temp, { recursive: true });
    //     }
    //     fs.moveSync(outTemp, temp, { overwrite: true });
    //     fs.moveSync(outTemp + '.meta', temp + '.meta', { overwrite: true });
    //     // console.warn(tempUrl);
    //     fs.removeSync(outTemp);
    //     console.log('auto_atlas_temp已恢复');
    //     let tempUrl = temp.replace(Editor.Project.path, '');
    //     tempUrl = tempUrl.replace(/\\/g, '/');
    //     tempUrl = 'db://' + tempUrl.replace('/', '');
    //     Editor.Message.request('asset-db', 'refresh-asset', tempUrl);
    // } catch (e) {
    //     console.error(e);
    // }
};
exports.onAfterBuild = onAfterBuild;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvaG9va3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBSU8sTUFBTSxhQUFhLEdBQTRCLEtBQUssV0FBVyxPQUFPLEVBQUUsTUFBTTtJQUNqRixpREFBaUQ7SUFDakQsUUFBUTtJQUNSLDhFQUE4RTtJQUM5RSxrQ0FBa0M7SUFDbEMsa0JBQWtCO0lBQ2xCLFFBQVE7SUFDUiwyRkFBMkY7SUFDM0YsOEZBQThGO0lBQzlGLHFDQUFxQztJQUNyQyxzREFBc0Q7SUFDdEQsUUFBUTtJQUNSLHVEQUF1RDtJQUN2RCwyRUFBMkU7SUFDM0UsMEVBQTBFO0lBQzFFLG1FQUFtRTtJQUNuRSxnQkFBZ0I7SUFDaEIsd0JBQXdCO0lBQ3hCLElBQUk7QUFDUixDQUFDLENBQUM7QUFuQlcsUUFBQSxhQUFhLGlCQW1CeEI7QUFHSyxNQUFNLFlBQVksR0FBMkIsS0FBSyxXQUFXLE9BQU8sRUFBRSxNQUFNO0lBQy9FLGdEQUFnRDtJQUNoRCxRQUFRO0lBQ1IsOEZBQThGO0lBQzlGLHFDQUFxQztJQUNyQyxrQkFBa0I7SUFDbEIsUUFBUTtJQUNSLDhFQUE4RTtJQUM5RSxrQ0FBa0M7SUFDbEMsbURBQW1EO0lBQ25ELFFBQVE7SUFDUix1REFBdUQ7SUFDdkQsMkVBQTJFO0lBQzNFLGdDQUFnQztJQUNoQyw4QkFBOEI7SUFDOUIseUNBQXlDO0lBQ3pDLDJEQUEyRDtJQUMzRCw2Q0FBNkM7SUFDN0Msb0RBQW9EO0lBQ3BELG9FQUFvRTtJQUNwRSxnQkFBZ0I7SUFDaEIsd0JBQXdCO0lBQ3hCLElBQUk7QUFFUixDQUFDLENBQUM7QUF4QlcsUUFBQSxZQUFZLGdCQXdCdkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgQnVpbGRIb29rIH0gZnJvbSAnLi4vQHR5cGVzJztcclxuXHJcbmV4cG9ydCBjb25zdCBvbkJlZm9yZUJ1aWxkOiBCdWlsZEhvb2sub25CZWZvcmVCdWlsZCA9IGFzeW5jIGZ1bmN0aW9uIChvcHRpb25zLCByZXN1bHQpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKCdvbkJlZm9yZUJ1aWxkJywgb3B0aW9ucywgcmVzdWx0KTtcclxuICAgIC8vIHRyeSB7XHJcbiAgICAvLyAgICAgbGV0IHRlbXAgPSBwYXRoLmpvaW4oRWRpdG9yLlByb2plY3QucGF0aCwgJ2Fzc2V0cycsICdhdXRvX2F0bGFzX3RlbXAnKTtcclxuICAgIC8vICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGVtcCkpIHtcclxuICAgIC8vICAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vICAgICBsZXQgdGVtcFVybCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LXVybCcsIHRlbXApIGFzIHN0cmluZztcclxuICAgIC8vICAgICBsZXQgb3V0VGVtcCA9IHBhdGguam9pbihFZGl0b3IuUHJvamVjdC5wYXRoLCAnYXV0b19hdGxhc190ZW1wX2RpcicsICdhdXRvX2F0bGFzX3RlbXAnKTtcclxuICAgIC8vICAgICBpZiAoIWZzLmV4aXN0c1N5bmMob3V0VGVtcCkpIHtcclxuICAgIC8vICAgICAgICAgZnMubWtkaXJTeW5jKG91dFRlbXAsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vICAgICBmcy5tb3ZlU3luYyh0ZW1wLCBvdXRUZW1wLCB7IG92ZXJ3cml0ZTogdHJ1ZSB9KTtcclxuICAgIC8vICAgICBmcy5tb3ZlU3luYyh0ZW1wICsgJy5tZXRhJywgb3V0VGVtcCArICcubWV0YScsIHsgb3ZlcndyaXRlOiB0cnVlIH0pO1xyXG4gICAgLy8gICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3JlZnJlc2gtYXNzZXQnLCB0ZW1wVXJsKTtcclxuICAgIC8vICAgICBjb25zb2xlLmxvZygnYXV0b19hdGxhc190ZW1wIOW3suenu+WKqOWIsCcgKyBwYXRoLmRpcm5hbWUob3V0VGVtcCkpO1xyXG4gICAgLy8gfSBjYXRjaCAoZSkge1xyXG4gICAgLy8gICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAvLyB9XHJcbn07XHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IG9uQWZ0ZXJCdWlsZDogQnVpbGRIb29rLm9uQWZ0ZXJCdWlsZCA9IGFzeW5jIGZ1bmN0aW9uIChvcHRpb25zLCByZXN1bHQpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKCdvbkFmdGVyQnVpbGQnLCBvcHRpb25zLCByZXN1bHQpO1xyXG4gICAgLy8gdHJ5IHtcclxuICAgIC8vICAgICBsZXQgb3V0VGVtcCA9IHBhdGguam9pbihFZGl0b3IuUHJvamVjdC5wYXRoLCAnYXV0b19hdGxhc190ZW1wX2RpcicsICdhdXRvX2F0bGFzX3RlbXAnKTtcclxuICAgIC8vICAgICBpZiAoIWZzLmV4aXN0c1N5bmMob3V0VGVtcCkpIHtcclxuICAgIC8vICAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vICAgICBsZXQgdGVtcCA9IHBhdGguam9pbihFZGl0b3IuUHJvamVjdC5wYXRoLCAnYXNzZXRzJywgJ2F1dG9fYXRsYXNfdGVtcCcpO1xyXG4gICAgLy8gICAgIGlmICghZnMuZXhpc3RzU3luYyh0ZW1wKSkge1xyXG4gICAgLy8gICAgICAgICBmcy5ta2RpclN5bmModGVtcCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gICAgIGZzLm1vdmVTeW5jKG91dFRlbXAsIHRlbXAsIHsgb3ZlcndyaXRlOiB0cnVlIH0pO1xyXG4gICAgLy8gICAgIGZzLm1vdmVTeW5jKG91dFRlbXAgKyAnLm1ldGEnLCB0ZW1wICsgJy5tZXRhJywgeyBvdmVyd3JpdGU6IHRydWUgfSk7XHJcbiAgICAvLyAgICAgLy8gY29uc29sZS53YXJuKHRlbXBVcmwpO1xyXG4gICAgLy8gICAgIGZzLnJlbW92ZVN5bmMob3V0VGVtcCk7XHJcbiAgICAvLyAgICAgY29uc29sZS5sb2coJ2F1dG9fYXRsYXNfdGVtcOW3suaBouWkjScpO1xyXG4gICAgLy8gICAgIGxldCB0ZW1wVXJsID0gdGVtcC5yZXBsYWNlKEVkaXRvci5Qcm9qZWN0LnBhdGgsICcnKTtcclxuICAgIC8vICAgICB0ZW1wVXJsID0gdGVtcFVybC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbiAgICAvLyAgICAgdGVtcFVybCA9ICdkYjovLycgKyB0ZW1wVXJsLnJlcGxhY2UoJy8nLCAnJyk7XHJcbiAgICAvLyAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncmVmcmVzaC1hc3NldCcsIHRlbXBVcmwpO1xyXG4gICAgLy8gfSBjYXRjaCAoZSkge1xyXG4gICAgLy8gICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAvLyB9XHJcblxyXG59OyJdfQ==
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.unload = exports.load = void 0;
const global_1 = require("./global");
const load = function () {
    console.debug(`${global_1.PACKAGE_NAME} load`);
};
exports.load = load;
const unload = function () {
    console.debug(`${global_1.PACKAGE_NAME} unload`);
};
exports.unload = unload;
exports.configs = {
    '*': {
        hooks: './hooks',
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHFDQUF3QztBQUVqQyxNQUFNLElBQUksR0FBcUI7SUFDbEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLHFCQUFZLE9BQU8sQ0FBQyxDQUFDO0FBQzFDLENBQUMsQ0FBQztBQUZXLFFBQUEsSUFBSSxRQUVmO0FBQ0ssTUFBTSxNQUFNLEdBQXFCO0lBQ3BDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxxQkFBWSxTQUFTLENBQUMsQ0FBQztBQUM1QyxDQUFDLENBQUM7QUFGVyxRQUFBLE1BQU0sVUFFakI7QUFFVyxRQUFBLE9BQU8sR0FBd0I7SUFDeEMsR0FBRyxFQUFFO1FBQ0QsS0FBSyxFQUFFLFNBQVM7S0FDbkI7Q0FDSixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCB7IEJ1aWxkUGx1Z2luIH0gZnJvbSAnLi4vQHR5cGVzJztcclxuaW1wb3J0IHsgUEFDS0FHRV9OQU1FIH0gZnJvbSAnLi9nbG9iYWwnO1xyXG5cclxuZXhwb3J0IGNvbnN0IGxvYWQ6IEJ1aWxkUGx1Z2luLmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zb2xlLmRlYnVnKGAke1BBQ0tBR0VfTkFNRX0gbG9hZGApO1xyXG59O1xyXG5leHBvcnQgY29uc3QgdW5sb2FkOiBCdWlsZFBsdWdpbi5sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc29sZS5kZWJ1ZyhgJHtQQUNLQUdFX05BTUV9IHVubG9hZGApO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGNvbmZpZ3M6IEJ1aWxkUGx1Z2luLkNvbmZpZ3MgPSB7XHJcbiAgICAnKic6IHtcclxuICAgICAgICBob29rczogJy4vaG9va3MnLFxyXG4gICAgfVxyXG59XHJcbiJdfQ==
/**
 * 处理报错元素
 * @param {*} path 报错path
 */

function getSelector(path) {
    // 翻转后过滤掉document window
    return path.reverse().filter(element => {
        return element !== document && element !== window;
    }).map((element) => {
        // 精确报错位置
        let selector = "";
        if (element.id) {
            return `${element.nodeName.toLowerCase()}#${element.id}`;
        } else if (element.className && typeof element.className === "string") {
            return `${element.nodeName.toLowerCase()}.${element.className}`;
        } else {
            selector = element.nodeName.toLowerCase();
        }
        return selector;
    }).join(' ')
}

export default function (pathOrTarget) {
    if (Array.isArray(pathOrTarget)) { // 数组
        return getSelector(pathOrTarget);
    } else { // 对象
        let target = []
        // 一直向上找父节点 html body script  用来区分是在头部还是在body引入
        while (pathOrTarget) {
            target.push(pathOrTarget)
            pathOrTarget = pathOrTarget.parentNode
        }
        return getSelector(target)
    }
}

import getLastEvent from "../utils/getLastEvent"
import getSelector from "../utils/getSelector"
import tracker from "../utils/tracker"
/**
 * 处理js错误
 */
export function injectJsError() {
    // 监听普通错误
    window.addEventListener("error", function (event) {
        let lastEvent = getLastEvent(); // 最后一个交互事件

        if (event.target && (event.target.src || event.target.href)) { // 是脚本加载错误
            let log = {
                kind: "stability", // 监控指标大类
                type: "error", // 小类  一个错误
                errorType: "resourceError", // js、css加载错误
                filename: event.target.src || event.target.href, // 报错文件
                tagName: event.target.tagName, // 标签名
                selector: getSelector(event.target) // 元素
            }
            console.log(log)
            tracker.send(log)
        } else { // 是js错误
            let log = {
                kind: "stability", // 监控指标大类
                type: "error", // 小类  一个错误
                errorType: "jsError", // js执行错误
                message: event.message, // 报错信息
                filename: event.filename, // 报错文件
                position: `${event.lineno}:${event.colno}`, // 行：列
                stack: getLines(event.error.stack), // 栈
                selector: lastEvent ? getSelector(lastEvent.path) : "", // 最后一个操作的元素
            }
            console.log(log)
            tracker.send(log)
        }
    }, true);

    // 监听promise错误
    window.addEventListener('unhandledrejection', event => {
        let lastEvent = getLastEvent(); // 最后一个交互事件
        let message
        let filename
        let line = 0
        let column = 0
        let stack
        let reason = event.reason
        if (typeof reason === 'string') {
            message = event.reason // 报错信息
        } else if (typeof reason === 'object') {
            message = reason.message // 报错信息
            if (reason.stack) {
                // at http://localhost:8080/:23:38
                let matchResult = reason.stack.match(/at\s+.+(\d+):(\d+)/)
                filename = matchResult[0]
                line = matchResult[1]
                column = matchResult[2]
            }

            stack = getLines(reason.stack)  // 栈
        }
        tracker.send({
            kind: "stability", // 监控指标大类
            type: "error", // 小类  一个错误
            errorType: "promiseError", // js执行错误
            message, // 报错信息
            filename, // 报错文件
            position: `${line}:${column}`, // 行：列
            stack, // 栈
            selector: lastEvent ? getSelector(lastEvent.path) : "", // 最后一个操作的元素
        })
    }, true)

    // 处理stack栈信息
    function getLines(stack) {
        return stack.split("\n").slice(1).map((item) => item.replace(/^\s+at\s+/g, "")).join("^");
    }
}

/**
 * 发送阿里云的请求class
 */
let userAgent = require('user-agent')

let host = 'cn-beijing.log.aliyuncs.com'  // 阿里云日志服务器
let project = 'zxjk' // 项目名
let logStore = 'zxjk-store' // 仓库名

// 获取其它用户信息
function getExtraData() {
    return {
        title: document.title,
        url: location.href,
        timestamp: Date.now(),
        userAgent: userAgent.parse(navigator.userAgent).name,
        // 用户id等
    }
}

class SendTracker {
    constructor() {
        this.url = `https://${project}.${host}/logstores/${logStore}/track`  // 上报的路径
        this.xhr = new XMLHttpRequest;
    }
    send(data = {}) {
        let extraData = getExtraData()
        // 整合原报错信息和其它信息
        let log = { ...extraData, ...data }

        // 阿里云要求value不能是number类型，转换为字符串
        for (let key in log) {
            if (typeof log[key] === 'number') {
                log[key] = `${log[key]}`
            }
        }
        // 消息体
        let body = JSON.stringify({
            __logs__: [log]
        })

        console.log(log)

        // 发送请求到阿里云
        this.xhr.open('POST', this.url, true)
        this.xhr.setRequestHeader('Content-Type', 'application/app')  // 请求体类型
        this.xhr.setRequestHeader('x-log-apiversion', '0.6.0') // 版本号
        this.xhr.setRequestHeader('x-log-bodyrawsize', body.length) // 请求体大小
        this.xhr.onload = function () {
            // console.log(this.xhr.response)
        }
        this.xhr.onerror = function (error) {
            console.log(error)
        }
        this.xhr.send(body)
    }

}

export default new SendTracker()
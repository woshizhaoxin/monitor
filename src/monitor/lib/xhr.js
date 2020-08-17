import tracker from '../utils/tracker'

export function injectXHR() {
    let XMLHttpRequest = window.XMLHttpRequest

    let oldOpen = XMLHttpRequest.prototype.open // 缓存原来的open方法
    // 改造open方法
    XMLHttpRequest.prototype.open = function (method, url, async) {
        // 不监控日志上报请求
        if (!url.match(/logstores/)) {
            this.logData = { method, url, async }
        }

        return oldOpen.apply(this, arguments)
    }

    let oldSend = XMLHttpRequest.prototype.send // 缓存原来的send方法
    // 改造send方法
    XMLHttpRequest.prototype.send = function (body) {
        if (this.logData) {
            let startTime = Date.now()  // 开始时间
            let handler = (type) => (event) => {
                let duration = Date.now() - startTime // 用时
                let status = this.status // 状态码 200 500
                let statusText = this.statusText // OK Server Error
                tracker.send({
                    kind: 'stability',
                    type: 'xhr',
                    eventType: type, // load error abort
                    pathname: this.logData.url, // 请求路径
                    status: status + '-' + statusText,
                    duration, // 持续时间
                    response: this.response ? JSON.stringify(this.response) : '', // 响应体
                    params: body || ''
                })
            }
            this.addEventListener('load', handler('load'), false) // 成功
            this.addEventListener('error', handler('error'), false) // 失败
            this.addEventListener('abort', handler('abort'), false) // 取消
        }
        return oldSend.apply(this, arguments)
    }
}
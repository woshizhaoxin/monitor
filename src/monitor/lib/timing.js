import tracker from '../utils/tracker'
import onload from '../utils/onload'
import getLastEvent from '../utils/getLastEvent'
import getSelector from "../utils/getSelector"

/**
 * 监控用户体验时间
 */
export function timing() {
    let FP // 首次绘制  包括了任何用户定义的背景绘制，它是首次将像素绘制到屏幕的时刻
    let FCP // 首次内容绘制  是浏览器将一个DOM渲染到屏幕的时间，可能是文本、图像、svg等，这其实就是白屏时间
    let FMP // 首次有意义绘制  页面有意思内容的渲染时间
    let LCP // 最大元素绘制  代表viewport中最大的页面元素加载时间

    if (PerformanceObserver) {
        /**
     * 一个性能条目的观察者(原生的)
     * @param entryList 观察的条目
     * @param observer 观察者
     */
        // 观察页面中有意义的元素 标签中用elementtiming属性规定有意义元素
        new PerformanceObserver((entryList, observer) => {
            let perfEntries = entryList.getEntries()
            FMP = perfEntries[0]
            observer.disconnect() // 不再观察
        }).observe({ entryTypes: ['element'] })

        // 观察页面中最大元素
        new PerformanceObserver((entryList, observer) => {
            let perfEntries = entryList.getEntries()
            LCP = perfEntries[0]
            observer.disconnect() // 不再观察
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // 用户的第一次交互 点击页面
        new PerformanceObserver((entryList, observer) => {
            let lastEvent = getLastEvent()
            let firstInput = entryList.getEntries()[0]
            if (firstInput) {
                // processingStart开始处理的时间 startTime开始点击的时间  差值就是处理的延迟
                let inputDelay = firstInput.processingStart - firstInput.startTime
                // 处理的耗时
                let duration = firstInput.duration

                if (inputDelay > 0 || duration > 0) {
                    // 发送首次交互指标
                    tracker.send({
                        kind: 'experience', // 用户体验指标
                        type: 'firstInputDelay', // 首次交互指标
                        inputDelay, // 延迟的时间
                        duration, // 处理的耗时
                        startTime: firstInput.startTime, // 开始时间
                        selector: lastEvent ? getSelector(lastEvent.path || lastEvent.target) : '', // 最后的元素
                    })
                }
            }
            observer.disconnect() // 不再观察
        }).observe({ type: 'first-input', buffered: true })
    }


    onload(function () {
        setTimeout(() => {
            const {
                fetchStart,
                connectStart,
                connectEnd,
                requestStart,
                responseStart,
                responseEnd,
                domLoading,
                domInteractive,
                domContentLoadedEventStart,
                domContentLoadedEventEnd,
                loadEventStart
            } = performance.timing

            // 发送每个阶段时间指标
            tracker.send({
                kind: 'experience', // 用户体验指标
                type: 'timing', // 统计每个阶段时间
                connectTime: connectEnd - connectStart, // 连接时间
                ttfbTime: responseStart - requestStart, // 首字节到达时间
                responseTime: responseEnd - responseStart, // 响应的读取时间
                parseDOMTime: loadEventStart - domLoading, // DOM解析时间
                domContentLoadedTime: domContentLoadedEventEnd - domContentLoadedEventStart, // domContentLoaded时间耗时
                timeToInteractive: domInteractive - fetchStart, // 首次可交互时间
                loadTime: loadEventStart - fetchStart, // 完整的加载时间 
            })

            FP = performance.getEntriesByName('first-paint')[0]
            FCP = performance.getEntriesByName('first-contentful-paint')[0]

            // 发送绘制时间指标
            tracker.send({
                kind: 'experience', // 用户体验指标
                type: 'paint', // 统计绘制时间
                firstPaint: FP.startTime, // 首次绘制
                firstContentfulPaint: FCP.startTime, // 首次内容绘制
                firstMeaningfulPaint: FMP.startTime, // 首次有意义绘制
                largestContentfulPaint: LCP.startTime, // 最大元素绘制

            })
        }, 3000);
    })
}
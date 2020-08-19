import tracker from '../utils/tracker'
import onload from '../utils/onload'
/**
 * 白屏监控
 */
export function blankScreen() {
    let wrapperElements = ['html', 'body', '#container', '.content'] // 定义容器
    let emptyPoints = 0 // 空白点
    // 获取dom
    function getSelector(element) {
        if (element.id) {
            return "#" + element.id
        } else if (element.className) {
            return "." + element.className.split(' ').filter(item => !!item).join('.')
        } else {
            return element.nodeName.toLowerCase()
        }
    }

    // 获取的dom是否是容器
    function isWrapper(element) {
        let selector = getSelector(element)
        // console.log(selector)
        if (wrapperElements.indexOf(selector) != -1) {
            // 返回容器等空白点+1
            emptyPoints++
        }
    }

    onload(function () {
        // 循环出18个点
        for (let i = 1; i <= 9; i++) {
            // elementsFromPoint() 方法可以获取到当前视口内指定坐标处，由里到外排列的所有元素(数组)
            // 横轴元素
            let xElements = document.elementsFromPoint(window.innerWidth * i / 10, window.innerHeight / 2)
            // 纵轴元素
            let yElements = document.elementsFromPoint(
                window.innerWidth / 2, window.innerHeight * i / 10
            )

            // 是不是容器元素
            isWrapper(xElements[0])
            isWrapper(yElements[0])
        }

        // 空白点足够多，认为是白屏
        // console.log(emptyPoints)
        if (emptyPoints >= 18) {

            let centerElements = document.elementsFromPoint(
                window.innerWidth / 2,
                window.innerHeight / 2
            )
            tracker.send({
                kind: 'stability',
                type: 'blank',
                emptyPoints, // 空白点
                screen: window.screen.width + "X" + window.screen.height, // 屏幕大小
                viewPoint: window.innerWidth + "X" + window.innerHeight, // 视口大小
                selector: getSelector(centerElements[0])
            })
        }
    })

}
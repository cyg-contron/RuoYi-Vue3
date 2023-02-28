import request from '@/utils/request'

// 单项统计-承保
export function getDxCb(query) {
    return request({
        url: '/zjazx/stat/dxcb/',
        method: 'get'
    })
}

// 单项统计-服务
export function getDxFw(query) {
    return request({
        url: '/zjazx/stat/dxfw/',
        method: 'get'
    })
}

// 单项统计-出险
export function getDxCx(query) {
    return request({
        url: '/zjazx/stat/dxcx/',
        method: 'get'
    })
}

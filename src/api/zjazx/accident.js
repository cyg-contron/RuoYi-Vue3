import request from '@/utils/request'

// 查询理赔信息-理赔管理列表
export function listAccident(query) {
    return request({
        url: '/zjazx/accident/list',
        method: 'get',
        params: query
    })
}

// 查询理赔信息-理赔管理详细
export function getAccident(accidentId) {
    return request({
        url: '/zjazx/accident/' + accidentId,
        method: 'get'
    })
}

// 新增理赔信息-理赔管理
export function addAccident(data) {
    return request({
        url: '/zjazx/accident',
        method: 'post',
        data: data
    })
}

// 修改理赔信息-理赔管理
export function updateAccident(data) {
    return request({
        url: '/zjazx/accident',
        method: 'put',
        data: data
    })
}

// 删除理赔信息-理赔管理
export function delAccident(accidentId) {
    return request({
        url: '/zjazx/accident/' + accidentId,
        method: 'delete'
    })
}

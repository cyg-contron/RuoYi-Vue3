import request from '@/utils/request'

// 查询承保信息-保单管理列表
export function listPolicy(query) {
  return request({
    url: '/zjazx/policy/list',
    method: 'get',
    params: query
  })
}

// 查询承保信息-保单管理详细
export function getPolicy(policyId) {
  return request({
    url: '/zjazx/policy/' + policyId,
    method: 'get'
  })
}

// 新增承保信息-保单管理
export function addPolicy(data) {
  return request({
    url: '/zjazx/policy',
    method: 'post',
    data: data
  })
}

// 修改承保信息-保单管理
export function updatePolicy(data) {
  return request({
    url: '/zjazx/policy',
    method: 'put',
    data: data
  })
}

// 删除承保信息-保单管理
export function delPolicy(policyId) {
  return request({
    url: '/zjazx/policy/' + policyId,
    method: 'delete'
  })
}

// 查询承保信息-保单管理详细
export function getPolicyByCode(policyCode) {
  return request({
    url: '/zjazx/policy/code/' + policyCode,
    method: 'get'
  })
}

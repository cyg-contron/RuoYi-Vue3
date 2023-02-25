import request from '@/utils/request'

// 查询评估报告列表
export function listStatement(query) {
  return request({
    url: '/zjazx/statement/list',
    method: 'get',
    params: query
  })
}

// 查询评估报告详细
export function getStatement(statementId) {
  return request({
    url: '/zjazx/statement/' + statementId,
    method: 'get'
  })
}

// 新增评估报告
export function addStatement(data) {
  return request({
    url: '/zjazx/statement',
    method: 'post',
    data: data
  })
}

// 修改评估报告
export function updateStatement(data) {
  return request({
    url: '/zjazx/statement',
    method: 'put',
    data: data
  })
}

// 删除评估报告
export function delStatement(statementId) {
  return request({
    url: '/zjazx/statement/' + statementId,
    method: 'delete'
  })
}

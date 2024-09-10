import service from '@/js/service';

// 获取用户列表
export function getUserList(params) {
  return service.get('/user/list', { params: params });
}

// 创建用户
export function createUser(data) {
  return service.post('/user/create', data);
}

// 更新用户信息
export function updateUser(id, data) {
  return service.put(`/user/update/${id}`, data);
}

export async function getPodDetails() {
  return service.get("/getPodDetails");
}
import axios from 'axios';
import {ElMessage} from 'element-plus'; // Make sure you are using ElementPlus if on Vue 3

// 创建axios实例
const service = axios.create({
    baseURL: "http://localhost:5000", // api的base_url
    timeout: 5000 // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 可以在这里添加请求头等信息
        // 例如：config.headers['Authorization'] = 'Bearer your-token';
        return config;
    },
    error => {
        // 请求错误处理
        console.log(error); // for debug
        ElMessage.error('请求失败');  // Display error message when request fails
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    response => {
        const res = response;
        // 如果返回的状态码为200，说明成功，可以直接返回数据
        if (res.status === 200) {
            return res.data;
        } else {
            console.log(res)
            // 其他状态码都当作错误处理
            ElMessage.error(res.message || '请求失败');  // Display error message with response message
            return Promise.reject({
                message: res.message || 'Error',
                status: res.code
            });
        }
    },
    error => {
        // 对响应错误做处理
        console.log('err' + error); // for debug
        ElMessage.error('服务器响应失败');  // Display error message when response fails
        return Promise.reject(error);
    }
);

export default service;

/*
 * :Author: June
 * :Date: 2022-03-07 02:12:16
 * :LastEditTime: 2022-03-30 02:01:31
 * :Description:
 */
import axios from 'axios'
import router from '@/router/index'
import { ElMessage } from 'element-plus'

const service = axios.create({
    baseURL: '/api/',
    withCredentials: true,
    timeout: 5000
})

service.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

service.interceptors.response.use(
    (response) => {
        const { status, data: resData } = response
        if (status !== 200) return Promise.reject(new Error('请求失败'))
        return new Promise((resolve, reject) => {
            const { code, data, msg } = resData
            switch (code) {
                case 200:
                    resolve({
                        code,
                        data
                    })
                    break
                case 401:
                    router.push('/login')
                    break
                default:
                    ElMessage({
                        type: 'error',
                        message: msg
                    })
                    reject(new Error('请求错误'))
                    break
            }
        })
    },
    (error) => {
        console.log(`err${error}`) // for debug

        return Promise.reject(error)
    }
)

export default service

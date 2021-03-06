import axios from 'axios'
import stores from '../store/index'
import Qs from 'qs'
import router from '../router/index'
import auth from './auth'

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
// axios.defaults.baseURL = 'http://localhost:57014/api/'
axios.defaults.baseURL = 'http://localhost:8098/api/'
axios.defaults.timeout = 1000 * 15
axios.defaults.withCredentials = true

axios.interceptors.request.use(config => {
  if (stores.state.token) {
    config.headers.Authorization = stores.state.token
  }
  stores.dispatch('showLoader')
  return config
}, error => {
  return Promise.reject(error)
})

axios.interceptors.response.use(response => {
  stores.dispatch('hideLoader')
  return response
}, error => {
  stores.dispatch('hideLoader')
  if (error.response) {
    switch (error.response.status) {
      case 401:
        stores.state.token = '' // store.commit(types.LOGOUT)
        auth.removeAuthentication()
        router.replace({
          path: '/login',
          query: {
            redirect: router.currentRoute.fullPath
          }
        })
        break
      case 403:
        router.replace({
          path: '/403',
          query: {
            path: router.currentRoute.fullPath
          }
        })
        break
    }
  }
  return Promise.reject(error)
})

function fetch(url, params) {
  return new Promise((resolve, reject) => {
    if (params && params.id) {
      axios.get(url + '/' + params.id).then((response) => {
        resolve(response.data)
      }).catch((error) => {
        reject(error)
      })
    } else {
      axios.get(url, { params: params }).then((response) => {
        resolve(response.data)
      }).catch((error) => {
        reject(error)
      })
    }
  })
}

function post(url, params) {
  return new Promise((resolve, reject) => {
    axios.post(url, Qs.stringify(params)).then((response) => {
      resolve(response.data)
    }).catch((error) => {
      reject(error)
    })
  })
}

function modify(url, id, params) {
  return new Promise((resolve, reject) => {
    axios.put(url + '/' + id, Qs.stringify(params)).then((response) => {
      resolve(response.data)
    }).catch((error) => {
      reject(error)
    })
  })
}

function remove(url, id) {
  return new Promise((resolve, reject) => {
    axios.delete(url + '/' + id).then((response) => {
      resolve(response.data)
    }).catch((error) => {
      reject(error)
    })
  })
}

// RESTful
export default{
  GET: fetch,
  POST: post,
  PUT: modify,
  DELETE: remove
}

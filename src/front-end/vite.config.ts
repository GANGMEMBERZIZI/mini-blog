import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: '../../public',
  publicDir: false,
  resolve: {
    alias: {
      // 把 /src 映射到项目根目录的 src/，解决 root 在 public/ 下找不到 src 的问题
      '/src': path.resolve(__dirname, '../')
    }
  },
  server: {
    fs: {
      // 允许访问 public 自身 + 外部的 src 目录
      allow: ['../..']
    }
  }
})

/**
 * HTTP 网络请求模块
 *
 * 主要功能：
 * 1. 提供基于 axios 的 HTTP 请求封装
 * 2. 支持请求/响应拦截器
 * 3. 统一的错误处理
 * 4. Token 管理（包括刷新token）
 * 5. 支持自定义配置
 *
 * 导出内容：
 * - http: 默认的 HTTP 请求实例
 * - createHttp: 创建新的 HTTP 请求实例的工厂函数
 * - HttpRequest: HTTP 请求类
 * - tokenService: Token 管理服务
 * - 工具函数和类型定义
 */
import HttpRequest from './request';
import tokenService from './token-service';
import type { CreateHttpOptions } from './types';

// 默认配置
const defaultConfig: CreateHttpOptions = {};

// 创建默认实例
const http = new HttpRequest(defaultConfig, tokenService);

// 提供创建新实例的工厂函数
export const createHttp = (config: CreateHttpOptions, customTokenService = tokenService) => {
  return new HttpRequest(config, customTokenService);
};

export * from './types';
export * from './utils';
export { HttpRequest, tokenService };
export default http;

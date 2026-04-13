// src/global.d.ts

// 1. 声明所有 .less 文件都是模块
declare module '*.less' {
  const content: Record<string, string>;
  export default content;
}

// 声明所有 .css 文件都是合法的模块
declare module '*.css' {
  // 如果你是用 import styles from './xxx.css'，这里定义导出类型
  const content: Record<string, string>;
  export default content;
}

// 2. 如果你只是单纯 import './style.less' 而不使用变量，
// 也可以只声明一个空模块来消除报错：
declare module '*.less' {}

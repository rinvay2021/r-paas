export enum StorageType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage',
}

interface StorageOptions {
  prefix: string;
  storage?: StorageType;
  defaultValue?: any;
}

export default class Storage {
  private prefix: string;
  private storage: globalThis.Storage;

  constructor(options: StorageOptions) {
    this.prefix = options.prefix;
    this.storage = window[options.storage || 'localStorage'];
  }

  /**
   * 获取完整的 key
   * @param key 存储键名
   */
  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * 设置存储项
   * @param key 键名
   * @param value 值
   * @param expire 过期时间（毫秒）
   */
  set<T>(key: string, value: T, expire?: number): void {
    const data = {
      value,
      time: Date.now(),
      expire: expire ? Date.now() + expire : null,
    };
    this.storage.setItem(this.getKey(key), JSON.stringify(data));
  }

  /**
   * 获取存储项
   * @param key 键名
   * @param defaultValue 默认值
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    const item = this.storage.getItem(this.getKey(key));
    if (item) {
      try {
        const data = JSON.parse(item);
        if (data.expire && Date.now() >= data.expire) {
          this.remove(key);
          return defaultValue;
        }
        return data.value;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  }

  /**
   * 删除存储项
   * @param key 键名
   */
  remove(key: string): void {
    this.storage.removeItem(this.getKey(key));
  }

  /**
   * 清除所有以当前前缀开头的存储项
   */
  clear(): void {
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key);
      }
    });
  }

  /**
   * 获取所有存储项
   */
  getAll(): Record<string, any> {
    const result: Record<string, any> = {};
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        const shortKey = key.slice(this.prefix.length + 1);
        result[shortKey] = this.get(shortKey);
      }
    });
    return result;
  }
}

class CountCache {
  constructor() {
    this._cache = {};
  }

  setCache(path, count) {
    this._cache[path] = count;
  }

  getCache(path) {
    if (path in this._cache) {
      return this._cache[path];
    } else {
      return undefined;
    }
  }

  clearCache(path) {
    if (path) {
      if (path in this._cache) {
        delete this._cache["path"];
      }
    } else {
      this._cache = {};
    }
  }

  cacheSum(path) {
    var sum = Object.values(this._cache)
      .filter(
        (val) =>
          val !== null &&
          val !== undefined &&
          typeof val === "number" &&
          !isNaN(val)
      )
      .reduce((acc, cur) => acc + cur, 0);
    if (path) {
      sum -= this.getCache(path);
    }
    return sum;
  }
}

module.exports = {
  CountCache,
};

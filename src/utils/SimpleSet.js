
export default class SimpleSet {
  constructor() {
    this.v = []
  }
  clear() { this.v.length = 0; }
  has(k) { return this.v.indexOf(k) !== -1; }
  add(k) {
    if (this.has(k)) return;
    this.v.push(k)
  }
  delete(k) {
    const idx = this.v.indexOf(k);
    if (idx === -1) return false;
    this.v.splice(idx, 1)
    return true;
  }
}

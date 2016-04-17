String.prototype.replaceAll = function(f,r) {
    return this.split(f).join(r);
};
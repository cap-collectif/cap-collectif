const DeepLinkStateMixin = {
  linkState: function(path) {
    function setPath(obj, path, value) {
      var leaf = resolvePath(obj, path);
      leaf.obj[leaf.name] = value;
    }

    function getPath(obj, path) {
      var leaf = resolvePath(obj, path);
      return leaf.obj[leaf.name];
    }

    function resolvePath(obj, names) {
      if (typeof names === 'string') {
        names = names.split('.');
      }
      var lastIndex = names.length - 1;
      var current = obj;
      for (var i = 0; i < lastIndex; i++) {
        var name = names[i];
        current = current[name];
      }
      return {
        obj: current,
        name: names[lastIndex]
      }
    }

    return {
      value: getPath(this.state, path),
      requestChange: function(newValue) {
        setPath(this.state, path, newValue);
        this.forceUpdate();
      }.bind(this)
    }
  }
};

export default DeepLinkStateMixin;

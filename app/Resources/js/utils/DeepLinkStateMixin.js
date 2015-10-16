const DeepLinkStateMixin = {
  linkState: function(path) {

    function resolvePath(obj, names) {
      if (typeof names === 'string') {
        names = names.split('.');
      }
      const lastIndex = names.length - 1;
      let current = obj;
      for (let i = 0; i < lastIndex; i++) {
        let name = names[i];
        current = current[name];
      }
      return {
        obj: current,
        name: names[lastIndex],
      };
    }

    function setPath(obj, objPath, value) {
      let leaf = resolvePath(obj, objPath);
      leaf.obj[leaf.name] = value;
    }

    function getPath(obj, objPath) {
      let leaf = resolvePath(obj, objPath);
      return leaf.obj[leaf.name];
    }

    return {
      value: getPath(this.state, path),
      requestChange: function(newValue) {
        setPath(this.state, path, newValue);
        this.forceUpdate();
      }.bind(this),
    };
  },
};

export default DeepLinkStateMixin;

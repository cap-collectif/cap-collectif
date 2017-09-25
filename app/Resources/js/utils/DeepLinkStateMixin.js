const resolvePath = (obj, names) => {
  let namesArray = [];
  if (typeof names === 'string') {
    namesArray = names.split('.');
  }
  const lastIndex = namesArray.length - 1;
  let current = obj;
  for (let i = 0; i < lastIndex; i++) {
    const name = namesArray[i];
    current = current[name];
  }
  return {
    obj: current,
    name: namesArray[lastIndex],
  };
};

const setPath = (obj, objPath, value) => {
  const leaf = resolvePath(obj, objPath);
  leaf.obj[leaf.name] = value;
};

const getPath = (obj, objPath) => {
  const leaf = resolvePath(obj, objPath);
  return leaf.obj[leaf.name];
};

const DeepLinkStateMixin = {
  linkState(path) {
    return {
      value: getPath(this.state, path),
      requestChange: newValue => {
        setPath(this.state, path, newValue);
        this.forceUpdate();
      },
    };
  },
};

export default DeepLinkStateMixin;

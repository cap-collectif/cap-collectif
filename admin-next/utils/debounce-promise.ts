export function debounce(
    fn: Function,
    wait = 0,
    options: { leading?: boolean; accumulate?: boolean } = {},
) {
    let lastCallAt: number;
    let deferred: any;
    let timer: any;
    let pendingArgs: any = [];
    return function debounced(this: any, ...args: any[]) {
        const currentWait = getWait(wait);
        const currentTime = new Date().getTime();

        const isCold = !lastCallAt || currentTime - lastCallAt > currentWait;

        lastCallAt = currentTime;

        if (isCold && options.leading) {
            return options.accumulate
                ? Promise.resolve(fn.call(this, [args])).then(result => result[0])
                : Promise.resolve(fn.call(this, ...args));
        }

        if (deferred) {
            clearTimeout(timer);
        } else {
            deferred = defer();
        }

        pendingArgs.push(args);
        timer = setTimeout(flush.bind(this), currentWait);

        if (options.accumulate) {
            const argsIndex = pendingArgs.length - 1;
            return deferred.promise.then((results: any[]) => results[argsIndex]);
        }

        return deferred.promise;
    };

    function flush(this: any) {
        const thisDeferred = deferred;
        clearTimeout(timer);

        Promise.resolve(
            options.accumulate
                ? fn.call(this, pendingArgs)
                : fn.apply(this, pendingArgs[pendingArgs.length - 1]),
        ).then(thisDeferred.resolve, thisDeferred.reject);

        pendingArgs = [];
        deferred = null;
    }
}

function getWait(wait: number | Function) {
    return typeof wait === 'function' ? wait() : wait;
}

function defer() {
    const deferred: { resolve?: Function; reject?: Function; promise?: Promise<unknown> } = {};
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}

export default debounce;

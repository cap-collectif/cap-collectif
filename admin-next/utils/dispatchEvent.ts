export const dispatchEvent = (type: string, data?: Object) => {
    const event = new MessageEvent(type, {
        bubbles: true,
        data,
    });
    document.dispatchEvent(event);
};

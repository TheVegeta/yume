export const voidFunction = () => {};

export const handleArrayBuffer = (message: ArrayBuffer | string) => {
  if (message instanceof ArrayBuffer) {
    const decoder = new TextDecoder();
    return decoder.decode(message);
  }
  return message;
};

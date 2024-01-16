export const voidFunction = () => {};

export const handleArrayBuffer = (message: ArrayBuffer | string) => {
  if (message instanceof ArrayBuffer) {
    return new TextDecoder().decode(message);
  }
  return message;
};

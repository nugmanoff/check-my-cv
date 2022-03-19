const { customAlphabet } = require("nanoid");

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const idLength = 9;
const nanoid = customAlphabet(alphabet, idLength);

const generateId = () => {
  return nanoid();
};

export default generateId;

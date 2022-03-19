const { customAlphabet } = require("nanoid");

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const idLength = 9;
const nanoid = customAlphabet(alphabet, idLength);

export const generateResumeId = () => {
  return nanoid();
};

export const generateCommentId = () => String(Math.random()).slice(2);

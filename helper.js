/**
 * Contains generic helper methods
 */

/**
 * get a random string with length
 * @param len
 * @param chars the chars
 * @returns {string}
 */
function randomStr(len, chars) {
  const newLen = len || 10;
  const $chars = chars || 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789';
  const maxPos = $chars.length;
  let str = '';
  for (let i = 0; i < newLen; i += 1) {
    str += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return `${str}`;
}

module.exports = {
  randomStr
};

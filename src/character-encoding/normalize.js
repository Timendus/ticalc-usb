// The character sets from tilibs contain hexadecimal numbers and characters.
// In C this is all just binary numbers, but JavaScript interprets the
// characters as strings and messes things up. This normalizes it all back down
// to numeric values.

module.exports = charset =>
  charset.map(c => typeof c == 'string' ? c.charCodeAt(0) : c);

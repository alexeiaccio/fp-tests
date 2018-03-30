const curry = require('folktale/core/lambda/curry');
const partialize = require('folktale/core/lambda/partialize');
const _      = partialize.hole;

const match = curry(2, (what, str) => str.match(what));

const replace = curry(3, (what, replacement, str) => str.replace(what, replacement));
const replacePartialized = partialize(3, (what, replacement, str) => str.replace(what, replacement));

const filter = curry(2, (f, ary) => ary.filter(f));

const map = curry(2, (f, ary) => ary.map(f));

match(/\s+/g, "hello world");

match(/\s+/g)("hello world");

const hasSpaces = match(/\s+/g);

hasSpaces("hello world");

hasSpaces("spaceless");

const spacesFiltration = filter(hasSpaces);

console.log(spacesFiltration(["tori_spelling", "tori amos"]));

const findSpaces = filter(hasSpaces);

findSpaces(["tori_spelling", "tori amos"]);

const noVowels = replacePartialized(/[aeiou]/ig, _, _);

const censored = noVowels('*', _);


console.log(censored("Chocolate Rain"));
const metamagical = require('metamagical-interface')
const defineTests = require('metamagical-mocha-bridge')(metamagical, describe, it)

const add = require('./dist/85828673976a751ab9b72b129dd12dcd')

defineTests(add)
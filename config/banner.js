var pkg = require("../package.json");

module.exports =
` ${pkg.name} ${pkg.version}
 ${pkg.repository.url}
         
 Copyright (c) 2020 ${pkg.author},
 Released under the ${pkg.license} license`;
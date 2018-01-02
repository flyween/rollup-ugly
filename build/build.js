const fs = require('fs')
const babel = require('rollup-plugin-babel')
const uglify = require('uglify-js')
const rollup = require('rollup')
const zlib = require('zlib')

const builds = [
    {
        entry: 'src/main.js',
        dest: 'dist/bundle.js',
        format: 'umd',
        name: 'Mbundle',
        plugins: [
            babel({
                exclude: 'node_modules/**'
            })
        ]
    },
    {
        entry: 'src/main.js',
        dest: 'dist/bundle.min.js',
        format: 'umd',
        name: 'Mbundle',
        mini: true,
        plugins: [
            babel({
                exclude: 'node_modules/**'
            })
        ]
    }
]

function build(builds) {
    let built = 0
    const total = builds.length
    const next = () => {
      buildEntry(builds[built]).then(() => {
        built++
        if (built < total) {
          next()
        }
      }).catch(logError)
    }
  
    next()
}

function buildEntry(config) {
    const inputOptions = {
        input: config.entry,
        plugins: [
            babel({
                exclude: 'node_modules/**'
            })
        ]
    }
    const outputOptions = {
        file: config.dest,
        format: config.format,
        name: config.name
    }
    return rollup.rollup(inputOptions).then(async (bundle) => {
        const { code, map } = await bundle.generate(outputOptions)
        if(config.mini){
            var minified = uglify.minify(code)
            write(outputOptions.file, minified.code)
        }else{
            write(outputOptions.file, code)
        }
    })
}

function write(dest, code) {
    return new Promise((resolve, reject) => {
        fs.writeFile(dest, code, () => {
            zlib.gzip(code, () => {})
        })
    })
}

function logError(e) {
    console.log(e)
}

build(builds)
import {Bundle} from './bundle'
import {requireHook, Dependency} from './dependencies'
import {findFile} from './util'
import {patch} from './patching'
import fs from 'fs'
import path from 'path'

export class Package extends Bundle {
    constructor(name, parentBundle) {
        super(null, path.resolve(parentBundle.out_dirname ? parentBundle.out_dirname : '',
                                 'dependencies', name),
              { name: name, parentBundle: parentBundle, useBabel: false, usePolyfills: false })
    }

    locate() {
        this.src_dirname = findFile(path.join('node_modules', this.name),
                                    this.parentBundle.src_dirname)

        return this.exists
    }

    load() {
        if (!this.locate())
            return
        super.load()
        this.config = JSON.parse(fs.readFileSync(path.join(this.src_dirname, 'package.json'), 'utf8'))
    }

    patch(file) {
        patch(file, path.join(this.name, path.relative(this.src_dirname, file.src_filename)))
    }

    require(filename) {
        if (!filename)
            filename = this.main_filename
        return this.getFile(path.resolve(this.src_dirname, filename), { useBabel: filename.includes('src' ) })
    }

    get main_filename() {
        const filename = this.config['main']

        return filename ? filename : 'index.js'
    }

    get exists() {
        return !!this.src_dirname
    }

    static locate(name, parentBundle) {
        const module = new Package(name, parentBundle.parentBundle || parentBundle)

        if (!module.exists)
            return null

        return module
    }
}

export function requireModule(importPath, context) {
    if (importPath.startsWith('./') || importPath.startsWith('../'))
        return null

    let moduleName = importPath
    let filename = null

    if (importPath.includes('/')) {
        [moduleName, ...filename] = importPath.split('/')

        filename = filename[0] ? filename.join('/') + '.js' : null
    }

    if (moduleName.endsWith('.js'))
        throw new Error('Only npm packages are supported, not simple modules')

    const bundle = (context instanceof Bundle) ? context : context.bundle

    const module = Package.locate(moduleName, bundle)

    if (!module)
        return null

    const file = module.require(filename)

    // console.log(`Resolved "${importPath}" as npm module: ${context.relative(file.out_filename)}`)

    return new Dependency(`"${context.relative(file.out_filename)}"`, importPath, file)
}

requireHook(requireModule)

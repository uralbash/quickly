import QtQuick 2.3
import QtTest 1.0
import Quickly 0.1

TestCase {
    name: "PathTests"

    function test_delimiter() {
        compare(Paths.delimiter, ":")
    }

    function test_basename_without_ext() {
        compare(Paths.basename('/foo/bar/baz/asdf/quux.html'), 'quux.html')
    }

    function test_basename_with_ext() {
        compare(Paths.basename('/foo/bar/baz/asdf/quux.html', '.html'), 'quux')
    }

    function test_dirname() {
        compare(Paths.dirname('/foo/bar/baz/asdf/quux'), '/foo/bar/baz/asdf')
    }

    function test_extname_data() {
        return [
            { actual: 'index.html', expected: '.html' },
            { actual: 'index.coffee.md', expected: '.md' },
            { actual: 'index.', expected: '.' },
            { actual: 'index', expected: '' },
            { actual: '.index', expected: '' }
        ]
    }

    function test_extname(data) {
        compare(Paths.extname(data.actual), data.expected)
    }
}

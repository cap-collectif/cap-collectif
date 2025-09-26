const fs = require('fs')
const { parseString } = require('xml2js')
const xml2js = require('xml2js')

fs.readdir('./tests-results', (err, files) => {
  if (err) {
    return console.log(err)
  }
  files.forEach(file => {
    const filePath = `./tests-results/${file}`
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return console.log(err)
      }

      parseString(data, (err, xml) => {
        if (err) {
          return console.log(err)
        }

        if (!xml.testsuites.testsuite) {
          console.log(`Skip empty report: ${filePath}`)
          return
        }

        const firstSuite = xml.testsuites.testsuite[0]
        const baseFile = firstSuite.$ && firstSuite.$.file ? firstSuite.$.file : filePath

        xml.testsuites.testsuite = xml.testsuites.testsuite.filter(testsuite => {
          return testsuite.testcase && testsuite.testcase.length > 0
        })

        xml.testsuites.testsuite.forEach(testsuite => {
          testsuite.$ = testsuite.$ || {}
          if (!testsuite.$.file) {
            testsuite.$.file = baseFile
          }
        })

        const builder = new xml2js.Builder()
        const xmlOut = builder.buildObject(xml)
        fs.writeFile(filePath, xmlOut, err => {
          if (err) throw err
        })
      })
    })
  })
})

import cp from 'child_process'

const exec = async (command: string) => {
  return new Promise(resolve => {
    try {
      // @ts-ignore fixme
      cp.exec(command, { log: false, cwd: process.cwd() }, (err, stdout, stderr) => {
        if (err) {
          err.stdout = stdout
          err.stderr = stderr
          resolve({ error: err, stdout, stderr })
          return
        }

        resolve({ error: null, stdout, stderr })
      })
    } catch (e) {
      resolve({ error: e, stdout: '', stderr: '' })
    }
  })
}

export default exec

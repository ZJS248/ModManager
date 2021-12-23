import { exec } from 'child_process'
import fs from 'fs/promises'
/**
 * 执行cmd
 * @param cmd
 */
function execute(cmd: string) {
  return new Promise((resolve, reject) => {
    exec(cmd, { encoding: 'binary' }, (err, stdout, stderr) => {
      if (err) reject(new Error(`err:${err}`))
      else if (stderr) reject(new Error(`stderr:${stderr}`))
      else resolve(stdout)
    })
  })
}
const rar = {
  /**
   * 压缩文件
   * @param target 目标文件
   * @param outDir 输出目录+文件名
   */
  compress: async function (target: string, outDir: string) {
    const cmd = `rar a ${target} ${outDir} -y`
    try {
      await fs.access(outDir)
    } catch {
      await fs.mkdir(outDir)
    }
    return await execute(cmd)
  },
  /**
   * 解压文件
   * @param target 目标文件
   * @param outDir 输出目录
   */
  decompress: async function (target: string, outDir: string) {
    const cmd = `rar x ${target} ${outDir} -y`
    try {
      await fs.access(target)
      try {
        await fs.access(outDir)
      } catch {
        await fs.mkdir(outDir)
      }
      return await execute(cmd)
    } catch (e) {
      console.log(e)
      throw new Error('File needs compress not exist')
    }
  },
}
export default rar

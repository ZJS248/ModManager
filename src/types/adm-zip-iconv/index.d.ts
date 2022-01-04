declare module 'adm-zip-iconv' {
  import type AdmZip from 'adm-zip'
  class AdmZipIconV extends AdmZip {
    /**
     * @param fileNameOrRawData If provided, reads an existing archive. Otherwise creates a new, empty archive.
     */
    constructor(fileNameOrRawData?: string | Buffer, type?: string)
  }
  export = AdmZipIconV
}

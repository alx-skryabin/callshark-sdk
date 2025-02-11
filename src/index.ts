interface ISdkSk {
  hello: (name: string) => string
  get2x: (num: number) => number
  print: (text: string) => string
}

export function SDK_SK(): ISdkSk {
  return {
    hello: (name) => {
      const test = 'Hello'
      return `${test}, ${name}!`
    },
    get2x: (num) => {
      return num * 2
    },
    print: (text) => {
      return `PRINT: ${text}`
    }
  }
}

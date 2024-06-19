import { bundledLanguages, codeToHtml, bundledThemes } from 'shiki'
export const allLanguages = Object.keys(bundledLanguages)
export const langSet = new Set(allLanguages)
export const codeThemes = new Set(Object.keys(bundledThemes))

const themes: {
  light?: {
    codeBg: string
    codeDark: boolean
  }
  dark?: {
    codeBg: string
    codeDark: boolean
  }
} = {}

export const getCodeTheme = async (theme: string = '') => {
  if (theme.includes('dark')) {
    if (themes.dark) {
      return themes.dark
    }
  } else {
    if (themes.light) {
      return themes.light
    }
  }
  return bundledThemes[theme as keyof typeof bundledThemes]?.().then((res) => {
    const data = {
      codeBg: res.default.colors?.['editor.background'] || '',
      codeDark: res.default.type === 'dark'
    }
    themes[theme.includes('dark') ? 'dark' : 'light'] = data
    return data
  })
}

export const highlight = async (code: string, lang: string, theme: string) => {
  if (langSet.has(lang?.toLowerCase())) {
    return codeToHtml(code, {
      theme: theme,
      lang: lang
    })
  } else {
    return null
  }
}

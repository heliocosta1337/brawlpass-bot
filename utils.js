module.exports = {
  GetRandomNumber: (min, max) => {
    return Math.floor(Math.random() * (max - min) + min)
  },

  GetRandomPercentage: () => {
    return Math.floor(Math.random() * 100) + 1
  },

  GetRandomItemFromArray: arr => {
    return arr[Math.floor(Math.random() * arr.length)]
  },

  GetRandomSadEmoji: () => {
    return module.exports.GetRandomItemFromArray(['😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '😢', '😭', '😰', '😥', '😓', '😪'])
  },

  GetProgressBarImage: percentage => {
    if (percentage >= 90) return 'https://cdn.discordapp.com/attachments/831902713343246336/831903392409583666/90pct.png'
    if (percentage >= 80) return 'https://cdn.discordapp.com/attachments/831902713343246336/831903380523450378/80pct.png'
    if (percentage >= 65) return 'https://cdn.discordapp.com/attachments/831902713343246336/831903368451981312/65pct.png'
    if (percentage >= 50) return 'https://cdn.discordapp.com/attachments/831902713343246336/831903357853630475/50pct.png'
    if (percentage >= 40) return 'https://cdn.discordapp.com/attachments/831902713343246336/831903348792754196/40pct.png'
    if (percentage >= 1) return 'https://cdn.discordapp.com/attachments/831902713343246336/831903339746295808/20pct.png'

    return 'https://cdn.discordapp.com/attachments/831902713343246336/831903329897676820/0pct.png'
  },

  ParseNumber: (n, short) => {
    if ((!n && n != 0) || isNaN(n)) return '-'

    if (short && n != 0) {
      if (n >= 1000000000) return (n / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G'
      if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
      if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
      return n
    }

    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  },

  ParseDiscordName: name => {
    name = name.replace(/\*/g, '')
    name = name.replace(/_/g, '')
    name = name.replace(/`/g, '')

    return name
  },

  HumanizeMilliseconds: ms => {
    hours = Math.floor(ms % 86400000 / 3600000)
    minutes = Math.floor(ms % 3600000 / 60000)
    sec = Math.floor(ms % 60000 / 1000)

    let str = ''

    if (hours) str += `**${hours}** hours`
    if (minutes) str += `, **${minutes}** minutes`
    if (sec) str += ` and **${sec}** seconds`

    return str
  }
}
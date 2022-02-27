module.exports = {
  GetRandomNumber: (min, max) => {
    return Math.floor(Math.random() * (max - min) + min)
  },

  GetRandomItemFromArray: arr => {
    return arr[Math.floor(Math.random() * arr.length)]
  },

  GetRandomPercentage: () => {
    return Math.floor(Math.random() * 100) + 1
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

  GetRandomSadEmoji: () => {
    return module.exports.GetRandomItemFromArray(['😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '😢', '😭', '😰', '😥', '😓', '😪'])
  }
}
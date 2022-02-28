const Event = require('../structures/Event')


//Porting from MySQL to MongoDB code
const mysql = require('mysql') //TODO: uninstall mysql after port
const util = require('util')
const profileModel = require('../models/profile')
const seasonModel = require('../models/season')
const { GetRandomNumber, ParseDiscordName } = require('../../utils')


module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'ready'
    })
  }

  run = async () => {
    this.client.registerCommands()
    console.log(`Connected to Discord as "${this.client.user.tag}" in ${this.client.guilds.cache.size} servers.`)

/*
    //Porting from MySQL to MongoDB code
    const con = mysql.createConnection({
      host: process.env.dbHost,
      port: process.env.dbPort || 3306,
      user: process.env.dbUser,
      password: process.env.dbPass,
      database: process.env.bp_dbName,
      charset: 'utf8mb4'
    })
    const query = util.promisify(con.query).bind(con)

    const arrows = await query(`SELECT * FROM user`)

    for (let i = 0; i < arrows.length; i++) {
      if (arrows[i].id && arrows[i].name && !arrows[i].banned && arrows[i].matches > 0) {
        await profileModel.create({
          user_id: arrows[i].id,
          user_name: ParseDiscordName(arrows[i].name),
          user_avatar: `https://cdn.discordaparrows[i].com/embed/avatars/${GetRandomNumber(0, 5)}.png`,
          gems: (arrows[i].gems / 2).toFixed(0),
          matches: arrows[i].matches,
          wins: arrows[i].wins,
          kills: arrows[i].kills,
          damage: arrows[i].damge
        }).then(() => { console.log(arrows[i].id) })

        if (parseInt(arrows[i].tarasbazaar) > 0) {
          const season = await seasonModel.findOne({ name: 'Tara\'s Bazaar' })
          await season.updateOne({ $push: { players: { user_id: arrows[i].id, user_name: ParseDiscordName(arrows[i].name), quests: parseInt(arrows[i].tarasbazaar) } } }).catch(console.log)
        }

        if (parseInt(arrows[i].summerofmonsters) > 0) {
          const season = await seasonModel.findOne({ name: 'Summer of Monsters' })
          await season.updateOne({ $push: { players: { user_id: arrows[i].id, user_name: ParseDiscordName(arrows[i].name), quests: parseInt(arrows[i].summerofmonsters) } } })
        }

        if (parseInt(arrows[i].starrpark) > 0) {
          const season = await seasonModel.findOne({ name: 'Starr Park' })
          await season.updateOne({ $push: { players: { user_id: arrows[i].id, user_name: ParseDiscordName(arrows[i].name), quests: parseInt(arrows[i].starrpark) } } })
        }

        if (parseInt(arrows[i].snowtel) > 0) {
          const season = await seasonModel.findOne({ name: 'Snowtel' })
          await season.updateOne({ $push: { players: { user_id: arrows[i].id, user_name: ParseDiscordName(arrows[i].name), quests: parseInt(arrows[i].snowtel) } } })
        }

        if (parseInt(arrows[i].starrforce) > 0) {
          const season = await seasonModel.findOne({ name: 'Starr Force' })
          await season.updateOne({ $push: { players: { user_id: arrows[i].id, user_name: ParseDiscordName(arrows[i].name), quests: parseInt(arrows[i].starrforce) } } })
        }

        if (parseInt(arrows[i].goldarmgang) > 0) {
          const season = await seasonModel.findOne({ name: 'Goldarm Gang' })
          await season.updateOne({ $push: { players: { user_id: arrows[i].id, user_name: ParseDiscordName(arrows[i].name), quests: parseInt(arrows[i].goldarmgang) } } })
        }

        if (parseInt(arrows[i].jurassicsplash) > 0) {
          const season = await seasonModel.findOne({ name: 'Jurassic Splash' })
          await season.updateOne({ $push: { players: { user_id: arrows[i].id, user_name: ParseDiscordName(arrows[i].name), quests: parseInt(arrows[i].jurassicsplash) } } })
        }

        if (parseInt(arrows[i].onceuponabrawl) > 0) {
          const season = await seasonModel.findOne({ name: 'Once Upon a Brawl' })
          await season.updateOne({ $push: { players: { user_id: arrows[i].id, user_name: ParseDiscordName(arrows[i].name), quests: parseInt(arrows[i].onceuponabrawl) } } })
        }

        if (parseInt(arrows[i].brawlywood) > 0) {
          const season = await seasonModel.findOne({ name: 'Brawlywood' })
          await season.updateOne({ $push: { players: { user_id: arrows[i].id, user_name: ParseDiscordName(arrows[i].name), quests: parseInt(arrows[i].brawlywood) } } })
        }

        if (parseInt(arrows[i].yearofthetiger) > 0) {
          const season = await seasonModel.findOne({ name: 'Year of The Tiger' })
          await season.updateOne({ $push: { players: { user_id: arrows[i].id, user_name: ParseDiscordName(arrows[i].name), quests: parseInt(arrows[i].yearofthetiger) } } })
        }

        console.log(arrows[i].id)
      }
    }
    console.log('done')
*/
  }
}
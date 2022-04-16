const mongoose = require('mongoose')

require('dotenv').config()

const profileModel = require('./src/models/profile');

/*(async () => {
  await mongoose.connect(process.env.MONGO_SRV)
  const profiles = await profileModel.find()

  console.log('starting')

  for (const profile of profiles) {
    await profile.updateOne({ $set: { trophies: 0 } })
    console.log(profile.user_name)
  }

  console.log('done')
})()*/

(async () => {
  await mongoose.connect(process.env.MONGO_SRV)
  await profileModel.updateMany({ $set: { trophies: 0 } }).then(console.log)
})()
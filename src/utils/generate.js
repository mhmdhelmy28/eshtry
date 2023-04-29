const bcrypt = require('bcrypt')
const generateSecretCode = () => {
    return bcrypt.genSaltSync(10)
}

module.exports = generateSecretCode
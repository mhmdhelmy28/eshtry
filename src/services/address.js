const Address = require('../models/address')
async function addressExists(city, street, userId){
    const address = await Address.findOne({
        where: { city: city, street: street, UserId: userId },
    });
    return address !== null;
}

async function getAllAddresses(userId) {
    await Address.findAll({ where: { UserId: userId } });
}

async function findAddressByUserAndAddressId(addressId, userId){
    const address = await Address.findOne({ where: { id: addressId, UserId: userId } });
    return address;
}
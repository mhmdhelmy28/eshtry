const Address = require('../models/address');


class AddressService {

async addressExists(city, street, userId){
    const address = await Address.findOne({
        where: { city: city, street: street, UserId: userId },
    });
    return address !== null;
}
async createAddress(city, street, userId){
    return await Address.create({ city, street, UserId: userId });
}
async getAllAddresses(userId) {
   return await Address.findAll({ where: { UserId: userId } });
}

async findAddressByUserAndAddressId(addressId, userId){
    const address = await Address.findOne({ where: { id: addressId, UserId: userId } });
    return address;
}
}
module.exports = AddressService;
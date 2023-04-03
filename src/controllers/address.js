const ApiError = require("../utils/ApiError");
const AddressService = require('../services/address');
const addressService = new AddressService()
const createAddress = async (req, res, next) => {
    try {
        const { city, street } = req.body
        const userId = res.locals.userId
        if (!city || !street) return next(ApiError.badRequest("street and city are required."))

        const address = await addressService.addressExists(city, street, userId)
        if (address) return next(ApiError.badRequest("this address already exists"))

        const newAddress = await addressService.createAddress(city, street, userId)
        res.status(201).send(newAddress)
    } catch (error) {
        next(error)
    }
};

const getUserAdresses = async (req, res, next) => {
    try {
        const userId = res.locals.userId

        const userAddresses = await addressService.getAllAddresses(userId)
        res.status(200).send(userAddresses)
    } catch (error) {
        next(error)
    }
};

const getAddressById = async (req, res, next) => {
    try {
        const addressId = req.params.id
        const userId = res.locals.userId

        const address = await addressService.findAddressByUserAndAddressId(addressId, userId)
        if (!address) return next(ApiError.notFound("Address not found"))

        res.status(200).send(address)
    } catch (error) {
        console.error(error.message)
        next(error)
    }
};

const deleteAddressById = async (req, res, next) => {
    try {
        const addressId = req.params.id
        const userId = res.locals.userId

        const address = await addressService.findAddressByUserAndAddressId(addressId, userId)
        if (!address) return next(ApiError.notFound("Address not found"))
        await address.destroy()
        res.status(200).send({ message: "Address deleted successfully" })
    } catch (error) {
        next(error)
    }
};

module.exports = { createAddress, getUserAdresses, getAddressById, deleteAddressById };

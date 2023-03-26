


async function findUserByUsername(username){
    const user = await User.findOne({ where: { username: username } });
    return user;
}
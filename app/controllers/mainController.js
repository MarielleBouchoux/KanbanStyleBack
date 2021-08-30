module.exports = {
    error404: (_, response) => {
        response.status(404).json({error: `resource not found`});
    }
}
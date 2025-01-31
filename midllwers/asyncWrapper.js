module.exports = (AsyncFn) => {
    return (req, res, next) => {
        AsyncFn(req, res, next).catch((err) => {
            next(err)
        })
    }
}
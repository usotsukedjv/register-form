exports.function = requireAuth  (req, res, next)  {
    const token = req.cookies.token
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.id
    next()
};
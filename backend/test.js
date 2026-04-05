module.exports = {
  setupRequest: (req, context) => {
    const id = Math.floor(Math.random() * 1000000)

    req.method = 'POST'

    req.headers = {
      'Content-Type': 'application/json'
    }

    req.body = JSON.stringify({
      email: `test${id}@test.com`,
      password: "test123"
    })

    return req
  }
}
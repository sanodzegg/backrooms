const { sign, verify } = require("jsonwebtoken");

function parseCookies(request) {
  const list = {};
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(`;`).forEach(function (cookie) {
    let [name, ...rest] = cookie.split(`=`);
    name = name?.trim();
    if (!name) return;
    const value = rest.join(`=`).trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
}

const createTokens = (user) => {
  const accessToken = sign(
    { username: user.username, id: user.id },
    "uari-tkvi-daxmarebaze-da-iwvale-shenit-iyavi-kaci"
  );
  return accessToken;
};

const validateToken = (req, res, next) => {
  const cookies = parseCookies(req);
  const accessToken = cookies["access-token"];
  if (!accessToken) return res.redirect("/apn");
  try {
    const validToken = verify(
      accessToken,
      "uari-tkvi-daxmarebaze-da-iwvale-shenit-iyavi-kaci"
    );
    if (validToken) {
      req.authenticated = true;
      return next();
    }
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

module.exports = { createTokens, validateToken };

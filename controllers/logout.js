module.exports = (req, res) => {
  res.clearCookie("jwt_token", {
    httpOnly: true,
  });
  res.redirect("/login");
};

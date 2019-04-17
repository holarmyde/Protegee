if (process.env.NODE_ENV === "production") {
  module.exports = {
    mongoURI: "mongodb://aremu:oluwafemi1@ds017205.mlab.com:17205/protegee-dev"
  };
} else {
  module.exports = {
    mongoURI: "mongodb://aremu:oluwafemi1@ds017205.mlab.com:17205/protegee-dev"
  };
}

//module.exports = { mongoURI: "mongodb://localhost/protegeeft-dev" };

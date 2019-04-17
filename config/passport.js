const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const keys = require("./keys");

// Load user model
const User = mongoose.model("users");

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match User
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: "No User Found" });
        }

        // Match Password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password Incorrect" });
          }
        });
      });
    })
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: "/auth/google/callback",
        proxy: true
      },
      (accessToken, refreshToken, profile, done) => {
        console.log(accessToken);
        console.log(profile);

        const image = profile.photos[0].value.substring(
          0,
          profile.photos[0].value.indexOf("?")
        );
        console.log(image);

        const newUser = {
          googleID: profile.id,
          firstName: profile.name.givenName,

          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          image: image
        };

        //Check for Existing User
        User.findOne({
          googleID: profile.id
        }).then(user => {
          if (user) {
            //Return user
            done(null, user);
          } else {
            //Create user
            new User(newUser).save().then(user => done(null, newUser));
          }
        });
      }
    )
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};

import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { UserModel } from '../models/user.schema.js';

export function initPassport() {
  passport.use('current',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          (req) => req?.cookies?.jwt,
        ]),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (payload, done) => {
        try {
          // tu payload es { uid }
          const user = await UserModel.findById(payload.uid).lean();
          if (!user) return done(null, false);
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

export default passport;

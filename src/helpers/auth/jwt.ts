import { sign, SignOptions, verify, decode } from "jsonwebtoken";
import { serialize } from "cookie";
import { NextApiResponse } from "next";

const ISSUER = "meclayms.com";
const SECRET = "SECRET";

interface SignTokenConfig {
  // issuer: string;
  /**
   * @description Expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
   */
  expiresIn: string | number;
  // secret?: string;
}

interface SignRefreshTokenConfig extends SignTokenConfig {
  kind: "RefreshToken";
  count: number;
}
interface SignAccessTokenConfig extends SignTokenConfig {
  kind: "AccessToken";
  userId: string;
}

export function signToken(config: SignRefreshTokenConfig | SignAccessTokenConfig) {
  let { expiresIn, kind, ...rest } = config;
  let payload = {
    ...rest,
  };
  let options: SignOptions = {
    issuer: ISSUER,
    expiresIn,
  };
  return sign(payload, SECRET, options);
}

interface VerifyTokenConfig {
  token?: string;
  secret?: string;
}

export function decodeToken(config: VerifyTokenConfig): { userId: string } | null {
  let { token } = config;
  if (!token || token === "") {
    return null;
  }
  try {
    const verifiedToken = verify(token, SECRET);
    const decodedToken = decode(verifiedToken as string);
    if (typeof decodedToken !== "string" && decodedToken?.userId) {
      return {
        userId: decodedToken.userId,
      };
    }
    return null;
  } catch (error) {
    throw new Error(error);
  }
}

interface RefreshTokenConfig {
  count: number;
}

export function issueRefreshToken(res: NextApiResponse, config: RefreshTokenConfig) {
  const { count } = config;
  const refreshToken = signToken({
    kind: "RefreshToken",
    expiresIn: "15m",
    count,
  });

  res.setHeader(
    "Set-Cookie",
    serialize("refreshToken", String(refreshToken), {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 15),
      maxAge: 1000 * 60 * 15,
      secure: process.env.NODE_ENV === "production",
    })
  );
}

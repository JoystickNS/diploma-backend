import { CookieOptions } from "express";
import * as moment from "moment";
import configuration from "../config/configuration";

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  path: "auth",
};

const refreshTokenAliveTime = configuration().refreshTokenAliveTime;

export const calcTokenLifeTime = () => {
  return new Date(Date.now() + refreshTokenAliveTime);
};

// export const calcSemester = (startYear: number, endDate: moment.Moment) => {
//   const startDate = moment(`01.07.${startYear}`, "DD.MM.YYYY");
//   const diff = Math.abs(startDate.diff(endDate, "months"));
//   return Math.trunc(diff / 6) + 1;
// };

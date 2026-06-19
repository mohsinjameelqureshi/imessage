export const DB_NAME = "imessage_db";

export const OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

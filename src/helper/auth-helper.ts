import db from './db.js';

export async function doesUsernameExist(username: string): Promise<boolean> {
  const result = await db.user.findFirst({
    where: {
      username: username
    }
  });
  return result != undefined;
};

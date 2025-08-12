import mongoose, { type ClientSession } from "mongoose";

const startTransaction = async <K>(fn: (session: ClientSession) => Promise<K>): Promise<K> => {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      return await fn(session);
    });
  } finally {
    await session.endSession();
  }
}

export default startTransaction;
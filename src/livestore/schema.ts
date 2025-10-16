import { Events, makeSchema, Schema, SessionIdSymbol, State } from '@livestore/livestore'


export const tables = {
  messages: State.SQLite.table({
    name: 'messages',
    columns: {
        id: State.SQLite.integer({ primaryKey: true }),
        peerId: State.SQLite.text(),
        createdAt: State.SQLite.integer(),
        text: State.SQLite.json(),
        editedAt: State.SQLite.integer({ nullable: true}),
    },
  }),

  peers: State.SQLite.table({
    name: 'peers',
    columns: {
      id: State.SQLite.integer({ primaryKey: true }),
      name: State.SQLite.text(),
      lastName: State.SQLite.text(),
      username: State.SQLite.text(),
      peerId: State.SQLite.text(),
      unreadCount: State.SQLite.integer(),
      totalCount: State.SQLite.integer(),
      topMessageId: State.SQLite.integer(),
      lastSeenMessageId: State.SQLite.integer({ nullable: true}),
    },
  }),
}
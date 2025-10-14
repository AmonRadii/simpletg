import { Events, makeSchema, Schema, SessionIdSymbol, State } from '@livestore/livestore'


export const tables = {
  messages: State.SQLite.table({
    name: 'messages',
    columns: {
        id: State.SQLite.integer({ primaryKey: true }),
        peerId: State.Sqlite.text(),
        createdAt: State.Sqlite.integer(),
        text: State.Sqlite.json(),
        editedAt?: integer(),
    }
  })


  todos: State.SQLite.table({
    name: 'todos',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      text: State.SQLite.text({ default: '' }),
      completed: State.SQLite.boolean({ default: false }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  })
}
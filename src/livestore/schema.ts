import { Events, makeSchema, Schema, SessionIdSymbol, State } from '@livestore/livestore'
import { message } from 'telegram/client';


export const tables = {
  messages: State.SQLite.table({
    name: 'messages',
    columns: {
        // id = peerId/messageId
        // deleted messages should stay in the table and marked as deleted
        id: State.SQLite.text({ primaryKey: true }),
        messageId: State.SQLite.integer(),
        peerId: State.SQLite.text(),
        createdAt: State.SQLite.integer(),
        messageText: State.SQLite.json(),
        editedAt: State.SQLite.integer({ nullable: true}),
    },
  }),

  peers: State.SQLite.table({
    name: 'peers',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      name: State.SQLite.text(),
      lastName: State.SQLite.text(),
      username: State.SQLite.text(),
      unreadCount: State.SQLite.integer(),
      totalCount: State.SQLite.integer(),
      topMessageId: State.SQLite.integer(),
      lastSeenMessageId: State.SQLite.integer({ nullable: true}),
    },
  }),
}

const TextElement = Schema.Struct({
  text: Schema.String,
  bold: Schema.Boolean,
  italic: Schema.Boolean,
  underline: Schema.Boolean,
  url: Schema.optional(Schema.String)
})

type TextElement = typeof TextElement.Type;

const MessageText = Schema.Array(TextElement)

type MessageText = typeof MessageText.Type

export const events = {
  messageCreateRequest: Events.synced({
    name: 'v1.MessageCreateRequest',
    schema: Schema.Struct({
      messageId: Schema.Number,
      messageText: MessageText, 
      createdAt: Schema.Number,
      peerId: Schema.String   
    })
  }),
  messageCreated: Events.synced({
    name: 'v1.MessageCreated',
    schema: Schema.Struct({
      messageId: Schema.Number,
      messageText: MessageText,
      createdAt: Schema.Number,
      peerId: Schema.String
    })
  }),
  messageEditRequested: Events.synced({
    name: 'v1.MessageEditRequested',
    schema: Schema.Struct({
      messageId: Schema.Number,
      messageText: MessageText,
      createdAt: Schema.Number,
      peerId: Schema.String,
    })
  }),
  messageEdited: Events.synced({
    name: 'v1.MessageEdited',
    schema: Schema.Struct({
      messageId: Schema.Number,
      messageText: MessageText,
      createdAt: Schema.Number,
      peerId: Schema.String,
    })
  }),
  messageDeleteRequested: Events.synced({
    name: 'v1.MessageDeleteRequested',
    schema: Schema.Struct({
      messageId: Schema.Number,
      peerId: Schema.String,
      createdAt: Schema.Number,
    })
  }),
  messageDeleted: Events.synced({
    name: 'v1.MessageDeleted',
    schema: Schema.Struct({
      messageId: Schema.Number,
      peerId: Schema.String,
      createdAt: Schema.Number,
    })
  }),
  // todo message viewed event - how it is handled in telegram?
}


export const materializers = State.SQLite.materializers(events, {
  'v1.MessageCreateRequest': ({ messageId, messageText, createdAt, peerId }) => {
    return tables.messages.insert({ id: `${peerId}/${messageId}`, messageText, createdAt, peerId, messageId  })
  },
  'v1.MessageCreated': ({ messageId, messageText, createdAt, peerId }) => {
    return tables.messages.update({ id: `${peerId}/${messageId}`, messageText, createdAt, peerId }).where({
      id: `${peerId}/${messageId}`   
    })
  },
  'v1.MessageEditRequested': ({ messageId, messageText, createdAt, peerId }) => {
    return tables.messages.update({ messageText, editedAt: createdAt }).where({ id: `${peerId}/${messageId}` })
  },
  'v1.MessageEdited': ({ messageId, messageText, createdAt, peerId }) => {
    return tables.messages.update({ messageText, editedAt: createdAt }).where({ id: `${peerId}/${messageId}` })
  },
  'v1.MessageDeleteRequested': ({ messageId, peerId }) => {
    return tables.messages.delete().where({ id: `${peerId}/${messageId}` })
  },
  'v1.MessageDeleted': ({ messageId, peerId }) => {
    return tables.messages.delete().where({ id: `${peerId}/${messageId}` })
  },
})

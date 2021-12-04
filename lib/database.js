const sqlite3 = require('sqlite3').verbose() // FIXME

const NAME = "data.db"

// TODO implement table migrations once necessary

sqlite3.Database.prototype.runAsync = async function (sql, params) {
  const db = this;
  return new Promise((resolve, reject) => {
    db.run(sql, params, err => {
      if (err !== null) {
        reject(err);
        return
      }
      resolve();
    });
  });
};

sqlite3.Database.prototype.getAsync = async function (sql, params) {
  const db = this;
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err !== null) {
        reject(err);
        return
      }
      resolve(row);
    });
  });
};

sqlite3.Database.prototype.allAsync = async function (sql, params) {
  const db = this;
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err !== null) {
        reject(err);
        return
      }
      resolve(rows);
    });
  });
};

function open() {
  return new sqlite3.Database(NAME, err => {
    if (err) {
      throw err;
    }
  });
}

const handle = open();

function createTable(sql, callback) {
  handle.run(sql, err => {
    if (err) {
      if (!err.message.includes('already exists')) {
        throw err;
      }
    }
    callback();
  });
}

async function create() {
  return new Promise((resolve, reject) => {
    createTable(`
      CREATE TABLE "payment" (
        "id" INTEGER PRIMARY KEY,
        "timestamp_created" TEXT NOT NULL,
        "url_key" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "price_cents" INTEGER NOT NULL,
        "currency_code" TEXT NOT NULL,
        -- should be unique but I should be able
        -- to manage that without this system.
        "reference" TEXT NOT NULL, -- UNIQUE
        "paid" INTEGER NOT NULL DEFAULT 0,
        "archived" INTEGER NOT NULL DEFAULT 0
      );
    `, function () {
      createTable(`
        CREATE TABLE "admin" (
          "password_hash" TEXT NOT NULL
        );
      `, resolve);
    });
  });
}

module.exports = {
  handle,
  create
}

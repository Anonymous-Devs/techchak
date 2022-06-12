const config = require("./config");
const consola = require("consola");
const mongoose = require("mongoose");
let ip = require("default-gateway");
const { Pool } = require("pg");

class Database {
    static mongodb() {
        let retry = 0;
        try {
            ip = ip.v4.sync().gateway
        } catch (err) {
            ip = "0.0.0.0"
            consola.error(err.message)
        }
        const connect = async (conString, cert) => {

            consola.info('Initiating MongoDB connection...');

            return mongoose.connect(conString || config.mongodb_uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                sslKey: cert,
                sslCert: cert
            }, err => {
                if (err) {
                    if (retry !== 3) {
                        retry++;
                        if (retry > 1) consola.info("Retrying again in 5 seconds...");
                        else consola.info("Retrying in 5 seconds...");
                        setTimeout(() => connect(conString || config.mongodb_uri), 5000);
                    } else {
                        consola.error("Failed to connect to MongoDB Atlas.");
                        consola.info("Attempting to connect locally...");
                        setTimeout(() => connect(config.mongodb_uri), 3000);
                    }
                } else consola.success(`Mongodb connected successfully from ${ip} 🚀`);
            });

        };
        return {
            connect
        };
    }

    static postgres(config = {}) {
        const pool = new Pool({
            user: config.pg_user,
            host: config.pg_host,
            database: config.pg_database,
            password: config.pg_password,
            port: config.pg_port
        });

        const testConnection = async() => {
            consola.info('Initiating Postgres connection...');
            return pool.connect()
                .then(() => consola.success(`Postgres connected successfully from ${ip} 🚀`))
                .catch(err => consola.error(err.message));
        }

        const testPoolConnection = async() => {
            pool.query('SELECT NOW()', (err, res) => {
                consola.info('Testing pool connection...');
                if (err) consola.error(err.message);
                const now = res.rows[0].now;
                consola.success(new Date(now).toLocaleString());
            });
        }
        return { pool, testConnection, testPoolConnection }
    }
}


module.exports = Database.mongodb();
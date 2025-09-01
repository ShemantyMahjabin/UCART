const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const cns = {
    /*user: "mim",
    password: "mimisbest",
    connectString: "localhost/orcl"*/
    /*user: "PROJECTDATABASE",
    password: "123",
    connectString: "localhost/orcl"*/
    /*
    user: "PROJECTDATABASE",
    password: "123",
    connectString: "localhost/orcl"
    */
};
async function DB(sql, params, autoCommit) {
    let connection ;
    try {
        connection = await oracledb.getConnection(cns);
        console.log("Successfully connected to the database");

        // Make sure to replace sql with your actual SQL statement
        const options = { autoCommit: autoCommit };

        let result;
        if (params && params.length > 0) {
            // Use bind variables if params is provided
            result = await connection.execute(sql, params, options);
        } else {
            // Execute without bind variables if params is not provided
            result = await connection.execute(sql, options);
        }

        await connection.close();
        return result;
    } catch (err) {
        console.error(err);
    }
}

module.exports = DB;

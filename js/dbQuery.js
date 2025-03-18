export class DBQuery{
    static #dbConnectorUrl = "https://shannaway06.webhosting1.eeecs.qub.ac.uk/dbConnector.php";    //Change to point to the group DB dbConnector file.

    static #dbConfig = new URLSearchParams({     //Update this with database credentials.
        hostname: 'localhost',
        username: 'shannaway06',
        password: 'PVhrKC3P89B12Zbb',
        database: 'CSC1034_CW_39',
    });

    //Method for DB Queries, returns result, or null if there was no result
    static async getQueryResult(query){
        //sets the query property in the #dbConfig to the passed query
        this.#dbConfig.set('query', query);

        try {
            //send the query to the database
            let response = await fetch(dbConnectorUrl, {
                method: "POST",
                body: dbConfig
            });
            let result = await response.json(); //stores the query result and parses it into a JavaScript object

            //checks if the result has been recieved properly, outputs the appropriate error message if not
            if(!result.success){
                console.error("Query error for: ", query)
            }

            //returns the result
            return result;
        } catch (error) {
            console.error("Query Error:", error);
        }
    }
    
}
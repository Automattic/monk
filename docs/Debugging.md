# Query debugging

* If you wish to see what queries `monk` passes to the driver, simply leverage
  [debug](http://github.com/visionmedia/debug):

  ```bash
  DEBUG="monk:queries" npm start
  ```

* To see all debugging output from monk:

  ```bash
  DEBUG="monk:*" npm start
  ```
  
* You can also see the output from the mongo driver using `debug`:

  ```bash
  DEBUG="mongo:*" npm start
  ```
  
  There are several separated features available on this namespace:

    * Db: The Db instance log statements
    * Server: A server instance (either standalone, a mongos or replicaset member)
    * ReplSet: Replicaset related log statements
    * Mongos: Mongos related log statements
    * Cursor: Cursor log statements
    * Pool: Connection Pool specific log statements
    * Connection: Singular connection specific log statements
    * Ping: Replicaset ping inquiry log statements
    
  To see the output of only one of those features:
  
  ```bash
  DEBUG="mongo:Cursor" npm start // will only print the Cursor log statements
  ```

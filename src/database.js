var connConfig = null;
import mysql from 'mysql';

var freeIndexInPositionsTable = 0;

class TransportDatabase {
    static async useConnection(conn){
      connConfig = conn;

      let index = await TransportDatabase.getNextFreeIndexInPositionsTable();
      await TransportDatabase.getNextFreeIndexInPositionsTable();//...
      freeIndexInPositionsTable = (index == null) ? 0 : index + 1
      console.log("freeIndexInPositionsTable = "+freeIndexInPositionsTable);
    }
    constructor(){
        throw new Error("TransportDatabase is a static class!");
    }
    static async getPositionsArchive(){
      //...
      return await executeQuery("SELECT * from gps_positions_archive");
    }
    static async getNextFreeIndexInPositionsTable(){
      const results = await executeQuery("SELECT MAX(position_id) FROM gps_positions_archive AS solution");
      console.log(results[0]);
      console.log(results[0].solution);
      return results[0].solution;
    }
    static async pushPositionsInPositionsTable(positions){
      if (positions == null || positions.length === 0) return;
      let request = "INSERT INTO gps_positions_archive(position_id, previous_position_id, next_position_id, lat, lng, vehicle_id, date, day_of_week, time_seconds, route_id, way_id, trip_id) VALUES";

      for(let i = 0, n = positions.length, currentItem = positions[0]; i < n; currentItem = positions[++i]){
        request += " ("
        + currentItem.positionId + ", "
        + (currentItem.previousPositionId == null ? "\"null\"" : currentItem.previousPositionId) + ", "
        + (currentItem.nextPositionId == null ? "\"null\"" : currentItem.nextPositionId) + ", "
        + currentItem.lat + ", "
        + currentItem.lng + ", "
        + (currentItem.vehicleId == null ? "\"null\"" : currentItem.vehicleId) + ", "
        + "\"" + currentItem.dateDDMMYY + "\", "
        + currentItem.dayOfWeek + ", "
        + currentItem.timeSeconds + ", "
        + (currentItem.routeId == null ? "\"null\"" : currentItem.routeId) + ", "
        + (currentItem.wayId == null ? "\"null\"" : currentItem.wayId) + ", "
        + (currentItem.tripId == null ? "\"null\"" : currentItem.tripId)
        + "),";
      }
      request = request.slice(0, -1);
      console.log(request);

      let results = await executeQuery(request);
      console.log(results);
      //...
    }
}

async function executeQuery(query){
  let connection = null;
  try{
    connection = mysql.createConnection(connConfig)
    connection.connect();
    var promise = new Promise(function (resolve, reject) {
      connection.query(query, function (error, results, fields) {
        if (error) reject(error);
        console.log(results);
        resolve(results);
      });
    });
    return await promise;
  }
  catch(e){
    console.log(e);
    return null;
  }
  finally{
    if(connection != null) connection.end();
  }
}

export default TransportDatabase;
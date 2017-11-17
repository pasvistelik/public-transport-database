var connection = null;

var freeIndexInPositionsTable = 0;

class TransportDatabase {
    async useConnection(conn){
      connection = conn;
      await getNextFreeIndexInPositionsTable()
    }
    constructor(){
        throw new Error("TransportDatabase is a static class!");
    }
    async getPositionsArchive(){
      //...
      return await executeQuery("SELECT * from gps_positions_archive");
    }
    async getNextFreeIndexInPositionsTable(){
      const result = await executeQuery("SELECT MAX(position_id) FROM gps_positions_archive");
      console.log(result);
      return result;
    }
    async pushPositionsInPositionsTable(positions){
      let request = "INSERT INTO gps_positions_archive(position_id, previous_position_id, next_position_id, lat, lng, vehicle_id, date, day_of_week, time_seconds, route_id, way_id, trip_id) VALUES";

      for(let i = 0, n = positions.length, currentItem = positions[0]; i < n; currentItem = positions[++i]){
        request += " ("
        + currentItem.positionId + ", "
        + currentItem.previousPositionId + ", "
        + currentItem.nextPositionId + ", "
        + currentItem.lat + ", "
        + currentItem.lng + ", "
        + (currentItem.vehicleId == null ? null : currentItem.vehicleId) + ", "
        + "\"" + currentItem.dateDDMMYY + "\", "
        + currentItem.dayOfWeek + ", "
        + currentItem.timeSeconds + ", "
        + (currentItem.routeId == null ? null : currentItem.routeId) + ", "
        + (currentItem.wayId == null ? null : currentItem.wayId) + ", "
        + (currentItem.tripId == null ? null : currentItem.tripId) + ", "
        + "),";
      }
      request = request.slice(0, -1);

      await executeQuery(request);
    }
}

async function executeQuery(query){
  try{
    connection.connect();
    var promise = new Promise(function (resolve, reject) {
      connection.query(query, function (error, results, fields) {
        if (error) throw error;
        console.log(results);
        resolve(results);
      });
    });
    return await promise;
  }
  catch(e){
    console.log(e);
  }
  finally{
    connection.end();
  }
}

export default TransportDatabase;
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const serviceAccount = {
  type: "service_account",
  project_id: "bus-stops-2a227",
  private_key_id: "2",
  private_key:
    "privatekey",
  client_email:
    "firebase-adminsdk-emv4k@bus-stops-2a227.iam.gserviceaccount.com",
  client_id: "101005590240928972866",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-emv4k%40bus-stops-2a227.iam.gserviceaccount.com",
};
const alasql = require('alasql');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
function uniq(a) {
  let seen = {};
  return a.filter(function (item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}
// $ = function argument
function select_$1_from_$2_where_$3_equals_$4(target, collection, attribute, value) {
  return new Promise((resolve) => {
    db.collection(collection)
      .where(attribute, "==", value)
      .get()
      .then((data) => {
        // res.send(data)
        let values = [];
        data.forEach((doc) => {
          values.push(doc.data()[target]);
        });
        // console.log("values:");
        // console.log(values);
        resolve(values);
      });
  });
}
async function select_$1_from_$2_where_$3_in_$4(target, collection, attribute, value_list) {
  promises = [];
  const collectionPath = db.collection(collection);

  while (value_list.length) {
    // firestore limitation on "in" query is a list of 10
    // firestore limits batches to 10
    const batch = value_list.splice(0, 10);

    // add the batch request to to a queue
    promises.push(
      collectionPath
        .where(
          attribute,
          'in',
          [...batch]
        )
        .get()
        .then(results => results.docs.map(result => ({ /* id: result.id, */ ...result.data() })))
    )
  }

  // after all of the data is fetched, return it
  return Promise.all(promises)
    .then(content => content.flat().map(e => e[target]));
}
async function select_$0_and_$1_from_$2_where_$3_in_$4(target0, target1, collection, attribute, value_list) {
  promises = [];
  const collectionPath = db.collection(collection);

  while (value_list.length) {
    // firestore limitation on "in" query is a list of 10
    // firestore limits batches to 10
    const batch = value_list.splice(0, 10);

    // add the batch request to to a queue
    promises.push(
      collectionPath
        .where(
          attribute,
          'in',
          [...batch]
        )
        .get()
        .then(results => results.docs.map(result => ({ /* id: result.id, */ ...result.data() })))
    )
  }
  const select_2 = (obj) => {
    return { [target0]: obj[target0], [target1]: obj[target1] }
  }
  // after all of the data is fetched, return it
  return Promise.all(promises)
    .then(content => content.flat().map(select_2));
}
function join1(time_plus_stop_id, stop_id_list) {
  var db_ala = new alasql.Database();
  db_ala.exec("CREATE TABLE table1 (arrival_time VARCHAR(16), stop_id VARCHAR(16))");
  db_ala.exec("CREATE TABLE table2 ( stop_id VARCHAR(16))");
  db_ala.tables.table1.data = time_plus_stop_id;
  list = []

  stop_id_list.forEach(element => {
    list.push({ "stop_id": element })
  });
  db_ala.tables.table2.data = list
  var res = db_ala.exec("select * from table1 join table2 ON table1.stop_id = table2.stop_id")
  // console.log(res)

  return res
}
function join2(joined, table_table) {
  var db_ala = new alasql.Database();
  db_ala.exec("CREATE TABLE table1 (arrival_time VARCHAR(16), stop_id VARCHAR(16))");
  db_ala.exec("CREATE TABLE table2 ( stop_id VARCHAR(16), stop_desc VARCHAR(16))");
  db_ala.tables.table1.data = joined;
  db_ala.tables.table2.data = table_table
  var res = db_ala.exec("select * from table1 join table2 ON table1.stop_id = table2.stop_id")
  // console.log(res)

  return res
}
async function get_coords_data(stop_lat, stop_lon) {
  return new Promise((resolve) => {
    db.collection("stops")
      .where("stop_lat", "==", stop_lat)
      .where("stop_lon", "==", stop_lon)
      .get()
      .then((data) => {
        // res.send(data)
        let values = [];
        data.forEach((doc) => {
          values.push(doc.data());
        });
        // console.log("values:");
        // console.log(values);
        const select_mapping = (obj) => {
          return { stop_area: obj["stop_area"], stop_name: obj["stop_name"], stop_lat: obj["stop_lat"], stop_lon: obj["stop_lon"] }
        }
        let table = values.map(select_mapping)
        resolve(table);
      });
  });
}
//-----------------------------------------------------------------------------------------------------------



async function main() {
  let route_id_list = await select_$1_from_$2_where_$3_equals_$4("route_id", "routes", "route_short_name", "29");
  let trip_id_list = await select_$1_from_$2_where_$3_in_$4("trip_id", "trips", "route_id", route_id_list);
  let time_plus_stop_id = await select_$0_and_$1_from_$2_where_$3_in_$4("arrival_time", "stop_id", "stop_times", "trip_id", trip_id_list)
  let stop_id_list = await select_$1_from_$2_where_$3_equals_$4("stop_id", "stops", "stop_name", "Ahtme kaubakeskus");
  let joined = join1(time_plus_stop_id, stop_id_list)
  db.collection("stops")
    .get()
    .then((data) => {
      let values = [];
      data.forEach((doc) => {
        values.push(doc.data());
      });
      const select_mapping = (obj) => {
        return { stop_desc: obj["stop_desc"], stop_id: obj["stop_id"] }
      }
      let table = values.map(select_mapping)
      let result = join2(joined, table)
      console.log(result)
    });
}
main()

















  // let route_id_list = await select_$1_from_$2_where_$3_equals_$4("route_id", "routes", "route_short_name", "29");
  // let trip_id_list = await select_$1_from_$2_where_$3_in_$4("trip_id", "trips", "route_id", route_id_list);
  // // let route_id_list = await select_$1_from_$2_where_$3_in_$4( "route_id", "trips", "trip_id", trip_id_list );
  // // let route_short_name_list = await select_$1_from_$2_where_$3_in_$4("route_short_name", "routes", "route_id", route_id_list);
  // let time_plus_stop_id = await select_$0_and_$1_from_$2_where_$3_in_$4("arrival_time", "stop_id", "stop_times", "trip_id", trip_id_list)
  // let stop_id_list = await select_$1_from_$2_where_$3_equals_$4("stop_id", "stops", "stop_name", "Ahtme kaubakeskus");
  // let joined = join1(time_plus_stop_id, stop_id_list)
  // //(select stop_desc, stop_id from alexander_rassadin_stops)

  // db.collection("stops")
  //   .get()
  //   .then((data) => {
  //     let values = [];
  //     data.forEach((doc) => {
  //       values.push(doc.data());
  //     });
  //     const select_2 = (obj) => {
  //       return { stop_desc: obj["stop_desc"], stop_id: obj["stop_id"] }
  //     }
  //     let table = values.map(select_2)
  //     let result = join2(joined, table)
  //     console.log(result)
  //   });
  // console.log("equsl");
  // console.log(joined);
  // console.log("====================================");























// let cond_in  = select_$1_from_$2_where_$3_condition$4_$5("stop_name", "stops", "stop_area", "==", "Muhu vald")

// app.listen(3013, function () {
//   console.log("Server is running on http://localhost:3012");
// });

// app.get("/", function (req, res) {
//   res.send("Hello, stranger!");
//   console.log("root reached");
// });
// app.get("/get_stop_areas", function (req, res) {
//   const sql = "select stop_area from alexander_rassadin_stops;";
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     res.send(result);
//   });
// });

// app.get("/get_bus_stops_names_from/:area", function (req, res) {
//   const sql =
//     'select stop_name from alexander_rassadin_stops where stop_area = "' +
//     req.params.area +
//     '";';
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     res.send(result);
//   });
// });
// route_short_name <- stop_name
// stop_name-input -> stop_id-list -> stop_times records that have stop_id: in stop_id-list; select trip_id-list from records
//  trips records that had trip_id: in trip_id-list; select route_id-list from them
// app.get("/get_bus_names_from/:stop_name", function (req, res) {
//   const sql =
    // `select route_short_name from alexander_rassadin_routes
    //   where route_id in
    //     (select route_id from alexander_rassadin_trips
    //       where trip_id in
    //         (select trip_id from alexander_rassadin_stop_times
    //           where stop_id in
    //             (select stop_id from alexander_rassadin_stops
    //                where stop_name = "` +
    // req.params.stop_name +
    // `"
    //                  group by stop_id) group by trip_id))`;
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     res.send(result);
//   });
// });
// app.get(
//   "/get_stopBus_times_join_stop_desc_from/:stop_name/:route_short_name",
//   function (req, res) {
//     const sql =
//       `select arrival_time, stop_desc from (
//       select alexander_rassadin_stop_times.arrival_time, stop_id from alexander_rassadin_stop_times
//             where trip_id in
//               (select trip_id from alexander_rassadin_trips
//                 where trip_id in
//                   (select trip_id from alexander_rassadin_trips
//                     where route_id in
//                       (select route_id from alexander_rassadin_routes
//                          where route_short_name = "` +
//       req.params.route_short_name +
//       `"
//                        )
//                   )
//                )
//             and alexander_rassadin_stop_times.stop_id in (select stop_id from alexander_rassadin_stops
//               where stop_name = "` +
//       req.params.stop_name +
//       `")
//       ) as table1
//       inner join (select stop_desc, stop_id from alexander_rassadin_stops) as table2 on table1.stop_id = table2.stop_id;`;
//     con.query(sql, function (err, result) {
//       if (err) throw err;
//       res.send(result);
//     });
//   }
// );

// app.get("/get_stop_lat_and_stop_lon", function (req, res) {
//   const sql = "select stop_lat, stop_lon from alexander_rassadin_stops;";
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     res.send(result);
//   });
// });

// app.get(
//   "/get_bus_stop_area_and_stop_name_from/:stop_lat/:stop_lon",
//   function (req, res) {
//     const sql =
//       'select stop_name, stop_area from alexander_rassadin_stops where stop_lat= "' +
//       req.params.stop_lat +
//       '" and stop_lon = "' +
//       req.params.stop_lon +
//       '" ';
//     con.query(sql, function (err, result) {
//       if (err) throw err;
//       res.send(result);
//     });
//   }
// );

// test_collection.forEach((doc) => {
//   console.log(doc.data());
// });
// const allCapitalsRes = await colRef.where('route_id', '==', "1230247").get();

/*
// const admin = require("firebase-admin");
import { initializeApp } from "firebase/app";
// import { getDatabase, ref, child, get } from "firebase/database";
// admin.initializeApp();

import { getDatabase, ref, onValue } from "firebase/database";
const firebaseConfig = {
  // ...
  // The value of `databaseURL` depends on the location of the database
  databaseURL: "https://bus-stops-2a227-stop-times.firebaseio.com/",
};
function select_arg_from_arg_where_arg_equals_arg(
  target_key,
  table,
  condition_key,
  condition_value
) {
  let all_selection = table.filter(function (obj) {
    return obj[condition_key] == condition_value;
  });
  let values = [];
  all_selection.forEach((obj) => {
    values.push(obj[target_key]);
  });

  return values;
}
const app_firebase = initializeApp(firebaseConfig);
const db = getDatabase(app_firebase);
let ass = () => {
  return onValue(
    ref(db, "/"),
    (snapshot) => {
      const table = snapshot.val();
      console.log(
        select_arg_from_arg_where_arg_equals_arg(
          "trip_id",
          table["stops"],
          "stop_id",
          "13090"
        )
      );
      // ...
    },
    {
      onlyOnce: true,
    }
  );
};

ass();
*/
// const dbRef = ref(getDatabase(app_firebase));
// get(child(dbRef, `trips`))
//   .then((snapshot) => {
//     if (snapshot.exists()) {
//       const trips = snapshot.val();
//       console.log(
//         select_arg_from_arg_where_arg_equals_arg(
//           "trip_id",
//           trips,
//           "route_id",
//           "99fa5b535855c9bd925ac9d2b5d6b481"
//         )
//       );
//     } else {
//       console.log("No data available");
//     }
//   })
//   .catch((error) => {
//     console.error(error);
//   });
// dbRef.once("trips", (data) => {
//   console.log(data);
// });

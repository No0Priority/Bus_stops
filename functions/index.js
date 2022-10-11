const express = require("express");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const alasql = require('alasql');

//-=-=-=-=-=-=-=-=-=-=-=-= INIT -=-=-=-=-=-=-=-=--=-=-=-=-=-=-
const serviceAccount = {
  "type": "service_account",
  "project_id": "bus-stops-2a227",
  "private_key_id": "private_key",
  "private_key": "privatekey",
  "client_email": "firebase-adminsdk-emv4k@bus-stops-2a227.iam.gserviceaccount.com",
  "client_id": "101005590240928972866",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-emv4k%40bus-stops-2a227.iam.gserviceaccount.com"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const app = express();
// app.use(function (request, response, next) {
//   response.append("Access-Control-Allow-Origin", "https://bus-stops-2a227.web.app/");
//   response.append("Access-Control-Allow-Methods", "GET");
//   response.append("Access-Control-Allow-Headers", "Content-Type");
//   response.append("Content-Type", "application/json");
//   next();
// });
const cors = require("cors");
app.use(cors({ origin: '*' }));
// app.use(function (req, res, next) {

//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', 'https://us-central1-bus-stops-2a227.cloudfunctions.net/app/');

//   // Request methods you wish to allow
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//   // Request headers you wish to allow
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', true);

//   // Pass to next layer of middleware
//   next();
// });
// const firebaseConfig = {
//   apiKey: "AIzaSyAk5dhgr7Pz_st3ZkXd5eugIZpYOzCIWts",
//   authDomain: "bus-stops-2a227.firebaseapp.com",
//   databaseURL:
//     "https://bus-stops-2a227-default-rtdb.europe-west1.firebasedatabase.app",
//   projectId: "bus-stops-2a227",
//   storageBucket: "bus-stops-2a227.appspot.com",
//   messagingSenderId: "311843122851",
//   appId: "1:311843122851:web:3d63560ad537f9af735916",
// };
app.use(express.json());

// initializeApp(firebaseConfig)
const db = admin.firestore();
exports.app = functions.https.onRequest(app);

//-------------------------------------------------------------

//-=-=-=-=-=-=-=-=-=-=-=-= DATA FUNCTIONS -=-=-=-=-=-=-=-=--=-=-=-=-=-=-
function uniq(a) {
  let seen = {};
  return a.filter(function (item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
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

async function get_bus_names_from_stop_name(stop_name, res) {
  const stop_id_list = await select_$1_from_$2_where_$3_equals_$4("stop_id", "stops", "stop_name", stop_name);
  const trip_id_list = await select_$1_from_$2_where_$3_in_$4("trip_id", "stop_times", "stop_id", stop_id_list);
  const route_id_list = await select_$1_from_$2_where_$3_in_$4("route_id", "trips", "trip_id", trip_id_list);
  const route_short_name_list = await select_$1_from_$2_where_$3_in_$4("route_short_name", "routes", "route_id", route_id_list);
  res.send(uniq(route_short_name_list))
}
async function get_bus_stops_names_from_area(area, res) {
  const bus_stop_list = await select_$1_from_$2_where_$3_equals_$4("stop_name", "stops", "stop_area", area);
  res.send(uniq(bus_stop_list))
}
async function get_stopBus_times_join_stop_desc_from_stop_name_route_short_name(stop_name, route_short_name, res) {
  let route_id_list = await select_$1_from_$2_where_$3_equals_$4("route_id", "routes", "route_short_name", route_short_name);
  let trip_id_list = await select_$1_from_$2_where_$3_in_$4("trip_id", "trips", "route_id", route_id_list);
  let time_plus_stop_id = await select_$0_and_$1_from_$2_where_$3_in_$4("arrival_time", "stop_id", "stop_times", "trip_id", trip_id_list)
  let stop_id_list = await select_$1_from_$2_where_$3_equals_$4("stop_id", "stops", "stop_name", stop_name);
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
      res.send(result)
    });
}
// Need to refactor using .where().where(); nested queries instead of alasql joins???
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
function join2(joined, table) {
  var db_ala = new alasql.Database();
  db_ala.exec("CREATE TABLE table1 (arrival_time VARCHAR(16), stop_id VARCHAR(16))");
  db_ala.exec("CREATE TABLE table2 ( stop_id VARCHAR(16), stop_desc VARCHAR(16))");
  db_ala.tables.table1.data = joined;
  db_ala.tables.table2.data = table
  var res = db_ala.exec("select * from table1 join table2 ON table1.stop_id = table2.stop_id")
  // console.log(res)

  return res
}
//-------------------------------------------------------------


app.get("/", function (req, res) {
  res.send("Hello, stranger!");
  console.log("root reached");
});

app.get("/test", function (req, res) {
  main(res);
});

app.get("/get_stop_areas", function (req, res) {
  db.collection('stops')
    .get()
    .then((data) => {
      let values = []
      data.forEach(doc => {
        values.push(doc.data()["stop_area"])
      });
      res.send(uniq(values))
    })
});
app.get("/get_bus_stops_names_from/:area", function (req, res) {
  get_bus_stops_names_from_area(req.params.area, res)
});
app.get("/get_bus_names_from/:stop_name", function (req, res) {
  get_bus_names_from_stop_name(req.params.stop_name, res)
});
app.get("/get_stopBus_times_join_stop_desc_from/:stop_name/:route_short_name",
  function (req, res) {
    get_stopBus_times_join_stop_desc_from_stop_name_route_short_name(req.params.stop_name, req.params.route_short_name, res)
  })
app.get("/get_stop_lat_and_stop_lon", function (req, res) {
  const sql = "select stop_lat, stop_lon from alexander_rassadin_stops;";
  db.collection("stops")
    .get()
    .then((data) => {
      let values = [];
      data.forEach((doc) => {
        values.push(doc.data());
      });
      const select_mapping = (obj) => {
        return { stop_lat: obj["stop_lat"], stop_lon: obj["stop_lon"] }
      }
      let table = values.map(select_mapping)
      res.send(table)
    });
});


app.get("/get_bus_stop_area_and_stop_name_from/:stop_lat/:stop_lon",
  function (req, res) {
    db.collection("stops")
      .where("stop_lat", "==", req.params.stop_lat)
      .where("stop_lon", "==", req.params.stop_lon)
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
          return { stop_area: obj["stop_area"], stop_name: obj["stop_name"] }
        }
        let result = values.map(select_mapping)
        res.send(result);
      });
  }
);

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
// app.get("/get_bus_names_from/:stop_name", function (req, res) {
//   const sql =
//     `select route_short_name from alexander_rassadin_routes
//       where route_id in
//         (select route_id from alexander_rassadin_trips
//           where trip_id in
//             (select trip_id from alexander_rassadin_stop_times
//               where stop_id in
//                 (select stop_id from alexander_rassadin_stops
//                    where stop_name = "` +
//     req.params.stop_name +
//     `"
//                      group by stop_id) group by trip_id))`;
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

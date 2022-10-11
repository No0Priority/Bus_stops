stop_areas_arr = [];
const SERVER = "https://us-central1-bus-stops-2a227.cloudfunctions.net/app/";
function uniq(a) {
  let seen = {};
  return a.filter(function (item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}
function populate_dropdown(arr, div_id, input_id, tag_name) {
  var dropdown_div = document.getElementById(div_id);
  if (dropdown_div) {
    dropdown_div.innerHTML = "";
  }
  arr.forEach((arr_element) => {
    //console.log(arr_element)
    let dropdown_option = document.createElement(tag_name);
    dropdown_option.innerHTML = arr_element;
    dropdown_option.className = "dropdown-item";
    dropdown_option.style.display = "none";
    dropdown_option.onclick = function () {
      let inner_input = document.getElementById(input_id);
      inner_input.value = arr_element;
    };
    dropdown_div.appendChild(dropdown_option);
  });
}
function filterFunction(div_id, input_id) {
  var input, filter, a;
  input = document.getElementById(input_id);
  filter = input.value.toUpperCase();
  div = document.getElementById(div_id);
  a = div.getElementsByTagName("a");
  let options_amount = 10;
  for (let i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      options_amount--;
      if ((txtValue = "" || txtValue == "--")) {
        continue;
      }
      if (options_amount <= 0) {
        a[i].style.display = "none";
      } else {
        a[i].style.display = "";
      }
    } else {
      a[i].style.display = "none";
    }
    // if (i > 10) {
    //     a[i].style.display = "none";
    // }
  }
}
function open_input_and_dropdown(
  arr_to_show,
  dropdown_area_id,
  input_id,
  dropdown_element_tag
) {
  // document.getElementById(dropdown_area_id).classList.add("show");
  populate_dropdown(
    uniq(arr_to_show),
    dropdown_area_id,
    input_id,
    dropdown_element_tag
  );
}
setTimeout(get_areas, 1);
page_onload();

async function arr_from_db_data(fetch_address) {
  document.getElementById("loading").style.display = "block";
  const result = await fetch(fetch_address);
  const text = await result.text();
  document.getElementById("loading").style.display = "none";

  return JSON.parse(text);
}
async function get_areas() {
  const data = await arr_from_db_data(SERVER + "get_stop_areas");
  // let stop_area_arr = data.map((e) => e.stop_area);
  let stop_area_arr = data;
  stop_area_arr = stop_area_arr.sort();
  open_input_and_dropdown(stop_area_arr, "Dropdown_areas", "areas_input", "a");
}
async function get_bus_stops_names_from_area(stop_area) {
  document.getElementById("areas_input").value = stop_area;
  console.log("stop_area: " + stop_area);
  const data = await arr_from_db_data(
    SERVER + "get_bus_stops_names_from/" + stop_area
  );
  // let stop_name_arr = data.map((e) => e.stop_name);
  let stop_name_arr = data
  stop_name_arr = stop_name_arr.sort();
  console.log("stop_name_arr" + stop_name_arr);
  open_input_and_dropdown(
    stop_name_arr,
    "Dropdown_bus_stops",
    "bus_stops_input",
    "a"
  );
}

async function get_bus_names_from_bus_stop_name(bus_stop_name) {
  document.getElementById("bus_stops_input").value = bus_stop_name;
  console.log("bus_stop_name: " + bus_stop_name);
  const data = await arr_from_db_data(
    SERVER + "get_bus_names_from/" + bus_stop_name
  );
  console.log(data)
  // let bus_name_arr = data.map((e) => e.route_short_name);
  let bus_name_arr = data;
  bus_name_arr = bus_name_arr.sort();
  console.log("bus_name_arr: " + bus_name_arr);
  // document.getElementById("Dropdown_bus_names").classList.add("show");
  var dropdown_div = document.getElementById("Dropdown_bus_names");
  // dropdown_div.childNodes.forEach(element=> {
  //     console.log(element)
  //     if(element.tagName == "BUTTON"){
  //         dropdown_div.removeChild(element)
  //     }
  // })
  if (dropdown_div) {
    dropdown_div.innerHTML = "";
  }
  bus_name_arr.forEach((arr_element) => {
    //console.log(arr_element)
    let dropdown_option = document.createElement("button");
    dropdown_option.innerHTML = arr_element;
    dropdown_option.className = "btn-primary";
    dropdown_option.style.float = "right";
    dropdown_option.style.margin = "10px";

    dropdown_option.onclick = function () {
      try {
        get_stopBus_times(arr_element, bus_stop_name);
      }
      catch {
        get_stopBus_times(arr_element, bus_stop_name);
      }
    };
    dropdown_div.appendChild(dropdown_option);
  });
}
async function get_stopBus_times(bus_name, bus_stop_name) {
  p_bus = document.getElementById("bus");
  p_bus.innerText = "Bus: " + bus_name;
  p_stop = document.getElementById("stop_name");
  p_stop.innerText = "Bus Stop: " + bus_stop_name;
  document.getElementById("loading").style.display = "block";

  const data = await arr_from_db_data(
    SERVER +
    "get_stopBus_times_join_stop_desc_from/" +
    bus_stop_name +
    "/" +
    bus_name
  );
  document.getElementById("loading").style.display = "none";

  let stopBus_times_arr = data.map((e) => e.arrival_time);
  stopBus_times_arr = stopBus_times_arr.slice(0, 5);
  let desc_arr = data.map((e) => e.stop_desc);
  console.log("stopBus_times_arr: " + stopBus_times_arr);
  var container_div = document.getElementById("Dropdown_stopBus_times");
  if (container_div) {
    container_div.innerHTML = "";
  }
  let table = document.getElementById("arrival_suun_table");
  let table_body = table.getElementsByTagName("tbody");
  console.log(table_body);
  $("#arrival_suun_table tbody").remove();
  Object.keys(stopBus_times_arr).forEach((i) => {
    let table_row = table.insertRow();
    let td = table_row.insertCell();
    td.innerHTML = stopBus_times_arr[i];
    td = table_row.insertCell();
    td.innerHTML = desc_arr[i];
  });
}
async function get_stopBus_times(bus_name, bus_stop_name) {
  p_bus = document.getElementById("bus")
  p_bus.innerText = ("Bus: " + bus_name);
  p_stop = document.getElementById("stop_name")
  p_stop.innerText = ("Bus Stop: " + bus_stop_name);
  const data = await arr_from_db_data(SERVER + "get_stopBus_times_join_stop_desc_from/" + bus_stop_name + "/" + bus_name);
  let stopBus_times_arr = data.map(e => e.arrival_time); stopBus_times_arr = stopBus_times_arr.slice(0, 5)
  let desc_arr = data.map(e => e.stop_desc);
  console.log("stopBus_times_arr: " + stopBus_times_arr)
  var container_div = document.getElementById("Dropdown_stopBus_times");
  if (container_div) {
    container_div.innerHTML = '';
  }

  let table = document.getElementById("arrival_suun_table")
  // console.log(table_body)
  $("#arrival_suun_table tbody").remove();
  table.appendChild(document.createElement("tbody"))
  var tbodyRef = document.getElementById('arrival_suun_table').getElementsByTagName('tbody')[0];
  Object.keys(stopBus_times_arr).forEach(i => {
    let table_row = tbodyRef.insertRow()
    let td = table_row.insertCell();
    td.innerHTML = stopBus_times_arr[i];
    td = table_row.insertCell();
    td.innerHTML = desc_arr[i];
  });

}

function distance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
  );
}
function getLocation() {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve(position);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
      resolve({ x: 0, y: 0 });
    }
  });
}
async function get_closest_stop_coords() {
  let geoloc_object = await getLocation();

  let point = {
    x: geoloc_object.coords.latitude,
    y: geoloc_object.coords.longitude,
  };
  console.log("Point: || " + point.x + ":" + point.y);
  const data = await arr_from_db_data(SERVER + "get_stop_lat_and_stop_lon");
  stop_lat_arr = data.map((e) => e.stop_lat);
  stop_lon_arr = data.map((e) => e.stop_lon);
  var points = [];
  Object.keys(stop_lon_arr).forEach((i) => {
    points.push({});
    points[i]["x"] = parseFloat(stop_lat_arr[i]);
    points[i]["y"] = parseFloat(stop_lon_arr[i]);
  });
  console.log(points.slice(0, 10));
  var closest = points.reduce((a, b) =>
    distance(a, point) < distance(b, point) ? a : b
  );

  console.log("closest:");
  console.log(closest);
  return closest;
}

async function page_onload() {
  let coords = await get_closest_stop_coords();
  const data = await arr_from_db_data(
    SERVER + "get_bus_stop_area_and_stop_name_from/" + coords.x + "/" + coords.y
  );
  let stop_name_arr = data.map((e) => e.stop_name),
    stop_area_arr = data.map((e) => e.stop_area);
  console.log(stop_name_arr);
  console.log(stop_area_arr);
  await get_bus_names_from_bus_stop_name(stop_name_arr[0]);
  await get_bus_stops_names_from_area(stop_area_arr[0]);
}

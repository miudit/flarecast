var view_north = true;

var col_merge_num = 16;

var average = function(list){
  var sum=0;
  for( var i=0; i<list.length; i++ ){
    sum+=list[i];
  }
  return sum/list.length;
}

var wirelessLevel = function(solarxrayflux_list, geomagnetic_list, esp){
  result = 0;
  result += electricityLevel(geomagnetic_list)

  var val = solarxrayflux_list[solarxrayflux_list.length-1];
  if( val <= 0.1 )
    result += 1;
  else if( val <= 0.5 )
    result += 2;
  else
    result += 3;

  if(esp <= 4.5)
    result += 1
  else if(esp <= 8)
    result += 2
  else
    result += 3

  return parseInt(result / 3)

}

var gpsLevel = function(geomagnetic_list){
  var val = geomagnetic_list[geomagnetic_list.length-1];
  if( val <= 5 )
    return 1;
  else if( val <= 6 )
    return 2;
  else
    return 3;
}

var electricityLevel = function(geomagnetic_list){
  var val = geomagnetic_list[geomagnetic_list.length-1];
  if( val <= 5 )
    return 1;
  else if( val <= 6 )
    return 2;
  else
    return 3;
  return 2;
}

var airplaneLevel = function(protonflux_list){
  var val = protonflux_list[protonflux_list.length-1];
  if( val <= 10e1 )
    return 1 ;
  else if( val <= 10e2 )
    return 2;
  else
    return 3;
}

var auroraLevel = function(element){
  if( element <= 20 )
    return 1;
  else if( element <= 40 )
    return 2;
  else if( element <= 60 )
    return 3;
  else if( element <= 80 )
    return 4;
  else if( element <= 90 )
    return 5;
}

var sun_forecast = function(){
  forecast = [2, 3, 1] // 1: good, 2: normal, 3: bad
  $(".sun_forecast_day1").attr({"src":"./img/DAY1SUN-"+String(forecast[0])+".png"})
  $(".sun_forecast_day2").attr({"src":"./img/DAY2SUN-"+String(forecast[1])+".png"})
  $(".sun_forecast_day3").attr({"src":"./img/DAY3SUN-"+String(forecast[2])+".png"})
}

var aurora_forecast = function(){
  forecast [3, 1, 2] // 1: good, 2: normal, 3: bad
  $(".aurora_forecast_day1").attr({"src":"./img/DAY1AURORA"+String(forecast[0])+".png"})
  $(".aurora_forecast_day2").attr({"src":"./img/DAY2AURORA"+String(forecast[1])+".png"})
  $(".aurora_forecast_day3").attr({"src":"./img/DAY3AURORA"+String(forecast[2])+".png"})
}


var createGridCell = function(row_index, col_index, element, viewer){
  var col_resolution = 360.0 / 1024.0;
  var row_resolution = 180.0 / 512.0;
  var testcell = viewer.entities.add({
    name : 'testcell'+String(row_index)+String(col_index),
    polygon : {
      hierarchy : Cesium.Cartesian3.fromDegreesArray([
                                0.0+col_index*col_resolution, -90.0+row_index*row_resolution,
                                0.0+(col_index+col_merge_num)*col_resolution, -90.0+row_index*row_resolution,
                                0.0+(col_index+col_merge_num)*col_resolution, -90.0+(row_index+1)*row_resolution,
                                0.0+col_index*col_resolution, -90.0+(row_index+1)*row_resolution]),
      material : Cesium.Color.GREEN.withAlpha(parseInt(element)/50.0),
      outline : false
    }
  });
}

var drawGrid = function(data, viewer){
  var element_list = [];
  var elem_max = 0;
  if( view_north ){
    for( var row=92; row>=0; row-- ){
      data_row = data[92-row].split('   ').slice(1, 1025);
      for( var col=0; col<1024; col++ ){
        var element = parseInt(data_row[col]);
        if( element > elem_max )
          elem_max = element;
        element_list.push(element)
        if( element_list.length < col_merge_num ){
          continue;
        }
        element = average(element_list);
        //console.log(element)
        createGridCell(512-row, col, element, viewer);
        element_list = []
      }
    }
  }
  else{
    for( var row=0; row<93; row++ ){
      data_row = data[row].split('   ').slice(1, 1025);
      for( var col=0; col<1024; col++ ){
        var element = parseInt(data_row[col]);
        if( element > elem_max )
          elem_max = element;
        element_list.push(element)
        if( element_list.length < col_merge_num ){
          continue;
        }
        element = average(element_list);
        //console.log(element)
        createGridCell(row, col, element, viewer);
        element_list = []
      }
    }
  }
  $(".aurora").attr({"src":"./img/AURORA-"+String(auroraLevel(elem_max))+".png"})
}

var getGeomagneticKIndexList = function(solarxrayflux_list){
  $.ajax({
		url: "http://services.swpc.noaa.gov/text/daily-geomagnetic-indices.txt"
	}).then(function(data){ //ajaxの通信に成功した場合
		var array = data.split("\n");
		array = array.filter(function(line){
		  return line[0] != '#' && line[0] != ':';
		})
		array = array.slice(-5, -2);
	  var result = [];
	  for( var i=array.length-3; i<array.length; i++ ){
	    //console.log(array[i].split("    ")[3].split("  "))
	    if( array[i].split("    ")[3].split("  ").length != 0 ){
	      var elemlist = array[i].split("    ")[3].split("  ")[1].split(" ").map(function(element){
	        return parseFloat(element)
	      })
	      //console.log(elemlist)
	      result += elemlist;
	    }
	  }
	  console.log("gergeg")
	  var gps_level = gpsLevel(result)
	  var electricity_level = electricityLevel(result)
	  console.log("gps level = " + gps_level)
	  console.log("elec level = " + electricity_level)
	  $(".gps").attr({"src":"./img/gps-"+String(gps_level)+".png"})
	  $(".electricity").attr({"src":"./img/electricity-"+String(electricity_level)+".png"})

	  getEsp(solarxrayflux_list, result)

	  return result;
	}, function(data){ //ajaxの通信に失敗した場合
		alert("error!");
	});
}

var getSolarXrayFluxList = function(){
  $.ajax({
		url: "http://services.swpc.noaa.gov/text/goes-xray-flux-primary.txt"
	}).then(function(data){ //ajaxの通信に成功した場合
		var array = data.split("\n");
		array = array.filter(function(line){
		  return line[0] != '#' && line[0] != ':';
		})
		array = array.slice(0, -2);
		//console.log(array);
	  var result = array.map(function(element){
	    var tmp = element.split("    ")
	    return parseFloat(tmp[tmp.length-1]);
	  });
	  //console.log(result)

	  geomagnetic_list = getGeomagneticKIndexList(result)

	  return result;
	}, function(data){ //ajaxの通信に失敗した場合
		alert("error!");
	});
}

var getProtonFluxList = function(){
  $.ajax({
		url: "http://services.swpc.noaa.gov/text/goes-energetic-proton-flux-secondary.txt"
	}).then(function(data){ //ajaxの通信に成功した場合
		var array = data.split("\n");
		array = array.filter(function(line){
		  return line[0] != '#' && line[0] != ':';
		})
		array = array.slice(0, -2);
		//console.log(array);
	  var result = array.map(function(element){
	    var tmp = element.split("  ")
	    return parseFloat(tmp[tmp.length-11]);
	  });
	  //console.log(result)
	  var airplane_level = airplaneLevel(result)
	  console.log(airplane_level)
	  $(".aviation").attr({"src":"./img/aviation"+String(airplane_level)+"-2.png"})

      return result;
		/*drawGrid(array, viewer);*/
	}, function(data){ //ajaxの通信に失敗した場合
		alert("error!");
	});
}

var getEsp = function(solarxrayflux_list, geomagnetic_list){
  $.ajax({
		url: "./esp_dummy.html"
	}).then(function(data){ //ajaxの通信に成功した場合
		var array = data.split("\n");
		array = array.slice(6, 10);
		//console.log(array);
	  var result = array.map(function(element){
	    var tmp = element.split(" ")
	    return parseFloat(tmp[tmp.length-1]);
	  });
	  var ave = average(result);
	  var wireless_level = wirelessLevel(solarxrayflux_list, geomagnetic_list, ave)
	  $(".wireless").attr({"src":"./img/wifi-"+String(wireless_level)+".png"})
	  console.log("wireless_level = " + wireless_level)
	  return result;
		/*drawGrid(array, viewer);*/
	}, function(data){ //ajaxの通信に失敗した場合
		alert("error!2222222");
	});
}

$(document).ready(function(){
  var viewer = new Cesium.Viewer('cesiumContainer');

  /*var band_array = [-180.0, 60.0];
  for( var i=1; i<=180; i++ ){
    band_array.push(-180+2.0*i);
    band_array.push(60.0);
  }
  for( var i=180; i>=1; i-- ){
    band_array.push(-180+2.0*i);
    band_array.push(55.0);
  }
  console.log(band_array)
  //band_array.push(-180);
  //band_array.push(55.0);*/

  $.ajax({
		url: "http://services.swpc.noaa.gov/text/aurora-nowcast-map.txt"
	}).then(function(data){ //ajaxの通信に成功した場合
		alert("data retrieved");
		var array = data.split("\n");
		array = array.filter(function(line){ return line[0] != '#' })
		//array = array.slice(0, 512)
		if( !view_north )
		  array = array.slice(0, 93); //南極
		else
		  array = array.slice(419,512);
		drawGrid(array, viewer);
	}, function(data){ //ajaxの通信に失敗した場合
		alert("error!");
	});

  /*var wyoming = viewer.entities.add({
    name : 'Wyoming',
    polygon : {
      hierarchy : Cesium.Cartesian3.fromDegreesArray([
                                -109.080842,45.002073,
                                -105.91517,45.002073,
                                -104.058488,44.996596,
                                -104.053011,43.002989,
                                -104.053011,41.003906,
                                -105.728954,40.998429,
                                -107.919731,41.003906,
                                -109.04798,40.998429,
                                -111.047063,40.998429,
                                -111.047063,42.000709,
                                -111.047063,44.476286,
                                -111.05254,45.002073]),
      //hierarchy : Cesium.Cartesian3.fromDegreesArray(band_array),
      material : Cesium.Color.RED.withAlpha(0.5),
      outline : true,
      outlineColor : Cesium.Color.BLACK
    }
  });
  viewer.zoomTo(wyoming);*/

  console.log("draw completed")

  //var geomagnetic_list = getGeomagneticKIndexList()
  //console.log(geomagnetic_list)
  var solarxrayflux_list = getSolarXrayFluxList()
  var protonflux_list = getProtonFluxList()

  //var wireless_level = wirelessLevel()
  //var gps_level = gpsLevel(geomagnetic_list)
  //var electricity_level = electricityLevel(geomagnetic_list)
  //var airplane_level = airplaneLevel(protonflux_list)
  //console.log("GPS LEVEL = " + gps_level)
  //console.log("ELECTRICITY LEVEL = " + electricity_level)
  //console.log("AIRPLANE LEVEL = " + airplane_level)
  sun_forecast();
  aurora_forecast();
});

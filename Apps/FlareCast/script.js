var view_north = true;

var col_merge_num = 16;

var average = function(list){
  var sum=0;
  for( var i=0; i<list.length; i++ ){
    sum+=list[i];
  }
  return sum/list.length;
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
  if( view_north ){
    for( var row=92; row>=0; row-- ){
      data_row = data[92-row].split('   ').slice(1, 1025);
      for( var col=0; col<1024; col++ ){
        var element = parseInt(data_row[col]);
        element_list.push(element)
        if( element_list.length < col_merge_num ){
          continue;
        }
        element = average(element_list);
        console.log(element)
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
        element_list.push(element)
        if( element_list.length < col_merge_num ){
          continue;
        }
        element = average(element_list);
        console.log(element)
        createGridCell(row, col, element, viewer);
        element_list = []
      }
    }
  }
}

var getGeomagneticKIndexList = function(){
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
	    console.log(array[i].split("    ")[3].split("  ")) 
	    if( array[i].split("    ")[3].split("  ").length != 0 ){
	      var elemlist = array[i].split("    ")[3].split("  ")[1].split(" ")
	      console.log(elemlist)
	      result += elemlist;
	    }
	  }
	  /*var result = array.map(function(element){
	    if( element.split("    ")[3].split("  ").length != 0 ){
	      elemlist = element.split("    ")[3].split("  ").slice(2, -1);
	      return elemlist
	    }
	  });*/
	  console.log(result)
	  return result;
		/*drawGrid(array, viewer);*/
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
		console.log(array);
	  var result = array.map(function(element){
	    var tmp = element.split("    ")
	    return tmp[tmp.length-1];
	  });
	  console.log(result)
	  return result;
		/*drawGrid(array, viewer);*/
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
		console.log(array);
	  var result = array.map(function(element){
	    var tmp = element.split("  ")
	    return tmp[tmp.length-11];
	  });
	  console.log(result)
	  return result;
		/*drawGrid(array, viewer);*/
	}, function(data){ //ajaxの通信に失敗した場合
		alert("error!");
	});
}

var wirelessLevel = function(){
  return 2;
}

var gpsLevel = function(){
  return 2;
}

var erectricityLevel = function(){
  return 2;
}

var airplaneLevel = function(){
  return 2;
}

var auroraLevel = function(){
  return 3;
}

var sun_forecast = function(){
  return [1, 1, 1] // 0: good, 1: normal, 2: bad
}

var aurora_forecast = function(){
  return [1, 1, 1] // 0: good, 1: normal, 2: bad
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

  var geomagnetic_list = getGeomagneticKIndexList()
  //var solarxrayflux_list = getSolarXrayFluxList()
  //var protonflux_list = getProtonFluxList()
});

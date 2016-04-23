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

/*var createMergedGridCell = function(row_index, col_index, element_list, viewer){
  var col_resolution = 360.0 / 1024.0;
  var row_resolution = 180.0 / 512.0;
  var testcell = viewer.entities.add({
    name : 'testcell'+String(row_index)+String(col_index)),
    polygon : {
      hierarchy : Cesium.Cartesian3.fromDegreesArray([
                                0.0+col_index*col_resolution, -90.0+row_index*row_resolution,
                                0.0+(col_index+1)*col_resolution, -90.0+row_index*row_resolution,
                                0.0+(col_index+1)*col_resolution, -90.0+(row_index+1)*row_resolution,
                                0.0+col_index*col_resolution, -90.0+(row_index+1)*row_resolution]),
      material : Cesium.Color.RED.withAlpha(element/100.0),
      outline : false
    }
  });
}*/

var drawGrid = function(data, viewer){
  var element_list = [];
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
		array = array.slice(0, 93);
		drawGrid(array, viewer);
	}, function(data){ //ajaxの通信に失敗した場合
		alert("error!");
	});
  
  var wyoming = viewer.entities.add({
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
  //viewer.zoomTo(wyoming);
  
  console.log("draw completed")
});
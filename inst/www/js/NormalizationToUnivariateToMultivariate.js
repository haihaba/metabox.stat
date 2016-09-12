var missgroup = "no";
var event = [];
var appNorm = angular.module('app_norm', ["xeditable",'ngRoute','multipleSelect']);
var subsetlevelscount = [];
var levelscount = [];
var continueuploadshow = false;
var evtD;
var univariateResultColumnName=[];
var firsttimeplottable=true;

appNorm.run(function(editableOptions) {//MIGHT NOT BE USEFUL.
  editableOptions.theme = 'bs3';
});

appNorm.config(["$routeProvider","$locationProvider",function($routeProvider,$locationProvider){
  $routeProvider
		.when("/", {
			templateUrl: "Normalization.html",
			controller: "ctrl_norm"
		})
		.when("/Univariate_Analysis", {
			templateUrl: "Univariate_Analysis.html",
			controller: "ctrl_univariateanalysis"
		})
		;
}])

appNorm.controller('ctrl_norm', function($scope,srvShareData,$location) {
  {
  $scope.tolmissingperc = 10;
  $scope.missingreplacemethod = "half minimum";
  $scope.missingreplacemethodgroup = "no";
  $scope.removemiss = true;
  $scope.missimpute = true;
  $scope.compoundName = "sudo";
  $scope.sampleName = "sudo";
  $scope.phenotypenames = [];
  $scope.featurenames = [];
  $scope.compound = {name:null};
  $scope.sample = {name:'ID'};
  $scope.numofmiss = [];
  $scope.percofmiss = [];
  $scope.miss_rate = [];
  $scope.samplewisenorm = 'none';
  $scope.transformation = {value:'none'};
  $scope.scaling = 'none';
  $scope.loga = {value:1};
  $scope.logbase = {value:2};
  $scope.power = {value:1/2};
  $scope.samplewisenormindex = {value:'none'};
  $scope.scaling = {value:'none'};
  $scope.PCA = {color:'species',ellipseNeeded:true,showlegend:true,height:800,width:800,ellipseLineType:'dash',title:"PCA Plot"};
  $scope.Selected = {factor:'treatment',height:500,width:500,xAxisTextSize:10}
  $scope.UniResultSelected = {}

  }
$scope.dataToShare = [];
  $scope.shareMyData = function (myValue) {
  $scope.dataToShare = myValue;
  srvShareData.addData($scope.dataToShare);
  window.location.href = "Univariate_Analysis.html";
}


  $scope.enablecontinueupload = function(){
    if($scope.compound.name&&$scope.sample.name){
      $scope.continueuploadshow = true
    }
  }
  $scope.submitupload = function(){
    $('#missingreplacemethodgroup_norm').editable({
      source: $scope.phenotypenames,
      display: function(value) {
        if(value===null || value.length===0){
          missgroup = "no";
          $(this).html("<span style='font-weight:normal;'>no</span>");
        }else{
          missgroup = value;
          $(this).html("<span style='font-weight:normal;'>"+value+"</span>");
        }
      },
      select2: {
         multiple: true
      }
    });
    $scope.calnumberofmiss();
  }

  $scope.calnumberofmiss = function(){
    var req=ocpu.call("normalization_numofmissing",{
      e:e0,f:f0,p:p0,missindex:$scope.missindex,compoundName:$scope.compound.name,tolmissingperc:$scope.tolmissingperc
    },function(sess){
      sess.getObject(function(obj){
        document.getElementById("numofmiss").innerHTML = obj.numofmiss[0];
        $scope.$apply(function(){$scope.numofmiss = obj.numofmiss[0]})
        document.getElementById("percofmiss").innerHTML = obj.percofmiss[0];
        $scope.$apply(function(){$scope.percofmiss = obj.percofmiss[0]});
        $scope.$apply(function(){$scope.miss_rate = obj.miss_rate})
        if(obj.numofmiss[0]==0){
          $("#misstext").attr('class', 'text-success');
        }else{
          $("#misstext").attr('class', 'text-danger');
        }

        var all = new CanvasJS.Chart("misingallplot",{
          width:1400,
      			title:{
      				text: "Missing Rate of each compound",
      				fontSize: 20
      			},
            animationEnabled: true,
      			axisX: {
      				title:"Compound Name",
      				titleFontSize: 18
      			},
      			axisY:{
      			  maximum:100,
      				title: "Missing Rate",
      				titleFontSize: 16
      			},
      			legend: {
      				verticalAlign: 'bottom',
      				horizontalAlign: "center"
      			},
      			data: [
      			{
      				type: "scatter",
      				name: "Not to be removed",
      				markerType: "triangle",
      				showInLegend: true,
                      toolTipContent: "<span style='\"'color: {color};'\"'><strong>{name}</strong></span><br/><strong> Compound:</strong> {label} <br/><strong> Missing Rate</strong></span> {y}%",

      				dataPoints: JSON.parse(obj.untolerable[0])
      			},
      			{
      				type: "scatter",
      				markerType: "square",
              toolTipContent: "<span style='\"'color: {color};'\"'><strong>{name}</strong></span><br/><strong> Compound:</strong> {label} <br/><strong> Missing Rate</strong></span> {y}%",
      				name: "To be removed",
      				showInLegend: true,
      				dataPoints:JSON.parse(obj.tolerable[0])
      			}
      			],
            legend:{
                  cursor:"pointer",
                  itemclick : function(e) {
                    if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                      e.dataSeries.visible = false;
                    }
                    else {
                      e.dataSeries.visible = true;
                    }
                    chart.render();
                  }
                }
		});
          all.render();
    		var missing = new CanvasJS.Chart("misingonlymissingplot", {
    		  width:1400,
            	title:{
            		text:"Compounds with missing value"
            	},
              animationEnabled: true,
            	axisX:{
            		interval: 1,
            		gridThickness: 0,
            		labelFontSize: 10,
            		labelFontStyle: "normal",
            		labelFontWeight: "normal",
            		labelFontFamily: "Lucida Sans Unicode"
            	},
            	axisY2:{
            	  maximum:100,
            		interlacedColor: "rgba(1,77,101,.2)",
            		gridColor: "rgba(1,77,101,.1)"
            	},
            	data: [
              	{
              		type: "bar",name: "compounds",axisYType: "secondary",color: "#014D65",
              		dataPoints: JSON.parse(obj.missing[0])
              	}
            	]
          });
          missing.render();
      })

    }).always(function(){$('#mytabs a[href="#dealwithmissingvalue-pills"]').tab('show');})
  }
  $scope.dealwithmissing = function(){
    var req = ocpu.call("normalization_dealwithmissing",{
      e:e0,f:f0,p:p0,missindex:$scope.missindex,removemiss:$scope.removemiss,
      miss_rate:$scope.miss_rate,tolmissingperc:$scope.tolmissingperc,
      missingreplacemethod:$scope.missingreplacemethod,missgroup:missgroup
    },function(sess){
      sess.getObject(function(obj){
        e1 = obj.e1;p1=obj.p1;f1=obj.f1;
      })
    }).always(function(){$('#mytabs a[href="#normalization-pills"]').tab('show');})
  }

  $scope.visualizenormalization = function(){
    var req=ocpu.call("normalization_normalization",{
      e1:e1,f1:f1,p1:p1,
     samplewisenorm : $scope.samplewisenorm,samplewisenormindex:$scope.samplewisenormindex.value,
     transformation : $scope.transformation.value, loga : $scope.loga.value, logbase : $scope.logbase.value, power : $scope.power.value,
     scaling : $scope.scaling.value
    },function(sess){
      sess.getObject(function(obj){
        e2 = obj.e2;f2 = obj.f2;p2=obj.p2;
        $scope.drawPCA();
        //$scope.drawboxplots();
        })
    })
  }
  $scope.applynormalizationtoUni = function(){
    var req=ocpu.call("normalization_normalization",{
      e1:e1,f1:f1,p1:p1,
     samplewisenorm : $scope.samplewisenorm,samplewisenormindex:$scope.samplewisenormindex.value,
     transformation : $scope.transformation.value, loga : $scope.loga.value, logbase : $scope.logbase.value, power : $scope.power.value,
     scaling : $scope.scaling.value
    },function(sess){
      sess.getObject(function(obj){
        e2 = obj.e2;f2 = obj.f2;p2=obj.p2;
        $scope.shareMyData({e2:e2,f2:f2,p2:p2,phenotypenames:$scope.phenotypenames,featurenames:$scope.featurenames})//!!!
        })
    })
  }

  $scope.drawPCA = function(){

    var req = ocpu.call("normalization_PCA",{
      e2:e2,f2:f2,p2:p2,
      color:$scope.PCA.color,shape:"no_shape", opacity:$("#pca_opacity").val(),
      ellipse_needed:$scope.PCA.ellipseNeeded,
      showlegend:$scope.PCA.showlegend,dotsize:$("#pca_dotsize").val(),
      ellipse_line_width:$("#pca_ellipse_line_width").val(),ellipseLineType:$scope.PCA.ellipseLineType,
      confidence_level:$("#pca_ellipse_confidenceLevel").val(),
      paper_bgcolor:$("#pca_paper_bgcolor_value").val(),
      plot_bgcolor:$("#pca_plot_bgcolor_value").val(),
      width:$scope.PCA.width,height:$scope.PCA.height,
      title:$scope.PCA.title

    },function(sess){
      sess.getObject(function(obj){
      PCAplot = document.getElementById('PCAplot');
      Plotly.newPlot(PCAplot, JSON.parse(obj.data[0]), JSON.parse(obj.layout[0]));
      PCAplot.on('plotly_selected',function(eventData){
        evtD = eventData;
        total = p2.map(function(ind){return ind[$scope.Selected.factor]});
        //see if total is number or character.
        if(isNaN(Number(total[0]))){//character
          temp1 = countunique(total);
          levelsnames = temp1[0];
          levelscount = temp1[1];
          selects = eventData.points;
          subsetofp2 = [];
          for(ii=0;ii < selects.length;ii++){
            if(selects[ii]["curveNumber"]==0){
              subsetofp2.push(p2[selects[ii]["pointNumber"]]);
            }else{
              subsetofp2.push(p2[Number(selects[ii]["pointNumber"]) + Number(selects[ii]["curveNumber"]) +
             Number(temp1[1].slice(0,Number(selects[ii]["curveNumber"])).reduce((a, b) => a + b, 0))-1]);
            }
          }
          subset = subsetofp2.map(function(ind){return ind[$scope.Selected.factor]});
          temp2 = countunique(subset);
          subsetlevelsnames = temp2[0];
          subsetlevelscount = []
          for(ii=0;ii<levelscount.length;ii++){
            subsetlevelscount.push(levelscount[ii])
          }
          oo = 0
          for(ii=0;ii<subsetlevelscount.length;ii++){
            if($.inArray(levelsnames[ii], subsetlevelsnames)===-1){
              subsetlevelscount[ii] = 0;
            }else{
              subsetlevelscount[ii] = temp2[1][oo];oo++
            }
          }
          infodata = [];
          infodata.push({
            x:levelsnames,y:subsetlevelscount,name:"selected",type:'bar'
          })
          diff = [];for(ii=0;ii<levelscount.length;ii++){diff.push(levelscount[ii]-subsetlevelscount[ii])}
          infodata.push({
            x:levelsnames,y:diff,name:"total",type:"bar"
          })
          Plotly.newPlot('Selectedplot', infodata, {barmode: 'relative',title:"Selected Sample Info"});
        }else{//numeric

        var totaldata={x:[],y:[],
            mode:'markers',type:'scatter',name:'unselected',marker:{size:12}};
        var subsetdata={x:[],y:[],
            mode:'markers',type:'scatter',name:'selected',marker:{size:12}};
        var total_temp = []//for some reason, countunique() sort the parameter.
        for(ii=0;ii<total.length;ii++){
          total_temp.push(total[ii])
        }
        temp1 = countunique(total_temp);
          levelsnames = temp1[0];
          levelscount = temp1[1];
          selects = eventData.points;
          subsetofp2 = [];
          for(ii=0;ii < selects.length;ii++){
            if(selects[ii]["curveNumber"]==0){
              subsetofp2.push(p2[selects[ii]["pointNumber"]]);
              subsetdata.x.push(selects[ii]["pointNumber"]);
            }else{
              subsetofp2.push(p2[Number(selects[ii]["pointNumber"]) + Number(selects[ii]["curveNumber"]) +
             Number(temp1[1].slice(0,Number(selects[ii]["curveNumber"])).reduce((a, b) => a + b, 0))-1]);

             subsetdata.x.push(Number(selects[ii]["pointNumber"]) + Number(selects[ii]["curveNumber"]) +
             Number(temp1[1].slice(0,Number(selects[ii]["curveNumber"])).reduce((a, b) => a + b, 0))-1)

            }
          }
          subset = subsetofp2.map(function(ind){return ind[$scope.Selected.factor]});



          for(ii=0;ii<total.length;ii++){
            totaldata.x.push(ii)
            totaldata.y.push(Number(total[ii]))
          }
          for(ii=0;ii<subset.length;ii++){
            subsetdata.y.push(Number(subset[ii]))
          }



          var infodata = [totaldata,subsetdata];
          var layout = {
            height:$scope.Selected.height,
            width:$scope.Selected.width,
            title:"Selected Sample Info"
          }
          Plotly.newPlot('Selectedplot', infodata, layout);
        }

      })
      })
    })

  }

  $scope.updateSelectedPlot = function(){
        total = p2.map(function(ind){return ind[$scope.Selected.factor]});
        //see if total is number or character.
        if(isNaN(Number(total[0]))){//character
          temp1 = countunique(total);
          levelsnames = temp1[0];
          levelscount = temp1[1];
          selects = evtD.points;
          subsetofp2 = [];
          for(ii=0;ii < selects.length;ii++){
            if(selects[ii]["curveNumber"]==0){
              subsetofp2.push(p2[selects[ii]["pointNumber"]]);
            }else{
              subsetofp2.push(p2[Number(selects[ii]["pointNumber"]) + Number(selects[ii]["curveNumber"]) +
             Number(temp1[1].slice(0,Number(selects[ii]["curveNumber"])).reduce((a, b) => a + b, 0))-1]);
            }
          }
          subset = subsetofp2.map(function(ind){return ind[$scope.Selected.factor]});
          temp2 = countunique(subset);
          subsetlevelsnames = temp2[0];
          subsetlevelscount = []
          for(ii=0;ii<levelscount.length;ii++){
            subsetlevelscount.push(levelscount[ii])
          }
          oo = 0
          for(ii=0;ii<subsetlevelscount.length;ii++){
            if($.inArray(levelsnames[ii], subsetlevelsnames)===-1){
              subsetlevelscount[ii] = 0;
            }else{
              subsetlevelscount[ii] = temp2[1][oo];oo++
            }
          }
          infodata = [];
          infodata.push({
            x:levelsnames,y:subsetlevelscount,name:"selected",type:'bar'
          })
          diff = [];for(ii=0;ii<levelscount.length;ii++){diff.push(levelscount[ii]-subsetlevelscount[ii])}
          infodata.push({
            x:levelsnames,y:diff,name:"total",type:"bar"
          })
          Plotly.newPlot('Selectedplot', infodata, {barmode: 'relative',title:"Selected Sample Info"});
        }else{//numeric

        var totaldata={x:[],y:[],
            mode:'markers',type:'scatter',name:'unselected',marker:{size:12}};
        var subsetdata={x:[],y:[],
            mode:'markers',type:'scatter',name:'selected',marker:{size:12}};
        var total_temp = []//for some reason, countunique() sort the parameter.
        for(ii=0;ii<total.length;ii++){
          total_temp.push(total[ii])
        }
        temp1 = countunique(total_temp);
          levelsnames = temp1[0];
          levelscount = temp1[1];
          selects = evtD.points;
          subsetofp2 = [];
          for(ii=0;ii < selects.length;ii++){
            if(selects[ii]["curveNumber"]==0){
              subsetofp2.push(p2[selects[ii]["pointNumber"]]);
              subsetdata.x.push(selects[ii]["pointNumber"]);
            }else{
              subsetofp2.push(p2[Number(selects[ii]["pointNumber"]) + Number(selects[ii]["curveNumber"]) +
             Number(temp1[1].slice(0,Number(selects[ii]["curveNumber"])).reduce((a, b) => a + b, 0))-1]);

             subsetdata.x.push(Number(selects[ii]["pointNumber"]) + Number(selects[ii]["curveNumber"]) +
             Number(temp1[1].slice(0,Number(selects[ii]["curveNumber"])).reduce((a, b) => a + b, 0))-1)

            }
          }
          subset = subsetofp2.map(function(ind){return ind[$scope.Selected.factor]});
          for(ii=0;ii<total.length;ii++){
            totaldata.x.push(ii)
            totaldata.y.push(Number(total[ii]))
          }
          for(ii=0;ii<subset.length;ii++){
            subsetdata.y.push(Number(subset[ii]))
          }

          var infodata = [totaldata,subsetdata];
          var layout = {
            height:$scope.Selected.height,
            width:$scope.Selected.width,
            title:"Selected Sample Info",
            xaxis:{
              tickfont:{size:$scope.Selected.xAxisTextSize}
            }

          }
          Plotly.newPlot('Selectedplot', infodata, layout);
        }

  }

  $scope.drawboxplots = function(){
    var req = ocpu.call("normalization_boxplots",{
      e2:e2,f2:f2,p2:p2,
      sampleName:$scope.sample.name
    },function(sess){
      sess.getObject(function(obj){
        BOXplots = Plotly.newPlot('BOXplots', JSON.parse(obj.data[0]), JSON.parse(obj.layout[0]));
      })
    })
  }

//dps.map(function(a) {return parseFloat(a.y);});


  $('#upload_norm').change(upload);
  function upload(){
  var req=ocpu.call("normalization_uploadfile",{
    file:$("#upload_norm")[0].files[0]
  },function(session){
    session.getObject(function(obj){
      e0=obj.expression;
      f0=obj.feature;
      p0=obj.phenotype;
      $scope.$apply(function(){
        $scope.compoundName = obj.compound_name[0];
        $scope.compound.name = obj.compound_name[0];
        $scope.sampleName = obj.sample_name[0];

        $scope.sample.name = obj.sample_name[0];
        $scope.phenotypenames = obj.phenotypenames;
        $scope.featurenames = obj.featurenames;
      });
    })
  })
}







})

appNorm.controller('ctrl_univariateanalysis',function($scope,srvShareData){
  $scope.dataexist = true;
  $scope.test = {groups :null}
  $scope.group = {first:null,second:null,
                  firstlength:null,secondlength:null,
                  firstmember:null,secondmember:null,
                  firstmemberlength:[],secondmemberlength:[]
  }
  $scope.sharedData = srvShareData.getData()[0];
  if($scope.sharedData.length === 0){
    $scope.dataexist = false
  }

  p2 = $scope.sharedData.p2
  e2 = $scope.sharedData.e2
  f2 = $scope.sharedData.f2

  $scope.summarygroup = function(){
    $scope.group['firstmemberlength']=[];
    $scope.group['secondmemberlength']=[];
      tempfirst= countunique(p2.map(function(ind){return ind[$scope.group.first]}))
      $scope.group['firstmember'] = tempfirst[0];$scope.group['firstlength'] = tempfirst[1];
      for(ii=0;ii<$scope.group['firstmember'].length;ii++){ $scope.group['firstmemberlength'].push($scope.group['firstmember'][ii]+"("+$scope.group['firstlength'][ii]+")")}
      tempsecond= countunique(p2.map(function(ind){return ind[$scope.group.second]}))
      $scope.group['secondmember'] = tempsecond[0];$scope.group['secondlength'] = tempsecond[1];
      for(ii=0;ii<$scope.group['secondmember'].length;ii++){ $scope.group['secondmemberlength'].push($scope.group['secondmember'][ii]+"("+$scope.group['secondlength'][ii]+")")}
  }

  $scope.univariateanalysis = function(){
    if($scope.test['groups'] == "two independent groups"){
      var req=ocpu.call("univariateanalysis_twoIndependentGroups",{e2:e2,f2:f2,p2:p2,group1:$scope.group.first},
      function(sess){
        console.log(sess)
      })
    }
    if($scope.test['groups'] == "two paired groups"){

    }
    if($scope.test['groups'] == "multiple independent groups"){
      var req=ocpu.call("univariateanalysis_multiIndependentGroups",{e2:e2,f2:f2,p2:p2,group1:$scope.group.first},
      function(sess){
        console.log(sess)
      })
    }
    if($scope.test['groups'] == "multiple paired groups"){

    }
    if($scope.test['groups'] == "independent*independent"){

      var req=ocpu.call("univariateanalysis_twowayIndependentGroups",{
        e2:e2,f2:f2,p2:p2,group1:$scope.group.first,group2:$scope.group.second
      },
      function(sess){
        sess.getObject(function(obj){
          univariateresult = obj;
          //univariateresult_forrecovery = obj;//Used for when user delete a column and would like recover it
          var toGetColumnName = obj[0]
          var ii=1;
          for(var name in toGetColumnName){
            univariateResultColumnName.push({id:ii,name:name})
            ii++
          }
          ii=1;
          $scope.optionsList = univariateResultColumnName;
          $scope.drawUnivariateResult();
      })
    })
  }

}

  $scope.drawUnivariateResult = function(){
    if(firsttimeplottable===false){
      univaraitetable.destroy();
    }else{
      firsttimeplottable = false;
    }

    temp = univariateresult.slice();

    univariateresult0 = univariateresult[0];

    temp[0] = jQuery.extend(true, {}, univariateresult0);

    for(ii=0;ii<$scope.selectedList.length;ii++){
      delete temp[0][$scope.selectedList[ii].name]
    }
    univaraitetable = drawTable('#univariatetable_univariateanalysis',temp, "Univariate Statistical Result");

  }



})
appNorm.service('srvShareData', function($window) {
        var KEY = 'appNorm.SelectedValue';
        var addData = function(newObj) {
            var mydata = $window.sessionStorage.getItem(KEY);
            if (mydata) {
                mydata = JSON.parse(mydata);
            } else {
                mydata = [];
            }
            mydata.push(newObj);
            $window.sessionStorage.setItem(KEY, JSON.stringify(mydata));
        };
        var getData = function(){
            var mydata = $window.sessionStorage.getItem(KEY);
            if (mydata) {
                mydata = JSON.parse(mydata);
            }
            return mydata || [];
        };
        return {
            addData: addData,
            getData: getData
        };
    });





$(document).ready(function(){
$("#pca_opacity").slider();$("#pca_dotsize").slider();$("#pca_ellipse_line_width").slider();
$("#pca_ellipse_confidenceLevel").slider();
$('#pca_paper_bgcolor').colorpicker();
$('#pca_plot_bgcolor').colorpicker();

$('#missingPerc_norm').editable();
$('#missingreplacemethod_norm').editable({
        value: 'half minimum',
        source: [
              {value: 'half minimum', text: 'half minimum'},
              {value: 'minimum', text: 'minimum'},
              {value: 'mean', text: 'mean'},
              {value: 'median', text:'median'}
           ]
    });

   $('#univariatetable_univariateanalysis tbody').on('click', 'tr', function () {
        var data = univaraitetable.row( this ).data();
        alert( 'You clicked on '+data[0]+'\'s row' );
    } );

})
//$.fn.editable.defaults.mode = 'popup';
var e0;
var f0;
var p0;



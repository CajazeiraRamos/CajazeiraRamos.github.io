let populacaoUF = d3.scale.ordinal()
	.domain(["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"])
	.range(['881935','3337357','845731','4144597','14873064','9132078','3015268','4018650','7018354','7075181','3484466','2778986','21168791','8602865','4018127','11433957','9557071','3273227','17264943','3506853','11377239','1777225','605761','7164788','45919049','2298696','1572866']),
nomeUF = d3.scale.ordinal()
	.domain(["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"])
	.range(['Acre','Alagoas','Amapá','Amazonas','Bahia','Ceará','Distrito Federal','Espírito Santo','Goiás','Maranhão','Mato Grosso','Mato Grosso do Sul','Minas Gerais','Pará','Paraíba','Paraná','Pernambuco','Piauí','Rio de Janeiro','Rio Grande do Norte','Rio Grande do Sul','Rondônia','Roraima','Santa Catarina','São Paulo','Sergipe','Tocantins']),
siglaRegiao = d3.scale.ordinal()
	.domain(["Sudeste", "Nordeste", "Sul", "Centro-Oeste", "Norte"])
	.range(['SE','NE','S','CO','N']),
colorRegiao = d3.scale.ordinal()
	.domain(["Sudeste", "Nordeste", "Sul", "Centro-Oeste", "Norte"])
	.range(['#b3e2cd','#fdcdac','#cbd5e8','#f4cae4','#e6f5c9']),
populacaoRG = d3.scale.ordinal()
	.domain(["Sudeste", "Nordeste", "Sul", "Centro-Oeste", "Norte"])
	.range(['88371433','57071654','29975984','16297074','18430980']); 

let indUF = d3.scale.ordinal()
	.domain(["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"])
	.range(['','','','','','','','','','','','','','','','','','','','','','','','','','','']),
indRG = d3.scale.ordinal()
	.domain(["Sudeste", "Nordeste", "Sul", "Centro-Oeste", "Norte"])
	.range(['','','','','']);

// 14.2350° S, 51.9253° W
let centroMapa = [-14.2350, -55],zoomMapa = 5;
var popBR = 210147125;
// if(window.innerWidth<1000)
// 	zoomMapa = 4;


let dimData, dimUF, dimRG; 
let groupCasos_dimUF, groupObitos_dimUF, groupTaxa_dimUF, groupLet_dimUF,
groupCasos_dimRG, groupObitos_dimRG, groupTaxa_dimRG, groupLet_dimRG;

let groupCasos_dimData, groupObitos_dimData;  

let casosPorUF = d3.map(), obitosPorUF = d3.map(), 
	taxaPorUF = d3.map(), letPorUF = d3.map();

let casosPorRG = d3.map(), obitosPorRG = d3.map(), 
	taxaPorRG = d3.map(), letPorRG = d3.map();

let casosPorData = d3.map(), obitosPorData = d3.map(), 
	taxaPorData = d3.map(), letPorData = d3.map();

let dataAtual, dataInicial, dataFinal, escala=false, controleUF_RG=false,
 dtgFormat = d3.time.format("%d/%m/%Y"), formatDay = d3.time.format("%d"),
	formatMonth = d3.time.format("%m"),
	formatYear = d3.time.format("%Y");
	

dataInicial = dtgFormat.parse("15/03/2020");

let graficoMapa;


var layerGroup_UF = new L.LayerGroup();
var layerGroup_RG = new L.LayerGroup();
let geojsonUFs, geojsonRGs;


let Mapa = L.map('divMapa').setView(centroMapa, zoomMapa);
// L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {maxZoom: 18, attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`})
// .addTo(Mapa);

let info = L.control(), 
legenda = L.control({position: 'bottomright'}),
grafico = L.control({position: 'bottomleft'}); 

legenda.onAdd = function (map) {
	
	var title = '<b>Taxa por 100 mil/h </b>';
	if(escala == 1)
		title = '<b>Letalidade (%)</b> ';

	var quantize = getQuantize();
	var brewerColors = getColors();
	let div = L.DomUtil.create('div', 'info legend'),
	labels = [],
	n = brewerColors.length,
	from, to;
	labels.push(title);
	for (let i = 0; i < n; i++) {
		let c = brewerColors[i];
		let fromto = quantize.domain();//.invertExtent(c);
		labels.push(
		'<i style="background:' + brewerColors[i] + '"></i> ' +
		d3.round(fromto[i],1) + (d3.round(fromto[i+1],1) ? ' &ndash; ' + d3.round(fromto[i+1],1) : '+'));
	}

	div.innerHTML = labels.join('<br>');
	return div;}
info.onAdd = function(map){
	this._div = L.DomUtil.create('div', 'info');
	this.update();
return this._div;};
info.update = function (e) {
	var formatDay = d3.time.format("%d"),
	formatMonth = d3.time.format("%m"),
	dia  = formatDay(dataAtual),
	mes = formatMonth(dataAtual);
	
	let title = 'estado';
	if(controleUF_RG)
		title = 'região';

	if(e){
		var info = e.properties,
		let = 0,
		taxa = 0,
		nome = "teste",
		casos = 0,
		mortes = 0;

		if(controleUF_RG){
			taxa = taxaPorRG.get(info.nome);
			let = letPorRG.get(info.nome);
			casos = casosPorRG.get(info.nome);
			mortes = obitosPorRG.get(info.nome);
			nome = info.nome;
		}else{
			taxa = taxaPorUF.get(info.UF);
			let = letPorUF.get(info.UF);
			casos = casosPorUF.get(info.UF);
			mortes = obitosPorUF.get(info.UF);
			nome = nomeUF(info.UF);
		}

		var quantize = getQuantize(),
		ind = IndCor(info),		
		cor = quantize(ind);

	}
	this._div.innerHTML = '<h3>Dados por '+title+' </h3>' +  (e ?
		'<b>' + nome + ' ('+dia+'/'+mes+')</b><br />'
		+ casos + ' Casos confirmados' + '</b><br />'
		+ mortes + ' Óbito(s)' + '</b><br />'
		+ taxa + ' para cada 100mil/h'+ '</b><br />'
		+ let + '% Letalidade'+ '</b><br />'+
		'<i style="float: left; margin-top: 5px; height: 20px; margin-left:25%; width:'+let+'px; background-color:black"></i>'
		+'<i style="float: left; margin-top: 5px; height: 20px; width:'+(100-let)+'px; background-color:'+cor+';"></i>' 
		: 'Passe o mouse sobre seu '+title+' ou click');};
grafico.onAdd = function(mymap){
	let div = L.DomUtil.create('div', 'Row'),
	labels = [];
	labels.push('<h3 id = "graficoMapaTitle" style="padding: 10px;">-</h3> <div id = "divGraficoMapa"> </div>')
	// div.id = "Row";
	div.innerHTML = labels.join('<br>');
	return div;}




function trocaEscala(){
	escala = !escala;
	render();
}
function trocaControleUF_RG(){
	controleUF_RG = !controleUF_RG;
	render();
}
function alteraDia(){
	
	// var title = document.getElementById("title");

	var novaData = NumToData(document.getElementById("dataRange").value);

	dataAtual = novaData;
	render();
}

function limparFiltros(){

	console.log("teste");
}


d3.csv("data/minSaude.csv", function(data){
	data.forEach(function(d) {
		
		d.regiao = d.regiao;
		d.uf = d.estado;
		d.data = dtgFormat.parse(d.data);
		d.nome = nomeUF(d.uf);
		d.casosNovos = +d.casosNovos;
		d.casosAcumulados = +d.casosAcumulados;
		d.obitosNovos = +d.obitosNovos;
		d.obitosAcumulados = +d.obitosAcumulados;
		d.populacao = populacaoUF(d.uf);
		});
	var facts = crossfilter(data);
	
	//CrossFilter Dimensions :	
	dimData = facts.dimension(function(d){

		return d.data;});
	dimUF = facts.dimension(function(d){

		return d.uf;});
	dimRG = facts.dimension(function(d){

		return d.regiao;});
	
	groupCasos_dimUF = dimUF.group()
		.reduceSum(function(d){
			return d.casosNovos;});
	groupTaxa_dimUF = dimUF.group()
		.reduceSum(function(d){
			return d.casosNovos;});
	groupObitos_dimUF = dimUF.group()
		.reduceSum(function(d){
			return d.obitosNovos;});
	groupLet_dimUF = dimUF.group()
		.reduceSum(function(d){
			return d.obitosNovos;});		
	
	groupCasos_dimRG = dimRG.group()
		.reduceSum(function(d){
			return d.casosNovos;});
	groupTaxa_dimRG = dimRG.group()
		.reduceSum(function(d){
			return d.casosNovos;});
	groupObitos_dimRG = dimRG.group()
		.reduceSum(function(d){
			return d.obitosNovos;});
	groupLet_dimRG = dimRG.group()
		.reduceSum(function(d){
			return d.obitosNovos;});
	
	groupCasos_dimData = dimData.group()
		.reduceSum(function(d){
			return d.casosAcumulados;});

	groupObitos_dimData = dimData.group()
		.reduceSum(function(d){
			return d.obitosAcumulados;});


	
 	groupCasos_dimData.all()
	.forEach(function(d){
		casosPorData.set(d.key, +d.value);
		var taxa = d3.round(((d.value*100000)/popBR),2);
		taxaPorData.set(d.key, taxa);
	});
	groupObitos_dimData.all()
	.forEach(function(d){
		obitosPorData.set(d.key, +d.value);
		var let = d3.round((d.value*100/casosPorData.get(d.key)),2);
		letPorData.set(d.key, let);
	});

	// Atualizando datas:


	atualiza_mapsUFs();
	atualiza_mapsRGs();


	dataFinal = dimData.top(1)[0].data;;
	dataAtual = dataFinal;

	document.getElementById("dataRange").min = dataToNum(dataInicial);
	document.getElementById("dataRange").max = dataToNum(dataFinal);
	document.getElementById("dataRange").value = dataToNum(dataFinal);
	
	geojsonUFs = L.geoJson(Estados, {
		style: style,
		onEachFeature: onEachFeatureUF
	});

	layerGroup_UF.addLayer(geojsonUFs);

	geojsonRGs = L.geoJson(Regioes, {
		style: style,
		onEachFeature: onEachFeatureRG
	});
	layerGroup_RG.addLayer(geojsonRGs);

	info.addTo(Mapa);
	grafico.addTo(Mapa);

	

	graficoMapa = new dc.rowChart("#divGraficoMapa");
	
	graficoMapa
		.width(250)
		.height(700)
		.margins({ top: 20, right: 40, bottom: 40, left: 30 })
		.renderLabel(true)
		.elasticX(true);

	alteraDia();


});


function render(){


	Mapa.removeLayer(layerGroup_UF);
	Mapa.removeLayer(layerGroup_RG);

	legenda.addTo(Mapa);

	dimData.filter(function(d){
		if(d<=dataAtual)
		return d;
	});

	// Mapa.


	atualiza_mapsUFs();
	atualiza_mapsRGs();

	// Renderizando mapas: 

	var graficoMapaTitle = document.getElementById("graficoMapaTitle");

	if(controleUF_RG){
		
		// console.log("Mapa por regiao");
		layerGroup_RG.addTo(Mapa);
		AtualizaCoresRG();

		graficoMapa
			.dimension(dimRG)
			.labelOffsetX(5);

		graficoMapaTitle.innerHTML = 'Índice por Região';

		if(escala){
			groupLet_dimRG.top(Infinity).forEach(function (d){
				d.value = letPorRG.get(d.key);
			});
			graficoMapa
				.group(groupLet_dimRG);
		}else{
			groupTaxa_dimRG.top(Infinity).forEach(function (d){
				d.value = taxaPorRG.get(d.key);
			});
			graficoMapa
				.group(groupTaxa_dimRG);
		}

	}else{
		// console.log("Mapa por Estado");
		layerGroup_UF.addTo(Mapa);
		AtualizaCoresUF();

		graficoMapa
			.dimension(dimUF)
			.labelOffsetX(-25);

		graficoMapaTitle.innerHTML = 'Índice por Estado';
		// console.log(graficoMapa);
		if(escala){
			groupLet_dimUF.top(Infinity).forEach(function (d){
				d.value = letPorUF.get(d.key);
			});
			graficoMapa
				.group(groupLet_dimUF);
		}else{
			groupTaxa_dimUF.top(Infinity).forEach(function (d){
				d.value = taxaPorUF.get(d.key);
			});
			graficoMapa
				.group(groupTaxa_dimUF);
		}
		
	}

	
	graficoMapa
		.colors(function(d){
			var quantize = getQuantize();
			return quantize(IndCor(getFeature(d).properties));
		});
	
	
	// console.log("teste");
	dc.renderAll();


	 d3.selectAll("g.row")
	 	.on('mouseover', function(d){
	 		highlightFeature(getLayer(d.key));
	 	})
	 	.on('mouseout', function(d){
	 		if(controleUF_RG)
	 			geojsonRGs.resetStyle(geojsonRGs[d.key]);
	 		else
	 			geojsonUFs.resetStyle(geojsonUFs[d.key]);
	 		
	 		info.update();
	 	})
	 	;


	// console.log(groupTaxa_dimUF.top(1)[0].value+'-'+groupTaxa_dimUF.top(1)[0].key);

	var title = document.getElementById("title"),
	dia  = formatDay(dataAtual),
	mes = formatMonth(dataAtual),
	ano = formatYear(dataAtual),
	dataLabel = document.getElementById("dataLabel");

	dataLabel.innerHTML = '<label id = "dataLabel"> Data: '+dia+"/"+mes+"/"+ano+'</label>';

	title.innerHTML = 'Coronavírus no Brasil ('+dia+"/"+mes+"/"+ano+')<h1>'+
		'<span class="label label-info">'+casosPorData.get(dataAtual)+' Casos</span>\n'+
		'<span class="label label-warning">'+d3.round(taxaPorData.get(dataAtual),1)+' p/ 100mil/h</span>\n'+
		'<span class="label label-danger">'+obitosPorData.get(dataAtual)+' Óbitos</span>\n'+
		'<span class="label label-default">'+d3.round(letPorData.get(dataAtual),1)+'% Let.</span>	</h1>';

}

function atualiza_mapsUFs(){
	groupCasos_dimUF.all()
	.forEach(function(d){
		casosPorUF.set(d.key, +d.value);
		var taxa = d3.round((d.value*100000)/populacaoUF(d.key),2);
		taxaPorUF.set(d.key, +taxa);
	});
	groupObitos_dimUF.all()
	.forEach(function(d){
		obitosPorUF.set(d.key, +d.value);
		var letalidade = d3.round((d.value*100)/casosPorUF.get(d.key),2);
		if(Number.isNaN(letalidade))
			letalidade = 0;
		letPorUF.set(d.key, +letalidade);
	});}
function atualiza_mapsRGs(){
	groupCasos_dimRG.all()
	.forEach(function(d){
		casosPorRG.set(d.key, +d.value);
		var taxa = d3.round((d.value*100000)/populacaoRG(d.key),2);
		taxaPorRG.set(d.key, +taxa);
	});
	groupObitos_dimRG.all()
	.forEach(function(d){
		obitosPorRG.set(d.key, +d.value);
		var letalidade = +d3.round((d.value*100)/casosPorRG.get(d.key),2);
		// console.log(letalidade);
		if(Number.isNaN(letalidade))
			letalidade = 0;
		letPorRG.set(d.key, +letalidade);
	});}

function onEachFeatureUF(feature, layer) {
	layer._leaflet_id = feature.properties.UF;
	// console.log(layer._leaflet_id);
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: highlightFeature
	});}
function onEachFeatureRG(feature, layer) {
	layer._leaflet_id = feature.properties.nome;
	// console.log(layer._leaflet_id);
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: highlightFeature
	});}
function AtualizaCoresUF(){
	// console.log(Pop)
	var UFs = groupCasos_dimUF.top(Infinity);
	UFs.forEach(function (d){
		geojsonUFs.resetStyle(geojsonUFs._layers[d.key]);
		// console.log(layer)
	});}

function style(feature) {
	var quantize = getQuantize();
	var ind = IndCor(feature.properties),
	cor = quantize(ind);
	return {
		weight: 2,
		opacity: 1,
		color: '#242424',
		dashArray: '3',
		fillOpacity: 1,
		fillColor: quantize(ind)};}

function getFeature(id){
	if(controleUF_RG)
		return geojsonRGs._layers[id].feature;
	else
		return geojsonUFs._layers[id].feature;
}
function getLayer(id){
	if(controleUF_RG)
		return geojsonRGs._layers[id];
	else
		return geojsonUFs._layers[id];
}


function IndCor(id){
	if(controleUF_RG){
		if(escala){
			// var let = 
			// indRG[] letPorRG.get(id.nome));
			return letPorRG.get(id.nome);
		}
		return taxaPorRG.get(id.nome);
	}
	if(escala)
		return letPorUF.get(id.UF);
	return taxaPorUF.get(id.UF);
	return 0;
}



function AtualizaCoresRG(){
	
	var RGs = groupCasos_dimRG.top(Infinity);
	RGs.forEach(function (d){
		geojsonRGs.resetStyle(geojsonRGs._layers[d.key]);});
}

function highlightFeature(e) {
	let layer;
	if(e.target)
		layer = e.target;
	else
		layer = e;

	layer.setStyle({
				weight: 3,
				color: 'white',
				dashArray: '',
				fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}

	info.update(layer.feature);}

function resetHighlight(e) {
	if(controleUF_RG)
		geojsonRGs.resetStyle(e.target);
	else
		geojsonUFs.resetStyle(e.target);
	info.update();
}

function getColors(){
	if(escala == 0)
		return colorbrewer.Reds[7];
	return ['#f7f7f7','#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525'];}

function getQuantize(){
	if(escala == 0){
	    return (d3.scale.linear()
			.domain([0,3,6,9,12,15,20])
			.range(getColors()));
	    }
	    return (d3.scale.linear()
		    .domain([0,1,3,5,7,10,15])
		    .range(getColors()));}

function dataToNum(inDate) {
    var returnDateTime = 25569.0 + ((inDate.getTime() - (inDate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
    return returnDateTime.toString().substr(0,5);}
function NumToData(serial) {
   var utc_days  = Math.floor(serial - 25569);
   var utc_value = utc_days * 86400;                                        
   var date_info = new Date(utc_value * 1000);
   var ano = date_info.getFullYear(),
   mes = date_info.getMonth()+1,
   dia =  date_info.getDate()+1;
   return dtgFormat.parse(dia+"/"+mes+"/"+ano);}

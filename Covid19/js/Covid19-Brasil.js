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


let centroMapa = [-13, -65],
	zoomMapa = 4;

let Mapa = L.map('divMapa').setView(centroMapa, zoomMapa);
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {maxZoom: 18, attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`})
.addTo(Mapa);

let dimData, dimUF, dimRG; 
let groupCasos_dimUF, groupObitos_dimUF,
groupCasos_dimRG, groupObitos_dimRG; 

let casosPorUF = d3.map(), obitosPorUF = d3.map(), 
	taxaPorUF = d3.map(), letPorUF = d3.map();

let casosPorRG = d3.map(), obitosPorRG = d3.map(), 
	taxaPorRG = d3.map(), letPorRG = d3.map();


let dataAtual, dataInicial, dataFinal, escala=false, controleUF_RG=false,
 dtgFormat = d3.time.format("%d/%m/%Y");	

dataInicial = dtgFormat.parse("15/03/2020");

var layerGroup_UF = new L.LayerGroup();
var layerGroup_RG = new L.LayerGroup();


let geojsonUFs, geojsonRGs;


// let geojsonRGs = L.geoJson(Regioes, {
	
// });
// layerGroup_RG.addLayer(RGs);


function trocaEscala(){
	escala = !escala;
	render();
}
function trocaControleUF_RG(){
	controleUF_RG = !controleUF_RG;
	render();
}
function alteraDia(){
	
	var formatDay = d3.time.format("%d"),
	formatMonth = d3.time.format("%m"),
	formatYear = d3.time.format("%Y");

	var dataLabel = document.getElementById("dataLabel");
	var title = document.getElementById("title");

	var novaData = NumToData(document.getElementById("dataRange").value);
	var dia  = formatDay(novaData),
	mes = formatMonth(novaData),
	ano = formatYear(novaData);

	dataLabel.innerHTML = '<label id = "dataLabel"> Data: '+dia+"/"+mes+"/"+ano+'</label>';
	title.innerHTML = 'Coronavírus no Brasil - '+dia+"/"+mes+"/"+ano+'';
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
	groupCasos_dimRG = dimRG.group()
		.reduceSum(function(d){
			return d.casosNovos;});
	groupObitos_dimUF = dimUF.group()
		.reduceSum(function(d){
			return d.obitosNovos;});
	groupObitos_dimRG = dimRG.group()
		.reduceSum(function(d){
			return d.obitosNovos;});

	// Atualizando datas:

	dataFinal = dimData.top(1)[0].data;;
	dataAtual = dataFinal;
	console.log(dataFinal);

	document.getElementById("dataRange").min = dataToNum(dataInicial);
	document.getElementById("dataRange").max = dataToNum(dataFinal);
	document.getElementById("dataRange").value = dataToNum(dataFinal);
	
	
	atualiza_mapsUFs();
	atualiza_mapsRGs();

	geojsonUFs = L.geoJson(Estados, {
		style: styleUF,
		onEachFeature: onEachFeatureUF
	});

	layerGroup_UF.addLayer(geojsonUFs);

	geojsonRGs = L.geoJson(Regioes, {
		style: styleRG,
		onEachFeature: onEachFeatureRG
	});
	layerGroup_RG.addLayer(geojsonRGs);

	// render();
	alteraDia();
	
});


function render(){

	Mapa.removeLayer(layerGroup_UF);
	Mapa.removeLayer(layerGroup_RG);

	console.log("Renderizando - "+ dataAtual);

	dimData.filter(function(d){
		if(d<=dataAtual)
		return d;
	});

	// Mapa.


	atualiza_mapsUFs();
	atualiza_mapsRGs();

	if(!controleUF_RG){
		console.log("Mapa por Estado");
		layerGroup_UF.addTo(Mapa);
		AtualizaCoresUF();
	}else{
		console.log("Mapa por regiao");
		layerGroup_RG.addTo(Mapa);
		AtualizaCoresRG();
	}

	// console.log(casosPorUF.get("SP"));
	// console.log(taxaPorUF.get("SP"));
	// console.log(obitosPorUF.get("SP"));
	// console.log(letPorUF.get("SP"));

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


function styleUF(feature) {
	var quantize = getQuantize();
	var ind = 0;
	if(escala == 0)
		ind = taxaPorUF.get(feature.properties.UF);
	else
		ind = letPorUF.get(feature.properties.UF);
	
	return {
		weight: 2,
		opacity: 1,
		color: '#AAA',
		dashArray: '3',
		fillOpacity: 1,
		fillColor: quantize(ind)
};}

function onEachFeatureUF(feature, layer) {

	layer._leaflet_id = feature.properties.UF;
	console.log(layer._leaflet_id);
	// 	layer.on({
	// 		// mouseover: highlightFeature,
	// 		// mouseout: resetHighlight,
	// 		// click: zoomToFeature
	// });
}
function AtualizaCoresUF(){
	// console.log(Pop)
	var UFs = groupCasos_dimUF.top(Infinity);
	UFs.forEach(function (d){
		geojsonUFs.resetStyle(geojsonUFs._layers[d.key]);
		// console.log(layer)
	});
}

function styleRG(feature) {
	var quantize = getQuantize();
	var ind = 0;
	if(escala == 0)
		ind = taxaPorRG.get(feature.properties.nome);
	else
		ind = letPorRG.get(feature.properties.nome);
	return {
		weight: 2,
		opacity: 1,
		color: '#AAA',
		dashArray: '3',
		fillOpacity: 1,
		fillColor: quantize(ind)
};}

function onEachFeatureRG(feature, layer) {

	layer._leaflet_id = feature.properties.nome;
	// 	layer.on({
	// 		// mouseover: highlightFeature,
	// 		// mouseout: resetHighlight,
	// 		// click: zoomToFeature
	// });
}
function AtualizaCoresRG(){
	// console.log(Pop)
	var RGs = groupCasos_dimRG.top(Infinity);
	RGs.forEach(function (d){
		geojsonRGs.resetStyle(geojsonUFs._layers[d.key]);});
}

function getColors(){
	if(escala == 0)
		return colorbrewer.Reds[6];
	return ['#f7f7f7','#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525'];}

function getQuantize(){
	if(escala == 0){
	    return (d3.scale.linear()
			.domain([0,3,6,9,12,15])
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

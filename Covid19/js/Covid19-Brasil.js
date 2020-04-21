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
let centroMapa = [-14, -54],zoomMapa = 5;
var popBR = 210147125;
// if(window.innerWidth<1000)
// 	zoomMapa = 4;

var formatoNum = d3.format(",d");

let dimData, dimUF, dimRG; 
let groupCasos_dimUF, groupObitos_dimUF, groupTaxa_dimUF, groupLet_dimUF,
groupCasos_dimRG, groupObitos_dimRG, groupTaxa_dimRG, groupLet_dimRG;

let groupCasos_dimData, groupObitos_dimData,
 groupNovosCasos_dimData, groupNovosObitos_dimData;  

let casosPorUF = d3.map(), obitosPorUF = d3.map(), 
	taxaPorUF = d3.map(), letPorUF = d3.map();

let casosPorRG = d3.map(), obitosPorRG = d3.map(), 
	taxaPorRG = d3.map(), letPorRG = d3.map();

let casosPorData = d3.map(), obitosPorData = d3.map(), 
	taxaPorData = d3.map(), letPorData = d3.map();

let RGPorUF = d3.map();

let dataAtual, dataInicial, dataFinal, escala=false, controleUF_RG=false, ControleTxVa=false,
 dtgFormat = d3.time.format("%d/%m/%Y"), formatDay = d3.time.format("%d"),
	formatMonth = d3.time.format("%m"),
	formatYear = d3.time.format("%Y");
	

let quantizeTaxa = d3.scale.linear()
			.domain([0,5,10,15,20,30,40])
			.range(['#eff3ff','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#084594']),
				
			// .range(['#edf8e9','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#005a32'])
			// .range(['#eff3ff','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#084594'])
			
			// .range(colorbrewer.Reds[7]),
	quantizeLet = d3.scale.linear()
			    .domain([0,1,3,5,7,10,15])
			    .range(['#f2f0f7','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#4a1486']),
			    // .range(['#f7f7f7','#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525']),

	quantizeCasos = d3.scale.linear()
				.domain([0,100,500,1000,5000,10000,15000])
				.range(['#edf8fb','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#005824']),
				
				// .range(['#eff3ff','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#084594']),
				// .range(colorbrewer.Reds[7]),

	quantizeObitos = d3.scale.linear()
			    .domain([0,10,50,100,200,500,1000])
			    .range(['#edf8e9','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#005a32'])
			    // .range(['#f2f0f7','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#4a1486'])
			   ;
			    // .range(['#f2f0f7','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#4a1486']);

// console.log(quantizeObitos.range());

let graficoNovosCasos,
graficoNovosObitos, graficoCasosAcumulados,
graficoAcumulados, graficoUF, graficoRG;


var layerGroup_UF = new L.LayerGroup();
var layerGroup_RG = new L.LayerGroup();
let geojsonUFs, geojsonRGs;


let Mapa = L.map('divMapa', { zoomControl:false }).setView(centroMapa, zoomMapa);
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {maxZoom: 18, attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`})
.addTo(Mapa);
Mapa.scrollWheelZoom.disable();
Mapa.doubleClickZoom.disable();

let info = L.control(), 
legenda = L.control({position: 'bottomright'}),
defMapa = L.control({position: 'bottomleft'}); 

legenda.onAdd = function (map) {
	
	var title = '';

	if(escala)
		if(ControleTxVa)
			title = '<b>Nº de Óbitos</b>';
		else
			title = '<b>Letalidade (%)</b>';
	else
		if(ControleTxVa)
			title = '<b> Nº de Casos</b>';
		else
			title = '<b>Taxa por 100 mil/h </b>';

	var format = d3.format("s");
	var quantize = getQuantize();
	var brewerColors = quantize.range();
	let div = L.DomUtil.create('div', 'info legend'),
	labels = [],
	n = brewerColors.length,
	from, to;
	labels.push(title);

	for (let i = 0; i < n; i++) {
		let c = brewerColors[i];
		let fromto = quantize.domain();//.invertExtent(c);
		var v1 = format(d3.round(fromto[i],1)),
		v2 = d3.round(fromto[i+1],1);

		labels.push(
		'<i style="background:' + brewerColors[i] + '"></i> ' +
		v1 + (v2 ? ' &ndash; ' + format(v2) : '+'));
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

defMapa.onAdd = function(mymap){
	let div = L.DomUtil.create('div', 'info');
	labels = [];
	// labels.push('<h2 style="padding: 10px;">-</h2>')
	var seletor = '<b>Estado/Região</b> <br> <label class="switch" style="margin-top:20px;">' + 
		'<input type="checkbox" id="DefMap" onchange="trocaControleUF_RG()">' + 
		'<span class="slider round"></span>' + 
		'</label>';
	labels.push(seletor);
	div.innerHTML = labels.join('<br>');

	return div;}

function trocaEscala(){
	escala = !escala;
	atualizaMapa();
	atualizaGraficos();
	// render();
}
function trocaControleUF_RG(){
	controleUF_RG = !controleUF_RG;
	info.update();
	atualizaMapa();
}

function trocaControleTxVa(){
	// alert("Não implementado ainda");
	ControleTxVa = !ControleTxVa;

	atualizaMapa();
	atualizaGraficos();		
}
function limparFiltros(){
	dc.filterAll(); 
	Mapa.flyTo(centroMapa, zoomMapa);}


function alteraDia(){
	
	limparFiltros();
	console.log(dataAtual);

	var novaData = NumToData(document.getElementById("dataRange").value);
	dataAtual = novaData;


	dimData.filter(function(d){
		if(d<=dataAtual)
		return d;
	});
	

	atualiza_mapsUFs();
	atualiza_mapsRGs();

	atualizaMapa();
	atualizaGraficos();

	var title = document.getElementById("title"),
	dia  = formatDay(dataAtual),
	mes = formatMonth(dataAtual),
	ano = formatYear(dataAtual),
	dataLabel = document.getElementById("dataLabel");

	dataLabel.innerHTML = '<label id = "dataLabel"> Data: '+dia+"/"+mes+"/"+ano+'</label>';


	title.innerHTML = 'Coronavírus no Brasil ('+dia+"/"+mes+"/"+ano+')<h1>'+
		'<span class="label label-default">'+casosPorData.get(dataAtual).toLocaleString('pt-BR')+' Casos</span>\n'+
		'<span class="label label-default">'+d3.round(taxaPorData.get(dataAtual),1)+' p/ 100mil/h</span>\n'+
		'<span class="label label-default">'+obitosPorData.get(dataAtual).toLocaleString('pt-BR')+' Óbitos</span>\n'+
		'<span class="label label-default">'+d3.round(letPorData.get(dataAtual),1)+'% Let.</span> \n'+	
		// '<button  class="label label-default" onclick="maisInfos()">+<span>'+
		'</h1>';}
function atualizaMapa(){

	Mapa.removeLayer(layerGroup_UF);
	Mapa.removeLayer(layerGroup_RG);
			

	legenda.addTo(Mapa);

	if(controleUF_RG){
		layerGroup_RG.addTo(Mapa);
		AtualizaCoresRG();
	}else{
		layerGroup_UF.addTo(Mapa);
		AtualizaCoresUF();
	}}
function atualizaGraficos(){

	let minDate = d3.time.day.offset(dataAtual, -30),
	maxDate = d3.time.day.offset(dataAtual, 1)

	graficoNovosCasos.x(d3.time.scale().domain([minDate, maxDate]));
	graficoNovosObitos.x(d3.time.scale().domain([minDate, maxDate]));
	graficoAcumulados.x(d3.time.scale().domain([minDate, maxDate]));
	
	graficoAcumulados.render();

	var titleAbs = document.getElementById("valoresAbsolutosTitle");
	var titleAbsRG = document.getElementById("valoresAbsolutosRGTitle");

	if(escala){
		if(ControleTxVa){
			// console.log("valores absolutos");
			graficoUF.group(groupObitos_dimUF)
				.title(function(d){
					if(d.value == 0)
		        		return '-';
					return d3.round(d.value,1).toLocaleString("pt-BR");
				})
				;
			graficoRG.group(groupObitos_dimRG)
				.title(function(d){
					if(d.value == 0)
		        		return '-';
					return d3.round(d.value,1).toLocaleString("pt-BR");
				});
			titleAbs.innerHTML = 'Total de óbitos registrados, por estado';
			titleAbsRG.innerHTML='Total de óbitos registrados, por região';
		}else{
			
			groupLet_dimUF.top(Infinity).forEach(function(x){
				x.value = letPorUF.get(x.key);
			});
			groupLet_dimRG.top(Infinity).forEach(function(x){
				x.value = letPorRG.get(x.key);
			});

			
			graficoUF.group(groupLet_dimUF)
				.title(function(d){
					if(d.value == 0)
		        		return '-';
					return d3.round(d.value,1).toLocaleString("pt-BR")+'%';
				});
			graficoRG.group(groupLet_dimRG)
				.title(function(d){
					if(d.value == 0)
		        		return '-';
					return d3.round(d.value,1).toLocaleString("pt-BR")+'%';
				});

			titleAbs.innerHTML = 'Taxa de Letalidade (%), por estado';
			titleAbsRG.innerHTML='Taxa de Letalidade (%), por região';
		}
	}else{

		if(ControleTxVa){
			graficoUF.group(groupCasos_dimUF)
				.title(function(d){
					if(d.value == 0)
		        		return '-';
					return d3.round(d.value,1).toLocaleString("pt-BR");
				});
			graficoRG.group(groupCasos_dimRG)
				.title(function(d){
					if(d.value == 0)
		        		return '-';
					return d3.round(d.value,1).toLocaleString("pt-BR");
				});
			titleAbs.innerHTML = 'Total de casos confirmados, por estado';
			titleAbsRG.innerHTML='Total de casos confirmados, por região';

		}else{
			
			groupTaxa_dimUF.top(Infinity).forEach(function(x){
				x.value = taxaPorUF.get(x.key);
			});
			groupTaxa_dimRG.top(Infinity).forEach(function(x){
				x.value = taxaPorRG.get(x.key);
			});

			graficoUF.group(groupTaxa_dimUF)
				.title(function(d){
					if(d.value == 0)
		        		return '-';
					return d3.round(d.value,1).toLocaleString("pt-BR");
				});
			graficoRG.group(groupTaxa_dimRG)
				.title(function(d){
					if(d.value == 0)
		        		return '-';
					return d3.round(d.value,1).toLocaleString("pt-BR");
				});

			titleAbs.innerHTML = 'Nº de casos para cada 100 mil habitantes, por estado';
			titleAbsRG.innerHTML='Nº de casos para cada 100 mil habitantes, por região';
		}
	}

	// var cores = getQuantize();

	// graficoUF.colors(function(d){
	// 	return cores(indPorUF(d));
	// });

	// graficoRG.colors(function(d){
	// 	return cores(indPorRG(d));
	// });

	dc.renderAll();

	d3.selectAll("g.row")
		.on('mouseover', function(d){

			try {
			  highlightFeature(getLayer(d.key));
			}
			catch(err) {
				console.log("layer não está no mapa");
			  // console.log(err);
			}
			
	 	})
	 	.on('mouseout', function(d){
	 		if(controleUF_RG)
	 			geojsonRGs.resetStyle(geojsonRGs[d.key]);
	 		else
	 			geojsonUFs.resetStyle(geojsonUFs[d.key]);
	 		
	 		info.update();
	 	});}

function maisInfos(){
	// alert("teste");
}

d3.csv("data/minSaude.csv", function(data){

// d3.csv("https://adimo.clinicasodontologicas.com.br/static/minSaude.csv", function(data){
	// console.log(data);
	data.forEach(function(d) {
		// console.log(d);
		d.regiao = d.regiao;
		d.uf = d.estado;
	
		// var Y = d.data.substr(0,4),
		// M = d.data.substr(5,2),
		// D = d.data.substr(8,2),
		// strData = D+'/'+M+'/'+Y;
		
		// console.log(d.data.substr(3,2));

		// d.data = dtgFormat.parse(strData);
		d.data =dtgFormat.parse(d.data);


		d.nome = nomeUF(d.uf);
		d.casosNovos = +d.casosNovos;
		d.casosAcumulados = +d.casosAcumulados;
		d.obitosNovos = +d.obitosNovos;
		d.obitosAcumulados = +d.obitosAcumulados;
		d.populacao = populacaoUF(d.uf);

		RGPorUF.set(d.uf, d.regiao);
		});


	// Atualizando datas:
	inicializa(data);

	// console.log(dimData.top(Infinity));

	dataFinal = dimData.top(1)[0].data;
	dataInicial = d3.time.day.offset(dataFinal, -15);
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
	defMapa.addTo(Mapa);


	inicializaGraficos();


	alteraDia();

});

function inicializa(data){
	
	var facts = crossfilter(data);
	
	//CrossFilter Dimensions :	
	dimData = facts.dimension(function(d){
		// console.log(d.data);
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
	
	// function reduceAdd(p, v, nf) {
	// 	console.log(p);
	// 	console.log(v);
	// 	console.log(nf);
	//   return p + 1;
	// }

	// function reduceRemove(p, v, nf) {
	//   return p - 1;
	// }

	// function reduceInitial() {
	//   return 0;
	// }

	// groupTaxa_dimUF = dimUF.group(reduceAdd,reduceRemove,reduceInitial);

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
	groupNovosCasos_dimData = dimData.group()
		.reduceSum(function(d){
			return d.casosNovos;});
	groupObitos_dimData = dimData.group()
		.reduceSum(function(d){
			return d.obitosAcumulados;});
	groupNovosObitos_dimData = dimData.group()
		.reduceSum(function(d){
			return d.obitosNovos;});

	
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
	

}
function inicializaGraficos(){

	graficoNovosCasos = new dc.barChart("#divNovosCasos");
	graficoNovosObitos = new dc.barChart("#divNovosObitos");
	graficoAcumulados = new dc.compositeChart("#divObitosAcumulados");
	graficoUF = new dc.rowChart("#divCasosPorUF");
	graficoRG = new dc.rowChart("#divCasosPorRG");

	
    var x = (window.innerWidth),
    widthGraficos = x*0.38,
    heightGraficos = 350;	

    if(x<1500){
    	widthGraficos = x*0.8;
    }

 //    vardocument.getElementById("valoresAbsolutosTitle")).style.width = widthGraficos;
	// document.getElementById("valoresAbsolutosRGTitle").style.width = widthGraficos;

    var marginsGraficos = {left: 60, top: 10, right: 80, bottom: 60};

	graficoNovosCasos
		.width(widthGraficos)
		.height(heightGraficos)
		.elasticY(true)
		.margins(marginsGraficos)
		.xUnits(d3.time.days)
		.centerBar(true)
		.brushOn(false)
		.title(function(d){
			var dia  = formatDay(d.key),
			mes = formatMonth(d.key);
			return ('('+dia+'/'+mes+'): '+d.value+'');
		})
		.renderHorizontalGridLines(true)
       	.renderVerticalGridLines(true)
		.colors(['#e34a33'])
		.dimension(dimData)
		.group(groupNovosCasos_dimData)
		.on('renderlet', function (chart) {
		   	chart.selectAll('g.x text')
		     	.attr('transform', 'translate(-20,20) rotate(-45)')

		     });
	graficoNovosObitos
		.width(widthGraficos)
		.height(heightGraficos)
		.elasticY(true)
		.margins(marginsGraficos)
		.brushOn(false)
		.centerBar(true)
		.brushOn(false)
		.xUnits(d3.time.days)
		.title(function(d){
			var dia  = formatDay(d.key),
			mes = formatMonth(d.key);
			return ('('+dia+'/'+mes+'): '+d.value+'');
		})
		.renderHorizontalGridLines(true)
       	.renderVerticalGridLines(true)
		.colors(['black'])
		.dimension(dimData)
		.group(groupNovosObitos_dimData)
		.on('renderlet', function (chart) {
		   	var txt = chart.selectAll('g.x text');
		   	txt.attr('transform', 'translate(-15,15) rotate(315)')
		});
	graficoAcumulados
		.width(widthGraficos)
		.height(heightGraficos)
		.margins(marginsGraficos)
		.brushOn(false)
		.xUnits(d3.time.days)
		.elasticY(true)
		.title(function(d){
			var dia  = formatDay(d.key),
			mes = formatMonth(d.key);
			return ('('+dia+'/'+mes+'): '+d.value+'');
		})
		.legend(dc.legend().x(80).y(20).itemHeight(20).gap(10))
		.renderHorizontalGridLines(true)
       	.renderVerticalGridLines(true)
       	.compose([
       		dc.lineChart(graficoAcumulados)
       			.group(groupCasos_dimData, "Nº Infectados")
       			// .centerBar(true)
       			.renderArea(true)
       			.renderDataPoints(true)
       			.ordinalColors(['#e34a33']),
       		dc.barChart(graficoAcumulados)
       			.group(groupObitos_dimData, "Óbitos")
       			.centerBar(true)
       			// .label(function(d){
       			// 	if(d.y>1000)
		        // 		return d3.round((d.y/1000),1)+'k';
		        // })
       			.ordinalColors(['black'])
       	])
       	.on('renderlet', function (chart) {
		   	var txt = chart.selectAll('g.x text');
		   	txt.attr('transform', 'translate(-15,15) rotate(315)')
		});


	graficoUF
		.width(widthGraficos)
		.height((heightGraficos*2)+65)
	    .margins(marginsGraficos)
		.renderLabel(true)
		.renderTitleLabel(true)
		.labelOffsetX(-30)
		.elasticX(true)
		.dimension(dimUF)
		.group(groupCasos_dimUF)
		.title(function(d){
			if(d.value == 0)
        		return '-';
			return d.value.toLocaleString("pt-BR");
			// return(d.key +':'+d.value);
		})
		.colorAccessor(function (d, i){return d.key;})
		.colors(function(d){
			return colorRegiao(RGPorUF.get(d));
		})
		.on('filtered', function(d){
			groupTaxa_dimRG.top(Infinity).forEach(function(x){
				x.value = taxaPorRG.get(x.key);
			});
			groupLet_dimRG.top(Infinity).forEach(function(x){
				x.value = letPorRG.get(x.key);
			});
		})


		;
	graficoRG
		.width(widthGraficos)
		.height(heightGraficos)
	    .margins(marginsGraficos)
	    // .margins({left: 110, top: 10, right: 80, bottom: 60})
		.dimension(dimRG)
		.group(groupCasos_dimRG)
		.labelOffsetX(-30)
		.label(function(d){
			return siglaRegiao(d.key);
		})
		.elasticX(true)
		.renderTitleLabel(true)
		.title(function(d){
			if(d.value == 0)
        		return '-';
			return d.value.toLocaleString("pt-BR");
		})
		.colorAccessor(function (d, i){return d.key;})
		.colors(function(d){
			return colorRegiao(d);
		})
		.filterHandler(function(dimension, filters){
			// console.log(dimension);
			// console.log(filters);
            dimension.filter(null);
                if(filters.length === 0){
                	
                	groupTaxa_dimUF.top(Infinity).forEach(function(x){
						x.value = taxaPorUF.get(x.key);
					});
					groupLet_dimUF.top(Infinity).forEach(function(x){
						x.value = letPorUF.get(x.key);
					});
                    dimension.filter(null);
                } else {
                	


                    dimension.filterFunction(function(d){
                    	for(var i = 0; i < filters.length; ++i) {
                            var filter = filters[i];
                            if(d.indexOf(filter) === 0) return true;
                        }
                        return false;
                    });

                    // for(var i=0;i)
                    groupTaxa_dimUF.top(Infinity).forEach(function(x){
						var rg = RGPorUF.get(x.key);
						var controle = false; 
						for(var i =0; i<filters.length; ++i){
							if(filters[i] == rg)
								controle = true;
						}
						if(controle)
							x.value = taxaPorUF.get(x.key);
						else
							x.value = 0;
					});
                    groupLet_dimUF.top(Infinity).forEach(function(x){
						var rg = RGPorUF.get(x.key);
						var controle = false; 
						for(var i =0; i<filters.length; ++i){
							if(filters[i] == rg)
								controle = true;
						}
						if(controle)
							x.value = letPorUF.get(x.key);
						else
							x.value = 0;
					});
                }
        });
		// .on('filtered', function(d, filter, i){
		// 	console.log(d);
		// 	console.log(filter);
		// 	console.log(i);
		
		// 	// console.log(d.filterPrinter());
		// 	// console.log(d.data());
		// 	if(filter){
		// 		groupTaxa_dimUF.top(Infinity).forEach(function(x){
		// 		if(RGPorUF.get(x.key)==filter)
		// 			x.value = taxaPorUF.get(x.key);
		// 		else{
		// 			x.value = 0;
		// 		}
		// 		});
		// 	}

		// })
		;


	graficoNovosCasos
		.xAxis()
		    .ticks(d3.time.days, 2)
		    .tickFormat(function(d){
		    	var dia = formatDay(d),
		    	mes = formatMonth(d);
		    	return (dia+'/'+mes);});
	graficoNovosCasos
		.yAxis()
	    	.tickFormat(function(d){
		    	return d.toLocaleString("pt-BR");
		    });
	graficoNovosObitos.xAxis()
	    .ticks(d3.time.days, 2)
	    .tickFormat(function(d){
	    	var dia = formatDay(d),
	    	mes = formatMonth(d);
	    	return (dia+'/'+mes);
	    });
	graficoNovosObitos
		.yAxis()
	    	.tickFormat(function(d){
		    	return d.toLocaleString("pt-BR");
		    });
	graficoAcumulados.xAxis()
	    .ticks(d3.time.days, 2)
	    .tickFormat(function(d){
	    	var dia = formatDay(d),
	    	mes = formatMonth(d);
	    	return (dia+'/'+mes);
	    });
	graficoAcumulados
		.yAxis()
	    	.tickFormat(function(d){
		    	return d.toLocaleString("pt-BR");
		    });
	graficoRG
		.xAxis()
	    	.tickFormat(function(d){
		    	return d.toLocaleString("pt-BR");
		    });
	graficoUF
		.xAxis()
	    	.tickFormat(function(d){
		    	return d.toLocaleString("pt-BR");
		    });}



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
			click: highlightFeaturev2
	});}
function onEachFeatureRG(feature, layer) {
	layer._leaflet_id = feature.properties.nome;
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: highlightFeaturev2
	});}
function AtualizaCoresUF(){

	var quantize = getQuantize();

	var UFs = groupCasos_dimUF.top(Infinity);
	UFs.forEach(function (d){
		var layer = geojsonUFs._layers[d.key];
		geojsonUFs.resetStyle(layer);
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
		return geojsonUFs._layers[id].feature;}

function getLayer(id){
	if(controleUF_RG)
		return geojsonRGs._layers[id];
	else
		return geojsonUFs._layers[id];}

function IndCor(id){

	if(escala){ //Obitos
		if(controleUF_RG){ //Obitos Por Região
			if(ControleTxVa){  //Valores Absolutos
				return obitosPorRG.get(id.nome);
			}
			return letPorRG.get(id.nome);
		}
		if(ControleTxVa){
			return obitosPorUF.get(id.UF);
		}
		return letPorUF.get(id.UF);
	}
	// Casos 
	if(controleUF_RG){ // Casos por Região
		if(ControleTxVa) //Valores absolutos
			return casosPorRG.get(id.nome);
		return taxaPorRG.get(id.nome);
	}
	if(ControleTxVa)
		return casosPorUF.get(id.UF);
	return taxaPorUF.get(id.UF);


	// if(controleUF_RG){
	// 	if(escala){
	// 		return letPorRG.get(id.nome);
	// 	}
	// 	return taxaPorRG.get(id.nome);
	// }
	// if(escala)
	// 	return letPorUF.get(id.UF);
	// return taxaPorUF.get(id.UF);
	return 0;}
function indPorUF(id){

	if(escala){ //Obitos
		if(ControleTxVa){
			return obitosPorUF.get(id);
		}
		return letPorUF.get(id);
	}
	if(ControleTxVa)
		return casosPorUF.get(id);
	return taxaPorUF.get(id);
}
function indPorRG(id){

	if(escala){ //Obitos
		if(ControleTxVa){  //Valores Absolutos
			return obitosPorRG.get(id);
		}
		return letPorRG.get(id);
		
	}
	// Casos 
	if(ControleTxVa) //Valores absolutos
		return casosPorRG.get(id);
	return taxaPorRG.get(id);
	
	return 0;}


function AtualizaCoresRG(){
	
	var RGs = groupCasos_dimRG.top(Infinity);
	RGs.forEach(function (d){
		geojsonRGs.resetStyle(geojsonRGs._layers[d.key]);});}
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
function highlightFeaturev2(e) {

	let layer =  e.target;
	var cod = layer.feature.properties.UF;
	// dimUF.filter(function(d){
	// 	console.log(d);
	// 	if(d == cod);
	// 		return true;
	// 	return false;
	// })
	// dimUF.filter(cod);
	// dc.renderAll();


	info.update(layer.feature);

}
function resetHighlight(e) {
	if(controleUF_RG)
		geojsonRGs.resetStyle(e.target);
	else
		geojsonUFs.resetStyle(e.target);
	info.update();}

function getQuantize(){
	if(escala){
		if(ControleTxVa)
			return quantizeObitos;
		return quantizeLet;
	}else{
		if(ControleTxVa)
			return quantizeCasos;
		return quantizeTaxa;
	}
}
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

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
	.range(['#b3e2cd','#fdcdac','#cbd5e8','#f4cae4','#e6f5c9']);


let centroMapa = [-13, -65],
	zoomMapa = 4;

let Mapa = L.map('divMapa').setView(centroMapa, zoomMapa);

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {maxZoom: 18, attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`})
.addTo(Mapa);


let dataAtual, dataInicial, dataFinal, escala=false, controleUF_RG=false,
 dtgFormat = d3.time.format("%d/%m/%Y");	

dataInicial = dtgFormat.parse("30/01/2020");
dataFinal = dtgFormat.parse("10/04/2020");
dataAtual = dataFinal;

var xMin = dataToNum(dataInicial),
xMax = dataToNum(dataFinal);

console.log(NumToData(xMin));

document.getElementById("dataRange").min = xMin;
document.getElementById("dataRange").max = xMax;
document.getElementById("dataRange").value = xMax;

function trocaEscala(){
	escala = !escala;
	render();
}
function trocaControleUF_RG(){
	controleUF_RG = !controleUF_RG;
	render();
}


function trocaDia(){
	
	var formatDay = d3.time.format("%d"),
	formatMonth = d3.time.format("%m"),
	formatYear = d3.time.format("%Y");

	var dataLabel = document.getElementById("dataLabel");
	

	var novaData = NumToData(document.getElementById("dataRange").value);
	var dia  = formatDay(novaData),
	mes = formatMonth(novaData),
	ano = formatYear(novaData);

	dataLabel.innerHTML = '<label id = "dataLabel"> Data: '+dia+"/"+mes+"/"+ano+'</label>';

	dataAtual = novaData;
	render();}


function limparFiltros(){
	console.log("teste");
}

var dim_UF_Data, uf_Data_Casos; 

d3.csv("data/minSaude.csv", function(data){
	data.forEach(function(d) {
		
		d.regiao = d.regiao;
		d.uf = d.estado;
		d.date = dtgFormat.parse(d.data);
		d.nome = nomeUF(d.uf);
		d.casosNovos = +d.casosNovos;
		d.casosAcumulados = +d.casosAcumulados;
		d.obitosNovos = +d.obitosNovos;
		d.obitosAcumulados = +d.obitosAcumulados;
		d.populacao = populacaoUF(d.uf);
		});
	var facts = crossfilter(data);
			
	dim_UF_Data = facts.dimension(function(d){
		return 'data='+d.date+'UF='+d.uf;
	});

	
});

function render(){
	console.log("Renderizando");
	console.log(dataAtual);
	console.log(escala);
	console.log(controleUF_RG);
	console.log(dim_UF_Data);
	
	uf_Data_Casos = dim_UF_Data.group().reduceSum(function(d){
		return d.casosAcumulados;
	});
	console.log(uf_Data_Casos.top(Infinity));

}
// console.log("teste");
// console.log(regioes);

// console.log(estados);
// L.geoJson(estados, {

// 		style: {fill:'blue'}

// 				}).addTo(Mapa);	

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

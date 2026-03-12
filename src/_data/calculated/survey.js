import { loadCsv, loadYaml, cleanGraphData, minMaxDates, expandToRange } from "lib/data-helpers.js";

const results = await loadCsv('src/_data/published/survey/results.csv');
const params = await loadYaml('pipelines/params.yaml');

function breakdown(variable){

	const byMonth = results.filter(r => 
		r.aggregation == 'BY_MONTH' && r.variable == variable
	).map(cleanGraphData).map(x => ({ ...x, percent: x.value*100 }));

	const dates = minMaxDates(byMonth,'Date');
	
	const dashboards = {};
	if(variable == "rated_good_or_excellent"){
		// Build monthly values
		const monthly = {};
		for(let i = 0; i < results.length; i++){
			if(results[i].aggregation == 'BY_MONTH'){
				let month = results[i].month;
				if(!(month in monthly)) monthly[month] = {};
				monthly[month][results[i].variable] = results[i].value;
			}
		}
		for(let d in params.dashboards){
			dashboards[d] = 0;
			let responses = 0;
			for(let dt in monthly){
				if(dt >= params.dashboards[d].start && dt <= params.dashboards[d].end){
					responses += monthly[dt].responses;
					dashboards[d] += monthly[dt].responses * monthly[dt].rated_good_or_excellent;
				}
			}
			dashboards[d] *= 100/responses;
		}
	}

	return {

		all: results.find((r) => 
			r.aggregation == 'TOTAL' &&
			r.variable == variable
		),

		monthly: {
			all: expandToRange(byMonth,dates),
		},

		dashboards: dashboards,

		dates: dates

	}
}

export default {
    responses: breakdown('responses'),
	rated_good_or_excellent: breakdown('rated_good_or_excellent'),
	nps: breakdown('nps'),
}
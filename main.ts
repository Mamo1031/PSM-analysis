import PSM_Analysis from "./psm_analysis";

const csv_file_path = 'PSMrawdata.csv';
const psm_analysis  = new PSM_Analysis(csv_file_path);
const csv_data      = psm_analysis.read_csv(csv_file_path);

const max_val  = Math.max(...csv_data[2]); // 600
const data_num = csv_data[0].length;       // 36
const interval = 50;

const aggregation_result = psm_analysis.aggregate(csv_data, max_val, interval, data_num);

const highest_price    = psm_analysis.calc_price(aggregation_result[2], aggregation_result[1]); // too_high, low
const compromise_price = psm_analysis.calc_price(aggregation_result[0], aggregation_result[1]); // high, low
const ideal_price      = psm_analysis.calc_price(aggregation_result[2], aggregation_result[3]); // too_high, too_low
const lowest_price     = psm_analysis.calc_price(aggregation_result[0], aggregation_result[3]); // high, too_low

console.log(`最高価格：${Math.floor(highest_price)}円`);      // 切り下げ
console.log(`妥協価格：${Math.round(compromise_price)}円`);   // 四捨五入
console.log(`理想価格：${Math.round(ideal_price)}円`);        // 四捨五入
console.log(`最低品質保証価格：${Math.ceil(lowest_price)}円`); // 切り上げ
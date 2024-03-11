import fs from 'fs';
import { parse } from 'csv-parse/sync';

class PSM_Analysis{
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    public read_csv = (filePath: string): [number[], number[], number[], number[]] => { // reference: https://qiita.com/shirokuman/items/509b159bf4b8dd1c41ef
        const content = fs.readFileSync(filePath);
        const data = parse(content, {
            columns: true,
            skip_empty_lines: true
        });
    
        const high: number[] = [];
        const low: number[] = [];
        const too_high: number[] = [];
        const too_low: number[] = [];
    
        data.forEach((row: any) => {
            high.push(parseFloat(row['高い']));
            low.push(parseFloat(row['安い']));
            too_high.push(parseFloat(row['高すぎる']));
            too_low.push(parseFloat(row['安すぎる']));
        });
    
        high.sort((a, b) => a - b)
        low.sort((a, b) => a - b)
        too_high.sort((a, b) => a - b)
        too_low.sort((a, b) => a - b)
    
        return [high, low, too_high, too_low];
    };

    // アンケートの集計
    public aggregate = (csv_data: [number[], number[], number[], number[]], max_val: number, interval: number, data_num: number): [number[], number[], number[], number[]] => {
        const result_high = Array.from({length: Math.ceil(max_val / interval)}, (_, i) => (i + 1) * interval);
        const result_low = Array.from({length: Math.ceil(max_val / interval)}, (_, i) => (i + 1) * interval);
        const result_too_high = Array.from({length: Math.ceil(max_val / interval)}, (_, i) => (i + 1) * interval);
        const result_too_low = Array.from({length: Math.ceil(max_val / interval)}, (_, i) => (i + 1) * interval);

        const aggregation_high = result_high.map((upperBound) => csv_data[0].filter((value) => value <= upperBound).length / data_num * 100);
        const aggregation_low = result_low.map((lowerBound) => csv_data[1].filter((value) => value >= lowerBound).length / data_num * 100);
        const aggregation_too_high = result_too_high.map((upperBound) => csv_data[2].filter((value) => value <= upperBound).length / data_num * 100);
        const aggregation_too_low = result_too_low.map((lowerBound) => csv_data[3].filter((value) => value >= lowerBound).length / data_num * 100);
        
        return [aggregation_high, aggregation_low, aggregation_too_high, aggregation_too_low];
    }

    public calc_intersection = (x1: number, x2: number, y1: number, y2: number, y3: number, y4: number): number => {
        const intersection_x = (((y3-y1)*(x1-x2)*(x1-x2)) + (x1*(y1-y2)*(x1-x2)) - x1*(y3-y4)*(x1-x2)) / (((y1-y2)*(x1-x2)) - ((x1-x2)*(y3-y4)));
    
        return intersection_x;
    }
    
    public calc_price = (aggregation1: number[], aggregation2: number[]): number => {
        let x1=0, x2=0, y1=0, y2=0, y3=0, y4=0;
        for(let i=1; i<=aggregation1.length; i++){
            if(aggregation1[i] >= aggregation2[i]){
                x1 = 50 * i;
                x2 = 50 * (i+1);
                y1 = aggregation1[i-1];
                y2 = aggregation1[i];
                y3 = aggregation2[i-1];
                y4 = aggregation2[i];
                break;
            }
        }
    
        const price = this.calc_intersection(x1, x2, y1, y2, y3, y4);
    
        return price;
    }
}

export default PSM_Analysis;
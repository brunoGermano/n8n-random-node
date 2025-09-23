// src/Random.node.ts
import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
    NodeConnectionType
} from 'n8n-workflow';

export class Random implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Random',
		name: 'random',
		icon: 'file:Random.node.svg',
		group: ['transform'],
		version: 1,
		description: 'Gera um número aleatório verdadeiro (True Random) usando a API do Random.org',
		defaults: {
			name: 'Random Number',
		},
		// CORREÇÃO DEFINITIVA: Usando a estrutura de objeto explícita
		inputs: [NodeConnectionType.Main],
		// inputs: [{ type: 'main', required: true }],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'hidden',
				default: 'generator',
				noDataExpression: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'True Random Number Generator',
						value: 'generate',
						action: 'Generate a true random number',
					},
				],
				default: 'generate',
			},
			{
				displayName: 'Min',
				name: 'minValue',
				type: 'number',
				default: 1,
				required: true,
				displayOptions: {
					show: {
						resource: ['generator'],
						operation: ['generate'],
					},
				},
				description: 'O valor mínimo para o número aleatório (inclusivo)',
			},
			{
				displayName: 'Max',
				name: 'maxValue',
				type: 'number',
				default: 100,
				required: true,
				displayOptions: {
					show: {
						resource: ['generator'],
						operation: ['generate'],
					},
				},
				description: 'O valor máximo para o número aleatório (inclusivo)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const minValue = this.getNodeParameter('minValue', i, 1) as number;
				const maxValue = this.getNodeParameter('maxValue', i, 100) as number;

				if (minValue > maxValue) {
					throw new Error('O valor mínimo não pode ser maior que o valor máximo.');
				}

				const options: IHttpRequestOptions = {
					method: 'GET',
					url: `https://www.random.org/integers/?num=1&min=${minValue}&max=${maxValue}&col=1&base=10&format=plain&rnd=new`,
					json: false,
				};

				const response = await this.helpers.httpRequest(options);
				const randomNumber = parseInt(response as string, 10);

				const newItem: INodeExecutionData = {
					json: {
						...items[i].json,
						randomNumber: randomNumber,
					},
					binary: items[i].binary,
				};

				returnData.push(newItem);
			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
					returnData.push({ json: { error: errorMessage }, pairedItem: i });
					continue;
				}
				throw error;
			}
		}

		return this.prepareOutputData(returnData);
	}
}
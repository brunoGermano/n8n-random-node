"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Random = void 0;
class Random {
    constructor() {
        this.description = {
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
            inputs: ["main" /* NodeConnectionType.Main */],
            // inputs: [{ type: 'main', required: true }],
            outputs: ["main" /* NodeConnectionType.Main */],
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
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const minValue = this.getNodeParameter('minValue', i, 1);
                const maxValue = this.getNodeParameter('maxValue', i, 100);
                if (minValue > maxValue) {
                    throw new Error('O valor mínimo não pode ser maior que o valor máximo.');
                }
                const options = {
                    method: 'GET',
                    url: `https://www.random.org/integers/?num=1&min=${minValue}&max=${maxValue}&col=1&base=10&format=plain&rnd=new`,
                    json: false,
                };
                const response = await this.helpers.httpRequest(options);
                const randomNumber = parseInt(response, 10);
                const newItem = {
                    json: {
                        ...items[i].json,
                        randomNumber: randomNumber,
                    },
                    binary: items[i].binary,
                };
                returnData.push(newItem);
            }
            catch (error) {
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
exports.Random = Random;

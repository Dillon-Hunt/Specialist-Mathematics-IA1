//
//    Predicts NRL results based on data 
//    collected from the first 9 rounds of 2020
//    as a part of specialist mathematics IA1.
//

const { multiply, add, number } = require('mathjs')
const { readFile } = require('fs')
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

const teams = ['PE', 'CR', 'NQC', 'NK', 'SSR', 'PP', 'MWSE', 'SGID', 'CBB', 'GCT', 'BB', 'NZW', 'CSS', 'SR', 'MS', 'WT']

function getVector(dominance_matrix) {
    return dominance_matrix.map(row => {
        return row.reduce((a, b) => number(a) + number(b))
    })
}

function pow(matrix, order) {

    let new_matrix = matrix

    for (let i = 1; i < order; i++) {
        new_matrix = multiply(new_matrix, matrix)
    }

    return new_matrix
}

function askTeams(results) {
    readline.question('Enter Teams: ', teams => {
        if (teams === '') return
        else {
            teams = teams.split(' vs ')

            if (results[teams[0]] > results[teams[1]]) console.log(`Team ${teams[0]} should win.\n`)
            else console.log(`Team ${teams[1]} should win.\n`)

            askTeams(results)
        }
    })
}

async function calculate() {
    let game_results_matrix = await new Promise((resolve) => 
        {
            readFile('./scores.csv', (err, data) => {
                rows = data.toString().split('\n')
        
                rows.forEach((row, id) => {
                    rows[id] = row.split(',')
            
                });
            
                resolve(rows)
            })
        }
    )
    

    let vector_orders = []

    for (i = 0; i < game_results_matrix.length - 1; i++) {
        vector_orders.push(getVector(pow(game_results_matrix, i + 1)))
    }

    let resultant_vector = multiply(vector_orders[0], vector_orders.length)

    {
        let i = 0

        while (resultant_vector.length !== new Set(resultant_vector).size) {
            i++

            resultant_vector = add(resultant_vector, multiply(vector_orders[i], vector_orders.length - i))
        }
    }

    let results = []

    resultant_vector.forEach((team, id) => {
        results.push([team, teams[id]])
    })

    let results_object = {}

    // results.sort((a, b) => b[0] - a[0]).forEach(team => console.log(team[1]))

    results.sort((a, b) => b[0] - a[0]).forEach(team => results_object[team[1]] = team[0])
    

    askTeams(results_object)
}

calculate()
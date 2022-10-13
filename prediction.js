//
//    Predicts NRL results based on data 
//    collected from the first 9 rounds of 2020
//    as a part of specialist mathematics IA1.
//

// Import libraries
const { multiply, add, number } = require('mathjs')
const { readFile } = require('fs')
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });

// Initialize teams variable
let teams = [] // Teams: 'PE', 'CR', 'NQC', 'NK', 'SSR', 'PP', 'MWSE', 'SGID', 'CBB', 'GCT', 'BB', 'NZW', 'CSS', 'SR', 'MS', 'WT'

// Get's dominance vector from dominance matrix by adding up each row.
function getVector(dominance_matrix) {
    return dominance_matrix.map(row => {
        return row.reduce((a, b) => number(a) + number(b))
    })
}


// Calculates a matrix to the nth power
function pow(matrix, order) {
    let new_matrix = matrix

    for (let i = 1; i < order; i++) {
        new_matrix = multiply(new_matrix, matrix)
    }

    return new_matrix
}

// Gets input for two teams and prints the expected result
function askTeams(results) {
    readline.question('\nEnter Teams: ', teams => {

        // End loop
        if (teams === '') return

        // Print result
        else {

            // Split 'PP-NQC' into ['PP', 'NQC']
            teams = teams.split('-')

            // Get winner
            if (results[teams[0]] > results[teams[1]]) console.log(`Team ${teams[0]} should win.\n`)
            else console.log(`Team ${teams[1]} should win.`)

            // Continue Loop
            askTeams(results)
        }
    })
}

async function calculate() {

    // Create matrix array from csv data stored in './scores.csv'
    let game_results_matrix = await new Promise((resolve) => 
        {
            readFile('./scores.csv', (err, data) => {
                csv = data.toString().split('\n')

                teams_raw = csv.shift()
                teams = teams_raw.split(',')

                rows = csv
        
                rows.forEach((row, id) => {
                    rows[id] = row.split(',')
            
                });
            
                resolve(rows)
            })
        }
    )
    
    // Initialize list of vector orders
    let vector_orders = []

    // Append each order up to the number of teams
    for (i = 0; i < game_results_matrix.length - 1; i++) {
        vector_orders.push(getVector(pow(game_results_matrix, i + 1)))
    }

    // Initialize resultant vector
    let resultant_vector = multiply(vector_orders[0], vector_orders.length)

    // While the resultant vector is not distinct, add next order multiplied by 16 - n
    {
        let i = 0

        while (resultant_vector.length !== new Set(resultant_vector).size) {
            i++
            resultant_vector = add(resultant_vector, multiply(vector_orders[i], vector_orders.length - i))
        }
    }

    // Initialize results array
    let results = []

    // Add teams and scores to results array
    resultant_vector.forEach((team, id) => {
        results.push([team, teams[id]])
    })

    // Initialize results object (for comparison)
    let results_object = {}

    // Sort results then print and construct results object
    const sorted_results = results.sort((a, b) => b[0] - a[0])
    sorted_results.forEach(team => results_object[team[1]] = team[0])
    sorted_results.forEach((team, index) => console.log(`${index + 1}: ${(index + 1).toString().length > 1 ? '' : ' '}${team[1]}`))

    // Ask for two teams to compare
    askTeams(results_object)
}

calculate()
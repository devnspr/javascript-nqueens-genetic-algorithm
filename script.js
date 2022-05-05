$(document).ready(function(){
    let popSize = 80
    let cr = 0.2
    let mr = 0.4
    let mg = 10000
    let cbs = 8
    let mds = mr / mg
    let cbr = 0

    function shuffleArray(arr){
        const len = arr.length;
        for(let i = 0; i < len; i ++){
            const a = Math.floor(Math.random() * len);
            const b = Math.floor(Math.random() * len);

            [arr[a], arr[b]] = [arr[b], arr[a]];
        }
        return arr;
    }

    function generateGenome(){
        const res = Array(cbs).fill(0).map((a, i) => i);
        return shuffleArray(res);
    }

    function randomIntFromInterval(min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    function createPopulation(size) {
        population = [

        ]
        for (let i = 0; i < size; i++) {
            population.push(generateGenome())
        }
        return population
    }

    function calcFitness(gnome){
        let count = 0;
        for(let row1 = 0; row1 < gnome.length; row1 ++){
            const col1 = gnome[row1];
            for(let row2 = row1 + 1; row2 < gnome.length; row2 ++){
                const col2 = gnome[row2];
                const gradient = Math.abs((row2 - row1) / (col2 - col1));
                if(gradient === 1){
                    count ++;
                }
            }
        }
        ft = 1 / (count + 1)
        return ft;
    }

    function optimizeGnome(gnome){
        const notExistsNums = [];

        for(let i = 0; i < gnome.length; i ++){
            if(gnome.indexOf(i) === -1) notExistsNums.push(i);
        }

        const visited = [];
        for(let i = 0; i < gnome.length; i ++){
            const gen = gnome[i];

            if(!visited.includes(gen)){
                visited.push(gen);
                continue;
            }

            gnome[i] = notExistsNums.pop();
        }

        return gnome;
    }

    function crossOver(gnome1, gnome2){
        const gnome1Half = Math.ceil(gnome1.length / 2);
        const gnome2Half = Math.ceil(gnome2.length / 2);
        const g1firstHalf = gnome1.slice(0, gnome1Half)
        const g1secondHalf = gnome1.slice(-gnome1Half)
        const g2firstHalf = gnome1.slice(0, gnome2Half)
        const g2secondHalf = gnome1.slice(-gnome2Half)
        let a = g1firstHalf.concat(g2secondHalf)
        let b = g2firstHalf.concat(g1secondHalf)
        return [optimizeGnome(a), optimizeGnome(b)];
    }

    const sleep = ms => new Promise(r => setTimeout(r, ms));


    async function drawChessBoard(gnome) {
        // console.log(gnome)
        let ths = ``
        for (let i = 0; i < gnome.length; i++) {
            ths += `<tr>`
            for (let j = 0; j < gnome.length; j++) {
                // console.log(i, j, gnome[i], j === gnome[i])
                if (j === gnome[i]) {
                    if (i % 2 === 1) {
                        if (j % 2 === 1) {
                            ths += `<td class="light"><img src="queen.png" width="40" height="40"/></td>`
                        } else {
                            ths += `<td class="dark"><img src="queen.png" width="40" height="40"/></td>`
                        }
                    } else {
                        if (j % 2 === 0) {
                            ths += `<td class="light"><img src="queen.png" width="40" height="40"/></td>`
                        } else {
                            ths += `<td class="dark"><img src="queen.png" width="40" height="40"/></td>`
                        }
                    }
                } else {
                    if (i % 2 === 1) {
                        if (j % 2 === 1) {
                            ths += `<td class="light"></td>`
                        } else {
                            ths += `<td class="dark"></td>`
                        }
                    } else {
                        if (j % 2 === 0) {
                            ths += `<td class="light"></td>`
                        } else {
                            ths += `<td class="dark"></td>`
                        }
                    }
                }
            }
            ths += `</tr>`
        }
        let HTML = `<table class="chess-board">
                <tbody>
                ${ths}
                </tbody>
            </table>`
        $("#board").html(HTML)
        await sleep(cbr)
    }

    async function findSolution() {
        let population = createPopulation(popSize)
        let maxFitness = 0
        let bestItem;
        for (let i = 1; i <= mg; i++){
            pf = []
            for (let gnome of population) {
                let fitness = calcFitness(gnome)
                let gpf = [gnome, fitness]
                pf.push(gpf)
                // await drawChessBoard(gnome)
                if (fitness === 1) {
                    return gnome
                }
                if (fitness > maxFitness) {
                    maxFitness = fitness
                    bestItem = gnome
                }
            }
            pf = pf.sort((a, b) => {
                return b[1] - a[1]
            })
            population = []
            for (let p of pf) {
                population.push(p[0])
            }
            for (let i = 0; i < population.length / 2; i++) {
                let rand = Math.random()
                if (rand < cr) {
                    let k = i * 2
                    let l = k + 1
                    let children = crossOver(population[k], population[l])
                    population[k] = children[0]
                    population[l] = children[1]
                }
            }
            for (let item of population) {
                let rand = Math.random()
                if (rand < mr) {
                    let k = randomIntFromInterval(0, cbs - 1)
                    let l = randomIntFromInterval(0, cbs - 1)
                    while (k === l) {
                        l = randomIntFromInterval(0, cbs - 1)
                    }
                    let temp = item[k]
                    item[k] = item[l]
                    item[l] = temp
                }
            }
            mr -= mds
            if (bestItem) {
                let p = randomIntFromInterval(0, population.length - 1)
                population[p] = bestItem
            }
        }
        return null
    }


    $("#find-solution").click(function(){
        $("#find-solution").html('Calculating...')
        mr = parseFloat($("#mr").val())
        cbs = parseInt($("#cbs").val())
        mg = parseInt($("#mg").val())
        cr = parseFloat($("#cr").val())
        popSize = parseInt($("#pop-size").val())
        cbr = parseInt($("#cbr").val())
        mds = mr / mg
        let d = Date.now() / 1000
        findSolution().then(gnome => {
            if (gnome) {
                drawChessBoard(gnome)
                let d2 = Date.now() / 1000
                let time = d2 - d
                $("#time").html(`it took ${time}s to find a solution`)
            } else {
                $("#time").html(`couldn't find a solution, try changing the values`)
            }
            $("#find-solution").html('Find Solution')
        })
    });
});
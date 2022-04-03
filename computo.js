const calculo = (qty) => {

    let randomizedNumber;
    const randomizedNumbersArray = [];

    const count = {};

    for (i = 0; i < qty; i++) {
        randomizedNumber = Math.floor(Math.random() * 1000);
        randomizedNumbersArray.push(randomizedNumber);
    }

    console.log(randomizedNumbersArray);

    randomizedNumbersArray.forEach((element) => {
        count[element] ? count[element] += 1 : count[element] = 1;
    });

    return count;
}

process.on('exit', () => {
    console.log(`worker #${process.pid} cerrado`)
})

process.on('message', msg => {
    console.log(`worker #${process.pid} iniciando su tarea`)
    const sum = calculo(5000000)
    process.send(sum)
    console.log(`worker #${process.pid} finalizó su trabajo`)
    process.exit()
})

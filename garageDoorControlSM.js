const stateMachine = require('./stateMachine');
const sm = new stateMachine('garageDoor'); 

async function simulateCloseLeft() {
    console.log('Simulating closing the left door...');
    // Simulate closing process, e.g., wait for 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));
    console.log('Left door closed');
}

async function simulateOpenLeft() {
    console.log('Simulating opening the left door...');
    // Simulate opening process, e.g., wait for 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));
    console.log('Left door opened');
}

sm.state('open')
    .when((event) => event.toLowerCase() === 'close left')
        .then(async (event) => { 
            console.log('Closing the left door');
            sm.currentState = 'closed'
            await simulateCloseLeft();
            console.log('Left door fully closed');
            return 'closed'; 
        });

sm.state('closed')
    .when((event) => event.toLowerCase() === 'open left') // I will change "event === ..." logic later, it doesn't work so I'm not working on that yet
        .then(async (event) => { 
            console.log('Opening the left door');
            sm.currentState = 'opened'
            await simulateOpenLeft();
            console.log('Left door fully opened');
            return 'open'; 
        });

sm.currentState = 'closed';

module.exports = sm;
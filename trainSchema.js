// Importing
const mongoose = require('mongoose');

// 1. Connect to MongoDB (Atlas or local)
mongoose.connect('connection_string_here');

// 2. Define Train Schema
const trainSchema = new mongoose.Schema({
    trainName: { type: String, required: true, unique: true },
    trainNumber: { type: String, required: true, unique: true },
    departureTime: { type: Date, required: true }
})

//3. Define Passenger Schema with reference to Train
const passSchema = new mongoose.Schema({
    passengerName: { type: String, required: true },
    age: { type: Number, required: true, min: 18 },
    ticketNumber: { type: String, required: true, unique: true },
    train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true } // ref to Train
});

// 4. Add a model method (Static)
trainSchema.static.findByTrainName = function(trainName) {
    return this.findOne({ trainName: new RegExp(`^${trainName}$`, 'i') });
};

// 5. Create models
const Train = mongoose.model('Train', trainSchema);
const Passenger = mongoose.model('Passenger', passSchema);

// 6. Main logic
async function run() {
    // Clear old data
    await Train.deleteMany({});
    await Passenger.deleteMany({});

    // Create a train
    const train1 = new Train({ trainName: 'Express Train', trainNumber: 'EXP354', departureTime: new Date('24/01/2026') })
    await train1.save();
    const train2 = new Train({ trainName: 'Local Train', trainNumber: 'LOC123', departureTime: new Date('25/01/2026') })
    await train2.save();

    // Create passengers linked to the train
    const passenger1 = new Passenger({ passengerName: 'Bruce Banner', age: 35, ticketNumber: 'TICK123', train: train1._id });
    const passenger2 = new Passenger({ passengerName: 'Natasha Romanoff', age: 30, ticketNumber: 'TICK124', train: train1._id });
    const passenger3 = new Passenger({ passengerName: 'Clint Barton', age: 40, ticketNumber: 'TICK125', train: train1._id });

    const passenger4 = new Passenger({ passengerName: 'Steve Rogers', age: 38, ticketNumber: 'TICK126', train: train2._id });

    await passenger1.save();
    await passenger2.save();
    await passenger3.save();
    await passenger4.save();

    // Query with populate (one-to-many)
    const passengers = await Passenger.find().populate('train', 'trainName trainNumber departureTime');
    console.log(JSON.stringify(passengers, null, 2));

    // Use model method
    const foundTrain = await Train.findByTrainName('express train');
    console.log('Found Train:', foundTrain?.trainName)

    mongoose.connection.close();
}

run().catch(console.error);
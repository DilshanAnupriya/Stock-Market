const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Fund = require('./Models/Fund');

dotenv.config();

const funds = [
    {
        name: "Growth Equity Fund",
        code: "GEF001",
        type: "equity",
        description: "High growth potential through diversified equity investments.",
        minimumInvestment: 5000,
        currentNAV: 12.5,
        riskLevel: "high",
        inceptionDate: new Date("2020-01-01"),
        fundManager: "John Smith",
        isActive: true,
        features: ["High Returns", "Long Term", "Dividends"]
    },
    {
        name: "Stable Income Fund",
        code: "SIF001",
        type: "money-market",
        description: "Stable returns with capital preservation.",
        minimumInvestment: 1000,
        currentNAV: 10.2,
        riskLevel: "low",
        inceptionDate: new Date("2021-06-01"),
        fundManager: "Jane Doe",
        isActive: true,
        features: ["Low Risk", "Monthly Income", "Liquid"]
    }
];

const seedDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stock-market';
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected');

        await Fund.deleteMany({});
        console.log('Funds cleared');

        await Fund.insertMany(funds);
        console.log('Funds seeded successfully');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();

const roomTypes = {
    gambling: {
        name: "Gambling Den",
        imageUrl: "images/gamblingden.jpg",
        cost: 5000, // Decoration cost in currency
        hint: "A place where fortunes are made... or lost.",
        upgrades: [
            { level: 2, cost: 7000, imageUrl: "path/to/upgrade_gambling_den_level2.jpg" },
            { level: 3, cost: 10000, imageUrl: "path/to/upgrade_gambling_den_level3.jpg" }
        ]
    },
    loansharking: {
        name: "Loan Sharking",
        imageUrl: "images/loanshark.jpg",
        cost: 4500,
        hint: "Only the most desperate come to borrow...",
        upgrades: [
            { level: 2, cost: 6000, imageUrl: "path/to/upgrade_loan_sharking_level2.jpg" },
            { level: 3, cost: 9000, imageUrl: "path/to/upgrade_loan_sharking_level3.jpg" }
        ]
    },
    druglab: {
        name: "Drug Laboratory",
        imageUrl: "images/drugslab.jpg",
        cost: 6000,
        hint: "A shadowy operation...",
        upgrades: [
            { level: 2, cost: 8000, imageUrl: "path/to/upgrade_drug_lab_level2.jpg" },
            { level: 3, cost: 12000, imageUrl: "path/to/upgrade_drug_lab_level3.jpg" }
        ]
    },
    massageparlor: {
        name: "Massage Parlor",
        imageUrl: "images/massageparlor.jpg",
        cost: 5500,
        hint: "Unholy dealings of various kinds...",
        upgrades: [
            { level: 2, cost: 7500, imageUrl: "path/to/upgrade_other_evil_level2.jpg" },
            { level: 3, cost: 11000, imageUrl: "path/to/upgrade_other_evil_level3.jpg" }
        ]
    },
    evillair: {
        name: "Evil Lair",
        imageUrl: "images/evillair.jpg",
        cost: 10000,
        hint: "The heart of all your dark plans...",
        upgrades: [
            { level: 2, cost: 13000, imageUrl: "path/to/upgrade_evil_lair_level2.jpg" }
        ]
    }
};

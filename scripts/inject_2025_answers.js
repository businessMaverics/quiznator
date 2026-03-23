const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../data/quizzes');

const answerMap = {
    // FA 2025
    "Two enhancing qualitative characteristics": "Comparability and Verifiability",
    "corrected in the first set of financial statements following their discovery": "Retrospectively",
    "profit as a percentage of cost is known as": "Mark-up and Margin",
    "proprietor of a business withdraws cash": "Debit Drawings, Credit Cash",
    "N2 million and the equipment is to be depreciated at 5% using reducing balance": "N1,714,750",
    "assets and liabilities as well as income and expenses should not be offset": "When allowed by IFRS",
    "constraint on users of financial statements": "Cost",
    "bought in August 2021 and delivered in September 2021": "September 2021",
    "tax authorities' assessment is higher than the provision": "Under-provision for Tax",
    "extended trial balance, a debit balance in the prepayments": "Current Asset",
    "systematic comparison of two or more financial data": "Ratio Analysis",
    "primary book of entry where all credit sales are recorded": "Sales Day Book",
    "journal entries necessary to record the share of loss": "Debit Partners' Current Account, Credit Appropriation Account",
    "Credit balance carried down in the subscription account": "Subscription in Advance",
    "entries for assets taken over by a partner": "Debit Partner's Capital, Credit Realisation",
    "non-profit-organisation, the excess of expenditure over income": "Deficit",
    "two models specified for measurement of an item of property": "Cost Model and Revaluation Model",
    "Another name for purchase ledger control account": "Creditors Control Account",
    "purchase consideration could be in the form": "Shares and Cash",
    "sales figure is 1,500,000 with a mark-up of 25%": "N1,200,000",

    // IT 2025
    "degree or extent of the dependency of the subsystems": "Coupling",
    "does not interact with its environment": "Closed System",
    "Compiler, Interpreter, and Assembler": "Translators / System Software",
    "converts a source program written in high level language": "Compiler",
    "operates computer services to process data": "Computer Bureau",
    "where files to be deleted are dumped": "Recycle Bin",
    "unique identifier of a record": "Primary Key",
    "staff using a number of telephones to receive users": "Help Desk",
    "IS services by an external source": "Outsourcing",
    "model that standardises communication functions": "OSI Model",
    "network that connects computers within a small geographical area": "Local Area Network (LAN)",
    "physical components of a computer system": "Hardware",
    "set of instructions that tells the computer": "Software",
    "main circuit board": "Motherboard",
    "Temporary storage used by the CPU": "RAM",
    "input device used to enter text": "Keyboard",
    "converts digital signals to analog": "Modem",
    "perform specific tasks for users": "Application Software",
    "program that can replicate itself": "Virus / Worm",
    "starting or restarting a computer": "Booting",

    // PSA 2025
    "official channel for financial reporting inaugurated in December 2019": "Open Treasury Portal",
    "domiciled in the Central Bank of Nigeria": "Treasury Single Account (TSA)",
    "presented in accordance with applicable financial reporting": "Financial Audit",
    "fulfil laid out policy goals and have achieved the set objectives": "Value for Money / Performance",
    "compilation and preparation of financial reports of the public sector": "Cash and Accrual Basis",
    "formulates the accounting policy of the Federal Government": "Accountant-General of the Federation",
    "guidelines that are issued by the Ministry of Budget": "Call Circular",
    "allows an officer to spend more than the budgeted amount": "Supplementary Warrant",
    "sources of cash-in-flow from investing activities": "Sale of PPE and Sale of Investments",
    "Subventions which government gives may be": "Capital or Recurrent",
    "segregates resources into specific or special purpose compartments": "Fund Accounting",
    "board formed to develop and issue under its own authority": "IPSASB / FRC",
    "TSA E-Payment scheme commenced in 2012": "TRUE",
    "acronym 'INTOSAI' stands for": "International Organisation of Supreme Audit Institutions",
    "records transactions only when cash is received": "Cash Basis",
    "annual estimates of revenue and expenditure": "Budget",
    "formal invitation to the public to subscribe for shares": "Prospectus",
    "revenues received by the Federation are paid": "Consolidated Revenue Fund",
    "external audit of the Federal Government accounts": "Office of the Auditor-General for the Federation",
    "collection of government revenue at the point of entry": "Treasury Receipt",

    // QA 2025
    "GH¢3,000 at a profit of 10%": "GH¢2,727.27",
    "price elasticity of demand function": "Percentage change in QD / Percentage change in Price",
    "maximize revenue is": "Depends on function",
    "semi-interquartile range": "(Q3 - Q1) / 2",
    "N40,000 at 13% simple interest at the end of 17 years": "N88,400",
    "L$85m now and receives L$100m in 2 years": "8.47%",
    "probability of an event happening is 0.4": "0.6",
    "median of the following set of numbers: 12, 15, 18, 22, 25": "18",
    "5 red balls and 3 blue balls": "3/8 or 0.375",
    "formula for calculating the Mean Deviation": "Σ|x - μ| / N",
    "Y = a + bX, 'a' represents": "Y-intercept",
    "square root of the variance": "Standard Deviation",
    "multiplying the previous term by a constant": "Geometric Progression",
    "total revenue equals total cost": "Break-Even Point",
    "mode of the following data: 2, 4, 4, 5, 6, 7, 7, 7, 8": "7",
    "measure of the steepness of a line": "Slope / Gradient",
    "set containing all elements under consideration": "Universal Set",
    "value of 5!": "120",
    "perfectly inelastic": "0",
    "highest and lowest values": "Range"
};

let filesUpdated = 0;
let questionsUpdated = 0;

fs.readdirSync(dir).filter(f => f.endsWith('.json') && f.includes('2025')).forEach(f => {
    const filePath = path.join(dir, f);
    const d = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let fileChanged = false;

    d.questions.forEach(q => {
        // Find a matching answer dynamically
        for (const [key, val] of Object.entries(answerMap)) {
            if (q.text.toLowerCase().includes(key.toLowerCase())) {
                if (q.answer !== val) {
                    q.answer = val;
                    fileChanged = true;
                    questionsUpdated++;
                }
                break;
            }
        }
    });

    if (fileChanged) {
        fs.writeFileSync(filePath, JSON.stringify(d, null, 2), 'utf-8');
        filesUpdated++;
        console.log(`Updated ${f}`);
    }
});

console.log(`Finished. Files updated: ${filesUpdated}, Questions updated: ${questionsUpdated}`);

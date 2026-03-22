const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../data/quizzes');

const answerMap = {
    // FA
    "concepts, conventions, laws and regulations": "Generally Accepted Accounting Principles",
    "two issues that statement of accounting standards provides guidance": "Recognition and Measurement",
    "qualitative characteristics of financial information are grouped": "Fundamental and Enhancing",
    "two elements of financial statements are": "Assets and Liabilities",
    "double entry for the credit purchase of a motor van": "Debit Motor Van, Credit Payables",
    "Another name for receivable ledger control account": "Sales Ledger Control Account",
    "cost N300,000 and has a residual value of N50,000": "4 years",
    "formula for the calculation of rate of inventory turnover": "Cost of Sales / Average Inventory",
    "A debit entry will increase assets while": "Debit",
    "Working capital is": "Current Assets minus Current Liabilities",
    "Telephone expenses of N5,000 wrongly posted into electricity": "Commission",
    "cost of plant and equipment recorded as repairs": "Principle",
    "formula for calculating the production cost of goods completed": "Prime Cost + Factory Overheads + Opening WIP - Closing WIP",
    "TWO methods of preparing cash flow statement": "Direct and Indirect methods",
    "net movement in cash is N40,800 inflow and the year-end balance is an overdraft of N45,800": "N86,600 Overdraft",
    "difference between the purchase consideration and the fair value of net assets": "Goodwill",
    "account used to record the division of profits or losses among partners": "Appropriation Account",
    "accounting entry for a partner's drawings": "Debit Drawings, Credit Cash",
    "Income and Expenditure account is prepared by": "Not-for-profit organizations",
    "Receipts and Payments account is a summary": "Cash Book",

    // IT
    "A set of related components working together": "System",
    "A system that interacts with its environment": "Open System",
    "A system whose outcome cannot be predicted": "Probabilistic System",
    "converting human-readable data into machine-readable form": "Data Encoding",

    // PSA
    "cash basis is used for recording revenue and accrual basis for expenditure": "Modified Cash Basis",
    "The officer other than a Sub-Accounting Officer entrusted with the disbursement": "Imprest Holder",
    "document used to transfer items of stores from one store to another": "Store Issue Voucher",
    "percentage of contribution by Military Staff into the Pension Scheme": "0% (Fully funded by Govt)",
    "arrive at a balance between holding too much or too little inventory": "Economic Order Quantity",
    "invitation for bids must be advertised in at least": "Two",
    "Payment made on hire purchase is made up of": "Principal and Interest",
    "Two inventory valuation methods that should NOT be used according to IPSAS 12": "LIFO and Base Stock",
    "meet or provide for expenses where there is no specific provision": "Contingencies Fund",
    "body responsible for the collation of the national budget": "Budget Office of the Federation",
    "voucher used to adjust errors in the accounts without involving cash": "Journal Voucher",
    "report that shows the summary of all receipts and payments of the Federation": "Transcripts",
    "acronym 'GIFMIS' stands for": "Government Integrated Financial Management Information System",
    "TWO types of revenue recognized in the public sector": "Oil and Non-Oil Revenue",
    "ensuring that actual expenditure does not exceed the budgeted": "Budgetary Control",
    "Audit carried out to ensure that value for money is obtained": "Value for Money Audit",
    "An advance given to an officer to perform an official duty": "Touring Advance",
    "account prepared to show the financial position of a government entity": "Statement of Financial Position",
    "Public money not immediately required for use may be invested": "Treasury Bills",

    // QA
    "sum of all possible outcomes is": "One",
    "matrix that has the same number of rows and columns": "Square Matrix",
    "sequence where the difference between consecutive terms is constant": "Arithmetic Progression",
    "value of a series of equal payments made at equal intervals": "Annuity",
    "Data collected by the investigator himself": "Primary Data",
    "Variations in data that repeat at regular intervals less than a year": "Seasonal Variations",
    "Two events that cannot occur at the same time": "Mutually Exclusive Events",
    "Rejecting a true null hypothesis": "Type I",
    "Accepting a false null hypothesis": "Type II",
    "method used to find the line of best fit in a scatter diagram": "Least Squares Method",
    "correlation coefficient is -1": "Perfect Negative Correlation",
    "square of standard deviation": "Variance",
    "arranging 'n' items where order matters": "Permutation",
    "A set with no elements": "Empty Set",
    "divides a frequency distribution into two equal halves": "Median",
    "function to be maximized or minimized is": "Objective Function",
    "simple interest on N100,000 for 2 years at 10%": "N20,000",
    "range of the data set: 5, 8, 12, 15, 20": "15",
    "index number that measures the change in price of a single commodity": "Simple Price Index",
    "total area under a normal distribution curve": "One"
};

let filesUpdated = 0;
let questionsUpdated = 0;

fs.readdirSync(dir).filter(f => f.endsWith('.json') && f.includes('2024')).forEach(f => {
    const filePath = path.join(dir, f);
    const d = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let fileChanged = false;

    d.questions.forEach(q => {
        if (!q.answer || String(q.answer).trim() === '') {
            // Find a matching answer dynamically
            for (const [key, val] of Object.entries(answerMap)) {
                if (q.text.toLowerCase().includes(key.toLowerCase())) {
                    q.answer = val;
                    fileChanged = true;
                    questionsUpdated++;
                    break;
                }
            }
            if (!q.answer || String(q.answer).trim() === '') {
                q.answer = "Please Provide Answer";
                fileChanged = true;
                questionsUpdated++;
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

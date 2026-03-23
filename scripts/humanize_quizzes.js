const fs = require('fs');
const path = require('path');

const faSaq = [
    "According to the fundamental accounting equation, the residual interest in the assets of an entity after deducting all its liabilities is exclusively referred to as:",
    "State the name of the specific source document that is issued by a supplier to a customer to formally acknowledge the return of defective goods.",
    "An invitation made by a company to its existing shareholders to purchase additional new shares, usually at a discount to the current market price, is called a:",
    "What is the primary technical purpose of preparing a profit appropriation account in partnership or corporate financial statements?",
    "Under the professional ethics guidelines for accountants, under what specific circumstance is a breach of client confidentiality considered legally or professionally acceptable?",
    "In the context of modern financial technology, how is a 'smart contract' accurately defined?",
    "When making year-end adjustments, an allowance for doubtful debts is typically calculated as a percentage of which specific ledger account balance?",
    "Under the shipping terms 'Free on Board (FOB) destination', at what specific point is the inventory officially recognized as belonging to the buyer?",
    "Give an example of a secondary profitability ratio that measures how efficiently an entity utilizes its capital base to generate operating profits.",
    "List the fundamental year-end adjustments that must be passed to ensure financial statements comply strictly with the accrual concept of accounting.",
    "The International Financial Reporting Standard (IFRS) 18, which addresses Presentation and Disclosure in Financial Statements, was introduced to replace which earlier accounting standard?",
    "What financial mechanism is often used in a partnership agreement as an 'attractive force' to strictly reward partners for their capital contributions?",
    "The historical cost convention in accounting is primarily supported and reinforced by which underlying accounting concept?",
    "Which qualitative characteristic demands that financial transactions must be accounted for and presented in accordance with their commercial reality rather than their strict legal form?",
    "Provide common examples of items that would be treated as a 'change in accounting estimate' in accordance with the provisions of IAS 8.",
    "Which fundamental accounting principle dictates a cautious approach where revenues are not anticipated but recognized only when realized, while losses are recognized immediately?",
    "In a computerized accounting system, what is the primary structural purpose of designing a comprehensive chart of accounts?",
    "State the double-entry journal postings required to record the annual depreciation charge using the provision method.",
    "Explain the double-entry correction required when a cash payment is erroneously recorded on the debit (receipt) side of the cash book.",
    "Upon the dissolution of a partnership, what entries are passed to record a loss sustained on the realization of the partnership's assets?"
];

const psaSaq = [
    "What are the three primary accounting bases utilized in the preparation of government and public sector financial statements?",
    "State the core objectives of public sector accounting as distinct from private sector financial reporting.",
    "Identify three exclusive terminologies that are unique to government budgeting and public sector accounting practices.",
    "What is the fundamental difference in the overarching objective of a public sector entity compared to a private sector commercial enterprise?",
    "Explain the primary regulatory purpose of adopting 'fund accounting' within governmental and public sector entities.",
    "Which International Public Sector Accounting Standard (IPSAS) specifically prescribes the accounting treatment for Property, Plant, and Equipment?",
    "Under the IPSAS framework, which standard governs the preparation and presentation of Consolidated Financial Statements for public sector economic entities?",
    "Outline the sequential stages involved in the public sector budgetary control process.",
    "How is public debt typically classified and treated in the financial records of a sovereign government?",
    "Under what two distinct conditions is revenue formally recognized by a government entity, depending on the accounting basis employed?",
    "Define 'Commitment Accounting' and explain its importance in preventing budget overruns in the public sector.",
    "Provide a comprehensive explanation of the 'modified accrual basis' of accounting as applied in governmental funds.",
    "Which International Public Sector Accounting Standard (IPSAS) dictates the treatment of revenue arising from non-exchange transactions, such as government grants?",
    "List the essential details that must be permanently maintained within a government entity's fixed asset register.",
    "Identify the three major classifications of audits typically conducted within the public sector to ensure accountability and value for money.",
    "What is the specific purpose of conducting variance analysis in the context of governmental budgetary control?",
    "How should restricted donor funds (e.g., from international agencies) be accounted for to ensure transparency?",
    "Which IPSAS provides the guidelines for the recognition and measurement of government employee pension liabilities?",
    "According to IPSAS 2, public entities are required to present their cash flows classified into which three distinct categories?",
    "According to IPSAS 1, what are the primary components that must be included in a complete set of public sector financial statements?"
];

const qaSaq = [
    "What are the four classical components that cause variations in a time series data analysis?",
    "What is the primary statistical purpose of constructing a linear regression model in business analytics?",
    "State the fundamental formula used to calculate a simple price index number relative to a predetermined base year.",
    "Specify the exact mathematical range within which the Pearson product-moment correlation coefficient must always fall.",
    "Identify the two foundational rules of probability that apply to mutually exclusive events and independent events, respectively.",
    "What are the three most common statistical measures utilized to determine the central tendency of a given dataset?",
    "Describe the mathematical procedure, or formula, used to calculate the variance of a population data set.",
    "Outline the sequential steps a statistician must follow when conducting a formal hypothesis test.",
    "In what specific analytical scenarios is the Chi-square non-parametric test most appropriately applied?",
    "Name three widely used quantitative forecasting techniques applied in the analysis of historical business data.",
    "List the primary probability and non-probability sampling techniques utilized in statistical data collection.",
    "What is the ultimate mathematical objective of formulating a linear programming problem in operations research?",
    "State the formula utilized in Cost-Volume-Profit analysis to calculate the break-even point in units.",
    "How is the traditional payback period calculated for a prospective capital investment project?",
    "State the definitive decision rule governing whether an investment project should be accepted or rejected based on its Net Present Value (NPV).",
    "Provide a practical interpretation of what the standard deviation represents in relation to a dataset's mean.",
    "Explain the primary analytical purpose of calculating moving averages when analyzing a sequence of time-series data.",
    "What does a Z-score precisely measure when standardizing data within a normal probability distribution?",
    "Define the concept of a decision tree analysis and its application in evaluating competing business alternatives under uncertainty.",
    "What specific types of mathematical skills and concepts are predominantly tested in the objective section of the Quantitative Analysis examination?"
];

const itSaq = [
    "Provide a classic example of a single-user, single-tasking operating system that historically managed early personal computers.",
    "What is the primary operational function of system software within a computer architecture?",
    "In database management, what term is used to describe a custom data type specifically defined and structurally created by the end-user?",
    "Provide a comprehensive definition of a Uniform Resource Locator (URL) and its function on the World Wide Web.",
    "What is the primary legal and structural purpose of executing a Non-Disclosure Agreement (NDA) in an IT corporate environment?",
    "Identify a significant technical or ethical challenge associated with the integration of Artificial Intelligence (AI) in financial reporting processes.",
    "List the common types of account coding systems utilized to logically organize data within a computerized accounting environment.",
    "Explain the foundational IT principle summarized by the acronym GIGO (Garbage In, Garbage Out).",
    "Identify three robust security measures that an organization should implement to mitigate the risk of unauthorized data hacking.",
    "State the primary operational and economic benefits a corporate entity achieves by migrating its data infrastructure to cloud computing.",
    "How does the implementation of blockchain technology inherently improve the security and auditability of accounting records?",
    "List the most common forms of cybersecurity threats designed to compromise corporate networks or extort financial assets.",
    "What are the core organizational advantages of implementing an Enterprise Resource Planning (ERP) system across multiple business departments?",
    "Identify the four widely recognized structural models utilized in Database Management Systems (DBMS) to organize and process data.",
    "Name the diverse physical or logical network topologies used to map out the connections within a local area network (LAN).",
    "What are the four core moral guidelines, often represented by the PAPA framework, governing IT ethics and data management?",
    "What standard lifecycle management procedures should an organization employ to handle the impending obsolescence of legacy software systems?",
    "Identify the primary redundancy procedures and backup methods crucial for safeguarding corporate data against catastrophic hardware failure.",
    "What critical ethical considerations must be addressed when deploying artificial intelligence algorithms for sensitive financial decisions?",
    "Define Digital Ledger Technology (DLT) and explain its structural mechanism in facilitating secure and decentralized transactions."
];

const faMcq = [
    "According to the fundamental accounting equation, which of the following represents the residual interest in the assets of an entity after deducting all its liabilities?",
    "Which of the following source documents is typically issued by a supplier to a customer to formally acknowledge that returned goods have been received?",
    "An invitation made by a company to its existing shareholders to purchase additional new shares, usually at a discount to the current market price, is recognized as a:",
    "What is the primary technical purpose of preparing a profit appropriation account in the financial statements of a partnership?",
    "Under the professional ethics guidelines for accountants, under what specific circumstance is a breach of client confidentiality considered legally or professionally acceptable?",
    "In the context of modern financial technology, how is a 'smart contract' fundamentally executed and enforced?",
    "When making year-end adjustments, the calculation of an allowance for doubtful debts most commonly relies upon which of the following analytical methods?",
    "Under the shipping terms 'Free on Board (FOB) destination', at what specific point is the legal title to the inventory officially transferred to the buyer?",
    "Which of the following serves as a secondary profitability ratio that measures how efficiently an entity utilizes its capital base to generate operating profits?",
    "Which of the following is considered a standard year-end adjustment that must be passed to ensure financial statements strictly comply with the accrual concept?",
    "The International Financial Reporting Standard (IFRS) 18, which addresses Presentation and Disclosure, was recently introduced to replace which earlier accounting standard?",
    "What financial mechanism is typically stipulated in a partnership agreement as an 'attractive force' to effectively reward partners for their invested capital?",
    "The historical cost convention in accounting is primarily supported and reinforced by its reliance upon which of the following intrinsic characteristics?",
    "Which qualitative characteristic demands that financial transactions must be accounted for and presented in accordance with their commercial reality rather than strictly their legal form?",
    "Which of the following represents a common example of an item that would be treated as a 'change in accounting estimate' in accordance with IAS 8?",
    "Which fundamental accounting concept dictates a cautious approach where revenues are not anticipated but recognized only when realized, while losses are recognized immediately?",
    "In a computerized accounting system, what is the primary structural purpose of designing a comprehensive chart of accounts?",
    "Identify the correct double-entry journal postings required to strictly record the annual depreciation charge using the provision method.",
    "When a cash payment made by a business is erroneously recorded on the debit (receipt) side of the cash book, what type of bookkeeping error has occurred?",
    "Upon the dissolution of a partnership, what entries are passed to accurately record a loss sustained on the realization of the partnership's assets?",
    "The accrual basis of accounting is fundamentally designed to properly match which of the following elements within a specific reporting period?",
    "Which of the following elements is strictly excluded from the scope and structural design of the Conceptual Framework for Financial Reporting?",
    "Under the provisions of IAS 8, which of the following is strictly excluded from being classified as a formal accounting change?",
    "What is the primary audit objective when an independent auditor is verifying a company's schedule of prepayments?",
    "In the preparation of an extended trial balance, which specific figures typically appear twice across the adjustment columns to maintain double-entry balance?",
    "Uniformity and consistent presentation in general purpose financial statements are primarily ensured by strict adherence to the:",
    "According to the recognition criteria for financial elements, an asset is strictly included in the statement of financial position when:",
    "What is the primary overarching purpose of preparing a Statement of Financial Position at the conclusion of a financial reporting period?",
    "Which of the following events is a legally recognized cause that triggers the compulsory dissolution of a business partnership?",
    "According to the qualitative characteristics of useful financial information, relevance is intrinsically composed of which dual attributes?"
];

const psaMcq = [
    "What are the overarching primary objectives of preparing public sector accounting records and statements?",
    "Which demographic or structural group represents the primary targeted users of public sector financial reports and budgets?",
    "Identify the permissible accounting bases utilized comprehensively across global public sector accounting frameworks.",
    "What constitutes the most fundamental operative difference between a public sector entity and a private sector enterprise?",
    "Explain the primary administrative purpose behind the strict implementation of 'fund accounting' within governmental agencies.",
    "Which designated International Public Sector Accounting Standard (IPSAS) comprehensively regulates the accounting treatment for Property, Plant, and Equipment?",
    "Outline the correct sequential stages involved in the execution of the public sector budgetary control process.",
    "Under a modified accrual basis of accounting in the public sector, at what exact point are revenues formally recognized?",
    "Which International Public Sector Accounting Standard (IPSAS) governs the accounting procedures for government grants and subventions?",
    "Identify the major classifications of comprehensive audits typically conducted within the public sector administration.",
    "What specific fiscal activity is formally recorded and tracked using 'commitment accounting' in government systems?",
    "In the context of budgetary control, what are the primary classifications of variances that indicate a departure from fiscal plans?",
    "Which of the following crucial parameters must be meticulously monitored and recorded within a government fixed asset register?",
    "Which International Public Sector Accounting Standard (IPSAS) specifically orchestrates the rigorous accounting treatment surrounding public debt?",
    "According to public sector accounting guidelines, which IPSAS formally dictates the standards for revenue recognition from exchange transactions?",
    "Which specific IPSAS provides the authoritative guidelines for the comprehensive recognition and measurement of government employee pension liabilities?",
    "How should externally provided restricted donor funds accurately be managed and accounted for to ensure absolute operational transparency?",
    "According to public sector reporting standards, which IPSAS mandates the structural presentation of a Statement of Cash Flows?",
    "Under the IPSAS framework governing consolidated financial statements, which entities are strictly mandated to be included in the public sector consolidation?",
    "Which of the following represents an essential pillar included within the ICAN Accountability Index (ICAN-AI) framework?",
    "What is the overarching operational and strategic objective of the Pan African Federation of Accountants (PAFA)?",
    "Which of the following objectives is strictly NOT a primary goal of conducting a public sector pre-payment audit?",
    "Identify an intrinsic component that serves as a cornerstone pillar during the process of budget execution in government.",
    "According to IPSAS 1, what specific overarching guidelines are prescribed for public sector entities?",
    "Which of the following structural checks functions as a primary mechanism for managing expenditure controls in public sector entities?",
    "What is implied when a localized government project is strictly classified and executed as a 'direct labour contract'?",
    "Within the parameters of public fiscal health, the accountability index primarily scrutinizes which of the following sectors?",
    "What standard of quality is inherently paramount regarding the timeliness of financial reporting in the public sector?",
    "Which professional body actively promotes and facilitates the adoption of International Public Sector Accounting Standards (IPSAS) across Africa?",
    "What is the central operational objective of enforcing 'stewardship' principles within public financial management?"
];

const qaMcq = [
    "What are the four classical mathematical components intricately responsible for the variations observed in time series data analysis?",
    "What is the primary overarching statistical purpose of constructing a linear regression model within business analytics?",
    "Identify the fundamental algebraic property or numerical base primarily utilized in the calculation of an index number.",
    "Specify the exact theoretical and mathematical boundary within which the Pearson product-moment correlation coefficient must be contained.",
    "Which foundational rule of probability analysis comprehensively dictates the mathematical treatment of mutually exclusive events?",
    "Which statistical metrics are collectively acknowledged and defined as the primary measures of central tendency?",
    "Describe the underlying architectural formula utilized to calculate the variance describing the spread of a localized population data set.",
    "Outline the rigorous and sequential logical steps a statistician must employ when conducting a formal hypothesis test.",
    "In what specific analytical scenario or structural distribution is the Chi-square non-parametric test most appropriately deployed?",
    "Identify the classic quantitative modeling methodologies most broadly applied in time-series business forecasting.",
    "Which process exemplifies the fundamental methodology involved in executing a pure, unstratified random sample?",
    "What is the ultimate, defining mathematical objective of successfully formulating a linear programming framework in operations research?",
    "Identify the structural formula utilized in Cost-Volume-Profit analysis to calculate the operational break-even point.",
    "How is the rudimentary payback period accurately calculated when exclusively evaluating initial investment liquidities?",
    "State the definitive and universal decision rule utilized to accept or reject an investment project based on Net Present Value (NPV).",
    "What specific dispersion characteristic does the classical standard deviation precisely measure and represent within a given dataset?",
    "Explain the overarching analytical strategy embedded within the calculation of moving averages across a sequence of time-series data.",
    "What does a standardized Z-score precisely measure and contextualize within the boundaries of a normal probability distribution?",
    "Define the structural implementation of a decision tree analysis architecture as actively used to evaluate business alternatives.",
    "Under the Central Limit Theorem framework, how is the structural distribution of sample means described as sample sizes grow sufficiently large?",
    "What is the primary, distinct analytical parameter tested and validated when executing an Analysis of Variance (ANOVA)?",
    "How does statistical skewness mathematically describe the structural shape and visual representation of an underlying data distribution?",
    "Which distinct characteristic of a statistical distribution is specifically quantified and evaluated by the concept of kurtosis?",
    "Define what a calculated confidence interval explicitly attempts to establish within the realm of inferential statistics.",
    "Explain the fundamental role and threshold interpretation of a P-value when formally testing a statistical hypothesis.",
    "Identify the specialized characteristic that distinguishes Spearman's rank correlation coefficient from other broad correlation tests.",
    "State the definitive decision rule determining whether to accept an investment project heavily relying upon the Internal Rate of Return (IRR).",
    "Identify the specific structural formula required to formally index and calculate a consumer price index (CPI).",
    "Describe the operative function and mathematical integration of a seasonal index within the breakdown of time series models.",
    "Which foundational principle of inferential probability theory explicitly underpins the mathematical architecture of Bayes' Theorem?"
];

const itMcq = [
    "Provide a historically classic example of a dominant single-user, single-tasking operating system primarily utilized in early personal computing.",
    "What is fundamentally considered the singular major function and operational boundary of computer system software?",
    "Within relational and hierarchical database management, what structural terminology accurately defines data systematically created by the end-user?",
    "Provide a comprehensive structural definition of a Uniform Resource Locator (URL) and its functional integration on the World Wide Web.",
    "What is uniformly considered the primary legal and strategic purpose underlying the execution of an organizational confidentiality agreement?",
    "Identify a significant regulatory or ethical apprehension strongly associated with incorporating Artificial Intelligence (AI) into financial reporting.",
    "List the foundational categories of account coding systems broadly integrated within structured computerized accounting environments.",
    "Summarize the enduring IT principle famously consolidated globally under the pervasive acronym GIGO (Garbage In, Garbage Out).",
    "Identify robust and structurally vital security measures an organization typically implements to deliberately mitigate pervasive data hacking risks.",
    "State the predominant operational and broad economic characteristics that primarily drive organizations to adopt cloud computing infrastructures.",
    "How does the direct integration of blockchain technology inherently optimize and safeguard the immutable audit trails of financial records?",
    "Identify the overarching categories representing the most aggressive and pervasive modern forms of malicious cybersecurity threats.",
    "What are universally recognized as the central integration advantages obtained by universally deploying an Enterprise Resource Planning (ERP) platform?",
    "Identify the foundational organizational models extensively utilized in the comprehensive design of standard Database Management Systems.",
    "Name the diverse architectural blueprints actively used to govern the physical or localized arrangement of connections traversing a computer network topology.",
    "Identify the fundamental framework and the four core philosophical tenets comprehensively underlying universal IT data ethics.",
    "Which structural lifecycle strategies should an organization prioritize to robustly combat systemic vulnerabilities caused exclusively by software obsolescence?",
    "Determine the primary mechanisms universally orchestrated by operational administrators to ensure total data storage redundancy and backup validity.",
    "Which critical ethical paradigms fundamentally mandate the operational guardrails applied over Artificial Intelligence within high-stakes finance algorithms?",
    "Define the intrinsic configuration of Digital Ledger Technology (DLT) and explain how its structural redundancy facilitates radically secure transactions.",
    "Explain the core technical dilemma described explicitly as the 'black box' challenge regarding the fundamental transparency of AI algorithms.",
    "How critical is the preservation of extreme data quality metrics when formally training and deploying predictive artificial intelligence logic models?",
    "How has the widespread, modern integration of AI explicitly altered the overarching severity and requirement threshold surrounding active cybersecurity measures?",
    "List the fundamental operational advantages an entity realizes seamlessly upon migrating from a manual to a completely computerized accounting infrastructure.",
    "What is the defining operational mandate explaining the existence, implementation, and overarching necessity of an enterprise computer network?",
    "Describe what operational phenomenon comprehensively defines and demonstrates the successful implementation of interconnected ERP architectural modules.",
    "Define the specific configuration and unyielding security function effectively executed by a network perimeter firewall.",
    "Explain the explicit cryptographic mechanism successfully deployed during the process of strategic data encryption.",
    "Determine the most structurally effective preliminary defense designed strictly to quarantine the organizational invasion of malicious software viruses.",
    "Identify an intrinsic administrative failure fundamentally characterized by auditors as a critical operational weakness in structural IT control systems."
];

const humanizedMap = {
    'FA_SAQ_POSSIBLE_2025.json': faSaq,
    'PSA_SAQ_POSSIBLE_2025.json': psaSaq,
    'QA_SAQ_POSSIBLE_2025.json': qaSaq,
    'IT_SAQ_POSSIBLE_2025.json': itSaq,
    'FA_MCQ_POSSIBLE_2025.json': faMcq,
    'PSA_MCQ_POSSIBLE_2025.json': psaMcq,
    'QA_MCQ_POSSIBLE_2025.json': qaMcq,
    'IT_MCQ_POSSIBLE_2025.json': itMcq
};

const quizzesDir = path.join(__dirname, '..', 'data', 'quizzes');

for (const [filename, newQuestions] of Object.entries(humanizedMap)) {
    const filePath = path.join(quizzesDir, filename);
    if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(raw);
        
        for (let i = 0; i < json.questions.length; i++) {
            if (newQuestions[i]) {
                json.questions[i].text = newQuestions[i];
            }
        }
        
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
        console.log(`Humanized ${json.questions.length} questions in ${filename}`);
    } else {
        console.log(`File not found: ${filename}`);
    }
}

/**
 * Demo stock universe seeded into MongoDB. Metadata only - never implies a
 * quote is current. Company blurbs are short, factual descriptions.
 */
const STOCK_UNIVERSE = [
  { symbol: 'AAPL', companyName: 'Apple Inc.', exchange: 'NASDAQ', industry: 'Technology', description: 'Designs and sells smartphones, personal computers, and consumer electronics, including the iPhone and Mac.' },
  { symbol: 'MSFT', companyName: 'Microsoft Corporation', exchange: 'NASDAQ', industry: 'Technology', description: 'Develops software, cloud services, and productivity tools, including Windows, Office, and Azure.' },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc.', exchange: 'NASDAQ', industry: 'Communication Services', description: 'Parent company of Google, operating search, advertising, YouTube, Android, and cloud computing.' },
  { symbol: 'AMZN', companyName: 'Amazon.com, Inc.', exchange: 'NASDAQ', industry: 'Consumer Discretionary', description: 'Operates global e-commerce marketplaces, logistics networks, and the AWS cloud platform.' },
  { symbol: 'TSLA', companyName: 'Tesla, Inc.', exchange: 'NASDAQ', industry: 'Consumer Discretionary', description: 'Designs and manufactures electric vehicles, energy storage systems, and solar products.' },
  { symbol: 'META', companyName: 'Meta Platforms, Inc.', exchange: 'NASDAQ', industry: 'Communication Services', description: 'Builds social networking apps including Facebook, Instagram, and WhatsApp, plus VR hardware.' },
  { symbol: 'NVDA', companyName: 'NVIDIA Corporation', exchange: 'NASDAQ', industry: 'Technology', description: 'Designs GPUs and accelerated computing platforms for gaming, AI, and data centers.' },
  { symbol: 'NFLX', companyName: 'Netflix, Inc.', exchange: 'NASDAQ', industry: 'Communication Services', description: 'Streams subscription-based films and series worldwide and produces original content.' },
  { symbol: 'AMD', companyName: 'Advanced Micro Devices, Inc.', exchange: 'NASDAQ', industry: 'Technology', description: 'Develops CPUs, GPUs, and adaptive computing chips for PCs, servers, and embedded systems.' },
  { symbol: 'INTC', companyName: 'Intel Corporation', exchange: 'NASDAQ', industry: 'Technology', description: 'Manufactures semiconductor chips and platforms for PCs, servers, and edge devices.' },
  { symbol: 'JPM', companyName: 'JPMorgan Chase & Co.', exchange: 'NYSE', industry: 'Financials', description: 'Global bank offering consumer banking, investment banking, and asset & wealth management.' },
  { symbol: 'V', companyName: 'Visa Inc.', exchange: 'NYSE', industry: 'Financials', description: 'Operates a global payments network connecting consumers, merchants, and financial institutions.' },
  { symbol: 'MA', companyName: 'Mastercard Incorporated', exchange: 'NYSE', industry: 'Financials', description: 'Payments technology company connecting consumers, financial institutions, and merchants.' },
  { symbol: 'BAC', companyName: 'Bank of America Corporation', exchange: 'NYSE', industry: 'Financials', description: 'Bank serving consumers and businesses with lending, investing, and wealth management.' },
  { symbol: 'GS', companyName: 'The Goldman Sachs Group, Inc.', exchange: 'NYSE', industry: 'Financials', description: 'Investment bank providing advisory, trading, asset management, and consumer banking.' },
  { symbol: 'JNJ', companyName: 'Johnson & Johnson', exchange: 'NYSE', industry: 'Health Care', description: 'Pharmaceutical and medical technology company producing medicines and medical devices.' },
  { symbol: 'PFE', companyName: 'Pfizer Inc.', exchange: 'NYSE', industry: 'Health Care', description: 'Biopharmaceutical company discovering, developing, and manufacturing medicines and vaccines.' },
  { symbol: 'UNH', companyName: 'UnitedHealth Group Incorporated', exchange: 'NYSE', industry: 'Health Care', description: 'Health insurance and health services company operating UnitedHealthcare and Optum.' },
  { symbol: 'XOM', companyName: 'Exxon Mobil Corporation', exchange: 'NYSE', industry: 'Energy', description: 'Integrated oil and gas company exploring for and producing crude oil and natural gas.' },
  { symbol: 'CVX', companyName: 'Chevron Corporation', exchange: 'NYSE', industry: 'Energy', description: 'Integrated energy company with upstream production and downstream refining operations.' },
  { symbol: 'KO', companyName: 'The Coca-Cola Company', exchange: 'NYSE', industry: 'Consumer Staples', description: 'Beverage company selling nonalcoholic drinks worldwide.' },
  { symbol: 'PEP', companyName: 'PepsiCo, Inc.', exchange: 'NASDAQ', industry: 'Consumer Staples', description: 'Food and beverage company with a portfolio of snack brands and soft drinks.' },
  { symbol: 'WMT', companyName: 'Walmart Inc.', exchange: 'NYSE', industry: 'Consumer Staples', description: 'Retail chain operating discount stores and e-commerce in multiple countries.' },
  { symbol: 'HD', companyName: 'The Home Depot, Inc.', exchange: 'NYSE', industry: 'Consumer Discretionary', description: 'Home improvement retailer selling building materials, tools, and garden products.' },
  { symbol: 'MCD', companyName: "McDonald's Corporation", exchange: 'NYSE', industry: 'Consumer Discretionary', description: 'Franchises and operates fast-food restaurants worldwide.' },
  { symbol: 'BA', companyName: 'The Boeing Company', exchange: 'NYSE', industry: 'Industrials', description: 'Aerospace company designing commercial airplanes, defense systems, and space technology.' },
  { symbol: 'CAT', companyName: 'Caterpillar Inc.', exchange: 'NYSE', industry: 'Industrials', description: 'Manufactures construction and mining equipment, engines, and industrial turbines.' },
  { symbol: 'DIS', companyName: 'The Walt Disney Company', exchange: 'NYSE', industry: 'Communication Services', description: 'Entertainment company with film studios, streaming services, theme parks, and networks.' },
];

module.exports = { STOCK_UNIVERSE };

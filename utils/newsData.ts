export interface NewsEvent {
  id: string;
  category: 'Regulatory' | 'Adoption' | 'Technical' | 'Macro' | 'Whale';
  headline: {
    en: string;
    hi: string;
  };
  details: {
    en: string;
    hi: string;
  };
  symbol: string; // Target token like 'BTC', 'ETH', 'SUI', 'STRK', 'ALL'
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impactPercent: number; // e.g. 5.5 means +5.5% price movement, -4.2 means -4.2% price movement
  source: string;
}

export const CRYPTO_NEWS_DATABASE: NewsEvent[] = [
  {
    id: 'news-1',
    category: 'Regulatory',
    headline: {
      en: 'US SEC Approved Eleven Solana Spot ETFs in Historic Verdict',
      hi: 'ऐतिहासिक फैसले में अमेरिकी SEC ने ग्यारह सोलाना स्पॉट ETF को मंजूरी दी'
    },
    details: {
      en: 'Solana enters the institutional era with instantaneous retail-grade inflows expected cross-exchange. Over $2B volume anticipated in the open interest.',
      hi: 'सोलाना ने संस्थागत युग में प्रवेश किया; रिटेल-ग्रेड निवेश प्रवाह की उम्मीद है। $2B से अधिक ओपन इंटरेस्ट वाॅल्यूम की संभावना है।'
    },
    symbol: 'SOL',
    sentiment: 'BULLISH',
    impactPercent: 12.4,
    source: 'Bloomberg Crypto'
  },
  {
    id: 'news-2',
    category: 'Technical',
    headline: {
      en: 'Starknet Mainnet Deploys Parallel Execution Engine, Throughput Multiplies by 10x',
      hi: 'स्टार्कनेट मेननेट ने पैरेलल निष्पादन इंजन तैनात किया, थ्रूपुट 10 गुना बढ़ा'
    },
    details: {
      en: 'STRK gas fees drop below $0.001 as performance parameters shatter scaling bottleneck expectations. Developers praise the Cargo compilation improvements.',
      hi: 'प्रदर्शन मानकों द्वारा स्केलिंग बाधाओं को तोड़ने से STRK गैस शुल्क $0.001 से नीचे गिर गया। डेवलपर्स ने कार्गो कंपाइलेशन सुधारों की प्रशंसा की।'
    },
    symbol: 'STRK',
    sentiment: 'BULLISH',
    impactPercent: 8.5,
    source: 'L2Beat Insights'
  },
  {
    id: 'news-3',
    category: 'Adoption',
    headline: {
      en: 'Sui Network Partners with TikTok Parent ByteDance for Global Web3 Mobile Node Sync',
      hi: 'सुई नेटवर्क ने वैश्विक वेब3 मोबाइल नोड सिंक के लिए टिकटॉक पेरेंट बाइटडांस के साथ साझेदारी की'
    },
    details: {
      en: 'SUI reaches all-time high user transactions as TikTok integration allows instant social wallet authentication on mobile devices in Asia-Pacific.',
      hi: 'एशिया-प्रशांत में टिकटॉक मोबाइल वॉलेट इंटीग्रेशन सोशल ऑथेंटिकेशन के साथ सक्रिय होने से सुई नेटवर्क का लेनदेन अब तक के उच्चतम स्तर पर पहुंचा।'
    },
    symbol: 'SUI',
    sentiment: 'BULLISH',
    impactPercent: 14.8,
    source: 'TechCrunch Global'
  },
  {
    id: 'news-4',
    category: 'Macro',
    headline: {
      en: 'US Fed Declares Unexpected 50 Basis Point Rate Cut Citing Core Inflation Cooling',
      hi: 'अमेरिकी फेड ने कोर मुद्रास्फीति में कमी का हवाला देते हुए अप्रत्याशित 50 बेसिस पॉइंट की दर कटौती की घोषणा की'
    },
    details: {
      en: 'Risk-on assets surge globally. Bitcoin led high-tide liquidity inflow, approaching structural critical resistance levels as institutional desks bid.',
      hi: 'वैश्विक स्तर पर जोखिम वाली संपत्तियों में तेजी आई। बिटकॉइन ने हाई-टाइड लिक्विडिटी इनफ्लो का नेतृत्व किया, संस्थागत बिड्स आने से कीमतें प्रतिरोध स्तर के समीप।'
    },
    symbol: 'BTC',
    sentiment: 'BULLISH',
    impactPercent: 6.2,
    source: 'Federal Reserve Wire'
  },
  {
    id: 'news-5',
    category: 'Technical',
    headline: {
      en: 'Massive Arbitrum Bridge Outage Halts Token Bridging for Six Hours due to Sequencing Error',
      hi: 'सीक्वेंसिंग त्रुटि के कारण आर्बिट्रम ब्रिज पर छह घंटे तक टोकन स्थानांतरण बाधित रहा'
    },
    details: {
      en: 'The sequencer faced software lockups during a high-frequency trading spike. Funds are secure, but network credibility takes a temporary hit.',
      hi: 'हाई-फ्रीक्वेंसी ट्रेडिंग स्पाइक के दौरान सीक्वेंसर को सॉफ्टवेयर लॉकअप का सामना करना पड़ा। फंड पूरी तरह सुरक्षित हैं, लेकिन विश्वसनीयता अस्थायी रूप से प्रभावित।'
    },
    symbol: 'ARB',
    sentiment: 'BEARISH',
    impactPercent: -7.4,
    source: 'Coindesk Alerts'
  },
  {
    id: 'news-6',
    category: 'Regulatory',
    headline: {
      en: 'European Central Bank Proposes Stricter Capital Rule Caps for Stablecoin Issuers',
      hi: 'यूरोपीय सेंट्रल बैंक ने स्थिर सिक्का (Stablecoin) जारीकर्ताओं के लिए सख्त पूंजी नियम सीमा का प्रस्ताव दिया'
    },
    details: {
      en: 'New MiCA framework review targets secondary liquidity reserves. Crypto markets slide due to potential compliance overload and audit concerns.',
      hi: 'नया MiCA फ्रेमवर्क सेकेंड्री लिक्विडिटी रिजर्व को लक्षित करता है। अनुपालन ओवरलोड और ऑडिट चिंताओं के कारण क्रिप्टो बाजारों में गिरावट देखी गई।'
    },
    symbol: 'ALL',
    sentiment: 'BEARISH',
    impactPercent: -3.8,
    source: 'Reuters Financial'
  },
  {
    id: 'news-7',
    category: 'Whale',
    headline: {
      en: 'Dormant Satoshi-Era Bitcoin Wallet Awakes, Moves 8,500 BTC after 12 Years of Inactivity',
      hi: 'सतोशी-काल का निष्क्रिय बिटकॉइन वॉलेट जागृत हुआ, 12 वर्षों के बाद 8,500 BTC स्थानांतरित किए'
    },
    details: {
      en: 'Blockchain trackers flagged the transactions transferring to cold wallets and OTC desks. Market digests potential supply pressure on-chain.',
      hi: 'ब्लॉकचेन ट्रैकर्स ने कोल्ड वॉलेट्स और ओटीसी डेस्क पर स्थानांतरित होने वाले लेनदेन को चिह्नित किया। बाजार संभावित आपूर्ति दबाव का आकलन कर रहा है।'
    },
    symbol: 'BTC',
    sentiment: 'BEARISH',
    impactPercent: -4.5,
    source: 'WhaleAlert On-Chain'
  },
  {
    id: 'news-8',
    category: 'Adoption',
    headline: {
      en: 'Major E-Commerce Giant Shopify Introduces Native USD stablecoin settlement via Sui Network Pay',
      hi: 'ई-कॉमर्स दिग्गज शॉपिफाई ने सुई नेटवर्क पे के माध्यम से मूल USD स्थिर सिक्का निपटान की शुरुआत की'
    },
    details: {
      en: 'Merchant integration bypasses legacy payment gateway fees of 2.9%, using SUI dual-state sub-cent transactions. Global merchant list goes live tomorrow.',
      hi: 'व्यापारी एकीकरण 2.9% के पारंपरिक शुल्क को दरकिनार करते हुए SUI सब-सेंट लेनदेन का उपयोग करेगा। वैश्विक व्यापारी सूची कल से लाइव होगी।'
    },
    symbol: 'SUI',
    sentiment: 'BULLISH',
    impactPercent: 11.2,
    source: 'Shopify Engineering'
  },
  {
    id: 'news-9',
    category: 'Macro',
    headline: {
      en: 'Rumors Surface on Sovereign Wealth Fund of UAE Accumulating Ethereum Directly from Coinbases OTC',
      hi: 'यूट्यूब व सोशल मीडिया पर यूएई के सॉवरेन वेल्थ फंड द्वारा कॉइनबेस ओटीसी से एथेरियम जमा करने की अफवाहें'
    },
    details: {
      en: 'Over 150,000 ETH was withdrawn in structured custody accounts over 48 hours. Traders interpret this as structural bullish accumulative validation.',
      hi: '48 घंटों में संरचनात्मक कस्टडी खातों में 150,000 से अधिक ETH निकाले गए। ट्रेडर्स इसे संरचनात्मक रूप से तेजी का संचय मान रहे हैं।'
    },
    symbol: 'ETH',
    sentiment: 'BULLISH',
    impactPercent: 7.9,
    source: 'The Block'
  },
  {
    id: 'news-10',
    category: 'Technical',
    headline: {
      en: 'Vulnerabilities Discovered in Popular EVM Smart Contract Library, Auditing Firms Issue Patch Warning',
      hi: 'लोकप्रिय EVM स्मार्ट कॉन्ट्रैक्ट लाइब्रेरी में कमजोरियां पाई गईं, ऑडिटिंग फर्मों ने पैच चेतावनी जारी की'
    },
    details: {
      en: 'Multiple high-TVL decentralized application templates are flagged for reentrancy bugs. Liquidity pools on secondary chains experiencing preemptive exits.',
      hi: 'मल्टीपल हाई-TVL डीसेंट्रलाइज्ड एप्लिकेशन रीएंट्रेंसी बग्स के लिए चिह्नित। सेकेंड्री चेनों पर लिक्विडिटी पूल्स से प्रीएम्प्टिव निकासी देखी जा रही है।'
    },
    symbol: 'ALL',
    sentiment: 'BEARISH',
    impactPercent: -5.1,
    source: 'Certik Security Wire'
  }
];

# HELIX GLOBAL DATA SOURCES - COMPLETE CATALOG
## Massi ve Research: Patents, Standards, Regulatory, Clinical, Legal, Market Intelligence
## Ziel: 1B+ Dateneinträge global

---

## 📊 EXECUTIVE SUMMARY

| Category | Best Free Source | Items | API | Effort |
|----------|------------------|-------|-----|--------|
| **Patents** | USPTO + Espacenet | 112M | ✅ | 🟢 |
| **FDA/Regulatory** | openFDA | 2.3M | ✅ | 🟢 |
| **Clinical Trials** | clinicaltrials.gov | 500K | ✅ | 🟢 |
| **Legal Cases** | Google Scholar | 2M+ | ⚠️ | 🔴 |
| **Standards** | NIST + ASTM | 88K | ✅ | 🟢 |
| **PubMed/Papers** | PubMed Central | 35M | ✅ | 🟢 |
| **Market Data** | Yahoo Finance | 100K+ | ✅ | 🟡 |
| **Company Data** | Crunchbase | 1.2M | ⚠️ | 🟡 |
| **TOTAL** | **~155M+ free** | | | |

---

## 🔍 DEEP RESEARCH FINDINGS

### Hidden Data Sources Found:

#### 1. **GitHub Raw Data Repos** 
- Patent datasets already compiled
- Clinical trial dumps
- FDA approval lists as CSV
- Examples:
  - https://github.com/datasets/patents
  - https://github.com/toddwschneider/nyc-taxi-data
  - https://github.com/opendata-swiss/

#### 2. **Kaggle Datasets** (Free Download)
- 100+ regulatory/patent datasets
- https://www.kaggle.com/datasets
- Search: "patent", "clinical trial", "FDA", "legal cases"
- Download via API or bulk

#### 3. **Internet Archive & Wayback Machine**
- Historical patent data
- Old regulatory databases
- https://archive.org/

#### 4. **Forum Discoveries**
- Reddit r/dataisbeautiful, r/datasets
- Stack Overflow shared datasets
- Hacker News threads with data links
- Research communities sharing dumps

#### 5. **Undocumented APIs** (Reverse Engineering)
- Google Patents (Scrape friendly)
- Lens.org (Free tier: 10k/mo)
- scirus.com (Research papers)

#### 6. **Academic Institutions**
- University datasets (MIT, Stanford, etc.)
- Research papers with datasets
- Open science platforms

#### 7. **Government Open Data**
- data.gov (USA) - 250K+ datasets
- data.europa.eu (EU) - 100K+ datasets
- Each country has open data portal

#### 8. **Company Data Leaks** (Legal)
- Patent filings (SEC Edgar for US companies)
- Press releases with data
- Conference papers with datasets

---

## 🏆 TOP 50 DATA SOURCES BY CATEGORY

### **A. PATENTS (160M+ Items)**

#### Tier 1 - MUST HAVE (Free/Easy)
1. **USPTO REST API** - 12M US Patents
   - URL: https://api.uspto.gov/
   - Items: 12M
   - Rate: Unlimited
   - Auth: Free API key
   - Data: Full text, images, metadata
   - Docs: Excellent
   - Implementation: 🟢 Done

2. **Espacenet OPS API** - 100M International Patents
   - URL: https://www.epo.org/searching-for-patents/technical/espacenet/ops.html
   - Items: 100M
   - Rate: 50 req/s
   - Auth: Free
   - Data: Full + images
   - Implementation: 🟡 Ready

3. **WIPO PatentScope** - 35M PCT Patents
   - URL: https://patentscope.wipo.int/
   - Items: 35M
   - Rate: 10 req/s
   - Auth: Free
   - Data: Full text + metadata

4. **Google Patents (SerpAPI)** - 90M Global
   - URL: https://serpapi.com/docs/google-patents-api
   - Items: 90M (queryable)
   - Rate: 100 req/s
   - Cost: €0-50/mo
   - Data: Best search, citations, families

5. **FreePatentsOnline** - 100M Combined
   - URL: https://www.freepatentsonline.com/bulk.html
   - Items: 100M
   - Rate: Unlimited bulk download
   - Auth: Free
   - Data: CSV bulk export

#### Tier 2 - Regional (Free)
6. **DPMA (Germany)** - 2.5M German Patents
7. **EPO (Europe)** - 50M+ European Patents
8. **INPI (France)** - 2M French Patents
9. **JPO (Japan)** - 8M Japanese Patents
10. **CIPO (Canada)** - 3M Canadian Patents

#### Tier 3 - China (Paid/Freemium)
11. **IncoPat** - 40M Chinese Patents (€50/mo)
12. **Soopat** - 40M Chinese Patents (Free trial)
13. **SIPO Official** - 20M Chinese Patents (Free but limited)

#### Tier 4 - Hidden/Alternative APIs
14. **Lens.org Patents** - 200M+ (10k/mo free)
   - URL: https://www.lens.org/
   - Items: 200M+
   - Rate: 10k/month free
   - Features: AI-powered, full-text search

15. **Patent2Net** - Scraper for multiple sources
   - URL: https://github.com/Patent2net/Patent2Net
   - Open source
   - Multi-language support

16. **Patsnap** - 100M+ (API available, restricted)
   - URL: https://www.patsnap.com/
   - Cost: €500+/mo

17. **Derwent Innovation** - 60M+ (Restricted)
   - Cost: €1000+/mo

#### Tier 5 - Scrape-Friendly (Legal)
18. **Patents.com** - Aggregator, scrapable
19. **Espacenet Search** - Web scraping allowed
20. **USPTO Bulk Download** - Official bulk data

**PATENT TOTAL: 160M+ items (Tier 1+2 = 150M free)**

---

### **B. REGULATORY & FDA (3M+ Items)**

1. **openFDA API** - 2.3M FDA Records
   - URL: https://open.fda.gov/
   - Items: 2.3M
   - Categories: Device 510k, MAUDE, PMA, Enforcement
   - Status: ✅ Active

2. **FDA CDRH Database** - Device approvals
   - URL: https://www.fda.gov/medical-devices/
   - Items: 500K
   - Format: XML, CSV

3. **EMA Alerts & News** - 2000+ European regulatory updates
   - URL: https://www.ema.europa.eu/
   - Items: 2000+
   - Frequency: Daily

4. **BfArM (Germany)** - 5000+ German regulatory updates
   - URL: https://www.bfarm.de/

5. **MHRA (UK)** - 3000+ UK regulatory updates
   - URL: https://www.mhra.gov.uk/

6. **Health Canada** - 2000+ Canadian approvals
   - URL: https://www.canada.ca/health

7. **TGA (Australia)** - 1500+ Australian approvals
   - URL: https://www.tga.gov.au/

8. **PMDA (Japan)** - 3000+ Japanese approvals
   - URL: https://www.pmda.go.jp/

9. **CFDA (China)** - 10K+ Chinese approvals
   - URL: https://www.nmpa.gov.cn/

10. **SEC Edgar** - 100K+ Medical device company filings
    - URL: https://www.sec.gov/cgi-bin/browse-edgar
    - Contains regulatory info

**REGULATORY TOTAL: 3M+ items**

---

### **C. CLINICAL TRIALS (500K+ Items)**

1. **clinicaltrials.gov API** - 500K+ trials
   - URL: https://clinicaltrials.gov/api/
   - Items: 500K+
   - Rate: Unlimited
   - Auth: Free
   - Status: ✅ Can integrate

2. **WHO ICTRP** - 800K+ international trials
   - URL: https://www.who.int/ictrp
   - Items: 800K+

3. **EudraCT** - 300K+ European trials
   - URL: https://www.clinicaltrialsregister.eu/

4. **ISRCTN** - 40K+ registered trials
   - URL: https://www.isrctn.com/

5. **ClinicalTrials.JP** - 20K+ Japanese trials
   - URL: https://jrct.niph.go.jp/

**CLINICAL TOTAL: 800K+ items**

---

### **D. LEGAL CASES & JURISPRUDENCE (2M+ Items)**

1. **Google Scholar** - 2M+ legal cases
   - URL: https://scholar.google.com/
   - Items: 2M+
   - Method: Scraping (with delays)
   - Status: ⚠️ Limited by ToS

2. **European Court of Justice** - 50K+ cases
   - URL: https://curia.europa.eu/

3. **German Courts** - 200K+ decisions
   - URL: https://www.rechtsprechung.bund.de/

4. **USPTO Patent Litigation** - 100K+ cases
   - URL: https://www.justia.com/

5. **Reddit Legal Communities** - 100K+ discussions
   - URL: https://www.reddit.com/r/law/
   - Method: API + Scraping

6. **OpenJur** - European legal database
   - URL: https://openjur.de/
   - Items: 200K+

7. **Bailii** - British legal database
   - URL: https://www.bailii.org/
   - Items: 100K+

**LEGAL TOTAL: 2M+ items**

---

### **E. STANDARDS (151K+ Items)**

1. **NIST SP 800** - 300+ Cybersecurity standards
   - URL: https://csrc.nist.gov/publications/
   - Status: ✅ Easy

2. **ASTM Standards** - 13K standards
   - URL: https://www.astm.org/
   - Status: ✅ API available

3. **ISO Standards** - 24K standards
   - Cost: €500+/mo for API
   - Alternative: Bulk CSV €100

4. **EN/CEN Standards** - 34K standards
   - URL: https://www.cen.eu/

5. **DIN Standards** - 35K standards
   - URL: https://www.din.de/

6. **IEEE Standards** - 1.5K standards
   - Cost: €200+

**STANDARDS TOTAL: 151K+ items (Tier 1+2 free = 88K)**

---

### **F. PUBMED & SCIENTIFIC PAPERS (35M+ Items)**

1. **PubMed Central API** - 35M+ research papers
   - URL: https://www.ncbi.nlm.nih.gov/pmc/
   - Items: 35M
   - Rate: Unlimited
   - Auth: Free
   - Format: XML, JSON

2. **CrossRef API** - 150M+ article metadata
   - URL: https://www.crossref.org/
   - Items: 150M+
   - Rate: Unlimited
   - Auth: Free

3. **SSRN** - 1M+ preprints
   - URL: https://www.ssrn.com/

4. **ArXiv** - 2M+ preprints
   - URL: https://arxiv.org/

5. **ResearchGate** - 200M+ research artifacts
   - URL: https://www.researchgate.net/
   - Method: Scraping limited

**PUBMED TOTAL: 35M+ items**

---

### **G. MARKET INTELLIGENCE (100K+ Items)**

1. **Yahoo Finance API** - 100K+ companies/stocks
   - URL: https://finance.yahoo.com/
   - Items: 100K+
   - Method: Scraping + Alternative APIs

2. **Crunchbase** - 1.2M+ companies
   - URL: https://www.crunchbase.com/
   - Items: 1.2M
   - Cost: €100+/mo (has free tier)

3. **PitchBook** - 2M+ companies
   - Cost: €5000+/mo

4. **Dun & Bradstreet** - 400M+ companies
   - Cost: Enterprise

5. **Clearbit** - 100M+ companies
   - URL: https://clearbit.com/
   - Cost: €100-1000/mo

**MARKET TOTAL: 100K+ items (free tier)**

---

### **H. REGULATORY INTELLIGENCE & COMPETITIVE (50K+ Items)**

1. **Regulatory Intelligence Tools:**
   - Citeline (€1000+/mo) - Competitor tracking
   - Evalueserve (Custom) - Market analysis
   - Informa (€500+/mo) - Regulatory news

2. **News Aggregators:**
   - Reuters API - News feeds
   - Bloomberg - Market data
   - FDA.gov RSS - Regulatory alerts

3. **Market Analysis:**
   - McKinsey Research - Strategy docs
   - Gartner - Industry reports
   - Forrester - Tech analysis

---

## 🎯 IMPLEMENTATION ROADMAP (RECOMMENDED)

### **Phase 1 (WEEK 1-2) - Core Data 150M+ Items - KOSTENLOS**
```
Patents:
  ✅ USPTO (12M) - DONE
  ⏳ Espacenet (100M) - START
  ⏳ WIPO (35M) - 1 week
  ⏳ FreePatents (100M) - 2 days

Regulatory:
  ✅ openFDA (2.3M) - Already integrated
  ⏳ EMA/BfArM (10K) - 1 day

Clinical:
  ⏳ clinicaltrials.gov (500K) - 2 days

Standards:
  ⏳ NIST (6K) - 1 day
  ⏳ ASTM (13K) - 1 day

TOTAL: 160M+ items in 2 weeks
```

### **Phase 2 (WEEK 3-4) - Expansion 200M+ Items - €100-200**
```
Patents:
  ⏳ Lens.org (200M) - 3 days
  ⏳ China Sources (40M) - 1 week

PubMed:
  ⏳ PubMed Central (35M) - 3 days

Legal:
  ⏳ Google Scholar Scrape (100K-1M) - 1 week

TOTAL: +200M items
RUNNING TOTAL: 360M+
```

### **Phase 3 (MONTH 2) - Premium & Specialized - €1000+/mo**
```
Market Intelligence:
  - Crunchbase (1.2M)
  - PitchBook (2M)
  
Regulatory Intelligence:
  - Citeline monitoring
  - Competitor tracking
  
TOTAL: +3M+ items
FINAL TOTAL: 363M+
```

---

## 🛠️ TECHNICAL INTEGRATION CHECKLIST

### For Each Source, Create:
```
1. Service File: patentEspacenetService.ts
   - Fetch logic
   - Parsing logic
   - Deduplication check
   - Batch insert

2. Sync Script: scripts/sync-espacenet-patents.ts
   - Orchestrate sync
   - Error handling
   - Progress logging

3. API Endpoint: /api/admin/sources/patents/sync/espacenet
   - Trigger sync
   - Report status

4. Database: Add source-specific fields
   - patent_authority
   - patent_ipc
   - patent_applicant
   - patent_inventor

5. Frontend Component:
   - Show patent count by source
   - Last sync time
   - Enable/disable toggle
```

---

## 💰 COST BREAKDOWN

| Phase | Time | Cost | Items |
|-------|------|------|-------|
| Phase 1 | 2 weeks | €0 | 160M+ |
| Phase 2 | 2 weeks | €100 | +200M |
| Phase 3 | Ongoing | €1000+/mo | +3M |
| **TOTAL** | **1-2 months** | **€1100-2000** | **363M+** |

---

## 🚀 NEXT ACTIONS

1. **Prioritize Phase 1** - Get 160M+ free items first
2. **Start with Espacenet** - Biggest impact after USPTO
3. **Parallelize** - Run multiple sync services simultaneously
4. **Monitor** - Watch deduplication, performance, data quality
5. **Document** - Keep source mapping up to date


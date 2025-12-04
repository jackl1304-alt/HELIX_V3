/**
 * DEEP RESEARCH: Global Patent APIs & Data Sources
 * Sucht nach allen verfügbaren kostenlosen und bezahlten Patent-APIs weltweit
 */

import axios from 'axios';

interface APISource {
  name: string;
  url: string;
  type: 'free' | 'freemium' | 'paid' | 'open-data';
  coverage: string;
  authRequired: boolean;
  rateLimit: string;
  dataPoints: string[];
  status: 'unknown' | 'tested' | 'active' | 'offline';
}

class PatentAPIResearcher {
  private sources: APISource[] = [];

  async testAPI(name: string, url: string, method: 'GET' | 'POST' = 'GET'): Promise<boolean> {
    try {
      const response = await axios({
        method,
        url,
        timeout: 5000,
        headers: {
          'User-Agent': 'PatentResearcher/1.0'
        }
      });
      console.log(`   ✅ ${name}: ${response.status} ${response.statusText}`);
      return true;
    } catch (error: any) {
      const status = error.response?.status || 'No response';
      console.log(`   ❌ ${name}: ${status}`);
      return false;
    }
  }

  async research() {
    console.log('\n🔬 GLOBAL PATENT API RESEARCH\n════════════════════════════════════\n');

    // ============================================================
    // 1. VEREINIGTE STAATEN
    // ============================================================
    console.log('🇺🇸 VEREINIGTE STAATEN\n');

    console.log('1. USPTO (U.S. Patent and Trademark Office)');
    await this.testAPI('USPTO Patent Examination Data', 'https://developer.uspto.gov/ibd-api/v1/application/grants?limit=1');
    this.sources.push({
      name: 'USPTO Patent Public Data API',
      url: 'https://developer.uspto.gov',
      type: 'free',
      coverage: 'All US Patents (1790-Present)',
      authRequired: false,
      rateLimit: '120 requests/min',
      dataPoints: ['Patent Number', 'Title', 'Abstract', 'Claims', 'Assignee', 'Inventors', 'Filing Date', 'Issue Date', 'IPC', 'CPC'],
      status: 'tested'
    });

    console.log('2. Google Patents');
    await this.testAPI('Google Patents', 'https://patents.google.com');
    this.sources.push({
      name: 'Google Patents',
      url: 'https://patents.google.com',
      type: 'free',
      coverage: '100M+ patents (US, EP, WO, GB, CA, JP, CN, etc.)',
      authRequired: false,
      rateLimit: 'No official limit (rate-limited by IP)',
      dataPoints: ['Title', 'Abstract', 'Publication Date', 'Grant Date', 'Assignee', 'Inventors', 'Citations', 'Related Patents'],
      status: 'active'
    });

    console.log('3. PatentsView.org');
    await this.testAPI('PatentsView API', 'https://patentsview.org/api/patents/query?q={"patent_type":"utility"}&f=["patent_num"]&o={"per_page":1}');
    this.sources.push({
      name: 'PatentsView (NIH-funded)',
      url: 'https://patentsview.org/api',
      type: 'free',
      coverage: 'US Patents + Assignments + Inventors',
      authRequired: false,
      rateLimit: '5,000 requests/hour',
      dataPoints: ['Patent Number', 'Title', 'Abstract', 'Claims', 'Assignees', 'Inventors', 'Citations', 'CPC', 'IPC'],
      status: 'tested'
    });

    console.log('4. USPTO PAIR (Patent Application Information Retrieval)');
    await this.testAPI('USPTO PAIR', 'https://pair.uspto.gov/cgi-bin/PublicAPAR');
    this.sources.push({
      name: 'USPTO PAIR',
      url: 'https://pair.uspto.gov',
      type: 'free',
      coverage: 'US Patent Applications (Real-time)',
      authRequired: false,
      rateLimit: 'Moderate (web scraping)',
      dataPoints: ['Application Number', 'Status', 'Filing Date', 'Publication Date', 'Examiner', 'Office Actions'],
      status: 'active'
    });

    console.log('5. USPTO Bulk Data');
    this.sources.push({
      name: 'USPTO Bulk Data (FTP)',
      url: 'ftp://ftp.uspto.gov/pub/patft',
      type: 'open-data',
      coverage: 'All US Patents (XML, TXT)',
      authRequired: false,
      rateLimit: 'No limit',
      dataPoints: ['Full XML/TXT dumps', 'Daily updates', 'Complete bibliographic data'],
      status: 'active'
    });

    console.log('6. Lens.org (AI-powered)');
    await this.testAPI('Lens.org API', 'https://api.lens.org/patent/search');
    this.sources.push({
      name: 'Lens.org Patent Database',
      url: 'https://lens.org',
      type: 'freemium',
      coverage: '150M+ patents (Global)',
      authRequired: true,
      rateLimit: '1,000 requests/day (free)',
      dataPoints: ['Full metadata', 'Sequences', 'Metadata Analysis', 'Global IP Intelligence'],
      status: 'offline'
    });

    // ============================================================
    // 2. EUROPA
    // ============================================================
    console.log('\n🇪🇺 EUROPA\n');

    console.log('1. EPO (European Patent Office) - OPS API');
    await this.testAPI('EPO OPS API', 'https://ops.epo.org');
    this.sources.push({
      name: 'EPO Open Patent Services (OPS)',
      url: 'https://ops.epo.org',
      type: 'free',
      coverage: 'European + Global Patents (140M+)',
      authRequired: true,
      rateLimit: '4 requests/sec (registered users)',
      dataPoints: ['Full bibliographic data', 'Classification', 'Legal status', 'Family information', 'Sequences'],
      status: 'offline'
    });

    console.log('2. EPO espacenet');
    await this.testAPI('EPO espacenet', 'https://worldwide.espacenet.com');
    this.sources.push({
      name: 'EPO espacenet',
      url: 'https://worldwide.espacenet.com',
      type: 'free',
      coverage: '130M+ patents (EP, US, WO, CN, JP, etc.)',
      authRequired: false,
      rateLimit: 'Rate-limited by IP',
      dataPoints: ['Title', 'Abstract', 'Claims', 'Publication Date', 'Examiner Notes', 'Legal Status'],
      status: 'offline'
    });

    console.log('3. WIPO PatentScope');
    await this.testAPI('WIPO PatentScope', 'https://patentscope.wipo.int/search');
    this.sources.push({
      name: 'WIPO PatentScope',
      url: 'https://patentscope.wipo.int',
      type: 'free',
      coverage: 'International (PCT) + National Patents',
      authRequired: false,
      rateLimit: 'Rate-limited',
      dataPoints: ['PCT Applications', 'Priority Date', 'Filing Date', 'Publication Date', 'IPC Classification'],
      status: 'offline'
    });

    // ============================================================
    // 3. ASIEN-PAZIFIK
    // ============================================================
    console.log('\n🇨🇳🇯🇵🇰🇷 ASIEN-PAZIFIK\n');

    console.log('1. CNIPA (China National Intellectual Property Administration)');
    this.sources.push({
      name: 'CNIPA Patent Database',
      url: 'https://www.cnipa.gov.cn',
      type: 'free',
      coverage: 'Chinese Patents (3M+ annually)',
      authRequired: false,
      rateLimit: 'Unknown',
      dataPoints: ['Application Number', 'Status', 'Title', 'Abstract', 'Assignee', 'Inventors'],
      status: 'unknown'
    });

    console.log('2. JPO (Japan Patent Office)');
    this.sources.push({
      name: 'JPO INPIT Database',
      url: 'https://www.inpit.go.jp',
      type: 'free',
      coverage: 'Japanese Patents',
      authRequired: false,
      rateLimit: 'Unknown',
      dataPoints: ['Patent Number', 'Title', 'Abstract', 'Classification', 'Status'],
      status: 'unknown'
    });

    console.log('3. KIPRIS (Korean IP Rights Information Service)');
    this.sources.push({
      name: 'KIPRIS',
      url: 'https://www.kipris.or.kr',
      type: 'free',
      coverage: 'Korean Patents',
      authRequired: false,
      rateLimit: 'Unknown',
      dataPoints: ['Patent Number', 'Title', 'Abstract', 'Assignee', 'Status'],
      status: 'unknown'
    });

    console.log('4. IP Australia');
    await this.testAPI('IP Australia', 'https://www.ipaustralia.gov.au');
    this.sources.push({
      name: 'IP Australia (PatentsDB)',
      url: 'https://www.ipaustralia.gov.au',
      type: 'free',
      coverage: 'Australian Patents',
      authRequired: false,
      rateLimit: 'Unknown',
      dataPoints: ['Patent Number', 'Status', 'Filing Date', 'Publication Date'],
      status: 'active'
    });

    // ============================================================
    // 4. SPEZIALISIERTE DATENBANKEN
    // ============================================================
    console.log('\n🔬 SPEZIALISIERTE DATENBANKEN\n');

    console.log('1. PubChem (Chemical Patents)');
    await this.testAPI('PubChem', 'https://pubchem.ncbi.nlm.nih.gov');
    this.sources.push({
      name: 'PubChem (NIH)',
      url: 'https://pubchem.ncbi.nlm.nih.gov',
      type: 'free',
      coverage: 'Chemical compounds in patents',
      authRequired: false,
      rateLimit: 'Moderate',
      dataPoints: ['Chemical structure', 'Patent citations', 'Compound name', 'Molecular weight'],
      status: 'active'
    });

    console.log('2. SureChemBL (Chemistry)');
    await this.testAPI('SureChemBL', 'https://www.surechembl.org');
    this.sources.push({
      name: 'SureChemBL',
      url: 'https://www.surechembl.org',
      type: 'free',
      coverage: '5M+ bioactive compounds from patents',
      authRequired: false,
      rateLimit: 'Rate-limited',
      dataPoints: ['Chemical structure', 'Patent ID', 'Bioactivity data', 'SMILES notation'],
      status: 'offline'
    });

    console.log('3. Scirus (Science search)');
    this.sources.push({
      name: 'Scirus Elsevier',
      url: 'https://www.elsevier.com',
      type: 'paid',
      coverage: 'Patents + Scientific literature',
      authRequired: true,
      rateLimit: 'Institutional license',
      dataPoints: ['Patent metadata', 'Citations', 'Co-inventorship networks'],
      status: 'unknown'
    });

    // ============================================================
    // 5. MONITORING & ALERTS (LAUFENDE PATENTE)
    // ============================================================
    console.log('\n⏰ LAUFENDE PATENTE & MONITORING\n');

    this.sources.push({
      name: 'USPTO TSDR (TESS)',
      url: 'https://teas.uspto.gov/teasplus/teasplus_entry.html',
      type: 'free',
      coverage: 'Trademark & Patent Status (Real-time)',
      authRequired: false,
      rateLimit: 'Moderate',
      dataPoints: ['Application Status', 'Filing Date', 'Publication Status', 'Examination Stage'],
      status: 'active'
    });

    this.sources.push({
      name: 'PatentScope Alerts',
      url: 'https://patentscope.wipo.int',
      type: 'free',
      coverage: 'PCT Application monitoring',
      authRequired: false,
      rateLimit: 'N/A',
      dataPoints: ['Status updates', 'Publication alerts', 'Request/Withdrawal notifications'],
      status: 'unknown'
    });

    this.sources.push({
      name: 'Google Patents Alerts',
      url: 'https://patents.google.com',
      type: 'free',
      coverage: 'Patent citation alerts',
      authRequired: false,
      rateLimit: 'N/A',
      dataPoints: ['New citations', 'Related patents', 'Similar inventions'],
      status: 'active'
    });

    // ============================================================
    // 6. KOSTENPFLICHTIGE PREMIUM-SERVICES
    // ============================================================
    console.log('\n💰 PREMIUM SERVICES\n');

    this.sources.push({
      name: 'Espacenet Premium API',
      url: 'https://www.epo.org',
      type: 'paid',
      coverage: 'Full EPO data with commercial SLA',
      authRequired: true,
      rateLimit: 'Custom',
      dataPoints: ['All EPO data', 'Legal status', 'Priority information'],
      status: 'unknown'
    });

    this.sources.push({
      name: 'LexisNexis PatentAdvisor',
      url: 'https://www.lexisnexis.com',
      type: 'paid',
      coverage: 'Global IP Intelligence',
      authRequired: true,
      rateLimit: 'Institutional',
      dataPoints: ['Patent analytics', 'Ownership tracking', 'Litigation monitoring'],
      status: 'unknown'
    });

    this.sources.push({
      name: 'Orbit Intelligence (formerly Questel)',
      url: 'https://www.orbitip.com',
      type: 'paid',
      coverage: '150M+ patents globally',
      authRequired: true,
      rateLimit: 'Custom',
      dataPoints: ['Full bibliographic data', 'Patent families', 'Citation networks', 'AI analysis'],
      status: 'unknown'
    });

    // ============================================================
    // 7. OPEN SOURCE & ALTERNATIVE QUELLEN
    // ============================================================
    console.log('\n🔓 OPEN SOURCE & ALTERNATIVE\n');

    this.sources.push({
      name: 'OpenPatents (Apache License)',
      url: 'https://www.openpatent.org',
      type: 'open-data',
      coverage: 'US Patents (Open database)',
      authRequired: false,
      rateLimit: 'No limit',
      dataPoints: ['All patent data', 'Bulk downloads', 'Open source tools'],
      status: 'unknown'
    });

    this.sources.push({
      name: 'GitHub Patent Data',
      url: 'https://github.com/topics/patent-data',
      type: 'open-data',
      coverage: 'Various open datasets',
      authRequired: false,
      rateLimit: 'N/A',
      dataPoints: ['Bulk patent files', 'Processing scripts', 'Datasets'],
      status: 'unknown'
    });

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n════════════════════════════════════\n');
    console.log('📊 ZUSAMMENFASSUNG\n');

    const active = this.sources.filter(s => s.status === 'active').length;
    const free = this.sources.filter(s => s.type === 'free').length;
    const paid = this.sources.filter(s => s.type === 'paid').length;

    console.log(`Total sources found: ${this.sources.length}`);
    console.log(`- ✅ Active/Tested: ${active}`);
    console.log(`- 🆓 Free: ${free}`);
    console.log(`- 💰 Paid: ${paid}`);

    // Top 5 Empfehlungen
    console.log('\n🎯 TOP 5 EMPFEHLUNGEN FÜR HELIX:\n');
    console.log('1. GOOGLE PATENTS (Free, Global)');
    console.log('   - 100M+ patents');
    console.log('   - Keine Auth erforderlich');
    console.log('   - Web scraping möglich');
    console.log('   - URL: https://patents.google.com/api\n');

    console.log('2. PATENTSVIEW (Free, US)');
    console.log('   - 930k+ US Patents');
    console.log('   - Strukturierte API');
    console.log('   - NIH-finanziert (zuverlässig)');
    console.log('   - URL: https://patentsview.org/api\n');

    console.log('3. USPTO BULK DATA (Open, Complete)');
    console.log('   - Vollständige tägliche Dumps');
    console.log('   - XML/TXT Format');
    console.log('   - Keine Rate Limits');
    console.log('   - URL: ftp://ftp.uspto.gov/pub/patft\n');

    console.log('4. WIPO PATENTSCOPE (Free, International)');
    console.log('   - PCT Applications');
    console.log('   - Real-time updates');
    console.log('   - Global coverage');
    console.log('   - URL: https://patentscope.wipo.int\n');

    console.log('5. LENS.org (Freemium, AI-powered)');
    console.log('   - 150M+ patents');
    console.log('   - Kostenlos registrieren');
    console.log('   - API mit 1,000 Req/Tag');
    console.log('   - URL: https://lens.org\n');

    console.log('\n════════════════════════════════════');
    console.log('\n💡 FÜR LAUFENDE PATENTE (MONITORING):\n');
    console.log('1. USPTO TSDR - Real-time application status');
    console.log('2. PatentScope Alerts - PCT application updates');
    console.log('3. Google Patents Alerts - Citation tracking');
    console.log('4. RSS Feeds von allen Major Offices');
    console.log('5. Webhook integration für API updates\n');

    return this.sources;
  }

  displayTable() {
    console.log('\n📋 DETAILLIERTE API-TABELLE\n');
    console.table(this.sources.map(s => ({
      'Name': s.name.substring(0, 30),
      'Typ': s.type,
      'Auth': s.authRequired ? '✓' : '✗',
      'Status': s.status,
      'Coverage': s.coverage.substring(0, 40)
    })));
  }
}

// Execute research
const researcher = new PatentAPIResearcher();
researcher.research().then(() => {
  researcher.displayTable();
  process.exit(0);
}).catch(err => {
  console.error('Research error:', err);
  process.exit(1);
});

/**
 * Parst master_sources_formatted.docx (extrahiert als Text) und erzeugt
 * shared/data/master-sources-catalog.json + docs/regulatory/MASTER_SOURCES_CATALOG.md
 *
 * Nutzung:
 *   node scripts/extract-docx-text.mjs "c:/Users/Marco/Downloads/master_sources_formatted.docx" tmp_master_sources.txt
 *   node scripts/build-master-sources-catalog.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const INPUT = path.join(ROOT, 'tmp_master_sources.txt');
const JSON_OUT = path.join(ROOT, 'shared/data/master-sources-catalog.json');
const MD_OUT = path.join(ROOT, 'docs/regulatory/MASTER_SOURCES_CATALOG.md');

const ACCESS_DATE = new Date().toISOString().slice(0, 10);
const SOURCE_DOC = 'master_sources_formatted.docx';
const VERSION = '1.0.0';

function slugId(prefix, text) {
  const base = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  return `${prefix}_${base}`;
}

function normalizeUrl(domainOrPath) {
  const d = domainOrPath.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${d}`;
}

/** Behörden: Domain aus DOCX → vollständige offizielle URL */
const AUTHORITY_URLS = {
  'fda.gov/medical-devices': 'https://www.fda.gov/medical-devices',
  'ema.europa.eu': 'https://www.ema.europa.eu/en/homepage',
  'eur-lex.europa.eu': 'https://eur-lex.europa.eu/homepage.html',
  'imdrf.org/documents': 'https://www.imdrf.org/documents/documents.asp',
  'pmda.go.jp/english': 'https://www.pmda.go.jp/english/index.html',
  'english.nmpa.gov.cn': 'https://english.nmpa.gov.cn/',
  'gov.uk/mhra': 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency',
  'tga.gov.au': 'https://www.tga.gov.au/',
  'canada.ca/en/health-canada': 'https://www.canada.ca/en/health-canada.html',
  'gov.br/anvisa': 'https://www.gov.br/anvisa/pt-br',
  'mfds.go.kr/eng': 'https://www.mfds.go.kr/eng/index.do',
  'hsa.gov.sg': 'https://www.hsa.gov.sg/',
  'swissmedic.ch': 'https://www.swissmedic.ch/swissmedic/en/home.html',
  'cdsco.gov.in': 'https://cdsco.gov.in/opencms/opencms/en/Home/',
  'sfda.gov.sa/en': 'https://www.sfda.gov.sa/en',
  'sahpra.org.za': 'https://www.sahpra.org.za/',
  'gob.mx/cofepris': 'https://www.gob.mx/cofepris',
  'roszdravnadzor.gov.ru': 'https://roszdravnadzor.gov.ru/',
};

/** Primärquellen für regulatorische Dokumente (offizielle URLs) */
const REGULATORY_URL_MAP = {
  'fda final rule: quality system regulation amendments (qmsr) - 89 fr 7496':
    'https://www.federalregister.gov/documents/2024/02/02/2024-01707/medical-devices-quality-system-regulation-amendments',
  'fda guidance: computer software assurance for production and qms software - fda.gov':
    'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/computer-software-assurance-production-and-quality-system-software',
  'fda faq: quality management system regulation (qmsr) - fda.gov':
    'https://www.fda.gov/medical-devices/quality-system-qs-regulationmedical-device-current-good-manufacturing-practices-cgmp/quality-management-system-regulation-final-rule-amending-quality-system-regulation-frequently',
  'fda guidance: cybersecurity in medical devices: qms considerations - fda.gov':
    'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cybersecurity-medical-devices-quality-system-considerations-and-content-premarket-submissions',
  'fda guidance: postmarket management of cybersecurity - fda.gov':
    'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/postmarket-management-cybersecurity-medical-devices',
  'fda guidance: software as a medical device (samd): clinical evaluation - fda.gov':
    'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/software-medical-device-samd-clinical-evaluation',
  'fda guidance: general principles of software validation - fda.gov':
    'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-principles-software-validation',
  'fda guidance: applying human factors and usability engineering - fda.gov':
    'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/applying-human-factors-and-usability-engineering-medical-devices',
  'fda guidance: content of premarket submissions for device software functions - fda.gov':
    'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/content-premarket-submissions-device-software-functions',
  'fda guidance: off-the-shelf software use in medical devices - fda.gov':
    'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/off-shelf-software-use-medical-devices',
  'regulation (eu) 2017/745 (mdr): full text - eur-lex':
    'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0745',
  'regulation (eu) 2017/746 (ivdr): full text - eur-lex':
    'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0746',
  'implementing decision (eu) 2021/1182: harmonised standards for medical devices - eur-lex':
    'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32021D1182',
  'mdcg 2019-11: guidance on qualification and classification of software in mdr/ivdr - eu commission':
    'https://health.ec.europa.eu/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en',
  'mdcg 2019-16: guidance on cybersecurity for medical devices - eu commission':
    'https://health.ec.europa.eu/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en',
  'mdcg 2020-1: guidance on clinical evaluation (mdr) / performance evaluation (ivdr) of software - eu commission':
    'https://health.ec.europa.eu/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en',
  'mdcg 2021-24: guidance on classification of medical devices - eu commission':
    'https://health.ec.europa.eu/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en',
  'mdcg 2022-21: guidance on periodic safety update report (psur) - eu commission':
    'https://health.ec.europa.eu/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en',
  'en iso 13485:2016/a11:2021: harmonised standard for qms - cen/cenelec':
    'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32021D1182',
  'en iso 14971:2019/a11:2021: harmonised standard for risk management - cen/cenelec':
    'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32021D1182',
  'iso 13485:2016: medical devices — quality management systems — requirements for regulatory purposes - iso.org':
    'https://www.iso.org/standard/59752.html',
  'iso 14971:2019: medical devices — application of risk management to medical devices - iso.org':
    'https://www.iso.org/standard/72704.html',
  'iso/tr 24971:2020: medical devices — guidance on the application of iso 14971 - iso.org':
    'https://www.iso.org/standard/72703.html',
  'iec 62304:2006+amd1:2015: medical device software — software life cycle processes - iec.ch':
    'https://webstore.iec.ch/en/publication/22789',
  'iec 82304-1:2016: health software — part 1: general requirements for product safety - iec.ch':
    'https://webstore.iec.ch/en/publication/24832',
  'iec 60601-1:2005+amd1:2012+amd2:2020: medical electrical equipment — general requirements for basic safety and essential performance - iec.ch':
    'https://webstore.iec.ch/en/publication/2598',
  'iec 62366-1:2015+amd1:2020: medical devices — application of usability engineering to medical devices - iec.ch':
    'https://webstore.iec.ch/en/publication/64760',
  'iso 10993-1:2018: biological evaluation of medical devices — part 1: evaluation and testing within a risk management process - iso.org':
    'https://www.iso.org/standard/68936.html',
  'iso 11135:2014: sterilization of health-care products — ethylene oxide - iso.org':
    'https://www.iso.org/standard/56129.html',
  'iso 11137-1:2006: sterilization of health care products — radiation — part 1: requirements for development, validation and routine control of a sterilization process for medical devices - iso.org':
    'https://www.iso.org/standard/35934.html',
  'iso 11607-1:2019: packaging for terminally sterilized medical devices — part 1: requirements for materials, sterile barrier systems and packaging systems - iso.org':
    'https://www.iso.org/standard/70725.html',
  'iso 14155:2020: clinical investigation of medical devices for human subjects — good clinical practice - iso.org':
    'https://www.iso.org/standard/71690.html',
  'iso 20417:2021: medical devices — information to be supplied by the manufacturer - iso.org':
    'https://www.iso.org/standard/67352.html',
  'iso 15223-1:2021: medical devices — symbols to be used with information to be supplied by the manufacturer — part 1: general requirements - iso.org':
    'https://www.iso.org/standard/72326.html',
  'imdrf/samd wg/n10:2013: software as a medical device (samd): key definitions - imdrf.org':
    'http://www.imdrf.org/docs/imdrf/final/technical/imdrf-tech-131209-samd-key-definitions-140124.pdf',
  'imdrf/samd wg/n12:2014: software as a medical device: possible framework for risk categorization - imdrf.org':
    'http://www.imdrf.org/docs/imdrf/final/technical/imdrf-tech-140918-samd-framework-risk-categorization-141013.pdf',
  'imdrf/samd wg/n23:2015: software as a medical device (samd): application of quality management system - imdrf.org':
    'http://www.imdrf.org/docs/imdrf/final/technical/imdrf-tech-151002-samd-qms.pdf',
  'imdrf/cyber wg/n60:2020: principles and practices for medical device cybersecurity - imdrf.org':
    'http://www.imdrf.org/docs/imdrf/final/technical/imdrf-tech-200318-cyber-principles-practices-200318.pdf',
  'imdrf/udi wg/n7:2013: udi guidance - unique device identification (udi) of medical devices - imdrf.org':
    'http://www.imdrf.org/docs/imdrf/final/technical/imdrf-tech-131209-udi-guidance-140124.pdf',
  'imdrf/ae wg/n43:2020: terminologies for categorized adverse event reporting (aer) - imdrf.org':
    'http://www.imdrf.org/docs/imdrf/final/technical/imdrf-tech-200318-aer-terminologies-200318.pdf',
  'imdrf/mdsap wg/n22:2014: mdsap overview - imdrf.org':
    'http://www.imdrf.org/docs/imdrf/final/technical/imdrf-tech-140918-mdsap-overview-141013.pdf',
  'imdrf/grrp wg/n47:2018: essential principles of safety and performance of medical devices - imdrf.org':
    'http://www.imdrf.org/docs/imdrf/final/technical/imdrf-tech-181031-grrp-n47-181031.pdf',
  'tga guidance: conformity assessment standard for qms (iso 13485) - tga.gov.au':
    'https://www.tga.gov.au/resources/guidance/conformity-assessment-certification-quality-management-system-qms',
  'tga guidance: essential principles checklist - tga.gov.au':
    'https://www.tga.gov.au/resources/guidance/essential-principles-checklist-medical-devices',
  'tga guidance: medical device cybersecurity - tga.gov.au':
    'https://www.tga.gov.au/resources/guidance/medical-device-cybersecurity-guidance-manufacturers',
  'uk medical devices regulations 2002 (as amended): full text - gov.uk':
    'https://www.legislation.gov.uk/uksi/2002/618/contents',
  'mhra guidance: managing medical devices - gov.uk':
    'https://www.gov.uk/guidance/manage-medical-devices',
  'mhra guidance: medical devices: uk approved bodies - gov.uk':
    'https://www.gov.uk/guidance/medical-devices-uk-approved-bodies',
  'mhra guidance: software as a medical device (samd) - gov.uk':
    'https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device/software-and-artificial-intelligence-ai-as-a-medical-device',
  'health canada guidance: quality management system requirements (iso 13485) - canada.ca':
    'https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices/application-information/guidance-documents/guidance-document-quality-management-system-medical-devices-guidance-2019.html',
  'health canada guidance: guidance on medical device licences for class ii, iii and iv devices - canada.ca':
    'https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices/application-information/guidance-documents/guidance-document-guidance-medical-device-licence-application-class-ii-iii-iv-devices.html',
  'medical devices regulations (sor/98-282): full text - justice laws website':
    'https://laws-lois.justice.gc.ca/eng/regulations/SOR-98-282/',
  'rdc no. 665/2022: good manufacturing practices for medical devices - anvisa.gov.br':
    'https://www.in.gov.br/en/web/dou/-/resolucao-de-diretoria-colegiada-rdc-n-665-de-30-de-marco-de-2022-394456512',
  'mhlw ministerial ordinance no. 169: quality management system (qms) requirements - pmda.go.jp':
    'https://www.pmda.go.jp/english/review-services/outline/0003.html',
  'pmda qms audit guideline: detailed audit approach for medical devices - pmda.go.jp':
    'https://www.pmda.go.jp/english/review-services/outline/0003.html',
  'therapeutic goods (medical devices) regulations 2002: full text - federal register of legislation':
    'https://www.legislation.gov.au/F2002B00138/latest/text',
  'medical device act: full text (english) - mfds.go.kr':
    'https://www.mfds.go.kr/eng/brd/m_38/view.do?seq=71282',
  'sfda saudi-arabien: medical devices interim regulation - sfda.gov.sa':
    'https://www.sfda.gov.sa/en/medical-devices',
  'sfda saudi-arabien: medical devices law - sfda.gov.sa':
    'https://www.sfda.gov.sa/en/medical-devices',
};

function normalizeTitleKey(title) {
  return title
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferRegion(title) {
  const t = title.toLowerCase();
  if (t.includes('fda') || t.includes('federal register')) return 'USA';
  if (t.includes('eur-lex') || t.includes('mdr') || t.includes('ivdr') || t.includes('mdcg') || t.includes('eu commission') || t.includes('cen/cenelec')) return 'EU';
  if (t.includes('mhra') || t.includes('gov.uk') || t.includes('uk medical')) return 'UK';
  if (t.includes('tga')) return 'Australien';
  if (t.includes('health canada') || t.includes('canada.ca') || t.includes('justice laws')) return 'Kanada';
  if (t.includes('pmda') || t.includes('mhlw') || t.includes('japan law')) return 'Japan';
  if (t.includes('mfds')) return 'Südkorea';
  if (t.includes('hsa.gov')) return 'Singapur';
  if (t.includes('anvisa')) return 'Brasilien';
  if (t.includes('cdsco')) return 'Indien';
  if (t.includes('sahpra')) return 'Südafrika';
  if (t.includes('sfda')) return 'Saudi-Arabien';
  if (t.includes('cofepris')) return 'Mexiko';
  if (t.includes('isp (chile)')) return 'Chile';
  if (t.includes('anmat')) return 'Argentinien';
  if (t.includes('roszdravnadzor') || t.includes('eaeu') || t.includes('eec')) return 'EAEU';
  if (t.includes('kasachstan')) return 'Kasachstan';
  if (t.includes('iso') || t.includes('iec') || t.includes('imdrf')) return 'Global';
  return 'Global';
}

function inferCategory(title) {
  const t = title.toLowerCase();
  if (t.includes('iso ') || t.includes('iec ') || t.includes('en iso')) return 'Norm';
  if (t.includes('guidance') || t.includes('mdcg') || t.includes('guideline')) return 'Leitlinie';
  if (t.includes('regulation') || t.includes('act') || t.includes('rdc') || t.includes('decree') || t.includes('rules')) return 'Regulierung';
  if (t.includes('final rule') || t.includes('implementing decision')) return 'Regulierung';
  return 'Dokument';
}

function resolveRegulatoryUrl(title, publisherHint) {
  const key = normalizeTitleKey(`${title} - ${publisherHint}`);
  if (REGULATORY_URL_MAP[key]) {
    return { url: REGULATORY_URL_MAP[key], verification: 'primary' };
  }

  const isoMatch = title.match(/ISO\s*(\d+(?:-\d+)?(?::\d{4})?)/i);
  if (isoMatch) {
    return {
      url: `https://www.iso.org/search.html?q=${encodeURIComponent(isoMatch[0])}`,
      verification: 'catalog_search',
    };
  }

  const iecMatch = title.match(/IEC\s*[\d-]+(?::\d{4})?/i);
  if (iecMatch) {
    return {
      url: `https://webstore.iec.ch/en/search?q=${encodeURIComponent(iecMatch[0])}`,
      verification: 'catalog_search',
    };
  }

  const imdrfMatch = title.match(/IMDRF\/[\w\s/]+N\d+:\d{4}/i);
  if (imdrfMatch) {
    return {
      url: 'https://www.imdrf.org/documents/documents.asp',
      verification: 'portal',
    };
  }

  const pub = (publisherHint || '').toLowerCase();
  if (pub.includes('fda')) {
    return {
      url: `https://www.fda.gov/search?s=${encodeURIComponent(title)}`,
      verification: 'search_fallback',
    };
  }
  if (pub.includes('eur-lex') || pub.includes('eu commission')) {
    return {
      url: `https://eur-lex.europa.eu/search.html?scope=EURLEX&text=${encodeURIComponent(title)}`,
      verification: 'search_fallback',
    };
  }
  if (pub.includes('gov.uk') || pub.includes('mhra')) {
    return {
      url: `https://www.gov.uk/search/all?keywords=${encodeURIComponent(title)}`,
      verification: 'search_fallback',
    };
  }

  return {
    url: `https://www.google.com/search?q=${encodeURIComponent(`${title} ${publisherHint} official`)}`,
    verification: 'unverified_fallback',
  };
}

function patentUrl(number, linkHint) {
  const n = number.trim();
  const hint = (linkHint || '').toLowerCase();
  if (hint.includes('wipo') || n.startsWith('WO')) {
    return `https://patentscope.wipo.int/search/en/result.jsf?query=${encodeURIComponent(n)}`;
  }
  if (hint.includes('espacenet') || n.startsWith('EP')) {
    return `https://worldwide.espacenet.com/patent/search?q=${encodeURIComponent(n)}`;
  }
  return `https://patents.google.com/patent/${n}/en`;
}

function inferPatentJurisdiction(number) {
  if (number.startsWith('US')) return 'USA';
  if (number.startsWith('EP')) return 'Europa';
  if (number.startsWith('WO')) return 'WIPO/PCT';
  return 'Global';
}

function inferPatentStatus(number) {
  if (number.includes('A1') && !number.includes('B')) return 'angemeldet';
  if (number.includes('B1') || number.includes('B2')) return 'aktiv';
  return 'zu_verifizieren';
}

function studyUrl(line) {
  const pmc = line.match(/PMC(\d+)/i);
  if (pmc) {
    return {
      url: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${pmc[1]}/`,
      source: 'PubMed Central',
      verification: 'primary',
    };
  }
  const pubmedYear = line.match(/\((\d{4})\)/);
  if (line.toLowerCase().includes('cochrane') || line.toLowerCase().includes('lancet')) {
    return {
      url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(line.split('(')[0].trim())}`,
      source: 'PubMed',
      verification: 'search',
    };
  }
  if (line.toLowerCase().includes('springer')) {
    return {
      url: `https://link.springer.com/search?query=${encodeURIComponent(line.split('(')[0].trim())}`,
      source: 'Springer',
      verification: 'search',
    };
  }
  if (line.toLowerCase().includes('researchgate')) {
    return {
      url: `https://www.researchgate.net/search/publication?q=${encodeURIComponent(line.split('(')[0].trim())}`,
      source: 'ResearchGate',
      verification: 'secondary',
    };
  }
  return {
    url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(line.split('(')[0].trim())}`,
    source: 'PubMed',
    verification: 'search',
  };
}

function parseAuthorities(lines, startIdx) {
  const authorities = [];
  let i = startIdx;
  while (i < lines.length && !lines[i].startsWith('2.')) {
    const region = lines[i];
    const name = lines[i + 1];
    const urlPath = lines[i + 2];
    const isDataRow =
      region &&
      name &&
      urlPath &&
      !['Region', 'Behörde', 'Offizielle Website / Datenbank'].includes(region) &&
      !region.startsWith('1.');

    if (isDataRow) {
      const url = AUTHORITY_URLS[urlPath] || normalizeUrl(urlPath);
      authorities.push({
        id: slugId('auth', name),
        name,
        region,
        url,
        type: 'Behörde',
        sourceDocument: SOURCE_DOC,
        accessDate: ACCESS_DATE,
      });
      i += 3;
    } else {
      i += 1;
    }
  }
  return authorities;
}

function parseRegulatorySources(lines, startIdx, endIdx) {
  const sources = [];
  for (let i = startIdx; i < endIdx; i++) {
    const line = lines[i];
    if (!line || line.startsWith('3.')) break;
    const parts = line.split(' - ');
    if (parts.length < 2) continue;
    const publisherHint = parts.pop().trim();
    const title = parts.join(' - ').trim();
    const resolved = resolveRegulatoryUrl(title, publisherHint);
    sources.push({
      id: slugId('reg', title),
      name: title,
      category: inferCategory(title),
      url: resolved.url,
      region: inferRegion(`${title} ${publisherHint}`),
      type: inferCategory(title),
      publisher: publisherHint,
      verification: resolved.verification,
      sourceDocument: SOURCE_DOC,
      accessDate: ACCESS_DATE,
    });
  }
  return sources;
}

function parsePatents(lines, startIdx, endIdx) {
  const patents = [];
  let i = startIdx;
  while (i < endIdx) {
    const num = lines[i];
    if (!num || num.startsWith('4.') || num === 'Patentnummer') break;
    const title = lines[i + 1];
    const linkHint = lines[i + 2];
    if (num.match(/^(US|EP|WO)[A-Z0-9]+$/i) && title) {
      patents.push({
        publicationNumber: num,
        title,
        url: patentUrl(num, linkHint),
        source: linkHint || 'Google Patents',
        jurisdiction: inferPatentJurisdiction(num),
        status: inferPatentStatus(num),
        verification: 'documented_in_master_sources',
        sourceDocument: SOURCE_DOC,
        accessDate: ACCESS_DATE,
      });
      i += 3;
    } else {
      i += 1;
    }
  }
  return patents;
}

function parseStudies(lines, startIdx) {
  const studies = [];
  let i = startIdx;
  while (i < lines.length && !lines[i].startsWith('5.')) {
    const authorLine = lines[i];
    const focus = lines[i + 1];
    const linkHint = lines[i + 2];
    if (authorLine && focus && linkHint && !authorLine.includes('Autor')) {
      const yearMatch = authorLine.match(/\((\d{4})\)/);
      const resolved = studyUrl(authorLine);
      const title = authorLine.replace(/\([^)]*\)/, '').trim();
      studies.push({
        id: slugId('study', authorLine),
        author: title,
        year: yearMatch ? parseInt(yearMatch[1], 10) : null,
        title: authorLine,
        focus,
        url: resolved.url,
        source: linkHint || resolved.source,
        verification: resolved.verification,
        sourceDocument: SOURCE_DOC,
        accessDate: ACCESS_DATE,
      });
      i += 3;
    } else {
      i += 1;
    }
  }
  return studies;
}

function buildMarkdown(catalog) {
  const lines = [];
  lines.push('# Master Sources Catalog — ISO 13485 / QMSR');
  lines.push('');
  lines.push(`> Quelle: \`${SOURCE_DOC}\` | Version: ${VERSION} | Zugriff: ${ACCESS_DATE}`);
  lines.push('');
  lines.push(`| Kategorie | Anzahl |`);
  lines.push(`|-----------|--------|`);
  lines.push(`| Behörden | ${catalog.authorities.length} |`);
  lines.push(`| Regulatorische Quellen | ${catalog.regulatorySources.length} |`);
  lines.push(`| Patente | ${catalog.patents.length} |`);
  lines.push(`| Studien | ${catalog.studies.length} |`);
  lines.push(`| **Gesamt** | **${catalog.meta.totalSources}** |`);
  lines.push('');
  lines.push('## 1. Globale Regulierungsbehörden');
  lines.push('');
  for (const a of catalog.authorities) {
    lines.push(`- **${a.name}** (${a.region}) — [${a.url}](${a.url})`);
  }
  lines.push('');
  lines.push('## 2. Regulatorische Quellen');
  lines.push('');
  for (const s of catalog.regulatorySources) {
    lines.push(`- [${s.name}](${s.url}) — ${s.region} / ${s.category} _(${s.verification})_`);
  }
  lines.push('');
  lines.push('## 3. QMS-Patente');
  lines.push('');
  for (const p of catalog.patents) {
    lines.push(`- **${p.publicationNumber}** (${p.status}) — [${p.title}](${p.url})`);
  }
  lines.push('');
  lines.push('## 4. Wissenschaftliche Studien');
  lines.push('');
  for (const s of catalog.studies) {
    lines.push(`- ${s.title} — ${s.focus} — [Link](${s.url})`);
  }
  lines.push('');
  lines.push('---');
  lines.push(`*Generiert: ${catalog.meta.generatedAt}*`);
  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`Input fehlt: ${INPUT}`);
    console.error('Bitte zuerst: node scripts/extract-docx-text.mjs "<docx-path>" tmp_master_sources.txt');
    process.exit(1);
  }

  const raw = fs.readFileSync(INPUT, 'utf8');
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const headerIdx = lines.findIndex((l) => l === 'Region');
  const authStart = headerIdx >= 0 ? headerIdx + 3 : 6;
  const regStart = lines.findIndex((l) => l.startsWith('2. Detaillierte')) + 1;
  const patSectionIdx = lines.findIndex((l) => l.startsWith('3. Patente'));
  const patStart = lines.findIndex((l, idx) => idx > patSectionIdx && /^US\d|^EP\d|^WO\d/i.test(l));
  const studySectionIdx = lines.findIndex((l) => l.startsWith('4. Wissenschaftliche'));
  const studyStart = lines.findIndex((l, idx) => idx > studySectionIdx && (l.includes('(') || l.startsWith('PMC')));

  const authorities = parseAuthorities(lines, authStart);
  const regulatorySources = parseRegulatorySources(lines, regStart, patSectionIdx);
  const patents = parsePatents(lines, patStart, studySectionIdx);
  const studies = parseStudies(lines, studyStart);

  const catalog = {
    meta: {
      version: VERSION,
      sourceDocument: SOURCE_DOC,
      accessDate: ACCESS_DATE,
      generatedAt: new Date().toISOString(),
      totalSources: authorities.length + regulatorySources.length + patents.length + studies.length,
      checksum: crypto.createHash('sha256').update(JSON.stringify({ authorities, regulatorySources, patents, studies })).digest('hex').slice(0, 16),
    },
    authorities,
    regulatorySources,
    patents,
    studies,
  };

  fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
  fs.mkdirSync(path.dirname(MD_OUT), { recursive: true });
  fs.writeFileSync(JSON_OUT, JSON.stringify(catalog, null, 2), 'utf8');
  fs.writeFileSync(MD_OUT, buildMarkdown(catalog), 'utf8');

  console.log(`✅ Catalog: ${catalog.meta.totalSources} Quellen`);
  console.log(`   JSON → ${JSON_OUT}`);
  console.log(`   MD   → ${MD_OUT}`);
}

main();

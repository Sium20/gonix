// Comprehensive list of Bangladeshi universities.
// Source: University Grants Commission (UGC) of Bangladesh + cross-referenced with Wikipedia & uniRank (2026).
// Includes 59 public universities, 110+ UGC-approved private universities, and 3 international universities.

export type UniversityType = "public" | "private" | "international";

export type UniversitySeed = {
  name: string;        // short name (colloquial)
  fullName: string;    // full official name
  type: UniversityType;
  division: string;    // Bangladesh administrative division
  city: string;        // primary city
  website: string;     // official website (https form)
  domain: string;      // primary email domain (no @)
  slug: string;        // URL slug
};

function website(domain: string) {
  return `https://${domain}`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

type Raw = Omit<UniversitySeed, "slug" | "website"> & { website?: string };

function make(raw: Raw): UniversitySeed {
  const websiteUrl = raw.website || website(raw.domain);
  return { ...raw, website: websiteUrl, slug: slugify(raw.name) };
}

// ──────────────────────────────────────────────────────────────────────────
//  PUBLIC UNIVERSITIES (59)
// ──────────────────────────────────────────────────────────────────────────
const PUBLIC: UniversitySeed[] = [
  make({ name: "DU", fullName: "University of Dhaka", type: "public", division: "Dhaka", city: "Dhaka", domain: "du.ac.bd" }),
  make({ name: "RU", fullName: "University of Rajshahi", type: "public", division: "Rajshahi", city: "Rajshahi", domain: "ru.ac.bd" }),
  make({ name: "CU", fullName: "University of Chittagong", type: "public", division: "Chattogram", city: "Chattogram", domain: "cu.ac.bd" }),
  make({ name: "BUET", fullName: "Bangladesh University of Engineering & Technology", type: "public", division: "Dhaka", city: "Dhaka", domain: "buet.ac.bd" }),
  make({ name: "BAU", fullName: "Bangladesh Agricultural University", type: "public", division: "Mymensingh", city: "Mymensingh", domain: "bau.edu.bd" }),
  make({ name: "JU", fullName: "Jahangirnagar University", type: "public", division: "Dhaka", city: "Savar", domain: "juniv.edu" }),
  make({ name: "IU", fullName: "Islamic University, Bangladesh", type: "public", division: "Khulna", city: "Kushtia", domain: "iu.ac.bd" }),
  make({ name: "SUST", fullName: "Shahjalal University of Science & Technology", type: "public", division: "Sylhet", city: "Sylhet", domain: "sust.edu" }),
  make({ name: "KU", fullName: "Khulna University", type: "public", division: "Khulna", city: "Khulna", domain: "ku.ac.bd" }),
  make({ name: "NU", fullName: "National University", type: "public", division: "Dhaka", city: "Gazipur", domain: "nu.edu.bd" }),
  make({ name: "BOU", fullName: "Bangladesh Open University", type: "public", division: "Dhaka", city: "Gazipur", domain: "bou.ac.bd" }),
  make({ name: "BSMMU", fullName: "Bangabandhu Sheikh Mujib Medical University", type: "public", division: "Dhaka", city: "Dhaka", domain: "bsmmu.ac.bd" }),
  make({ name: "BSMRAU", fullName: "Bangabandhu Sheikh Mujibur Rahman Agricultural University", type: "public", division: "Dhaka", city: "Gazipur", domain: "bsmrau.edu.bd" }),
  make({ name: "HSTU", fullName: "Hajee Mohammad Danesh Science & Technology University", type: "public", division: "Rangpur", city: "Dinajpur", domain: "hstu.ac.bd" }),
  make({ name: "MBSTU", fullName: "Mawlana Bhashani Science and Technology University", type: "public", division: "Dhaka", city: "Tangail", domain: "mbstu.ac.bd" }),
  make({ name: "PSTU", fullName: "Patuakhali Science and Technology University", type: "public", division: "Barishal", city: "Patuakhali", domain: "pstu.ac.bd" }),
  make({ name: "SAU", fullName: "Sher-e-Bangla Agricultural University", type: "public", division: "Dhaka", city: "Dhaka", domain: "sau.edu.bd" }),
  make({ name: "CUET", fullName: "Chittagong University of Engineering & Technology", type: "public", division: "Chattogram", city: "Chattogram", domain: "cuet.ac.bd" }),
  make({ name: "RUET", fullName: "Rajshahi University of Engineering & Technology", type: "public", division: "Rajshahi", city: "Rajshahi", domain: "ruet.ac.bd" }),
  make({ name: "KUET", fullName: "Khulna University of Engineering & Technology", type: "public", division: "Khulna", city: "Khulna", domain: "kuet.ac.bd" }),
  make({ name: "DUET", fullName: "Dhaka University of Engineering & Technology", type: "public", division: "Dhaka", city: "Gazipur", domain: "duet.ac.bd" }),
  make({ name: "NSTU", fullName: "Noakhali Science and Technology University", type: "public", division: "Chattogram", city: "Noakhali", domain: "nstu.edu.bd" }),
  make({ name: "JnU", fullName: "Jagannath University", type: "public", division: "Dhaka", city: "Dhaka", domain: "jnu.ac.bd" }),
  make({ name: "CoU", fullName: "Comilla University", type: "public", division: "Chattogram", city: "Comilla", domain: "cou.ac.bd" }),
  make({ name: "JKKNIU", fullName: "Jatiya Kabi Kazi Nazrul Islam University", type: "public", division: "Mymensingh", city: "Mymensingh", domain: "jkkniu.edu.bd" }),
  make({ name: "CVASU", fullName: "Chittagong Veterinary and Animal Sciences University", type: "public", division: "Chattogram", city: "Chattogram", domain: "cvasu.ac.bd" }),
  make({ name: "SAU-Sylhet", fullName: "Sylhet Agricultural University", type: "public", division: "Sylhet", city: "Sylhet", domain: "sau.ac.bd" }),
  make({ name: "JUST", fullName: "Jashore University of Science and Technology", type: "public", division: "Khulna", city: "Jashore", domain: "just.edu.bd" }),
  make({ name: "PUST", fullName: "Pabna University of Science and Technology", type: "public", division: "Rajshahi", city: "Pabna", domain: "pust.ac.bd" }),
  make({ name: "BUP", fullName: "Bangladesh University of Professionals", type: "public", division: "Dhaka", city: "Mirpur", domain: "bup.edu.bd" }),
  make({ name: "BUTEX", fullName: "Bangladesh University of Textiles", type: "public", division: "Dhaka", city: "Dhaka", domain: "butex.edu.bd" }),
  make({ name: "BRUR", fullName: "Begum Rokeya University, Rangpur", type: "public", division: "Rangpur", city: "Rangpur", domain: "brur.ac.bd" }),
  make({ name: "BSMRSTU", fullName: "Bangabandhu Sheikh Mujibur Rahman Science & Technology University", type: "public", division: "Dhaka", city: "Gopalganj", domain: "bsmrstu.edu.bd" }),
  make({ name: "BarisalU", fullName: "University of Barisal", type: "public", division: "Barishal", city: "Barishal", domain: "bu.ac.bd" }),
  make({ name: "BMU", fullName: "Bangabandhu Sheikh Mujibur Rahman Maritime University", type: "public", division: "Dhaka", city: "Dhaka", domain: "bmmu.gov.bd" }),
  make({ name: "IAU", fullName: "Islamic Arabic University", type: "public", division: "Dhaka", city: "Dhaka", domain: "iau.edu.bd" }),
  make({ name: "RmSTU", fullName: "Rangamati Science and Technology University", type: "public", division: "Chattogram", city: "Rangamati", domain: "rmstu.edu.bd" }),
  make({ name: "CMU", fullName: "Chittagong Medical University", type: "public", division: "Chattogram", city: "Chattogram", domain: "cmu.edu.bd" }),
  make({ name: "RMU", fullName: "Rajshahi Medical University", type: "public", division: "Rajshahi", city: "Rajshahi", domain: "rmu.edu.bd" }),
  make({ name: "RUB", fullName: "Rabindra University, Bangladesh", type: "public", division: "Rajshahi", city: "Shahjadpur", domain: "rub.edu.bd" }),
  make({ name: "BSFMSTU", fullName: "Bangamata Sheikh Fojilatunnesa Mujib Science & Technology University", type: "public", division: "Mymensingh", city: "Jamalpur", domain: "bsfmstu.ac.bd" }),
  make({ name: "SMU", fullName: "Sylhet Medical University", type: "public", division: "Sylhet", city: "Sylhet", domain: "smu.edu.bd" }),
  make({ name: "BDU", fullName: "Bangabandhu Sheikh Mujibur Rahman Digital University, Bangladesh", type: "public", division: "Dhaka", city: "Kaliakoir", domain: "bdu.ac.bd" }),
  make({ name: "SHU-Netrokona", fullName: "Sheikh Hasina University", type: "public", division: "Mymensingh", city: "Netrokona", domain: "shu.edu.bd" }),
  make({ name: "KAU", fullName: "Khulna Agricultural University", type: "public", division: "Khulna", city: "Khulna", domain: "kau.edu.bd" }),
  make({ name: "SHMU", fullName: "Sheikh Hasina Medical University", type: "public", division: "Khulna", city: "Khulna", domain: "shmu.ac.bd" }),
  make({ name: "BSMAAU", fullName: "Bangabandhu Sheikh Mujibur Rahman Aviation and Aerospace University", type: "public", division: "Dhaka", city: "Dhaka", domain: "bsmaau.ac.bd" }),
  make({ name: "CSTU", fullName: "Chandpur Science and Technology University", type: "public", division: "Chattogram", city: "Chandpur", domain: "cstu.ac.bd" }),
  make({ name: "SSTU", fullName: "Sunamganj Science and Technology University", type: "public", division: "Sylhet", city: "Sunamganj", domain: "sstu.ac.bd" }),
  make({ name: "HAU", fullName: "Habiganj Agricultural University", type: "public", division: "Sylhet", city: "Habiganj", domain: "hau.ac.bd" }),
  make({ name: "KAgU", fullName: "Kurigram Agricultural University", type: "public", division: "Rangpur", city: "Kurigram", domain: "kaguj.edu.bd" }),
  make({ name: "TU-Thakurgaon", fullName: "Thakurgaon University", type: "public", division: "Rangpur", city: "Thakurgaon", domain: "thakurgaonuniversity.edu.bd" }),
  make({ name: "MU-Meherpur", fullName: "Mujibnagar University, Meherpur", type: "public", division: "Khulna", city: "Meherpur", domain: "mujibnagaruniv.edu.bd" }),
  make({ name: "BSMRU-Kishoreganj", fullName: "Bangabandhu Sheikh Mujibur Rahman University, Kishoreganj", type: "public", division: "Dhaka", city: "Kishoreganj", domain: "bsmru.edu.bd" }),
  make({ name: "NkU", fullName: "Netrokona University", type: "public", division: "Mymensingh", city: "Netrokona", domain: "nku.edu.bd" }),
  make({ name: "KgU", fullName: "Kishoreganj University", type: "public", division: "Dhaka", city: "Kishoreganj", domain: "kgu.edu.bd" }),
  make({ name: "JSTU", fullName: "Jamalpur Science and Technology University", type: "public", division: "Mymensingh", city: "Jamalpur", domain: "jstu.edu.bd" }),
  make({ name: "BSMRAU-Naogaon", fullName: "Bangabandhu Sheikh Mujibur Rahman University, Naogaon", type: "public", division: "Rajshahi", city: "Naogaon", domain: "bsmrun.edu.bd" }),
  make({ name: "PSTU-Pirojpur", fullName: "Pirojpur Science and Technology University", type: "public", division: "Barishal", city: "Pirojpur", domain: "pstup.ac.bd" }),
];

// ──────────────────────────────────────────────────────────────────────────
//  PRIVATE UNIVERSITIES (UGC-approved, 110+)
// ──────────────────────────────────────────────────────────────────────────
const PRIVATE: UniversitySeed[] = [
  make({ name: "NSU", fullName: "North South University", type: "private", division: "Dhaka", city: "Dhaka", domain: "northsouth.edu" }),
  make({ name: "USTC", fullName: "University of Science & Technology Chittagong", type: "private", division: "Chattogram", city: "Chattogram", domain: "ustc.edu.bd" }),
  make({ name: "IUB", fullName: "Independent University, Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "iub.edu.bd" }),
  make({ name: "CWU", fullName: "Central Women's University", type: "private", division: "Dhaka", city: "Dhaka", domain: "cwu.edu.bd" }),
  make({ name: "IUBAT", fullName: "International University of Business Agriculture & Technology", type: "private", division: "Dhaka", city: "Dhaka", domain: "iubat.edu" }),
  make({ name: "IIUC", fullName: "International Islamic University Chittagong", type: "private", division: "Chattogram", city: "Chattogram", domain: "iiuc.ac.bd" }),
  make({ name: "AUST", fullName: "Ahsanullah University of Science and Technology", type: "private", division: "Dhaka", city: "Dhaka", domain: "aust.edu" }),
  make({ name: "AIUB", fullName: "American International University-Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "aiub.edu" }),
  make({ name: "EWU", fullName: "East West University", type: "private", division: "Dhaka", city: "Dhaka", domain: "ewubd.edu" }),
  make({ name: "UAP", fullName: "University of Asia Pacific", type: "private", division: "Dhaka", city: "Dhaka", domain: "uap-bd.edu" }),
  make({ name: "GB", fullName: "Gono Bishwabidyalay", type: "private", division: "Dhaka", city: "Savar", domain: "gonouniversity.edu.bd" }),
  make({ name: "PUB", fullName: "The People's University of Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "pub.ac.bd" }),
  make({ name: "AUB", fullName: "Asian University of Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "aub.edu.bd" }),
  make({ name: "DIU", fullName: "Dhaka International University", type: "private", division: "Dhaka", city: "Dhaka", domain: "diu.ac.bd" }),
  make({ name: "MIU", fullName: "Manarat International University", type: "private", division: "Dhaka", city: "Dhaka", domain: "manarat.ac.bd" }),
  make({ name: "BRACU", fullName: "BRAC University", type: "private", division: "Dhaka", city: "Dhaka", domain: "bracu.ac.bd" }),
  make({ name: "BU", fullName: "Bangladesh University", type: "private", division: "Dhaka", city: "Dhaka", domain: "bu.edu.bd" }),
  make({ name: "LU", fullName: "Leading University", type: "private", division: "Sylhet", city: "Sylhet", domain: "lus.ac.bd" }),
  make({ name: "BGCTUB", fullName: "BGC Trust University Bangladesh", type: "private", division: "Chattogram", city: "Chattogram", domain: "bgctub.ac.bd" }),
  make({ name: "SIU", fullName: "Sylhet International University", type: "private", division: "Sylhet", city: "Sylhet", domain: "siu.edu.bd" }),
  make({ name: "UODA", fullName: "University of Development Alternative", type: "private", division: "Dhaka", city: "Dhaka", domain: "uoda.edu.bd" }),
  make({ name: "PU-Chittagong", fullName: "Premier University, Chittagong", type: "private", division: "Chattogram", city: "Chattogram", domain: "puc.ac.bd" }),
  make({ name: "SEU", fullName: "Southeast University", type: "private", division: "Dhaka", city: "Dhaka", domain: "seu.edu.bd" }),
  make({ name: "DIU-Daffodil", fullName: "Daffodil International University", type: "private", division: "Dhaka", city: "Dhaka", domain: "daffodilvarsity.edu.bd" }),
  make({ name: "SUB-Stamford", fullName: "Stamford University Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "stamforduniversity.edu.bd" }),
  make({ name: "SUB", fullName: "State University of Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "sub.ac.bd" }),
  make({ name: "CUB", fullName: "City University", type: "private", division: "Dhaka", city: "Dhaka", domain: "cityuniversity.edu.bd" }),
  make({ name: "PrimeUni", fullName: "Prime University", type: "private", division: "Dhaka", city: "Dhaka", domain: "primeuniversity.edu.bd" }),
  make({ name: "NUB", fullName: "Northern University Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "nub.ac.bd" }),
  make({ name: "SUB-Southern", fullName: "Southern University Bangladesh", type: "private", division: "Chattogram", city: "Chattogram", domain: "southern.edu.bd" }),
  make({ name: "GUB", fullName: "Green University of Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "green.edu.bd" }),
  make({ name: "PUST-Pundra", fullName: "Pundra University of Science & Technology", type: "private", division: "Rajshahi", city: "Bogura", domain: "pundrauniversity.edu.bd" }),
  make({ name: "WUB", fullName: "World University of Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "wub.edu.bd" }),
  make({ name: "SMUCT", fullName: "Shanto-Mariam University of Creative Technology", type: "private", division: "Dhaka", city: "Dhaka", domain: "smuct.ac.bd" }),
  make({ name: "TMU", fullName: "The Millennium University", type: "private", division: "Dhaka", city: "Dhaka", domain: "themillenniumuniversity.edu.bd" }),
  make({ name: "EU-Bangladesh", fullName: "Eastern University", type: "private", division: "Dhaka", city: "Dhaka", domain: "easternuni.edu.bd" }),
  make({ name: "MU-Sylhet", fullName: "Metropolitan University", type: "private", division: "Sylhet", city: "Sylhet", domain: "metrouni.edu.bd" }),
  make({ name: "UU", fullName: "Uttara University", type: "private", division: "Dhaka", city: "Uttara", domain: "uttarauniversity.edu.bd" }),
  make({ name: "UIU", fullName: "United International University", type: "private", division: "Dhaka", city: "Dhaka", domain: "uiu.ac.bd" }),
  make({ name: "USAB", fullName: "University of South Asia", type: "private", division: "Dhaka", city: "Dhaka", domain: "southasiauni.ac.bd" }),
  make({ name: "VUB", fullName: "Victoria University of Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "vub.edu.bd" }),
  make({ name: "BUBT", fullName: "Bangladesh University of Business & Technology", type: "private", division: "Dhaka", city: "Dhaka", domain: "bubt.edu.bd" }),
  make({ name: "PresidencyU", fullName: "Presidency University", type: "private", division: "Dhaka", city: "Dhaka", domain: "presidency.edu.bd" }),
  make({ name: "UITS", fullName: "University of Information Technology & Sciences", type: "private", division: "Dhaka", city: "Dhaka", domain: "uits.edu.bd" }),
  make({ name: "PAU", fullName: "Primeasia University", type: "private", division: "Dhaka", city: "Dhaka", domain: "primeasia.edu.bd" }),
  make({ name: "RUD", fullName: "Royal University of Dhaka", type: "private", division: "Dhaka", city: "Dhaka", domain: "royal.edu.bd" }),
  make({ name: "ULAB", fullName: "University of Liberal Arts Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "ulab.edu.bd" }),
  make({ name: "ADUST", fullName: "Atish Dipankar University of Science & Technology", type: "private", division: "Dhaka", city: "Dhaka", domain: "adust.edu.bd" }),
  make({ name: "BIU", fullName: "Bangladesh Islami University", type: "private", division: "Dhaka", city: "Dhaka", domain: "biu.ac.bd" }),
  make({ name: "ASAUB", fullName: "ASA University Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "asaub.edu.bd" }),
  make({ name: "EDU", fullName: "East Delta University", type: "private", division: "Chattogram", city: "Chattogram", domain: "eastdelta.edu.bd" }),
  make({ name: "EUB", fullName: "European University of Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "eub.edu.bd" }),
  make({ name: "VU", fullName: "Varendra University", type: "private", division: "Rajshahi", city: "Rajshahi", domain: "vu.edu.bd" }),
  make({ name: "HUB", fullName: "Hamdard University Bangladesh", type: "private", division: "Dhaka", city: "Munshiganj", domain: "hamdarduniversity.edu.bd" }),
  make({ name: "BUFT", fullName: "BGMEA University of Fashion & Technology", type: "private", division: "Dhaka", city: "Dhaka", domain: "buft.edu.bd" }),
  make({ name: "NEUB", fullName: "North East University Bangladesh", type: "private", division: "Sylhet", city: "Sylhet", domain: "neub.edu.bd" }),
  make({ name: "FCUB", fullName: "First Capital University of Bangladesh", type: "private", division: "Khulna", city: "Chuadanga", domain: "fcub.edu.bd" }),
  make({ name: "IIUB", fullName: "Ishakha International University, Bangladesh", type: "private", division: "Dhaka", city: "Kishoreganj", domain: "ishakha.edu.bd" }),
  make({ name: "ZHSUST", fullName: "Z.H Sikder University of Science & Technology", type: "private", division: "Dhaka", city: "Bhedorgonj", domain: "zhsust.edu.bd" }),
  make({ name: "EBAUB", fullName: "Exim Bank Agricultural University, Bangladesh", type: "private", division: "Dhaka", city: "Chapainawabganj", domain: "ebaub.edu.bd" }),
  make({ name: "NWU", fullName: "North Western University", type: "private", division: "Khulna", city: "Khulna", domain: "nwu.edu.bd" }),
  make({ name: "KYAU", fullName: "Khwaja Yunus Ali University", type: "private", division: "Rajshahi", city: "Enayetpur", domain: "kyau.edu.bd" }),
  make({ name: "SU-Sonargaon", fullName: "Sonargaon University", type: "private", division: "Dhaka", city: "Dhaka", domain: "su.edu.bd" }),
  make({ name: "FU-Feni", fullName: "Feni University", type: "private", division: "Chattogram", city: "Feni", domain: "feniuniversity.edu.bd" }),
  make({ name: "Britannia", fullName: "Britannia University", type: "private", division: "Chattogram", city: "Comilla", domain: "britannia.edu.bd" }),
  make({ name: "PCIU", fullName: "Port City International University", type: "private", division: "Chattogram", city: "Chattogram", domain: "portcity.edu.bd" }),
  make({ name: "BUHS", fullName: "Bangladesh University of Health Sciences", type: "private", division: "Dhaka", city: "Dhaka", domain: "buhs.ac.bd" }),
  make({ name: "CIU", fullName: "Chittagong Independent University", type: "private", division: "Chattogram", city: "Chattogram", domain: "ciu.edu.bd" }),
  make({ name: "NDUB", fullName: "Notre Dame University Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "ndub.edu.bd" }),
  make({ name: "TUB", fullName: "Times University, Bangladesh", type: "private", division: "Dhaka", city: "Faridpur", domain: "timesuniversitybd.com" }),
  make({ name: "NBIU", fullName: "North Bengal International University", type: "private", division: "Rajshahi", city: "Rajshahi", domain: "nbiu.edu.bd" }),
  make({ name: "FIU", fullName: "Fareast International University", type: "private", division: "Dhaka", city: "Dhaka", domain: "fiu.edu.bd" }),
  make({ name: "RSTU", fullName: "Rajshahi Science & Technology University (RSTU)", type: "private", division: "Rajshahi", city: "Natore", domain: "rstu.edu.bd" }),
  make({ name: "SFMU", fullName: "Sheikh Fazilatunnesa Mujib University", type: "private", division: "Dhaka", city: "Dhaka", domain: "sfmuniversity.org" }),
  make({ name: "CBIU", fullName: "Cox's Bazar International University", type: "private", division: "Chattogram", city: "Cox's Bazar", domain: "cbiu.ac.bd" }),
  make({ name: "RPSU", fullName: "R. P. Shaha University", type: "private", division: "Dhaka", city: "Narayanganj", domain: "rpsu.ac.bd" }),
  make({ name: "GUB-Dhaka", fullName: "German University Bangladesh", type: "private", division: "Dhaka", city: "Gazipur", domain: "gub.edu.bd" }),
  make({ name: "GUBD", fullName: "Global University Bangladesh", type: "private", division: "Barishal", city: "Barishal", domain: "globaluniversity.edu.bd" }),
  make({ name: "CCNU", fullName: "CCN University of Science & Technology", type: "private", division: "Chattogram", city: "Comilla", domain: "ccnust.ac.bd" }),
  make({ name: "BAUST-Saidpur", fullName: "Bangladesh Army University of Science and Technology (BAUST), Saidpur", type: "private", division: "Rangpur", city: "Saidpur", domain: "baust.edu.bd" }),
  make({ name: "BAUET", fullName: "Bangladesh Army University of Engineering and Technology (BAUET), Qadirabad", type: "private", division: "Rajshahi", city: "Natore", domain: "bauet.ac.bd" }),
  make({ name: "BAIUST", fullName: "Bangladesh Army International University of Science & Technology (BAIUST), Comilla", type: "private", division: "Chattogram", city: "Comilla", domain: "baiust.edu.bd" }),
  make({ name: "IUS", fullName: "The International University of Scholars", type: "private", division: "Dhaka", city: "Dhaka", domain: "ius.edu.bd" }),
  make({ name: "CUB-Canada", fullName: "Canadian University of Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "cub.edu.bd" }),
  make({ name: "NPIUB", fullName: "N.P.I University of Bangladesh", type: "private", division: "Dhaka", city: "Manikganj", domain: "npiub.edu.bd" }),
  make({ name: "NUBT", fullName: "Northern University of Business & Technology, Khulna", type: "private", division: "Khulna", city: "Khulna", domain: "nubtkhulna.ac.bd" }),
  make({ name: "RMU-Kushtia", fullName: "Rabindra Maitree University, Kushtia", type: "private", division: "Khulna", city: "Kushtia", domain: "rmku.ac.bd" }),
  make({ name: "UCTC", fullName: "University of Creative Technology, Chittagong", type: "private", division: "Chattogram", city: "Chattogram", domain: "uctc.edu.bd" }),
  make({ name: "CUST", fullName: "Central University of Science and Technology", type: "private", division: "Dhaka", city: "Dhaka", domain: "cust.edu.bd" }),
  make({ name: "TUCA", fullName: "Tagore University of Creative Arts", type: "private", division: "Dhaka", city: "Dhaka", domain: "tuca.edu.bd" }),
  make({ name: "UGV", fullName: "University of Global Village", type: "private", division: "Dhaka", city: "Barishal", domain: "ugv.edu.bd" }),
  make({ name: "RAKM-Shamsuzzoha", fullName: "Rupayan A.K.M Shamsuzzoha University", type: "private", division: "Dhaka", city: "Dhaka", domain: "rakmsu.edu.bd" }),
  make({ name: "AKMU", fullName: "Anwer Khan Modern University", type: "private", division: "Dhaka", city: "Dhaka", domain: "akmu.edu.bd" }),
  make({ name: "ZUMS", fullName: "ZNRF University of Management Sciences", type: "private", division: "Dhaka", city: "Dhaka", domain: "zums.edu.bd" }),
  make({ name: "AMUST", fullName: "Ahsania Mission University of Science and Technology", type: "private", division: "Rajshahi", city: "Rajshahi", domain: "amust.ac.bd" }),
  make({ name: "KKBAU", fullName: "Khulna Khan Bahadur Ahsanullah University", type: "private", division: "Khulna", city: "Khulna", domain: "kkbau.ac.bd" }),
  make({ name: "BdU-Bandarban", fullName: "Bandarban University", type: "private", division: "Chattogram", city: "Bandarban", domain: "bubban.edu.bd" }),
  make({ name: "SMMU", fullName: "Shah Makhdum Management University, Rajshahi", type: "private", division: "Rajshahi", city: "Rajshahi", domain: "smmu.edu.bd" }),
  make({ name: "TrustU", fullName: "Trust University, Barishal", type: "private", division: "Barishal", city: "Barishal", domain: "trustuniversity.edu.bd" }),
  make({ name: "ISU", fullName: "International Standard University", type: "private", division: "Dhaka", city: "Dhaka", domain: "isu.ac.bd" }),
  make({ name: "UoB", fullName: "University of Brahmanbaria", type: "private", division: "Chattogram", city: "Brahmanbaria", domain: "uob.edu.bd" }),
  make({ name: "USET", fullName: "University of Skill Enrichment and Technology", type: "private", division: "Dhaka", city: "Narayanganj", domain: "uset.edu.bd" }),
  make({ name: "MUST-Microland", fullName: "Microland University of Science and Technology", type: "private", division: "Dhaka", city: "Dhaka", domain: "must.edu.bd" }),
  make({ name: "RTM-AKTU", fullName: "R.T.M Al-Kabir Technical University", type: "private", division: "Sylhet", city: "Sylhet", domain: "rtm-aktu.edu.bd" }),
  make({ name: "MUST-Momtaz", fullName: "Dr. Momtaz Begum University of Science and Technology", type: "private", division: "Dhaka", city: "Kishoreganj", domain: "must.ac.bd" }),
  make({ name: "CBUFT", fullName: "Chattogram BGMEA University of Fashion and Technology", type: "private", division: "Chattogram", city: "Chattogram", domain: "cbuft.edu.bd" }),
  make({ name: "BAUST-Khulna", fullName: "Bangladesh Army University of Science and Technology, Khulna", type: "private", division: "Khulna", city: "Khulna", domain: "baustkhulna.ac.bd" }),
  make({ name: "TeestaU", fullName: "Teesta University, Rangpur", type: "private", division: "Rangpur", city: "Rangpur", domain: "teestauniversity.ac.bd" }),
  make({ name: "IIUSTB", fullName: "International Islami University of Science and Technology Bangladesh", type: "private", division: "Dhaka", city: "Dhaka", domain: "iiustb.ac.bd" }),
  make({ name: "LUSA", fullName: "Lalon University of Science and Arts", type: "private", division: "Khulna", city: "Kushtia", domain: "lusa.ac.bd" }),
  make({ name: "IBAISU", fullName: "IBAIS University", type: "private", division: "Dhaka", city: "Dhaka", domain: "ibaisuniversity.edu.bd" }),
  make({ name: "QueensU", fullName: "Queens University", type: "private", division: "Dhaka", city: "Dhaka", domain: "queensuniversity.edu.bd" }),
  make({ name: "TUC", fullName: "The University of Comilla", type: "private", division: "Chattogram", city: "Comilla", domain: "tuc.edu.bd" }),
  make({ name: "ABU", fullName: "America Bangladesh University", type: "private", division: "Dhaka", city: "Dhaka", domain: "abu.edu.bd" }),
  make({ name: "GrameenU", fullName: "Grameen University", type: "private", division: "Dhaka", city: "Dhaka", domain: "grameenuniv.edu.bd" }),
  make({ name: "BIUSTB", fullName: "Bangabandhu Sheikh Mujibur Rahman International University of Science & Technology, Bogura", type: "private", division: "Rajshahi", city: "Bogura", domain: "biustb.edu.bd" }),
  make({ name: "BAUST-Cumilla", fullName: "Bangladesh Army University of Science & Technology, Cumilla", type: "private", division: "Chattogram", city: "Cumilla", domain: "baustc.edu.bd" }),
  make({ name: "DUCU", fullName: "Dhaka University of Creative & Universal", type: "private", division: "Dhaka", city: "Dhaka", domain: "ducu.edu.bd" }),
];

// ──────────────────────────────────────────────────────────────────────────
//  INTERNATIONAL UNIVERSITIES (3)
// ──────────────────────────────────────────────────────────────────────────
const INTERNATIONAL: UniversitySeed[] = [
  make({ name: "IUT", fullName: "Islamic University of Technology", type: "international", division: "Dhaka", city: "Gazipur", domain: "iutoic-dhaka.edu" }),
  make({ name: "AUW", fullName: "Asian University for Women", type: "international", division: "Chattogram", city: "Chittagong", domain: "auw.edu.bd" }),
  make({ name: "SAU-SA", fullName: "South Asian University", type: "international", division: "Dhaka", city: "Dhaka", domain: "sau.int" }),
];

export const ALL_UNIVERSITIES: UniversitySeed[] = [
  ...PUBLIC,
  ...PRIVATE,
  ...INTERNATIONAL,
];

// Summary counts for sanity-checking
export const UNIVERSITY_COUNTS = {
  public: PUBLIC.length,
  private: PRIVATE.length,
  international: INTERNATIONAL.length,
  total: ALL_UNIVERSITIES.length,
};

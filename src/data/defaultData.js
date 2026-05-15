// Default data for the website
export const defaultNotices = [
  {
    id: 1,
    title: 'Admission Open for Academic Year 2082',
    description: 'Admissions are now open for all levels from Nursery to +2. Apply online or visit our campus.',
    category: 'Academic',
    date: '2025-04-15',
    pinned: true,
    pdfUrl: null
  },
  {
    id: 2,
    title: 'SEE Exam Schedule Published',
    description: 'The examination schedule for Secondary Education Examination (SEE) 2082 has been published.',
    category: 'Exam',
    date: '2025-04-10',
    pinned: true,
    pdfUrl: null
  },
  {
    id: 3,
    title: 'Annual Sports Day - Date TBD',
    description: 'Annual Sports Day will be held soon. Students are requested to prepare for their respective events.',
    category: 'Sports',
    date: '2025-04-05',
    pinned: false,
    pdfUrl: null
  },
  {
    id: 4,
    title: 'Parent-Teacher Meeting',
    description: 'Parent-Teacher meeting for all levels will be held on 20th Chaitra. All parents are requested to attend.',
    category: 'Admin',
    date: '2025-04-01',
    pinned: false,
    pdfUrl: null
  },
  {
    id: 5,
    title: 'Holiday Notice - Ram Navami',
    description: 'The school will remain closed on Ram Navami. Classes will resume the next day.',
    category: 'Holiday',
    date: '2025-03-28',
    pinned: false,
    pdfUrl: null
  }
];

export const defaultNews = [
  {
    id: 1,
    title: 'SSNEBS Wins Inter-School Quiz Competition',
    excerpt: 'Our students secured first place in the regional inter-school quiz competition held in Janakpur.',
    content: 'Our talented students represented SSNEBS in the regional inter-school quiz competition held in Janakpur and secured the first place among 15 participating schools. The team was led by...',
    date: '2025-04-12',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600',
    category: 'Achievement'
  },
  {
    id: 2,
    title: 'New Computer Lab Inaugurated',
    excerpt: 'State-of-the-art computer lab with 40 new systems inaugurated by the District Education Officer.',
    content: 'A new state-of-the-art computer laboratory equipped with 40 latest systems was inaugurated today by the District Education Officer. The lab will provide hands-on training...',
    date: '2025-04-08',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    category: 'Infrastructure'
  },
  {
    id: 3,
    title: 'Science Exhibition 2082',
    excerpt: 'Annual science exhibition showcasing innovative projects by our students from all levels.',
    content: 'The annual science exhibition was a grand success with over 100 innovative projects displayed by students from Nursery to +2. The event was graced by...',
    date: '2025-03-25',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600',
    category: 'Event'
  }
];

export const defaultEvents = [
  {
    id: 1,
    title: 'Annual Day Celebration',
    date: '2025-05-15',
    time: '10:00 AM',
    location: 'School Ground',
    description: 'Annual day celebration with cultural programs and prize distribution.'
  },
  {
    id: 2,
    title: 'Sports Week',
    date: '2025-05-20',
    time: '8:00 AM',
    location: 'School Playground',
    description: 'Inter-house sports competition including track and field events.'
  },
  {
    id: 3,
    title: 'Career Counseling Session',
    date: '2025-06-01',
    time: '11:00 AM',
    location: 'Conference Hall',
    description: 'Expert career guidance for +2 students by renowned counselors.'
  }
];

export const defaultFaculty = [
  {
    id: 1,
    name: 'Mr. Ram Prasad Sharma',
    subjects: [],
    position: 'Principal',
    qualification: 'M.Ed, B.Ed',
    experience: 20,
    departments: ['Admin'],
    department: 'Admin',
    sections: [],
    photo: null,
    isLeadership: true,
    linkedUserId: null
  },
  {
    id: 2,
    name: 'Mrs. Sita Devi Yadav',
    subjects: [],
    position: 'Vice Principal',
    qualification: 'M.A English, B.Ed',
    experience: 15,
    departments: ['Admin'],
    department: 'Admin',
    sections: [],
    photo: null,
    isLeadership: true,
    linkedUserId: null
  },
  {
    id: 3,
    name: 'Mr. Hari Bahadur Thapa',
    subjects: ['Mathematics'],
    position: '',
    qualification: 'M.Sc Mathematics, B.Ed',
    experience: 12,
    departments: ['Secondary'],
    department: 'Secondary',
    sections: [],
    photo: null,
    isLeadership: false,
    linkedUserId: null
  },
  {
    id: 4,
    name: 'Mrs. Gita Kumari Singh',
    subjects: ['Science', 'Physics'],
    position: '',
    qualification: 'M.Sc Physics, B.Ed',
    experience: 10,
    departments: ['Secondary'],
    department: 'Secondary',
    sections: [],
    photo: null,
    isLeadership: false,
    linkedUserId: null
  },
  {
    id: 5,
    name: 'Mr. Krishna Prasad Gupta',
    subjects: ['Nepali'],
    position: '',
    qualification: 'M.A Nepali, B.Ed',
    experience: 18,
    departments: ['Primary'],
    department: 'Primary',
    sections: [],
    photo: null,
    isLeadership: false,
    linkedUserId: null
  },
  {
    id: 6,
    name: 'Mrs. Maya Devi Sharma',
    subjects: ['English'],
    position: '',
    qualification: 'M.A English, B.Ed',
    experience: 14,
    departments: ['Primary'],
    department: 'Primary',
    sections: [],
    photo: null,
    isLeadership: false,
    linkedUserId: null
  },
  {
    id: 7,
    name: 'Mr. Dipak Raj Joshi',
    subjects: ['Computer Science'],
    position: '',
    qualification: 'MCA, B.Ed',
    experience: 8,
    departments: ['Higher Secondary'],
    department: 'Higher Secondary',
    sections: [],
    photo: null,
    isLeadership: false,
    linkedUserId: null
  },
  {
    id: 8,
    name: 'Mrs. Anjali Kumari',
    subjects: ['Accountancy'],
    position: '',
    qualification: 'M.Com, B.Ed',
    experience: 9,
    departments: ['Higher Secondary'],
    department: 'Higher Secondary',
    sections: [],
    photo: null,
    isLeadership: false,
    linkedUserId: null
  }
];

export const defaultGallery = [
  { id: 1, url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600', category: 'Classrooms', caption: 'Modern Classroom' },
  { id: 2, url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600', category: 'Events', caption: 'Annual Day' },
  { id: 3, url: 'https://images.unsplash.com/photo-1461896836934- voices?w=600', category: 'Sports', caption: 'Sports Day' },
  { id: 4, url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600', category: 'Cultural', caption: 'Cultural Program' },
  { id: 5, url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600', category: 'Classrooms', caption: 'Science Lab' },
  { id: 6, url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600', category: 'Events', caption: 'Quiz Competition' },
  { id: 7, url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600', category: 'Sports', caption: 'Football Match' },
  { id: 8, url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600', category: 'Hostel', caption: 'Hostel Building' }
];

export const defaultTestimonials = [
  {
    id: 1,
    name: 'Mrs. Kamala Devi',
    role: 'Parent',
    grade: 'Mother of Class 5 Student',
    quote: 'SSNEBS has transformed my child. The teachers are dedicated and the environment is perfect for learning. My son has shown remarkable improvement in his studies.',
    rating: 5,
    photo: null
  },
  {
    id: 2,
    name: 'Ramesh Kumar',
    role: 'Student',
    grade: 'Class 10',
    quote: 'The science lab and computer facilities here are excellent. Teachers make learning fun and interactive. I am proud to be a student of SSNEBS.',
    rating: 5,
    photo: null
  },
  {
    id: 3,
    name: 'Mr. Shyam Sundar',
    role: 'Parent',
    grade: 'Father of +2 Science Student',
    quote: 'Best school in Siraha! The management and teaching quality are exceptional. My daughter got admission to a top medical college thanks to SSNEBS.',
    rating: 5,
    photo: null
  },
  {
    id: 4,
    name: 'Priya Sharma',
    role: 'Student',
    grade: 'Class 8',
    quote: 'I love the extra-curricular activities here. From sports to music, there is something for everyone. The teachers are very supportive.',
    rating: 5,
    photo: null
  }
];

export const defaultAchievements = [
  {
    id: 1,
    title: 'Board Topper - SEE 2081',
    student: 'Suman Raj',
    year: '2081',
    category: 'Academic',
    icon: '🏆'
  },
  {
    id: 2,
    title: 'Science Olympiad Winner',
    student: 'Anita Kumari',
    year: '2081',
    category: 'Competition',
    icon: '🥇'
  },
  {
    id: 3,
    title: 'National Sports Champion',
    student: 'Bikash Thapa',
    year: '2080',
    category: 'Sports',
    icon: '🏅'
  },
  {
    id: 4,
    title: 'Debate Competition Winner',
    student: 'Sarita Devi',
    year: '2081',
    category: 'Competition',
    icon: '🎤'
  },
  {
    id: 5,
    title: 'Art Exhibition Winner',
    student: 'Manoj Kumar',
    year: '2080',
    category: 'Arts',
    icon: '🎨'
  },
  {
    id: 6,
    title: 'Quiz Competition Winner',
    student: 'Team SSNEBS',
    year: '2081',
    category: 'Competition',
    icon: '🧠'
  }
];

export const defaultHeroSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
    title: 'Welcome to SSNEBS',
    subtitle: 'Quality Education is Our Aim and Satisfaction',
    cta1: 'Apply Now',
    cta1Link: '/admissions',
    cta2: 'Learn More',
    cta2Link: '/about'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200',
    title: 'Excellence in Education',
    subtitle: '25+ Years of Nurturing Young Minds',
    cta1: 'Our Programs',
    cta1Link: '/academics',
    cta2: 'Contact Us',
    cta2Link: '/contact'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200',
    title: 'Building Future Leaders',
    subtitle: 'Academic Excellence with Character Building',
    cta1: 'Join Us',
    cta1Link: '/admissions',
    cta2: 'Our Faculty',
    cta2Link: '/faculty'
  }
];

export const defaultSiteSettings = {
  tagline: 'Quality Education is Our Aim and Satisfaction',
  primaryColor: '#D72638',
  secondaryColor: '#1A3A6B',
  accentColor: '#F5C518',
  logo: null,
  phone: '+977-XXX-XXXXXXX',
  email: 'info@ssnebs.edu.np',
  address: 'Siraha-1, Nepal',
  officeHours: 'Sun-Fri: 9:00 AM - 4:00 PM',
  facebook: 'https://facebook.com/ssnebs',
  youtube: 'https://youtube.com/ssnebs',
  instagram: 'https://instagram.com/ssnebs',
  tiktok: 'https://tiktok.com/@ssnebs'
};

export const defaultPageContent = {
  // ── Principal's Message ──────────────────────────────────
  principal: {
    name: 'Mr. Principal Name',
    title: 'Principal, SSNEBS',
    qualifications: 'M.Ed., B.Ed.',
    experience: '20+ years in education',
    image: null,
    quote: "Welcome to Siddhartha Sishu Niketan English Boarding School. We are committed to providing quality education that nurtures every child's potential and prepares them for a bright future.",
    message: "At SSNEBS, we believe that every child is unique and deserves the best possible start in life. Our dedicated team of educators works tirelessly to create an environment where curiosity is celebrated, creativity is encouraged, and character is built alongside academic achievement. We invite you to be a partner in your child's journey towards excellence.",
  },

  // ── About Us ─────────────────────────────────────────────
  about: {
    schoolName: 'Siddhartha Sishu Niketan English Boarding School',
    established: '2057 B.S. (2000 A.D.)',
    location: 'Siraha-1, Nepal',
    studentCount: '1200+',
    facultyCount: '60+',
    affiliation: 'National Examinations Board (NEB)',
    story1: 'Founded in 2057 B.S. (2000 A.D.), Siddhartha Sishu Niketan English Boarding School has grown from a small local institution to one of the most respected schools in the Siraha district. What started with just a handful of students and teachers has now blossomed into a thriving educational community with over 1200 students and 60+ qualified faculty members.',
    story2: 'Located in Siraha-1, Nepal, our school has been at the forefront of providing quality English-medium education to the children of the Terai region. Over the past 25+ years, we have consistently produced outstanding academic results while nurturing well-rounded individuals who contribute positively to society.',
    mission: "To provide quality, holistic education that nurtures every child's potential. We aim to create a learning environment that fosters academic excellence, moral values, and practical skills necessary for success in the modern world.",
    vision: 'To be the leading school in the Terai region known for academic excellence and character building. We envision a future where every student from SSNEBS becomes a confident, compassionate, and capable leader who makes meaningful contributions to Nepal and the world.',
    coreValues: {
      excellence: 'Striving for the highest standards in education',
      integrity: 'Building character through honesty and ethics',
      inclusivity: 'Embracing diversity and equal opportunities',
      innovation: 'Encouraging creative thinking and new ideas',
      discipline: 'Fostering responsibility and self-control',
      community: 'Building strong bonds within our school family',
    },
    feature1Title: 'NEB Affiliated',
    feature1Desc: 'Recognized by National Examinations Board',
    feature2Title: 'Govt. Recognized',
    feature2Desc: 'Approved by Nepal Government',
    feature3Title: 'Experienced Faculty',
    feature3Desc: '60+ qualified and dedicated teachers',
    feature4Title: '25+ Years Legacy',
    feature4Desc: 'Established in 2057 B.S. (2000 A.D.)',
  },

  // ── Contact Us Page ──────────────────────────────────────
  contactPage: {
    subtitle: 'Get in Touch with Us',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114306.96682250785!2d86.1787805!3d26.6788617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ecfe5ed3d8a8d7%3A0xcd4f74f4d6e8a7c8!2sSiraha%2C%20Nepal!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s',
    additionalNote: 'We typically respond to inquiries within 24 hours on working days (Sunday to Friday).',
  },

  // ── Admissions Page ──────────────────────────────────────
  admissions: {
    subtitle: 'Join the SSNEBS Family',
    openNotice: 'Admissions Open for Academic Year 2082',
    eligibility: 'Students of all backgrounds are welcome. Admission is subject to availability of seats and an entrance assessment for classes above Grade 5.',
    documents: 'Birth Certificate\nPrevious School Leaving Certificate\nTransfer Certificate\nPassport-size photographs (4 copies)\nParent/Guardian Citizenship Copy\nGrade Sheet / Report Card',
    feeNursery: 'Rs. 2,500/month',
    feePrimary: 'Rs. 3,000/month',
    feeMiddle: 'Rs. 3,500/month',
    feeSEE: 'Rs. 4,000/month',
    fee11: 'Rs. 5,000/month',
    fee12: 'Rs. 5,000/month',
  },

  // ── Academics Page ───────────────────────────────────────
  academics: {
    subtitle: 'Comprehensive Education from Nursery to +2',
    overview: 'We offer a structured and nurturing academic curriculum from Early Childhood Development to +2 Science, guided by the National Curriculum Framework of Nepal and affiliated with the National Examinations Board.',
    eccdTitle: 'Early Childhood Development (ECCD)',
    eccdDesc: 'Nursery, LKG, UKG — Play-based learning to build a strong foundation in language, numeracy, and social skills.',
    primaryTitle: 'Primary Level (Grade 1–5)',
    primaryDesc: 'English-medium instruction across core subjects. Focus on reading, writing, mathematics, and general science.',
    lowerSecTitle: 'Lower Secondary (Grade 6–8)',
    lowerSecDesc: 'Introduction to advanced concepts in science, social studies, mathematics, and computer education.',
    seeTitle: 'Secondary Level — SEE (Grade 9–10)',
    seeDesc: 'Preparing students for the Secondary Education Examination (SEE) with a comprehensive curriculum and regular mock tests.',
    plusTwoTitle: '+2 Science (Grade 11–12)',
    plusTwoDesc: 'Higher secondary education with Physics, Chemistry, Biology, and Mathematics. NEB-affiliated with strong lab facilities.',
  },
};

export const defaultStudents = [
  {
    id: 1,
    name: 'Ram Kumar Yadav',
    dob: '2010-05-15',
    gender: 'Male',
    class: '10',
    section: 'A',
    rollNo: '101',
    photo: null,
    fatherName: 'Shyam Kumar Yadav',
    motherName: 'Sita Devi Yadav',
    parentContact: '+977-9801234567',
    address: 'Siraha-1, Nepal',
    linkedUserId: null,
    active: true
  },
  {
    id: 2,
    name: 'Sita Sharma',
    dob: '2011-08-22',
    gender: 'Female',
    class: '9',
    section: 'B',
    rollNo: '205',
    photo: null,
    fatherName: 'Hari Prasad Sharma',
    motherName: 'Gita Devi Sharma',
    parentContact: '+977-9807654321',
    address: 'Siraha-2, Nepal',
    linkedUserId: null,
    active: true
  },
  {
    id: 3,
    name: 'Krishna Prasad Gupta',
    dob: '2009-03-10',
    gender: 'Male',
    class: '10',
    section: 'A',
    rollNo: '102',
    photo: null,
    fatherName: 'Mohan Prasad Gupta',
    motherName: 'Radha Devi Gupta',
    parentContact: '+977-9812345678',
    address: 'Siraha-3, Nepal',
    linkedUserId: null,
    active: true
  }
];
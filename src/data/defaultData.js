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
    subject: 'Principal',
    qualification: 'M.Ed, B.Ed',
    experience: 20,
    department: 'Admin',
    photo: null,
    isLeadership: true
  },
  {
    id: 2,
    name: 'Mrs. Sita Devi Yadav',
    subject: 'Vice Principal',
    qualification: 'M.A English, B.Ed',
    experience: 15,
    department: 'Admin',
    photo: null,
    isLeadership: true
  },
  {
    id: 3,
    name: 'Mr. Hari Bahadur Thapa',
    subject: 'Mathematics',
    qualification: 'M.Sc Mathematics, B.Ed',
    experience: 12,
    department: 'Secondary',
    photo: null,
    isLeadership: false
  },
  {
    id: 4,
    name: 'Mrs. Gita Kumari Singh',
    subject: 'Science',
    qualification: 'M.Sc Physics, B.Ed',
    experience: 10,
    department: 'Secondary',
    photo: null,
    isLeadership: false
  },
  {
    id: 5,
    name: 'Mr. Krishna Prasad Gupta',
    subject: 'Nepali',
    qualification: 'M.A Nepali, B.Ed',
    experience: 18,
    department: 'Primary',
    photo: null,
    isLeadership: false
  },
  {
    id: 6,
    name: 'Mrs. Maya Devi Sharma',
    subject: 'English',
    qualification: 'M.A English, B.Ed',
    experience: 14,
    department: 'Primary',
    photo: null,
    isLeadership: false
  },
  {
    id: 7,
    name: 'Mr. Dipak Raj Joshi',
    subject: 'Computer Science',
    qualification: 'MCA, B.Ed',
    experience: 8,
    department: '+2',
    photo: null,
    isLeadership: false
  },
  {
    id: 8,
    name: 'Mrs. Anjali Kumari',
    subject: 'Accountancy',
    qualification: 'M.Com, B.Ed',
    experience: 9,
    department: '+2',
    photo: null,
    isLeadership: false
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

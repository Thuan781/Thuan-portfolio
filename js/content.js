/* ============================================================
   ✏️  YOUR SITE CONTENT — this is the ONLY file you need to edit
   ------------------------------------------------------------
   Every personal detail on the page lives here. The page
   rebuilds itself from this object every time it loads.

   HOW TO EDIT
   - Change the text between the quotes ("...").
   - Lists use [ ... ] — add or remove items freely (comma-separated).
   - Leave a text field empty ("") and that bit is hidden.
   - Leave a list empty ([ ]) and the whole section is hidden.
   - Social links with url "#" are hidden — put your real URL.
   - Save this file, refresh the browser. Done.
   ============================================================ */

window.SITE_CONTENT = {

  /* ---------- identity ---------- */
  name: "Thuankubuan Kamei",            // your name → nav logo, footer, page title
  role: "IT Analyst at HCLTech | Data Science & AI", // job title → page title, About card
  location: "Tamenglong, Manipur, India",            // where you are → About card
  // Your photo for the About section, e.g. "images/me.jpg" (drop the file in
  // an images/ folder). Empty = automatic neon initials avatar instead.
  photo: "images/me.png",

  /* ---------- page <title> + SEO ---------- */
  pageTitle: "",
  metaDescription: "Portfolio of Thuankubuan Kamei — IT Analyst at HCLTech, Data Science & AI. Building at the intersection of AI, Data Science, and real-world technology.",

  /* ---------- hero (big landing section) ---------- */
  hero: {
    kicker: "Hello, I'm Thuankubuan Kamei",     // small line above the big title
    title1: "IT ANALYST AT",                    // big title, line 1 (plain)
    titleAccent: "HCLTECH",                     // big title, gradient-colored part
    title2: "DATA SCIENCE &",                   // big title, line 2 (plain)
    titleNeon: "AI",                            // big title, glowing part
    roleLine: "Data Science & AI | AI/ML Enthusiast", // line under the title
    subtitle: "Building at the intersection of AI, Data Science, and real-world technology.",
  },

  /* ---------- hero stats — [ ] hides them ---------- */
  stats: [
    { value: "4+", label: "Years at HCLTech" },
    { value: "5",  label: "Certifications" },
    { value: "2+", label: "AI Projects" },
    { value: "1",  label: "Degree in Progress" },
  ],

  /* ---------- about ---------- */
  about: {
    paragraphs: [
      "I am a passionate technology professional working at HCLTech with a strong interest in Artificial Intelligence, Machine Learning, Data Science, and modern IT operations. I enjoy building and experimenting with machine learning models, working with real-world data, and exploring how AI can solve practical problems.",
      "Alongside my professional experience in IT infrastructure, middleware, incident management, and operations, I am pursuing a Bachelor's degree in Data Science and AI from IIT Guwahati — continuously learning, building projects, and looking for opportunities where AI and technology can create real-world impact.",
    ],
    code: {
      role: "IT Analyst @ HCLTech",
      stack: ["python", "tensorflow", "pytorch", "scikit-learn"],
      location: "Tamenglong, Manipur, India",
      available: true,                      // true / false → About card
      availableNote: "# open to opportunities",
      status: "learning",
    },
  },

  /* ---------- experience — [ ] hides the whole section ---------- */
  experience: [
    {
      title: "Major Incident Manager",
      company: "HCLTech",
      period: "June 2025 – Present",
      current: true,
      bullets: [
        "Own infrastructure and application-level major incidents from initiation through resolution.",
        "Lead incident bridges, coordinate infrastructure and application teams, assign actions, and manage escalations.",
        "Coordinate teams across servers, networks, storage, cloud, databases, middleware, applications, APIs, and third-party integrations.",
        "Provide timely and transparent updates to leadership, business stakeholders, and impacted teams.",
        "Lead Post-Incident Reviews, support root cause identification, and track corrective and preventive actions.",
      ],
    },
    {
      title: "IT Operations – ICC / Rhythm",
      company: "HCLTech",
      period: "August 2024 – May 2025",
      bullets: [
        "Worked on AutoSys job monitoring, batch processing, change management, and incident management supporting ICC and Rhythm systems.",
        "Resolved Rhythm XFER job failures and managed MAXRUN settings in AutoSys.",
        "Monitored server and storage health, handled ITIL-compliant changes, and ensured reliable job execution.",
      ],
    },
    {
      title: "Middleware Engineer – Web & Application Support",
      company: "HCLTech",
      period: "March 2023 – July 2024",
      bullets: [
        "Supported WebLogic, Apache, and Tomcat environments — application deployments, troubleshooting, and server monitoring.",
        "Maintained system availability and coordinated with infrastructure and application teams.",
        "Used UNIX/Linux, Splunk, and AppDynamics for troubleshooting, monitoring, automation, and system health management.",
      ],
    },
    {
      title: "SQL Database Administrator – Training",
      company: "HCLTech",
      period: "September 2022 – February 2023",
      bullets: [
        "Completed hands-on training focused on SQL database management.",
        "Worked with relational databases, SQL queries, stored procedures, database normalization, indexing, and data integrity.",
        "Covered performance optimization, security, and real-world datasets.",
      ],
    },
  ],

  /* ---------- projects — [ ] hides the whole section ---------- */
  projects: [
    {
      title: "Traffic Signal Classification",
      desc: "Machine learning and deep learning project for classifying traffic signs using the GTSRB dataset.",
      tags: ["Python", "TensorFlow", "CNN", "NumPy", "Matplotlib"],
      icon: "⬡",
      tone: 1,
    },
    {
      title: "Vehicle Detection and Counting",
      desc: "Computer vision project that detects and counts vehicles using OpenCV and Haar Cascade classifiers.",
      tags: ["Python", "OpenCV", "NumPy", "Pillow", "Flask"],
      icon: "◉",
      tone: 2,
    },
    {
      title: "Data Science & AI Projects",
      desc: "An ongoing collection of machine learning, deep learning, computer vision, and generative AI work — model building, training, evaluation, and real-world data.",
      tags: ["Python", "ML", "Deep Learning", "GenAI"],
      icon: "✦",
      tone: 3,
    },
  ],

  /* ---------- skills — [ ] hides the whole section ---------- */
  skills: [
    "AI", "Machine Learning", "Deep Learning", "Neural Networks",
    "Generative AI", "Computer Vision", "Python", "SQL", "ITIL",
    "Major Incident Management", "Natural Language Processing",
    "Large Language Models", "TensorFlow", "PyTorch", "Scikit-learn",
    "Data Science", "Data Preprocessing", "Data Visualization",
    "WebLogic", "Apache", "Tomcat", "UNIX/Linux", "AutoSys",
    "Splunk", "AppDynamics", "Incident Management", "Change Management",
  ],

  /* ---------- certifications — [ ] hides the whole section ---------- */
  certifications: [
    "ITIL® 4 Foundation: Key Concepts of Service Management",
    "Language and Vision with AI/ML",
    "Apache Tomcat for System and Web Administration",
    "AI Dashboards using Microsoft Power BI",
    "AI Fundamentals: Foundations for Understanding AI",
  ],

  /* ---------- education — [ ] hides the whole section ---------- */
  education: [
    {
      school: "Indian Institute of Technology, Guwahati",
      degree: "Bachelor's Degree – Data Science and AI",
      period: "Expected Graduation: 2027",
      languages: ["English – Full Professional Proficiency"],
    },
  ],

  /* ---------- contact ---------- */
  contact: {
    title1: "GET IN",
    titleAccent: "TOUCH",
    subtitle: "Interested in AI, data, or infrastructure work — or just want to talk shop? My inbox is open.",
    email: "kthuan781@gmail.com",       // shown as a button + mailto link
    linkedin: "https://www.linkedin.com/in/thuankubuankamei-010925261/",
  },

  /* ---------- socials — [ ] or "#" urls hide them ---------- */
  socials: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/thuankubuankamei-010925261/" },
  ],
};

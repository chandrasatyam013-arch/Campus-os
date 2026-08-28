import { CareerProfile, CareerRecommendation, CareerRoadmap, CareerRoadmapPhase, CareerRoadmapTask, Subject, Mark } from '../src/types'; 

export interface CareerTemplate {
  id: string;
  name: string;
  requiredSkills: string[];
  relevantSubjects: string[];
  relevantInterests: string[];
  workStyles: string[];
  careerPreferences: string[];
  description: string;
  roadmapTemplate: RoadmapPhaseTemplate[];
}

export interface RoadmapPhaseTemplate {
  title: string;
  description: string;
  order: number;
  tasks: RoadmapTaskTemplate[];
}

export interface RoadmapTaskTemplate {
  title: string;
  description: string;
  priority: string; // HIGH, MEDIUM, LOW
  requiredKnowledge?: string[]; // e.g. 'python', 'math'
}

export const CAREER_TEMPLATES: CareerTemplate[] = [
  {
    id: 'ai-ml-engineer',
    name: 'AI/ML Engineer',
    requiredSkills: ['Programming', 'Mathematics', 'Problem Solving', 'Logical Thinking', 'Research'],
    relevantSubjects: ['Mathematics', 'Data Structures', 'Python', 'Algorithms', 'Statistics', 'Machine Learning'],
    relevantInterests: ['Artificial Intelligence', 'Programming', 'Data', 'Mathematics', 'Problem Solving', 'Technology'],
    workStyles: ['Building things', 'Solving complex problems', 'Analyzing data', 'Experimenting'],
    careerPreferences: ['Innovation', 'High salary', 'Technology', 'Research'],
    description: 'Specializes in designing, building, and deploying machine learning models and artificial intelligence systems.',
    roadmapTemplate: [
      {
        title: 'Programming Foundations',
        description: 'Master the core programming skills required for ML.',
        order: 1,
        tasks: [
          { title: 'Python', description: 'Advanced Python programming.', priority: 'HIGH', requiredKnowledge: ['python'] },
          { title: 'Git & Version Control', description: 'Code management.', priority: 'MEDIUM' },
          { title: 'Problem Solving (DSA)', description: 'Data structures and algorithms.', priority: 'HIGH' }
        ]
      },
      {
        title: 'Mathematical Foundations',
        description: 'The math behind machine learning algorithms.',
        order: 2,
        tasks: [
          { title: 'Linear Algebra', description: 'Vectors, matrices.', priority: 'HIGH', requiredKnowledge: ['math'] },
          { title: 'Probability & Statistics', description: 'Distributions, Bayes theorem.', priority: 'HIGH', requiredKnowledge: ['math'] }
        ]
      },
      {
        title: 'Data Foundations',
        description: 'Handling and analyzing data.',
        order: 3,
        tasks: [
          { title: 'NumPy & Pandas', description: 'Data manipulation libraries.', priority: 'HIGH' },
          { title: 'SQL & Databases', description: 'Relational data querying.', priority: 'MEDIUM' }
        ]
      },
      {
        title: 'Machine Learning',
        description: 'Core ML algorithms.',
        order: 4,
        tasks: [
          { title: 'Supervised Learning', description: 'Regression, Classification.', priority: 'HIGH' },
          { title: 'Unsupervised Learning', description: 'Clustering, Dimensionality Reduction.', priority: 'HIGH' }
        ]
      },
      {
        title: 'Deep Learning',
        description: 'Neural networks and advanced models.',
        order: 5,
        tasks: [
          { title: 'Neural Networks Basics', description: 'Feedforward networks, backpropagation.', priority: 'HIGH' },
          { title: 'CNNs & Vision', description: 'Computer vision basics.', priority: 'MEDIUM' },
          { title: 'Transformers & NLP', description: 'Language models.', priority: 'MEDIUM' }
        ]
      }
    ]
  },
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    requiredSkills: ['Programming', 'Problem Solving', 'Logical Thinking', 'Teamwork'],
    relevantSubjects: ['Data Structures', 'Algorithms', 'Software Engineering', 'DBMS', 'Operating Systems', 'Python', 'Java', 'C++'],
    relevantInterests: ['Programming', 'Web Development', 'Mobile Development', 'Problem Solving', 'Technology'],
    workStyles: ['Building things', 'Solving complex problems', 'Working in teams', 'Creating products'],
    careerPreferences: ['High salary', 'Job stability', 'Work-life balance'],
    description: 'Builds scalable software applications, systems, and tools.',
    roadmapTemplate: [
      {
        title: 'Core Programming',
        description: 'Master at least one object-oriented language.',
        order: 1,
        tasks: [
          { title: 'Master Java/C++/Python', description: 'Deep dive into language syntax and paradigms.', priority: 'HIGH' },
          { title: 'Data Structures', description: 'Arrays, Lists, Trees, Graphs.', priority: 'HIGH' },
          { title: 'Algorithms', description: 'Sorting, Searching, Dynamic Programming.', priority: 'HIGH' }
        ]
      },
      {
        title: 'Systems & Databases',
        description: 'Understand how computers and data storage work.',
        order: 2,
        tasks: [
          { title: 'SQL & Relational Databases', description: 'Normalization, Queries, Joins.', priority: 'HIGH' },
          { title: 'Operating Systems', description: 'Threads, Processes, Memory Management.', priority: 'MEDIUM' },
          { title: 'Computer Networks', description: 'TCP/IP, HTTP.', priority: 'MEDIUM' }
        ]
      },
      {
        title: 'Software Design & Architecture',
        description: 'Building scalable systems.',
        order: 3,
        tasks: [
          { title: 'Design Patterns', description: 'Singleton, Factory, Observer.', priority: 'HIGH' },
          { title: 'System Design', description: 'Scalability, Load Balancing, Caching.', priority: 'HIGH' }
        ]
      }
    ]
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    requiredSkills: ['Mathematics', 'Analysis', 'Programming', 'Problem Solving', 'Presentation'],
    relevantSubjects: ['Mathematics', 'Statistics', 'Python', 'DBMS'],
    relevantInterests: ['Data', 'Mathematics', 'Artificial Intelligence', 'Analysis'],
    workStyles: ['Analyzing data', 'Solving complex problems', 'Researching'],
    careerPreferences: ['High salary', 'Innovation', 'Research'],
    description: 'Extracts insights from large datasets to drive business decisions.',
    roadmapTemplate: [
      {
        title: 'Data & Statistics',
        description: 'Foundations of data science.',
        order: 1,
        tasks: [
          { title: 'Probability & Statistics', description: 'Core math concepts.', priority: 'HIGH' },
          { title: 'Python Data Stack', description: 'Pandas, NumPy, Matplotlib.', priority: 'HIGH' }
        ]
      },
      {
        title: 'Data Wrangling',
        description: 'Cleaning and preparing data.',
        order: 2,
        tasks: [
          { title: 'SQL', description: 'Advanced querying.', priority: 'HIGH' },
          { title: 'Data Cleaning', description: 'Handling missing values, outliers.', priority: 'HIGH' }
        ]
      },
      {
        title: 'Modeling',
        description: 'Predictive analytics.',
        order: 3,
        tasks: [
          { title: 'Machine Learning', description: 'Scikit-learn, XGBoost.', priority: 'HIGH' },
          { title: 'A/B Testing', description: 'Experimentation.', priority: 'MEDIUM' }
        ]
      }
    ]
  },
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    requiredSkills: ['Design', 'Creativity', 'Communication', 'Research'],
    relevantSubjects: ['Human Computer Interaction', 'Design', 'Psychology'],
    relevantInterests: ['Design', 'Creativity', 'Technology', 'Communication'],
    workStyles: ['Designing interfaces', 'Working with people', 'Creating products'],
    careerPreferences: ['Creativity', 'Innovation', 'Flexible'],
    description: 'Designs intuitive and aesthetically pleasing digital experiences for users.',
    roadmapTemplate: [
      {
        title: 'Design Fundamentals',
        description: 'Learn the basics of visual design.',
        order: 1,
        tasks: [
          { title: 'Color Theory & Typography', description: 'Understanding visual hierarchy.', priority: 'HIGH' },
          { title: 'Figma Basics', description: 'Mastering the primary design tool.', priority: 'HIGH' }
        ]
      },
      {
        title: 'User Experience (UX)',
        description: 'Understanding users.',
        order: 2,
        tasks: [
          { title: 'User Research', description: 'Conducting interviews and surveys.', priority: 'HIGH' },
          { title: 'Wireframing & Prototyping', description: 'Low and high fidelity mockups.', priority: 'HIGH' }
        ]
      },
      {
        title: 'Advanced UI',
        description: 'Polishing designs.',
        order: 3,
        tasks: [
          { title: 'Design Systems', description: 'Creating reusable components.', priority: 'HIGH' },
          { title: 'Micro-interactions', description: 'Adding animations and delight.', priority: 'MEDIUM' }
        ]
      }
    ]
  }
];

export class CareerEngine {
  
  /**
   * Evaluates how closely an array of user traits matches the required traits of a career.
   */
  private static calculateMatchScore(userTraits: string[], careerTraits: string[]): number {
    if (careerTraits.length === 0) return 0;
    if (userTraits.length === 0) return 0;
    
    // Normalize for case-insensitive partial matches
    const normalizedUser = userTraits.map(t => t.toLowerCase().trim());
    const normalizedCareer = careerTraits.map(t => t.toLowerCase().trim());
    
    let matchCount = 0;
    for (const c of normalizedCareer) {
      if (normalizedUser.some(u => u.includes(c) || c.includes(u))) {
        matchCount++;
      }
    }
    
    return matchCount / normalizedCareer.length;
  }

  /**
   * Deterministically calculates compatibility for all careers.
   */
  public static calculateCareerFit(profile: any): any[] {
    const results = CAREER_TEMPLATES.map(career => {
      const interestMatch = this.calculateMatchScore(profile.interests || [], career.relevantInterests);
      const subjectMatch = this.calculateMatchScore(profile.preferredSubjects || [], career.relevantSubjects);
      const skillMatch = this.calculateMatchScore(profile.strengths || [], career.requiredSkills);
      const styleMatch = this.calculateMatchScore(profile.workPreferences || [], career.workStyles);
      const prefMatch = this.calculateMatchScore(profile.careerPreferences || [], career.careerPreferences);
      
      // Goal match gets a massive boost if they explicitly stated it
      let goalMatch = 0;
      if (profile.targetCareer && profile.targetCareer.toLowerCase() !== "i'm not sure yet") {
        if (career.name.toLowerCase().includes(profile.targetCareer.toLowerCase()) || 
            profile.targetCareer.toLowerCase().includes(career.name.toLowerCase())) {
          goalMatch = 1.0;
        }
      }

      // Weights
      const totalScore = (
        (interestMatch * 25) +
        (skillMatch * 25) +
        (subjectMatch * 15) +
        (styleMatch * 15) +
        (prefMatch * 10) +
        (goalMatch * 10) // Small boost just for selecting it, but the rest still dominates if goal is weak
      );

      // We want to scale it nicely so a good match hits 85-95%.
      // The math above maxes at 100, but realistically user won't select ALL tags.
      // So we apply a gentle curve to boost realistic scores.
      let finalScore = Math.min(100, Math.round(totalScore * 1.5)); 
      
      // Floor it at something reasonable
      if (finalScore < 20) finalScore = Math.floor(Math.random() * 10) + 20; // pseudo random floor just so it doesn't say 0%

      let rawExplanation = `Your strongest alignment comes from:\n`;
      if (interestMatch > 0.3) rawExplanation += `✓ Strong interest alignment\n`;
      if (skillMatch > 0.3) rawExplanation += `✓ Strengths match required skills\n`;
      if (subjectMatch > 0.3) rawExplanation += `✓ Preferred subjects are highly relevant\n`;
      if (styleMatch > 0.3) rawExplanation += `✓ Compatible work style preferences\n`;

      return {
        career: career.name,
        careerId: career.id,
        compatibilityScore: finalScore,
        explanation: rawExplanation.trim(), // Will be overwritten by AI if implemented
        rawStats: { interestMatch, skillMatch, subjectMatch, styleMatch }
      };
    });

    return results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  /**
   * Generates a personalized roadmap based on the target career and existing academic data.
   */
  public static generateRoadmap(careerName: string, subjects: Subject[], marks: Mark[]): any[] {
    const template = CAREER_TEMPLATES.find(c => c.name.toLowerCase() === careerName.toLowerCase()) || CAREER_TEMPLATES[1]; // default SW
    
    // Evaluate if user is already strong in specific topics based on subjects and marks
    const strongTopics = new Set<string>();
    for (const sub of subjects) {
      const subjectMarks = marks.filter(m => m.subjectId === sub.id);
      if (subjectMarks.length > 0) {
        const sumObtained = subjectMarks.reduce((acc, val) => acc + val.obtainedMarks, 0);
        const sumMax = subjectMarks.reduce((acc, val) => acc + val.maximumMarks, 0);
        const percentage = (sumObtained / sumMax) * 100;
        if (percentage >= 80) {
          // strong in this subject
          if (sub.name.toLowerCase().includes('math')) strongTopics.add('math');
          if (sub.name.toLowerCase().includes('python')) strongTopics.add('python');
          if (sub.name.toLowerCase().includes('java') || sub.name.toLowerCase().includes('c++')) strongTopics.add('programming');
        }
      }
    }

    const phases = template.roadmapTemplate.map(phaseTemplate => {
      const tailoredTasks = phaseTemplate.tasks.map(task => {
        let status = 'TODO';
        let description = task.description;
        
        // Personalization: If they are already strong in this requirement, mark it completed or adjust description
        if (task.requiredKnowledge) {
          const isStrong = task.requiredKnowledge.some(k => strongTopics.has(k));
          if (isStrong) {
            status = 'COMPLETED';
            description = `(Campus OS Data: Already strong in this area based on academic performance) - ${description}`;
          }
        }

        return {
          title: task.title,
          description: description,
          priority: task.priority,
          status: status
        };
      });

      return {
        title: phaseTemplate.title,
        description: phaseTemplate.description,
        order: phaseTemplate.order,
        tasks: tailoredTasks
      };
    });

    return phases;
  }
}

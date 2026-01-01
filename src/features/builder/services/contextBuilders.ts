/**
 * Context Builder Functions for Builder AI Service
 * Builds context objects used by content generators
 * 
 * Extracted from builderAiService.ts refactor
 */

import type {
    SimilarProject,
    ProjectContext,
    OutlineContext,
    ChapterContext,
    EnhancedChapterContext,
    ProjectWithDocuments
} from './types';
import {
    detectDomain,
    extractTechnologies,
    extractFeatures,
    extractFocusAreas,
    extractImprovements,
    extractContribution,
    extractFutureScope,
    extractProblemDomain,
    extractProjectTechnologies,
    extractProjectObjectives,
    extractResearchContext
} from './dataExtractors';

// ======================================
// Project Context Builders
// ======================================

/**
 * Build project context from similar projects
 */
export function buildProjectContext(similarProjects: SimilarProject[], topic: string): ProjectContext {
    return {
        domain: detectDomain(topic),
        technologies: extractTechnologies(similarProjects),
        features: extractFeatures(similarProjects),
        focusAreas: extractFocusAreas(similarProjects),
        improvements: extractImprovements(similarProjects),
        contribution: extractContribution(similarProjects),
        futureScope: extractFutureScope(similarProjects)
    };
}

/**
 * Build outline context from similar projects
 */
export function buildOutlineContext(similarProjects: SimilarProject[], topic: string): OutlineContext {
    return {
        domain: detectDomain(topic),
        technologies: extractTechnologies(similarProjects),
        problemDomain: extractProblemDomain(topic)
    };
}

/**
 * Build chapter context from project details
 */
export function buildChapterContext(
    project: { topic: string; twist?: string | null; abstract?: string | null },
    chapterNumber: number,
    chapterTitle: string
): ChapterContext {
    return {
        projectTopic: project.topic,
        problemDomain: project.twist || project.topic,
        technologies: extractProjectTechnologies(project),
        objectives: extractProjectObjectives(project),
        scope: project.abstract || project.topic,
        chapterNumber,
        chapterTitle
    };
}

/**
 * Build enhanced chapter context including research documents
 */
export function buildEnhancedChapterContext(
    project: ProjectWithDocuments,
    chapterNumber: number,
    chapterTitle: string
): EnhancedChapterContext {
    const researchContext = extractResearchContext(project.documents || []);
    const technologies = extractProjectTechnologies(project);
    const primaryTech = technologies[0] || 'Modern Technologies';

    return {
        // Core project info
        projectTopic: project.topic,
        problemDomain: project.twist || project.topic,
        technologies,
        objectives: extractProjectObjectives(project),
        scope: project.abstract || project.topic,
        chapterNumber,
        chapterTitle,
        researchContext,
        hasResearchDocuments: (project.documents?.length || 0) > 0,

        // Template defaults to prevent undefined errors
        limitations: ['limited timeframe', 'resource constraints', 'scope boundaries'],
        problem1: 'Inefficiency in current manual processes',
        problem2: 'Lack of real-time data access and analysis',
        problem3: 'Poor user experience and outdated interfaces',
        consequences: 'reduced productivity, increased errors, and user frustration',
        objectiveDetails: 'efficient data management and improved user experience',
        primaryTechnology: primaryTech,
        domain: detectDomain(project.topic),
        technicalAspect: 'software system design and implementation',
        useCase: project.twist || project.topic,
        industryApplication: 'modern software development',
        futureResearchAreas: 'emerging technologies and methodologies',
        projectScope: project.topic,
        scopeDetails: 'core functionality and user interface components',
        limitation1: 'Time constraints limit the scope of features implemented',
        limitation2: 'Testing is limited to simulated environments',
        limitation3: 'Budget constraints limit access to premium tools and services',
        term1: project.topic.split(' ')[0] || 'System',
        term1Definition: 'The primary subject of this research project',
        term2: 'API',
        term2Definition: 'Application Programming Interface - a software intermediary for application communication',
        term3: 'Database',
        term3Definition: 'An organized collection of structured information stored electronically',

        // Additional Chapter 2 template defaults
        concept1: 'System Architecture',
        concept1Description: 'The fundamental structure of the software system including its components and their relationships.',
        concept2: 'User Experience Design',
        concept2Description: 'The process of creating products that provide meaningful experiences to users.',
        concept3: 'Data Management',
        concept3Description: 'The practice of collecting, organizing, and maintaining data for efficient access and use.',
        theory1: 'Software Development Life Cycle (SDLC)',
        theory1Description: 'A systematic process for planning, creating, testing, and deploying software systems.',
        theory2: 'Agile Methodology',
        theory2Description: 'An iterative approach to project management and software development.',
        study1Title: 'Related Systems Analysis',
        study1Description: 'Analysis of existing systems in the same domain reveals common patterns and limitations.',
        study2Title: 'Technology Stack Comparison',
        study2Description: 'Comparison of available technologies for implementation reveals optimal choices.',
        study3Title: 'User Requirements Study',
        study3Description: 'Research into user needs and expectations informs system design decisions.',
        aspect1: 'Scalability', value1A: 'Limited', value1B: 'Moderate', value1C: 'Good', value1Proposed: 'Excellent',
        aspect2: 'Usability', value2A: 'Basic', value2B: 'Standard', value2C: 'Good', value2Proposed: 'Excellent',
        aspect3: 'Performance', value3A: 'Slow', value3B: 'Average', value3C: 'Fast', value3Proposed: 'Optimized',
        gap1: 'Existing solutions lack modern user interface design patterns',
        gap2: 'Current systems have limited integration capabilities',
        gap3: 'Performance optimization is often overlooked in existing implementations',

        // Additional Chapter 3 template defaults
        researchDesign: 'mixed-methods development',
        designFocus: 'iterative prototyping and user feedback integration',
        currentSystemIssue1: 'Outdated technology stack limiting performance',
        currentSystemIssue2: 'Poor scalability for growing user base',
        currentSystemIssue3: 'Inadequate security measures for modern threats',
        functionalReq1: 'User authentication and authorization',
        functionalReq2: 'Data management and storage capabilities',
        functionalReq3: 'Real-time data processing and display',
        nonFunctionalReq1: 'Response time under 3 seconds for all operations',
        nonFunctionalReq2: 'System availability of 99.5% uptime',
        nonFunctionalReq3: 'Secure handling of user data with encryption',
        architectureType: 'modular microservices',
        architectureBenefits: 'scalability, maintainability, and independent deployment',
        frontendDescription: 'Modern React-based user interface with responsive design',
        backendDescription: 'Node.js/Next.js API routes with robust error handling',
        databaseDescription: 'PostgreSQL database with optimized queries and indexing',
        integrationDescription: 'RESTful APIs for external service communication',
        dataFlow1: 'User input captured through form components',
        dataFlow2: 'Data validated and processed by API endpoints',
        dataFlow3: 'Results stored in database and returned to user interface',
        entity1: 'User', entity1Description: 'Stores user account information and preferences',
        entity2: 'Project', entity2Description: 'Contains project details and status information',
        entity3: 'Document', entity3Description: 'Manages uploaded files and extracted content',
        frontendTech: 'React/Next.js with TypeScript',
        backendTech: 'Node.js with Express/Next.js API Routes',
        databaseTech: 'PostgreSQL with Prisma ORM',
        additionalTools: 'Docker, Git, VS Code',
        developmentMethodology: 'Agile Scrum',
        methodologyBenefits: 'iterative development, continuous feedback, and adaptability',
        methodologyOutcomes: 'regular deliverables and responsive development process',
        unitTestFocus: 'individual component functionality',
        integrationTestFocus: 'component interactions work correctly',
        systemTestFocus: 'end-to-end system functionality',
        uatFocus: 'the system meets user requirements and expectations',
        qaMeasure1: 'Code review for all pull requests',
        qaMeasure2: 'Automated testing pipeline',
        qaMeasure3: 'Performance monitoring and logging',

        // Additional Chapter 4 template defaults
        hardwareSpec1: 'Development machine: Intel i7/AMD Ryzen, 16GB RAM',
        hardwareSpec2: 'Display: 1920x1080 resolution monitor',
        hardwareSpec3: 'Network: Stable internet connection for API testing',
        softwareEnv1: 'Operating System: Windows 11 / macOS / Linux',
        softwareEnv2: 'Node.js v18+ runtime environment',
        softwareEnv3: 'PostgreSQL 14+ database server',
        devTool1: 'Visual Studio Code with TypeScript extensions',
        devTool2: 'Git for version control',
        devTool3: 'Postman for API testing',
        backendFocus: 'API development and data processing',
        frontendFeature1: 'Responsive design for all screen sizes',
        frontendFeature2: 'Interactive user interface components',
        frontendFeature3: 'Real-time data updates',
        backendFeature1: 'RESTful API endpoints',
        backendFeature2: 'Authentication and authorization',
        backendFeature3: 'Data validation and error handling',
        dbFeature1: 'Normalized database schema',
        dbFeature2: 'Efficient query optimization',
        dbFeature3: 'Data integrity constraints',
        dashboardDescription: 'A comprehensive view of all system features and statistics.',
        feature1Description: 'Easy navigation and intuitive user interface',
        feature2Description: 'Quick access to frequently used functions',
        feature3Description: 'Real-time status updates and notifications',
        unitTestResult1: 'All core functions passed unit tests',
        unitTestResult2: 'Edge cases handled correctly',
        unitTestResult3: 'Error handling verified',
        integrationTestResult1: 'API endpoints respond correctly',
        integrationTestResult2: 'Database operations complete successfully',
        integrationTestResult3: 'Authentication flow works as expected',
        performanceResult1: 'Average response time: 150ms',
        performanceResult2: 'System handles 100 concurrent users',
        performanceResult3: 'Memory usage within acceptable limits',
        functionalEvaluation: 'all primary features',
        successRate: '95',
        userExperienceResults: 'positive feedback on interface design',
        satisfactionRating: '4.2/5',
        technicalResults: 'robust system performance',
        performanceMetrics: 'meeting all defined benchmarks',
        challenge1: 'Complex data relationships',
        solution1: 'Implemented efficient database design patterns',
        outcome1: 'Improved query performance',
        challenge2: 'User authentication complexity',
        solution2: 'Integrated established authentication library',
        outcome2: 'Secure and reliable user management',
        challenge3: 'Responsive design requirements',
        solution3: 'Used modern CSS frameworks and techniques',
        outcome3: 'Consistent experience across devices',

        // Additional Chapter 5 template defaults
        methodologyUsed: 'Agile development',
        achievement1: 'Successfully implemented core system functionality',
        achievement2: 'Achieved performance targets for all operations',
        achievement3: 'Created comprehensive documentation',
        rq1Answer: 'Modern web technologies provide efficient solutions for the identified problems',
        rq2Answer: 'Key requirements include scalability, usability, and security',
        rq3Answer: 'The proposed solution shows significant improvements in all measured metrics',
        rq4Answer: 'Challenges were overcome through iterative development and testing',
        solutionApproach: 'a modern technology stack and user-centered design',
        finding1: 'The system successfully addresses identified user needs',
        finding2: 'Performance exceeds initial expectations',
        finding3: 'User feedback indicates high satisfaction with the interface',
        fieldOfStudy: 'Software Engineering',
        contribution1: 'Practical implementation of modern development practices',
        contribution2: 'Documentation of challenges and solutions',
        contribution3: 'Framework for future similar projects',
        practitionerRec1: 'Adopt modern development frameworks for new projects',
        practitionerRec2: 'Implement continuous integration and deployment',
        practitionerRec3: 'Prioritize user experience in design decisions',
        researcherRec1: 'Investigate machine learning integration opportunities',
        researcherRec2: 'Study scalability implications for larger deployments',
        researcherRec3: 'Explore cross-platform development approaches',
        futureEnhancement1: 'Add advanced analytics and reporting features',
        futureEnhancement2: 'Implement mobile application companion',
        futureEnhancement3: 'Integrate with additional third-party services',
        limitation1Title: 'Time Constraints',
        limitation1Description: 'The project timeline limited the number of features that could be implemented.',
        limitation2Title: 'Testing Scope',
        limitation2Description: 'Testing was limited to development environments and simulated user scenarios.',
        limitation3Title: 'Resource Availability',
        limitation3Description: 'Access to certain tools and services was limited by budget constraints.',
        futureArea1: 'Advanced AI Integration',
        futureArea1Description: 'Exploring machine learning capabilities for intelligent data processing.',
        futureArea2: 'Mobile Development',
        futureArea2Description: 'Creating native mobile applications for broader accessibility.',
        futureArea3: 'Enhanced Security',
        futureArea3Description: 'Implementing advanced security features for enterprise deployment.'
    };
}

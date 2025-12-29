import { ProjectDetail } from '../components/ProjectDetailModal';

export const PROJECTS: ProjectDetail[] = [
    {
        id: "ecommerce-ai",
        title: "E-Commerce AI Agent",
        category: "Computer Science",
        summary: "An intelligent conversational shopping assistant that uses GPT-4 to provide personalized product recommendations.",
        description: "This final year project implements an AI-powered shopping assistant for e-commerce platforms. The system uses natural language processing to understand customer intent and provide relevant product suggestions. It addresses the challenge of impersonal online shopping experiences by acting as a knowledgeable virtual sales clerk.",
        heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
        techStack: ["Next.js", "OpenAI", "Stripe", "Tailwind", "PostgreSQL", "Prisma"],
        gradient: "from-purple-500 to-indigo-500",
        metrics: {
            codeQuality: 98,
            performance: "1.2s",
        },
        features: [
            { title: "AI Chatbot", desc: "Natural language product search and recommendations using GPT-4." },
            { title: "Stripe Checkout", desc: "Secure payment processing with webhooks and receipt generation." },
            { title: "Admin Dashboard", desc: "Real-time analytics, inventory management, and order tracking." },
            { title: "Mobile Responsive", desc: "Fully optimized PWA application for all device sizes." }
        ],
        deliverables: [
            "Full source code (GitHub)",
            "120-Page Dissertation PDF",
            "Defense Slide Deck (PPTX)",
            "System Documentation"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&auto=format&fit=crop&q=60"
        ]
    },
    {
        id: "hms-system",
        title: "Hospital Management",
        category: "Information Tech",
        summary: "A comprehensive digital solution for patient records, doctor scheduling, and inventory management.",
        description: "Designed to modernize healthcare administration, this system reduces paperwork and improves patient throughput. It features distinct portals for doctors, patients, and administrators, with strict role-based access control to ensure HIPAA compliance and data security.",
        heroImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2653&auto=format&fit=crop",
        techStack: ["React", "Firebase", "Tailwind", "Redux"],
        gradient: "from-cyan-500 to-blue-500",
        metrics: {
            codeQuality: 95,
            performance: "0.8s",
        },
        features: [
            { title: "Patient Portal", desc: "Appointment booking and medical history access." },
            { title: "Doctor Dashboard", desc: "Schedule management and digital prescription writing." },
            { title: "Pharmacy Module", desc: "Stock tracking and automated low-stock alerts." },
            { title: "Telemedicine", desc: "Integrated video consultation capabilities." }
        ],
        deliverables: [
            "Complete Source Code",
            "User Manual",
            "Functional Requirements Doc",
            "Project Report"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2653&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1516549655169-df83a0833860?w=400&auto=format&fit=crop&q=60"
        ]
    },
    {
        id: "crypto-detection",
        title: "Crypto Fraud Detection",
        category: "Cybersecurity",
        summary: "Machine learning model to detect fraudulent transactions in real-time on the Ethereum blockchain.",
        description: "This project addresses the growing issue of cryptocurrency fraud. By analyzing transaction patterns on the Ethereum network using graph neural networks, the system can flag suspicious wallets and transactions with 94% accuracy, providing a visual explorer for investigators.",
        heroImage: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=2669&auto=format&fit=crop",
        techStack: ["Python", "Machine Learning", "FastAPI", "Tensorflow", "React"],
        gradient: "from-pink-500 to-rose-500",
        metrics: {
            codeQuality: 92,
            performance: "120ms",
        },
        features: [
            { title: "Real-time Monitoring", desc: "Live ingestion of Ethereum mempool data." },
            { title: "Graph Visualization", desc: "Interactive visualization of wallet connections." },
            { title: "Alert System", desc: "Instant notifications for high-risk transactions." },
            { title: "API Endpoint", desc: "REST API for external service integration." }
        ],
        deliverables: [
            "Python Backend Code",
            "React Frontend Code",
            "Model Training Notebooks",
            "Thesis Report"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=2669&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&auto=format&fit=crop&q=60"
        ]
    },
    {
        id: "smart-campus",
        title: "Smart Campus IoT",
        category: "Computer Eng.",
        summary: "IoT network using ESP32 microcontrollers to monitor class attendance and environmental quality.",
        description: "A hardware-software hybrid project that creates a connected campus environment. Sensors deployed in classrooms monitor temperature, humidity, and occupancy, while RFID readers handle automated student attendance. All data is aggregated to a central cloud dashboard.",
        heroImage: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=2670&auto=format&fit=crop",
        techStack: ["C++", "Arduino", "MQTT", "Node-RED", "Grafana"],
        gradient: "from-emerald-500 to-teal-500",
        metrics: {
            codeQuality: 88,
            performance: "Real-time",
        },
        features: [
            { title: "Environmental Sensing", desc: "Temp, Humidity, CO2 monitoring." },
            { title: "RFID Attendance", desc: "Contactless student check-in system." },
            { title: "Mobile Alert App", desc: "Android app for facility managers." },
            { title: "Power Optimization", desc: "Deep sleep cycles for battery longevity." }
        ],
        deliverables: [
            "Circuit Diagrams",
            "Firmware Code (C++)",
            "PCB Layouts",
            "Final Hardware Prototype"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&auto=format&fit=crop&q=60"
        ]
    }
];

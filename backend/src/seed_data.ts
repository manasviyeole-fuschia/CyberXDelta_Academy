export const DOMAINS = [
    {
        id: "IAM Fundamentals",
        name: "IAM Fundamentals & Zero Trust",
        description: "Core identity lifecycle, RBAC/ABAC models, principle of least privilege, directory services",
        icon: "ShieldCheck"
    },
    {
        id: "Access Management / SSO",
        name: "Access Management & Federation (Okta, Ping, Entra)",
        description: "SAML 2.0, OAuth 2.0 / OIDC, MFA, PingFederate, Okta Admin, Microsoft Entra ID, PingOne DaVinci",
        icon: "KeyRound"
    },
    {
        id: "Identity Governance",
        name: "Identity Governance & Administration (SailPoint IGA)",
        description: "Access certification, compliance, Segregation of Duties (SoD), SailPoint IdentityIQ & IdentityNow",
        icon: "FileCheck2"
    },
    {
        id: "PAM / CyberArk",
        name: "Privileged Access Management (CyberArk PAM)",
        description: "Vault architecture, CPM credential rotation, PSM session isolation, Just-In-Time access",
        icon: "Lock"
    }
];

export const COURSES = [
    {
        id: "c-iam-01",
        title: "IAM Foundation Masterclass",
        slug: "iam-foundation-masterclass",
        primary_domain: "IAM Fundamentals",
        level: "Beginner to Intermediate",
        badge: "Career Foundation",
        duration: "4 Weeks (Live Instructor-led + Labs)",
        description: "The definitive jumpstart for cybersecurity professionals and freshers stepping into IAM. Covers core directory services, RBAC/ABAC models, least privilege principles, JML lifecycles, and hands-on identity labs.",
        key_topics: [
            "Core IAM Architecture & Directory Fundamentals (AD / Entra ID)",
            "Role-Based (RBAC) vs Attribute-Based (ABAC) Access Control",
            "Joiner-Mover-Leaver (JML) Identity Lifecycle Automation",
            "NIST 800-63 Digital Identity Guidelines & Least Privilege"
        ],
        booking_url: "https://courses.cyberxdelta.com/learn/IAM-Master-Class",
        rating: 4.96,
        students_enrolled: 3200
    },
    {
        id: "c-sso-02",
        title: "Ping Identity Suite & PingFederate Masterclass",
        slug: "ping-suite-cohort",
        primary_domain: "Access Management / SSO",
        level: "Intermediate to Advanced",
        badge: "High Demand Specialization",
        duration: "6 Weeks (Live Labs + Real Projects)",
        description: "End-to-end hands-on training on enterprise federation with PingFederate, PingAccess, PingDirectory, and PingOne DaVinci. Learn IdP/SP adapters, token mapping, OAuth 2.0 PKCE, and multi-cloud SSO architectures.",
        key_topics: [
            "PingFederate IdP & SP Connection Architecture",
            "SAML 2.0 Assertion Exchange & Signature Validation",
            "OAuth 2.0 Authorization Grant Flows & OIDC",
            "PingOne DaVinci Orchestration & User Journeys"
        ],
        booking_url: "https://courses.cyberxdelta.com/learn/CXD--Ping-Suite-Cohort",
        rating: 4.92,
        students_enrolled: 2450
    },
    {
        id: "c-sso-03",
        title: "Microsoft Entra ID & Okta Administrator Training",
        slug: "entra-id-okta-admin",
        primary_domain: "Access Management / SSO",
        level: "Intermediate",
        badge: "Enterprise Essential",
        duration: "5 Weeks (Live Scenarios)",
        description: "Master modern cloud identity architectures using Microsoft Entra ID (Azure AD) and Okta. Configure Conditional Access policies, Self-Service Password Reset (SSPR), B2B/B2C federation, and SCIM provisioning.",
        key_topics: [
            "Microsoft Entra ID Conditional Access & Risk Policies",
            "Okta Universal Directory & Lifecycle Management",
            "SCIM User Provisioning & Application Connectors",
            "MFA Enforcements, FIDO2 & Passwordless Workflows"
        ],
        booking_url: "https://courses.cyberxdelta.com/learn/Entra---ID",
        rating: 4.90,
        students_enrolled: 2100
    },
    {
        id: "c-iga-04",
        title: "SailPoint Identity Governance (IdentityIQ & IdentityNow)",
        slug: "sailpoint-iga-governance",
        primary_domain: "Identity Governance",
        level: "Intermediate to Advanced",
        badge: "Compliance & Risk Leader",
        duration: "6 Weeks (Live Cohort)",
        description: "Architect enterprise access certification campaigns, enforce Segregation of Duties (SoD) policies, and automate JML lifecycle workflows with SailPoint IdentityIQ and IdentityNow (ISC).",
        key_topics: [
            "Identity Lifecycle Modeling (Joiner, Mover, Leaver)",
            "Automated Access Certification & Attestation Campaigns",
            "Segregation of Duties (SoD) & Toxic Combinations",
            "Authoritative Source Aggregation & Target Reconciliation"
        ],
        booking_url: "https://courses.cyberxdelta.com/learn/SailPoint-Identity-IQ",
        rating: 4.93,
        students_enrolled: 1820
    },
    {
        id: "c-pam-05",
        title: "CyberArk PAM Enterprise Masterclass",
        slug: "cyberark-pam-masterclass",
        primary_domain: "PAM / CyberArk",
        level: "Intermediate to Advanced",
        badge: "High Demand Specialization",
        duration: "6 Weeks (Live Labs + Certification)",
        description: "Master CyberArk Enterprise Password Vault (EPV), Central Policy Manager (CPM), Privileged Session Manager (PSM), and session isolation. Complete hands-on labs on credential rotation and disaster recovery.",
        key_topics: [
            "CyberArk EPV Vault & Core Component Architecture",
            "Automatic Credential Rotation (CPM) & Discovery",
            "Privileged Session Monitoring (PSM) & Keystroke Auditing",
            "Dual-Control Approvals & Disaster Recovery Clustering"
        ],
        booking_url: "https://courses.cyberxdelta.com/learn/CyberArk-PAM",
        rating: 4.97,
        students_enrolled: 1980
    },
    {
        id: "c-arch-06",
        title: "ISS Identity Architect (3 IAM Products)",
        slug: "iam-architect-specialist",
        primary_domain: "IAM Fundamentals",
        level: "Advanced / Architect",
        badge: "Flagship Executive Program",
        duration: "8 Weeks (Design Cohort)",
        description: "Comprehensive architect track covering converged IAM design across Access Management, Identity Governance, and PAM. Learn enterprise system design, disaster recovery, zero-trust blueprints, and multi-vendor integrations.",
        key_topics: [
            "Converged IAM Architecture & Solution Design",
            "Multi-IdP High Availability & Geo-Redundant Federation",
            "Regulatory Compliance Frameworks (SOX, HIPAA, GDPR)",
            "PAM & IGA Integration Patterns"
        ],
        booking_url: "https://courses.cyberxdelta.com/learn/CXD--IAM-ARCHITECT",
        rating: 4.98,
        students_enrolled: 1450
    }
];

export const QUESTIONS = [
    // --- BEGINNER (Fresher) - 10 Questions ---
    {
        id: "q-iam-1-beg",
        domain: "IAM Fundamentals",
        difficulty: "Beginner",
        question: "What is the primary objective of implementing the Principle of Least Privilege (PoLP) in an enterprise IAM architecture?",
        options: [
            "Granting users full administrative rights by default to minimize IT helpdesk tickets",
            "Restricting identities to only the absolute minimum permissions necessary to perform authorized duties",
            "Disabling Multi-Factor Authentication for internal trusted subnets",
            "Storing all administrative credentials in a single unencrypted file"
        ],
        correct_answer: 1,
        explanation: "The Principle of Least Privilege (PoLP) restricts access permissions strictly to what is required for a role, drastically shrinking attack surface and blast radius."
    },
    {
        id: "q-iam-2-beg",
        domain: "IAM Fundamentals",
        difficulty: "Beginner",
        question: "Why is Multi-Factor Authentication (MFA) vastly superior to traditional single-factor passwords?",
        options: [
            "It combines two or more independent factors (knowledge, possession, inherence), preventing breaches even if passwords are leaked",
            "It permanently removes the need for passwords and secret keys",
            "It increases network throughput and server memory",
            "It eliminates the requirement for Identity Governance audits"
        ],
        correct_answer: 0,
        explanation: "MFA requires proof across multiple orthogonal categories (something you know, have, or are), rendering stolen passwords alone useless to attackers."
    },
    {
        id: "q-sso-1-beg",
        domain: "Access Management / SSO",
        difficulty: "Beginner",
        question: "What is the main benefit of implementing Single Sign-On (SSO) for employees?",
        options: [
            "It forces users to create more complex passwords",
            "It eliminates the need for any form of authentication",
            "It allows users to log in once and access multiple applications without repeatedly entering credentials",
            "It prevents users from accessing the corporate network remotely"
        ],
        correct_answer: 2,
        explanation: "SSO improves user experience and security by reducing password fatigue and centralized access control across multiple applications."
    },
    {
        id: "q-iga-1-beg",
        domain: "Identity Governance",
        difficulty: "Beginner",
        question: "What does the 'Joiner' phase refer to in the Joiner, Mover, Leaver (JML) lifecycle?",
        options: [
            "When an employee transfers to a new department",
            "The onboarding process when a new user is hired and granted initial access",
            "When a user leaves the company and their access is revoked",
            "The process of joining a server to a domain"
        ],
        correct_answer: 1,
        explanation: "The Joiner phase is the initial onboarding where accounts and entitlements are provisioned based on the new hire's role."
    },
    {
        id: "q-iam-3-beg",
        domain: "IAM Fundamentals",
        difficulty: "Beginner",
        question: "Which of the following best describes Role-Based Access Control (RBAC)?",
        options: [
            "Access is granted based on the user's IP address only",
            "Access is determined by the specific job function or role assigned to the user within the organization",
            "Every user receives the exact same level of access to all systems",
            "Access is granted by the system administrator individually for every single file"
        ],
        correct_answer: 1,
        explanation: "RBAC simplifies administration by assigning permissions to roles, and then users to those roles, rather than managing permissions user-by-user."
    },
    {
        id: "q-pam-1-beg",
        domain: "PAM / CyberArk",
        difficulty: "Beginner",
        question: "What is a 'Privileged Account' in the context of IT security?",
        options: [
            "An account used by customers to purchase products",
            "A standard employee email account",
            "An account that has elevated permissions, such as a local administrator, domain admin, or root account",
            "A temporary guest Wi-Fi account"
        ],
        correct_answer: 2,
        explanation: "Privileged accounts have elevated rights that can change system configurations or access sensitive data, making them prime targets for attackers."
    },
    {
        id: "q-sso-2-beg",
        domain: "Access Management / SSO",
        difficulty: "Beginner",
        question: "What does 'SAML' stand for in identity federation?",
        options: [
            "System Access Management Layer",
            "Security Assertion Markup Language",
            "Simple Authentication Modeling Logic",
            "Secure Authorization Management Link"
        ],
        correct_answer: 1,
        explanation: "SAML (Security Assertion Markup Language) is an open standard that allows identity providers (IdP) to pass authorization credentials to service providers (SP)."
    },
    {
        id: "q-iga-2-beg",
        domain: "Identity Governance",
        difficulty: "Beginner",
        question: "Why is the 'Leaver' process in the identity lifecycle critically important for security?",
        options: [
            "It ensures the employee receives their final paycheck",
            "It automatically orders a replacement laptop",
            "It immediately revokes all system access when an employee departs, preventing unauthorized access by former employees",
            "It backs up the user's hard drive to the cloud"
        ],
        correct_answer: 2,
        explanation: "Failing to immediately revoke access for departing employees leaves 'orphan accounts' that are highly vulnerable to malicious exploitation."
    },
    {
        id: "q-iam-4-beg",
        domain: "IAM Fundamentals",
        difficulty: "Beginner",
        question: "What is the primary function of a Directory Service like Microsoft Active Directory?",
        options: [
            "To filter spam emails",
            "To provide a centralized database that stores and manages information about network resources, users, and groups",
            "To act as a web server for external customers",
            "To scan endpoints for malware"
        ],
        correct_answer: 1,
        explanation: "A Directory Service is the central repository of identity data used to authenticate and authorize users within an enterprise network."
    },
    {
        id: "q-pam-2-beg",
        domain: "PAM / CyberArk",
        difficulty: "Beginner",
        question: "Why should IT administrators avoid using shared 'Administrator' or 'root' accounts without a PAM solution?",
        options: [
            "It makes passwords too easy to remember",
            "Shared accounts prevent individual accountability, making it impossible to audit who performed a specific action",
            "It consumes too much bandwidth on the network",
            "Shared accounts automatically delete files after 30 days"
        ],
        correct_answer: 1,
        explanation: "Without a PAM solution to vault and broker access, shared accounts lack non-repudiation; you cannot trace an action back to a specific human user."
    },

    // --- INTERMEDIATE (Analyst/Engineer) - 10 Questions ---
    {
        id: "q-iam-3-int",
        domain: "IAM Fundamentals",
        difficulty: "Intermediate",
        question: "Which description best defines the 'Joiner, Mover, Leaver' (JML) identity lifecycle framework?",
        options: [
            "Automated provisioning upon hiring (Joiner), entitlement adjustments on transfer (Mover), and immediate revocation upon exit (Leaver)",
            "Manual user creation in Active Directory with periodic manual reviews",
            "A network routing protocol for load balancing identity requests",
            "A database backup protocol for user directories"
        ],
        correct_answer: 0,
        explanation: "JML is the core identity lifecycle model ensuring accurate onboarding, lateral role transition adjustments, and timely deprovisioning upon employee exit."
    },
    {
        id: "q-sso-1-int",
        domain: "Access Management / SSO",
        difficulty: "Intermediate",
        question: "In SAML 2.0 federated Single Sign-On (e.g., PingFederate, Okta), what role does the Identity Provider (IdP) perform?",
        options: [
            "Authenticating user credentials, evaluating access policies, and issuing cryptographically signed XML assertions to the Service Provider",
            "Hosting and running the backend database of all external web applications",
            "Replacing all SSL/TLS encryption certificates on client devices",
            "Managing physical data center server hardware"
        ],
        correct_answer: 0,
        explanation: "In SAML 2.0, the IdP authenticates the user, verifies policies/MFA, and issues signed SAML assertions containing user identity attributes to relying Service Providers."
    },
    {
        id: "q-iga-1-int",
        domain: "Identity Governance",
        difficulty: "Intermediate",
        question: "What is the primary operational objective of conducting regular Access Certification (Attestation) campaigns in SailPoint IdentityIQ / IdentityNow?",
        options: [
            "Periodically requiring managers to review and recertify accumulated user entitlements to prevent privilege creep and ensure compliance",
            "Re-indexing database tables to improve LDAP query speeds",
            "Updating the user interface theme for enterprise employees",
            "Generating automated monthly payroll statements"
        ],
        correct_answer: 0,
        explanation: "Access certifications require line managers and resource owners to formally attest that users still require their assigned permissions, preventing privilege creep."
    },
    {
        id: "q-pam-1-int",
        domain: "PAM / CyberArk",
        difficulty: "Intermediate",
        question: "What key security risk is solved by implementing CyberArk Enterprise Password Vault (EPV) and Central Policy Manager (CPM)?",
        options: [
            "Privileged credential sprawl, hardcoded admin secrets, and unrotated domain admin passwords vulnerable to Pass-the-Hash and lateral movement",
            "Network latency on public website content delivery networks",
            "Email spam filtering false positives",
            "High CPU utilization in local virtual machines"
        ],
        correct_answer: 0,
        explanation: "CyberArk EPV and CPM centralize, encrypt, and automatically rotate privileged account credentials (root, domain admin, service accounts), stopping lateral attacker movement."
    },
    {
        id: "q-iam-4-int",
        domain: "IAM Fundamentals",
        difficulty: "Intermediate",
        question: "How does Attribute-Based Access Control (ABAC) differ fundamentally from Role-Based Access Control (RBAC)?",
        options: [
            "ABAC is only used for physical door access, while RBAC is used for IT systems",
            "ABAC evaluates dynamic policies based on user, resource, and environmental attributes (like time or location), whereas RBAC relies on static group memberships",
            "ABAC requires users to create their own permissions",
            "There is no difference; they are two terms for the same concept"
        ],
        correct_answer: 1,
        explanation: "ABAC provides fine-grained, dynamic authorization by evaluating context (who, what, when, where), overcoming the 'role explosion' problem inherent to static RBAC."
    },
    {
        id: "q-sso-2-int",
        domain: "Access Management / SSO",
        difficulty: "Intermediate",
        question: "In the OAuth 2.0 Authorization Code flow, what is the purpose of exchanging the Authorization Code for an Access Token at the Token Endpoint?",
        options: [
            "To ensure the Access Token is delivered directly via the secure back-channel rather than being exposed in the user's browser redirect URI",
            "To encrypt the user's password before storing it in the database",
            "To prompt the user for Multi-Factor Authentication",
            "To format the token as XML instead of JSON"
        ],
        correct_answer: 0,
        explanation: "The Authorization Code is a temporary, single-use credential sent to the browser. Exchanging it server-to-server prevents the highly sensitive Access Token from being exposed to the client-side browser history or malicious scripts."
    },
    {
        id: "q-iga-2-int",
        domain: "Identity Governance",
        difficulty: "Intermediate",
        question: "What is an 'Authoritative Source' in the context of an Identity Governance solution (like SailPoint)?",
        options: [
            "The primary database where all application passwords are encrypted",
            "A trusted system of record, such as an HR application (e.g., Workday), that acts as the single source of truth for user identities and lifecycle events",
            "The root certificate authority that issues SSL certificates",
            "A third-party auditor who signs off on compliance reports"
        ],
        correct_answer: 1,
        explanation: "IGA platforms sync identities from Authoritative Sources (usually HR systems) to detect new hires, terminations, and role changes, triggering automated lifecycle workflows."
    },
    {
        id: "q-pam-2-int",
        domain: "PAM / CyberArk",
        difficulty: "Intermediate",
        question: "What is the primary function of CyberArk's Privileged Session Manager (PSM)?",
        options: [
            "To change passwords on target endpoints",
            "To provide a secure, proxy-based connection to target systems that records all keystrokes and video without exposing the raw credentials to the end user",
            "To scan the network for unmanaged local administrator accounts",
            "To serve as a web application firewall for internal portals"
        ],
        correct_answer: 1,
        explanation: "PSM acts as a jump server that isolates the user from the target system. It injects the vaulted credentials automatically and provides complete session auditing."
    },
    {
        id: "q-sso-3-int",
        domain: "Access Management / SSO",
        difficulty: "Intermediate",
        question: "What is the primary purpose of the SCIM (System for Cross-domain Identity Management) protocol?",
        options: [
            "To securely hash user passwords for storage in SQL databases",
            "To standardize and automate the provisioning and deprovisioning of user identities across different IT systems and cloud applications",
            "To establish a secure VPN tunnel between two corporate networks",
            "To replace SAML as the primary protocol for Single Sign-On"
        ],
        correct_answer: 1,
        explanation: "SCIM is an open API standard that simplifies user lifecycle management (CRUD operations) across cloud applications, eliminating the need for custom provisioning scripts."
    },
    {
        id: "q-iam-5-int",
        domain: "IAM Fundamentals",
        difficulty: "Intermediate",
        question: "In Microsoft Entra ID (Azure AD), what is the function of 'Conditional Access' policies?",
        options: [
            "To enforce access controls based on real-time signals like user location, device compliance status, and risk level before granting access to an application",
            "To automatically format email addresses for new employees based on conditional logic",
            "To restrict the times of day when servers can download Windows updates",
            "To sync passwords from on-premises Active Directory to the cloud"
        ],
        correct_answer: 0,
        explanation: "Conditional Access is the Zero Trust policy engine in Entra ID that dynamically evaluates signals to allow, block, or require step-up authentication (MFA) for access requests."
    },

    // --- ADVANCED (Senior/Architect) - 10 Questions ---
    {
        id: "q-sso-3-adv",
        domain: "Access Management / SSO",
        difficulty: "Advanced",
        question: "Why is the PKCE (Proof Key for Code Exchange) extension recommended for OAuth 2.0 Authorization Code flows in Single Page Apps and Mobile Apps?",
        options: [
            "It dynamically verifies a code verifier against a code challenge to prevent authorization code interception attacks on public clients without client secrets",
            "It speeds up network socket connections between client and server",
            "It encrypts all DNS lookups performed by the mobile browser",
            "It allows users to bypass multi-factor authentication"
        ],
        correct_answer: 0,
        explanation: "PKCE protects public clients (which cannot securely store static client secrets) by using dynamic cryptographic code verifiers, preventing authorization code interception."
    },
    {
        id: "q-pam-2-adv",
        domain: "PAM / CyberArk",
        difficulty: "Advanced",
        question: "How does CyberArk Privileged Session Manager (PSM) safeguard privileged sessions without exposing credentials to human administrators?",
        options: [
            "It proxies the connection (RDP/SSH), injects the vaulted credentials automatically without revealing the password, and records video/keystrokes for audit",
            "It emails cleartext passwords to administrators on-demand",
            "It replaces all SSH keys with standard 4-digit PIN numbers",
            "It disables session logging to save server disk storage"
        ],
        correct_answer: 0,
        explanation: "CyberArk PSM acts as an isolated bastion proxy, transparently injecting vaulted credentials so administrators never view passwords, while recording all session keystrokes and video."
    },
    {
        id: "q-iga-2-adv",
        domain: "Identity Governance",
        difficulty: "Advanced",
        question: "How does a Segregation of Duties (SoD) policy in Identity Governance protect enterprise systems?",
        options: [
            "By identifying and preventing toxic permission combinations (e.g., creating purchase orders and approving vendor payouts) from being assigned to a single identity",
            "By requiring every employee to share a single root account",
            "By disabling role-based access control across all applications",
            "By forcing daily password resets on every endpoint"
        ],
        correct_answer: 0,
        explanation: "Segregation of Duties (SoD) prevents fraud and critical errors by ensuring no single user holds conflicting permissions that could allow unmonitored financial or administrative abuse."
    },
    {
        id: "q-iam-4-adv",
        domain: "IAM Fundamentals",
        difficulty: "Advanced",
        question: "In a Zero Trust Architecture, what is the primary role of a Policy Decision Point (PDP)?",
        options: [
            "To act as a firewall blocking incoming port traffic",
            "To evaluate contextual attributes (user identity, device posture, location) and calculate a trust score before granting access to a resource",
            "To store unencrypted passwords in a centralized relational database",
            "To provide a physical hardware token for multi-factor authentication"
        ],
        correct_answer: 1,
        explanation: "The PDP is the intelligent engine in Zero Trust that dynamically evaluates signals (identity, device, risk) against policies to grant, deny, or step-up access in real-time."
    },
    {
        id: "q-sso-4-adv",
        domain: "Access Management / SSO",
        difficulty: "Advanced",
        question: "When architecting a highly available Identity Provider (IdP) cluster across multiple geographic regions, what is the most critical challenge regarding state management?",
        options: [
            "Ensuring that the CSS and images for the login page load quickly",
            "Managing session replication and token revocation latency to prevent race conditions and token replay attacks during failover",
            "Assigning the correct DNS names to the load balancers",
            "Generating enough SSL certificates for all nodes"
        ],
        correct_answer: 1,
        explanation: "In distributed IdP architectures, session state and revocation lists must be rapidly replicated across nodes. If a token is revoked in one region, the delay in syncing to another region creates a window for token replay attacks."
    },
    {
        id: "q-iga-3-adv",
        domain: "Identity Governance",
        difficulty: "Advanced",
        question: "In advanced IGA deployments, what is 'Role Mining' and why is it complex?",
        options: [
            "Using analytics and machine learning to analyze existing user entitlements to discover patterns and define optimal business roles, which is complex due to historical privilege creep",
            "Physically extracting data from legacy mainframe hard drives",
            "A process of negotiating licensing costs with IAM vendors",
            "Manually deleting old inactive accounts from Active Directory"
        ],
        correct_answer: 0,
        explanation: "Role mining analyzes vast entitlement datasets to build a 'bottom-up' RBAC model. It is mathematically complex and often hindered by years of organic privilege creep and non-standard access patterns."
    },
    {
        id: "q-pam-3-adv",
        domain: "PAM / CyberArk",
        difficulty: "Advanced",
        question: "What is 'Just-In-Time' (JIT) privileged access provisioning?",
        options: [
            "Delivering passwords via SMS right before they are typed",
            "Creating or elevating a temporary privileged account exactly when needed for a specific task, and automatically revoking the privileges or destroying the account immediately after",
            "Updating the PAM software patches during business hours",
            "Requiring managers to approve all access requests within 60 seconds"
        ],
        correct_answer: 1,
        explanation: "JIT access eliminates standing privileges (accounts that have administrative rights 24/7). By granting access dynamically for a limited time window, the attack surface is dramatically reduced."
    },
    {
        id: "q-iam-5-adv",
        domain: "IAM Fundamentals",
        difficulty: "Advanced",
        question: "Which of the following describes the difference between OIDC 'Authorization Code Flow' and 'Implicit Flow', and why is Implicit Flow deprecated for SPAs?",
        options: [
            "Authorization Code uses XML, Implicit uses JSON",
            "Implicit Flow returns the Access Token directly in the URI fragment, exposing it to browser history and XSS. Authorization Code uses a secure server-to-server POST exchange to retrieve the token.",
            "Implicit Flow requires hardware MFA tokens, while Authorization Code does not",
            "There is no difference; they are just different names for the same specification"
        ],
        correct_answer: 1,
        explanation: "The Implicit Flow exposed tokens directly in the URL hash, making it vulnerable to leakage. Modern best practices dictate using the Authorization Code Flow with PKCE, even for Single Page Applications."
    },
    {
        id: "q-iga-4-adv",
        domain: "Identity Governance",
        difficulty: "Advanced",
        question: "How does a 'Target Reconciliation' process handle closed-loop provisioning in an IGA platform?",
        options: [
            "It scans target systems (e.g., AD, databases) and compares their actual permissions against the IGA's approved model, alerting on or reverting any out-of-band 'rogue' access changes",
            "It forces users to change their passwords across all target systems simultaneously",
            "It automatically patches vulnerabilities on target servers",
            "It synchronizes the system clocks across the network"
        ],
        correct_answer: 0,
        explanation: "Reconciliation acts as a detective control. If an admin manually grants access directly in Active Directory (bypassing the IGA tool), reconciliation detects this 'rogue access' and can automatically remove it to maintain the approved state."
    },
    {
        id: "q-sso-5-adv",
        domain: "Access Management / SSO",
        difficulty: "Advanced",
        question: "In the context of API Security and OAuth 2.0, what is a 'Phantom Token' approach?",
        options: [
            "An approach where API Gateways accept opaque reference tokens from external clients and exchange them internally for signed JWTs before forwarding to backend microservices",
            "A token that automatically deletes itself if the user moves their mouse",
            "A cryptographic key that only exists in RAM and is never written to disk",
            "A method of bypassing token validation during high traffic periods"
        ],
        correct_answer: 0,
        explanation: "The Phantom Token pattern ensures that sensitive JWTs containing user claims are not exposed to public clients. The client uses an opaque token, and the API gateway performs introspection to convert it to a JWT for internal microservices."
    }
];

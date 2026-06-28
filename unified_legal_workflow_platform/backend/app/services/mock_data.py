"""Seed realistic demo data for the CaseFlow MCP platform."""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.matter import Matter, Client, MatterStatus, MatterType
from ..models.communication import Communication, SourceType, LegalCategory, UrgencyLevel
from ..models.task import Task, Deadline, TaskStatus, TaskPriority, DeadlineStatus
from ..models.timeline import TimelineEvent, EventType
from ..models.knowledge import KnowledgeItem, KnowledgeSourceType
from ..models.user import User, UserRole
import uuid


def seed_demo_data(db: Session):
    """Seed the database with realistic demo data if empty."""
    if db.query(User).count() > 0:
        return

    # Users
    users = [
        User(id=str(uuid.uuid4()), email="sarah.chen@lawfirm.com", full_name="Sarah Chen",
             role=UserRole.ATTORNEY, practice_areas=["litigation", "commercial_dispute"]),
        User(id=str(uuid.uuid4()), email="marcus.johnson@lawfirm.com", full_name="Marcus Johnson",
             role=UserRole.PARALEGAL, practice_areas=["corporate", "employment"]),
        User(id=str(uuid.uuid4()), email="admin@lawfirm.com", full_name="Admin User",
             role=UserRole.ADMIN, practice_areas=[]),
    ]
    for u in users:
        db.add(u)

    # Clients
    acme = Client(id=str(uuid.uuid4()), name="ACME Corporation", email="legal@acme.com",
                  organization="ACME Corporation", phone="+1-555-0100")
    techstart = Client(id=str(uuid.uuid4()), name="TechStart Inc.", email="cto@techstart.io",
                       organization="TechStart Inc.")
    globalhr = Client(id=str(uuid.uuid4()), name="GlobalHR Solutions", email="counsel@globalhr.com",
                      organization="GlobalHR Solutions")
    db.add_all([acme, techstart, globalhr])
    db.flush()

    # Matter 1: Commercial Dispute - ACME
    m1_id = str(uuid.uuid4())
    m1 = Matter(
        id=m1_id, title="ACME Corp v. Vendor Breach of Contract",
        matter_number="LIT-2026-001", client_id=acme.id,
        status=MatterStatus.ACTIVE, matter_type=MatterType.LITIGATION,
        description="Commercial dispute regarding breach of supply agreement. Vendor failed to deliver components per contract terms, causing production delays.",
        assigned_to="Sarah Chen",
        tags=["breach", "contract", "commercial", "priority"],
    )
    db.add(m1)

    # Matter 2: Employment - GlobalHR
    m2_id = str(uuid.uuid4())
    m2 = Matter(
        id=m2_id, title="GlobalHR - Employee Discrimination Claim",
        matter_number="EMP-2026-004", client_id=globalhr.id,
        status=MatterStatus.ACTIVE, matter_type=MatterType.EMPLOYMENT,
        description="Former employee discrimination claim under Title VII. EEOC complaint filed.",
        assigned_to="Sarah Chen",
        tags=["employment", "discrimination", "EEOC"],
    )
    db.add(m2)

    # Matter 3: IP - TechStart
    m3_id = str(uuid.uuid4())
    m3 = Matter(
        id=m3_id, title="TechStart - Patent Portfolio Review",
        matter_number="IP-2026-007", client_id=techstart.id,
        status=MatterStatus.OPEN, matter_type=MatterType.IP,
        description="Review and prosecution of 3 patent applications for AI-based inventory management system.",
        assigned_to="Marcus Johnson",
        tags=["patent", "IP", "technology"],
    )
    db.add(m3)
    db.flush()

    now = datetime.utcnow()

    # Communications for Matter 1
    comm1 = Communication(
        id=str(uuid.uuid4()), matter_id=m1_id,
        source_type=SourceType.OUTLOOK,
        subject="URGENT: Breach of Supply Agreement - Demand Letter",
        body="""Dear Legal Team,

I am writing to formally notify you of a material breach of our Supply Agreement dated January 15, 2026 with VendorCo Industries.

Per Section 4.2 of the Agreement, VendorCo was obligated to deliver 50,000 units of Component X-400 by March 31, 2026. As of today, June 20, 2026, we have received only 12,000 units, representing a 76% shortfall.

This breach has resulted in:
1. Production line shutdown costing $2.3M per week
2. Breach of our own delivery obligations to downstream customers
3. Emergency procurement costs of approximately $890,000

We require full delivery by July 15, 2026 or we will pursue all available legal remedies including damages of approximately $8.5M.

Please advise on filing a preliminary injunction. Our response deadline to their counter-notice is July 1, 2026.

Best regards,
Michael Torres
VP Operations, ACME Corp""",
        sender="michael.torres@acme.com",
        recipients=["sarah.chen@lawfirm.com"],
        received_at=now - timedelta(days=4),
        category=LegalCategory.COMMERCIAL_DISPUTE,
        urgency=UrgencyLevel.CRITICAL,
        summary="ACME Corp reports VendorCo breached supply agreement by delivering only 12,000 of 50,000 contracted units. $8.5M damages claim. Preliminary injunction being considered. Response deadline July 1, 2026.",
        key_facts=["VendorCo delivered 12,000 of 50,000 contracted units", "Agreement dated January 15, 2026", "Production shutdown costing $2.3M/week", "Response deadline is July 1, 2026"],
        action_items=["Assess preliminary injunction filing", "Review Supply Agreement Section 4.2", "Calculate full damages"],
        owner_recommendation="Senior Litigation Partner",
        is_processed=True, is_triaged=True,
        extracted_entities={"deadlines": [{"date": "2026-07-01", "description": "Response to counter-notice", "source_text": "Our response deadline to their counter-notice is July 1, 2026"}]},
    )
    db.add(comm1)

    comm2 = Communication(
        id=str(uuid.uuid4()), matter_id=m1_id,
        source_type=SourceType.TEAMS,
        subject="Teams: Call notes - ACME breach strategy",
        body="""Meeting Notes - June 22, 2026
Attendees: Sarah Chen, Michael Torres (ACME), James Park (ACME GC)

Discussion:
- Confirmed VendorCo has 30-day cure period expiring June 30
- Decided to send formal demand letter today
- Emergency injunction to be filed if no delivery by June 30
- Sarah to review force majeure clause - vendor claims supply chain issues
- Need to gather all delivery records from ACME logistics team
- James confirmed cyber insurance may cover business interruption losses
- Next call: June 28, 2026 to review filing decision""",
        sender="sarah.chen@lawfirm.com",
        recipients=["marcus.johnson@lawfirm.com"],
        received_at=now - timedelta(days=2),
        category=LegalCategory.LITIGATION_SUPPORT,
        urgency=UrgencyLevel.HIGH,
        summary="Strategy call confirmed: 30-day cure period expires June 30. Emergency injunction to be filed if VendorCo fails to deliver. Force majeure clause needs review.",
        key_facts=["Cure period expires June 30, 2026", "Injunction filing decision by June 30", "Force majeure defense possible"],
        action_items=["Review force majeure clause", "Gather delivery records", "Schedule June 28 follow-up call"],
        is_processed=True, is_triaged=True,
        extracted_entities={"deadlines": [{"date": "2026-06-30", "description": "Cure period expiration / injunction filing decision"}]},
    )
    db.add(comm2)

    # Communications for Matter 2
    comm3 = Communication(
        id=str(uuid.uuid4()), matter_id=m2_id,
        source_type=SourceType.GMAIL,
        subject="EEOC Charge - Forwarding Notice - Response Required",
        body="""Ms. Chen,

Attached please find the EEOC Charge of Discrimination filed by former employee David Kim (Charge No. 440-2026-05821) against GlobalHR Solutions.

Key facts:
- Charge filed May 15, 2026
- Alleges discrimination based on national origin under Title VII
- David Kim was terminated April 2, 2026 after 3 years of employment
- EEOC has requested Position Statement due August 15, 2026
- Mediation offered - deadline to accept by July 10, 2026

Please review the attached charge and advise GlobalHR on response strategy. HR records including performance reviews are available upon request.

Regards,
Patricia Wong
HR Director, GlobalHR Solutions""",
        sender="patricia.wong@globalhr.com",
        recipients=["sarah.chen@lawfirm.com"],
        received_at=now - timedelta(days=7),
        category=LegalCategory.EMPLOYMENT,
        urgency=UrgencyLevel.HIGH,
        summary="EEOC discrimination charge filed against GlobalHR. Position Statement due August 15, 2026. Mediation offer deadline July 10, 2026. Former employee claims national origin discrimination.",
        key_facts=["EEOC Charge No. 440-2026-05821 filed May 15, 2026", "Position Statement due August 15, 2026", "Mediation deadline July 10, 2026", "Employee terminated April 2, 2026"],
        action_items=["Advise on EEOC response strategy", "Review HR records", "Evaluate mediation offer"],
        is_processed=True, is_triaged=True,
        extracted_entities={"deadlines": [
            {"date": "2026-07-10", "description": "Mediation offer acceptance deadline"},
            {"date": "2026-08-15", "description": "EEOC Position Statement due"}
        ]},
    )
    db.add(comm3)

    # Slack intake - unassigned
    comm4 = Communication(
        id=str(uuid.uuid4()),
        source_type=SourceType.SLACK,
        subject="Slack: #legal-intake - NDA review request",
        body="""Hey legal team! 👋

Quick question from the sales team. We're about to close a big deal with DataFlow Analytics and they sent us their standard NDA.

Main concerns:
- Perpetual confidentiality (we usually ask for 3 years)
- Very broad definition of "confidential information" - seems to cover everything
- Non-compete clause in section 8 that could affect future customers
- Governing law is Delaware but we operate in CA

Can someone take a look? The deal is supposed to close by end of next week (July 4).

I've attached the NDA PDF.

- Alex from Sales""",
        sender="alex.rivera@company.com",
        recipients=["#legal-intake"],
        received_at=now - timedelta(hours=3),
        category=LegalCategory.CONTRACT_REVIEW,
        urgency=UrgencyLevel.MEDIUM,
        summary="Sales team requesting NDA review for DataFlow Analytics deal. Concerns: perpetual confidentiality, broad definitions, non-compete clause, CA/DE governing law conflict. Deal closing July 4.",
        key_facts=["NDA from DataFlow Analytics", "Deal close deadline July 4", "Perpetual confidentiality vs standard 3-year term"],
        action_items=["Review NDA for problematic clauses", "Advise on non-compete clause", "Respond to Sales team"],
        is_processed=True, is_triaged=False,
    )
    db.add(comm4)

    db.flush()

    # Tasks
    tasks = [
        Task(id=str(uuid.uuid4()), matter_id=m1_id, communication_id=comm1.id,
             title="Review force majeure clause in VendorCo Supply Agreement",
             description="Analyze Section 12 (Force Majeure) to assess vendor's supply chain defense viability",
             assigned_to="Sarah Chen", status=TaskStatus.IN_PROGRESS,
             priority=TaskPriority.CRITICAL, due_date=now + timedelta(days=3),
             source_snippet="vendor claims supply chain issues"),
        Task(id=str(uuid.uuid4()), matter_id=m1_id,
             title="Gather delivery records from ACME logistics team",
             assigned_to="Marcus Johnson", status=TaskStatus.PENDING,
             priority=TaskPriority.HIGH, due_date=now + timedelta(days=4)),
        Task(id=str(uuid.uuid4()), matter_id=m1_id,
             title="Draft emergency injunction motion",
             assigned_to="Sarah Chen", status=TaskStatus.PENDING,
             priority=TaskPriority.CRITICAL, due_date=now + timedelta(days=6)),
        Task(id=str(uuid.uuid4()), matter_id=m2_id, communication_id=comm3.id,
             title="Prepare EEOC Position Statement",
             description="Draft comprehensive response to Charge No. 440-2026-05821 addressing all discrimination claims",
             assigned_to="Sarah Chen", status=TaskStatus.PENDING,
             priority=TaskPriority.HIGH, due_date=now + timedelta(days=52)),
        Task(id=str(uuid.uuid4()), matter_id=m2_id,
             title="Evaluate EEOC mediation offer",
             assigned_to="Sarah Chen", status=TaskStatus.PENDING,
             priority=TaskPriority.HIGH, due_date=now + timedelta(days=16)),
        Task(id=str(uuid.uuid4()), matter_id=m3_id,
             title="Review patent application claims - Application 1",
             assigned_to="Marcus Johnson", status=TaskStatus.IN_PROGRESS,
             priority=TaskPriority.MEDIUM, due_date=now + timedelta(days=14)),
    ]
    for t in tasks:
        db.add(t)

    # Deadlines
    deadlines = [
        Deadline(id=str(uuid.uuid4()), matter_id=m1_id, communication_id=comm1.id,
                 title="Response to VendorCo counter-notice",
                 deadline_date=now + timedelta(days=7),
                 deadline_type="response", status=DeadlineStatus.CONFIRMED,
                 source_snippet="Our response deadline to their counter-notice is July 1, 2026"),
        Deadline(id=str(uuid.uuid4()), matter_id=m1_id, communication_id=comm2.id,
                 title="Cure period expiration / Injunction filing decision",
                 deadline_date=now + timedelta(days=6),
                 deadline_type="filing", status=DeadlineStatus.CONFIRMED,
                 source_snippet="30-day cure period expiring June 30"),
        Deadline(id=str(uuid.uuid4()), matter_id=m2_id, communication_id=comm3.id,
                 title="EEOC Mediation offer deadline",
                 deadline_date=now + timedelta(days=16),
                 deadline_type="response", status=DeadlineStatus.SUGGESTED,
                 source_snippet="Mediation offered - deadline to accept by July 10, 2026"),
        Deadline(id=str(uuid.uuid4()), matter_id=m2_id, communication_id=comm3.id,
                 title="EEOC Position Statement due",
                 deadline_date=now + timedelta(days=52),
                 deadline_type="filing", status=DeadlineStatus.CONFIRMED,
                 source_snippet="EEOC has requested Position Statement due August 15, 2026"),
    ]
    for d in deadlines:
        db.add(d)

    # Timeline events
    events = [
        TimelineEvent(id=str(uuid.uuid4()), matter_id=m1_id,
                      event_date=datetime(2026, 1, 15), event_type=EventType.CONTRACT_SIGNED,
                      title="Supply Agreement signed with VendorCo",
                      summary="50,000 unit supply agreement executed, delivery due March 31, 2026",
                      source_references=[{"type": "email", "id": comm1.id, "description": "Referenced in breach notice"}],
                      associated_contacts=["VendorCo Industries", "ACME Corporation"],
                      is_confirmed="true"),
        TimelineEvent(id=str(uuid.uuid4()), matter_id=m1_id,
                      event_date=datetime(2026, 3, 31), event_type=EventType.DEADLINE,
                      title="Contract delivery deadline missed",
                      summary="VendorCo failed to deliver 50,000 units by contractual deadline",
                      source_references=[{"type": "email", "id": comm1.id}],
                      is_confirmed="true"),
        TimelineEvent(id=str(uuid.uuid4()), matter_id=m1_id,
                      event_date=now - timedelta(days=4), event_type=EventType.COMMUNICATION,
                      title="Formal breach notice sent to VendorCo",
                      summary="ACME sent formal demand for delivery by July 15, 2026 with $8.5M damages claim",
                      source_references=[{"type": "email", "id": comm1.id, "description": "Breach demand letter"}],
                      associated_contacts=["Michael Torres", "VendorCo Industries"],
                      is_confirmed="true"),
        TimelineEvent(id=str(uuid.uuid4()), matter_id=m2_id,
                      event_date=datetime(2026, 4, 2), event_type=EventType.CLIENT_CONTACT,
                      title="David Kim terminated by GlobalHR",
                      summary="Employee David Kim terminated after 3 years of employment",
                      source_references=[{"type": "email", "id": comm3.id}],
                      is_confirmed="true"),
        TimelineEvent(id=str(uuid.uuid4()), matter_id=m2_id,
                      event_date=datetime(2026, 5, 15), event_type=EventType.FILING,
                      title="EEOC Charge filed by David Kim",
                      summary="Charge No. 440-2026-05821 filed alleging national origin discrimination under Title VII",
                      source_references=[{"type": "email", "id": comm3.id}],
                      associated_contacts=["David Kim"],
                      is_confirmed="true"),
    ]
    for e in events:
        db.add(e)

    # Knowledge items
    knowledge = [
        KnowledgeItem(id=str(uuid.uuid4()),
                      title="NDA Playbook - Standard Terms & Positions",
                      source_type=KnowledgeSourceType.PLAYBOOK,
                      content="""NDA Standard Positions:

CONFIDENTIALITY PERIOD:
- Standard: 3 years from disclosure
- Acceptable: up to 5 years for particularly sensitive IP
- Never accept: Perpetual confidentiality for business information

DEFINITION OF CONFIDENTIAL INFORMATION:
- Prefer: Specific categories + marked/identified requirement
- Flag: Overly broad definitions covering all information exchanged
- Require: Exclusions for public domain, independently developed, rightfully known

NON-COMPETE / NON-SOLICITATION:
- Our standard: 1 year non-solicitation of employees only
- Flag immediately: Any geographic non-compete for commercial NDAs
- Section 8 non-competes in vendor NDAs require senior review

GOVERNING LAW:
- Preferred: State of incorporation
- Acceptable: Mutual agreement on neutral state
- Note: CA governing law NDAs may trigger PIAA implications

RETURN/DESTRUCTION:
- Standard: 30-day return or destroy obligation upon request
- Include: Written certification of destruction""",
                      tags=["NDA", "contracts", "confidentiality", "playbook"],
                      practice_area="corporate", is_approved="true"),
        KnowledgeItem(id=str(uuid.uuid4()),
                      title="EEOC Response Best Practices",
                      source_type=KnowledgeSourceType.POLICY,
                      content="""EEOC Response Guidelines:

POSITION STATEMENT:
- Must be submitted within 30 days of EEOC request (extensible for good cause)
- Should include: factual narrative, relevant policies, comparator analysis
- Never admit liability in the position statement
- Include complete personnel file with redactions per EEOC guidance

MEDIATION:
- EEOC mediation is confidential and non-binding
- Success rate nationally approximately 42%
- Benefits: saves litigation costs, faster resolution
- Cons: may signal weakness; not appropriate for all cases
- Evaluate: strength of defense, claimant damages, PR risk

DOCUMENTATION TO PRESERVE:
- All communications involving claimant for past 3 years
- Performance reviews and disciplinary records
- All termination-related documents and approvals
- Comparator employee data (same supervisor/same time period)""",
                      tags=["EEOC", "employment", "discrimination", "Title VII"],
                      practice_area="employment", is_approved="true"),
        KnowledgeItem(id=str(uuid.uuid4()),
                      title="Force Majeure Clause Analysis Framework",
                      source_type=KnowledgeSourceType.PLAYBOOK,
                      content="""Force Majeure Defense Assessment:

TRIGGERING CONDITIONS:
- Must be: unforeseeable event beyond party's control
- Supply chain disruptions: generally NOT force majeure unless caused by natural disaster/government action
- COVID-era cases: mixed results; standard supply chain disruption usually insufficient
- Key question: Was the event foreseeable at time of contracting?

NOTICE REQUIREMENTS:
- Most contracts require prompt notice (often 5-10 days)
- Failure to provide notice waives force majeure defense
- Check: was proper notice given by VendorCo?

MITIGATION OBLIGATION:
- Party claiming FM must take reasonable steps to mitigate
- Emergency procurement at higher prices = mitigation obligation on breaching party
- Document all attempts to source alternatives

CASE LAW NOTE:
- 2023: Courts have largely rejected general supply chain delays as FM
- Exception: direct government procurement orders or factory destruction
- Standard: "something beyond the reasonable control" - supply constraints rarely qualify""",
                      tags=["force majeure", "contract", "breach", "litigation"],
                      practice_area="litigation", is_approved="true"),
    ]
    for k in knowledge:
        db.add(k)

    db.commit()
    print("Demo data seeded successfully.")


class MockDataService:
    """Compatibility wrapper for the demo data seeding service."""

    @staticmethod
    def seed_demo_data(db: Session):
        seed_demo_data(db)

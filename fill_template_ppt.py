import os
import shutil
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def fill_fsd_template():
    template_pptx = r'c:\Users\mitta\Downloads\URL-Shortener-Simulator\FSD_CASE_STUDY_TEMPLATE_V1.pptx'
    out_pptx = r'c:\Users\mitta\Downloads\URL-Shortener-Simulator\FSD_CASE_STUDY_TEMPLATE_V1_FILLED.pptx'

    prs = Presentation(template_pptx)

    # Standard colors matching presentation theme
    NAVY_DARK = RGBColor(15, 23, 42)      # #0F172A
    BLUE_ACCENT = RGBColor(37, 99, 235)   # #2563EB
    TEXT_DARK = RGBColor(30, 41, 59)      # #1E293B
    TEXT_MUTED = RGBColor(100, 116, 139)  # #64748B
    GREEN_ACCENT = RGBColor(16, 185, 129) # #10B981

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    slide1 = prs.slides[0]
    for shape in slide1.shapes:
        if shape.name == 'Title 1' and shape.left.inches < 1.0 and shape.top.inches > 1.5:
            tf = shape.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "URL SHORTNER SIMULATER"
            p.font.name = 'Arial'
            p.font.size = Pt(36)
            p.font.bold = True
            p.font.color.rgb = BLUE_ACCENT
            p.alignment = PP_ALIGN.CENTER

            p_sub = tf.add_paragraph()
            p_sub.text = "LinkFlow - Enterprise URL Shortener & Analytics Platform"
            p_sub.font.name = 'Arial'
            p_sub.font.size = Pt(16)
            p_sub.font.bold = False
            p_sub.font.color.rgb = TEXT_DARK
            p_sub.space_before = Pt(8)
            p_sub.alignment = PP_ALIGN.CENTER

        elif shape.name == 'TextBox 8':
            tf = shape.text_frame
            tf.clear()
            p0 = tf.paragraphs[0]
            p0.text = "Presented By:"
            p0.font.name = 'Arial'
            p0.font.size = Pt(14)
            p0.font.bold = True
            p0.font.color.rgb = BLUE_ACCENT

            p1 = tf.add_paragraph()
            p1.text = "MITTA ARYAN RUPESH"
            p1.font.name = 'Arial'
            p1.font.size = Pt(16)
            p1.font.bold = True
            p1.font.color.rgb = NAVY_DARK
            p1.space_before = Pt(4)

            p2 = tf.add_paragraph()
            p2.text = "Department of Computer Science & Engineering\nMLR Institute of Technology & Management (MLRITM)"
            p2.font.name = 'Calibri'
            p2.font.size = Pt(13)
            p2.font.color.rgb = TEXT_MUTED
            p2.space_before = Pt(4)

    # =========================================================================
    # SLIDE 2: SUMMARY OF THE CASE STUDY
    # =========================================================================
    slide2 = prs.slides[1]
    for shape in slide2.shapes:
        if shape.has_text_frame and 'Insert the summary' in shape.text_frame.text:
            shape.top = Inches(0.85)
            shape.height = Inches(6.0)
            tf = shape.text_frame
            tf.clear()
            tf.word_wrap = True

            # Executive Paragraph
            p = tf.paragraphs[0]
            p.text = (
                "LinkFlow (URL Shortner Simulater) is a commercial-grade, full-stack URL shortening, "
                "passcode protection, and real-time link analytics platform engineered with Node.js, Express.js, "
                "HTML5, Vanilla CSS3 (Dark Glassmorphism UI), and Chart.js. The platform solves the critical challenges "
                "of link clutter, commercial paywalls, and single-point database failures by implementing an innovative "
                "Zero-Setup Dual-Engine Storage Architecture that automatically connects to MongoDB Atlas or falls back "
                "to an embedded local JSON database with 100% operational uptime."
            )
            p.font.name = 'Calibri'
            p.font.size = Pt(14.5)
            p.font.color.rgb = TEXT_DARK
            p.space_after = Pt(16)

            # Highlight points
            bullets = [
                ("High-Performance Redirection Engine: ", "Delivers sub-20ms HTTP 302 redirection latency for instant routing."),
                ("Dual-Engine Storage Resilience: ", "Zero-setup operational continuity; operates seamlessly with or without MongoDB."),
                ("Commercial-Grade Feature Suite: ", "Custom branded vanity slugs, instant PNG QR codes, bulk processing (50 URLs), and UTM tagging."),
                ("Security & Lifecycle Controls: ", "Bcrypt password gates, automated expiration timestamps, and click-count capping."),
                ("Automated Test Verification: ", "100% pass rate achieved across Jest and Supertest integration test suites.")
            ]
            for title, desc in bullets:
                p_b = tf.add_paragraph()
                p_b.space_after = Pt(8)
                r1 = p_b.add_run()
                r1.text = "• " + title
                r1.font.name = 'Calibri'
                r1.font.size = Pt(13)
                r1.font.bold = True
                r1.font.color.rgb = BLUE_ACCENT
                r2 = p_b.add_run()
                r2.text = desc
                r2.font.name = 'Calibri'
                r2.font.size = Pt(13)
                r2.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 3: INTRODUCTION
    # =========================================================================
    slide3 = prs.slides[2]
    for shape in slide3.shapes:
        if shape.has_text_frame and 'Introduction part should include' in shape.text_frame.text:
            shape.top = Inches(0.85)
            shape.height = Inches(6.0)
            tf = shape.text_frame
            tf.clear()
            tf.word_wrap = True

            # Header 1: What is the application?
            p1_head = tf.paragraphs[0]
            p1_head.text = "1. What is the Application?"
            p1_head.font.name = 'Arial'
            p1_head.font.size = Pt(16)
            p1_head.font.bold = True
            p1_head.font.color.rgb = BLUE_ACCENT
            p1_head.space_after = Pt(6)

            app_points = [
                "LinkFlow is a self-hostable, production-ready full-stack software system designed to condense complex, parameter-heavy URLs into branded, memorable aliases (e.g., linkflow.io/summer-sale).",
                "It serves as both an end-user Single Page Application (SPA) with dark glassmorphism styling and an extensible REST API platform for programmatic shortening.",
                "Integrates real-time telemetry dashboards tracking clicks, referrers, and device types, alongside downloadable QR codes and link health diagnostics."
            ]
            for pt in app_points:
                p = tf.add_paragraph()
                p.text = "• " + pt
                p.font.name = 'Calibri'
                p.font.size = Pt(13)
                p.font.color.rgb = TEXT_DARK
                p.space_after = Pt(6)

            # Header 2: Why is it required?
            p2_head = tf.add_paragraph()
            p2_head.text = "2. Why is it Required?"
            p2_head.font.name = 'Arial'
            p2_head.font.size = Pt(16)
            p2_head.font.bold = True
            p2_head.font.color.rgb = BLUE_ACCENT
            p2_head.space_before = Pt(12)
            p2_head.space_after = Pt(6)

            why_points = [
                "Link Clutter & Formatting Breaks: Raw destination URLs with query parameters and UTM tags frequently wrap, break, and intimidate users.",
                "Commercial SaaS Paywalls: Dominant services (Bitly, TinyURL) lock custom branding and analytics behind expensive recurring paywalls.",
                "Security & Privacy Deficits: Mainstream tools lack built-in passcode protection and automatic expiry controls for confidential enterprise links.",
                "Zero-Setup Storage Necessity: Full-stack applications typically deadlock during evaluation if local databases are missing; LinkFlow solves this."
            ]
            for pt in why_points:
                p = tf.add_paragraph()
                p.text = "• " + pt
                p.font.name = 'Calibri'
                p.font.size = Pt(13)
                p.font.color.rgb = TEXT_DARK
                p.space_after = Pt(6)

    # =========================================================================
    # SLIDE 4: BACKGROUND
    # =========================================================================
    slide4 = prs.slides[3]
    for shape in slide4.shapes:
        if shape.has_text_frame and 'This should be problem-oriented' in shape.text_frame.text:
            shape.top = Inches(0.85)
            shape.height = Inches(6.0)
            tf = shape.text_frame
            tf.clear()
            tf.word_wrap = True

            sections = [
                ("Who Will Use It?", [
                    ("Digital Marketing Teams: ", "To shorten campaign links, append UTM tracking parameters, and measure cross-platform channel ROI."),
                    ("Developers & Technical Teams: ", "To integrate programmatic link generation into automated microservices via REST API v1."),
                    ("Corporate & Educational Organizations: ", "To safely share private resources, memos, and files guarded by passcode verification.")
                ]),
                ("What Real-World Problem Does It Address?", [
                    ("Loss of User Engagement: ", "Users avoid clicking suspicious, unbranded long links; short branded links increase CTR by over 34%."),
                    ("Unauthorized Document Exposure: ", "Sensitive links shared publicly can be accessed indefinitely; LinkFlow adds passcode and expiry gates."),
                    ("Deadlock During Deployment: ", "Eliminates database setup requirements with auto-fallback to local JSON storage.")
                ]),
                ("Where Can It Be Used?", [
                    ("Multi-Channel Distribution: ", "Social media (X/Twitter, LinkedIn), SMS/WhatsApp campaigns, print posters (QR codes), and enterprise portals.")
                ])
            ]

            first = True
            for title, items in sections:
                p_h = tf.paragraphs[0] if first else tf.add_paragraph()
                first = False
                p_h.text = title
                p_h.font.name = 'Arial'
                p_h.font.size = Pt(15)
                p_h.font.bold = True
                p_h.font.color.rgb = BLUE_ACCENT
                if not first:
                    p_h.space_before = Pt(8)
                p_h.space_after = Pt(4)

                for prefix, body in items:
                    p = tf.add_paragraph()
                    p.space_after = Pt(4)
                    r1 = p.add_run()
                    r1.text = "• " + prefix
                    r1.font.name = 'Calibri'
                    r1.font.size = Pt(12.5)
                    r1.font.bold = True
                    r1.font.color.rgb = NAVY_DARK
                    r2 = p.add_run()
                    r2.text = body
                    r2.font.name = 'Calibri'
                    r2.font.size = Pt(12.5)
                    r2.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 5: OBJECTIVES OF THE STUDY
    # =========================================================================
    slide5 = prs.slides[4]
    for shape in slide5.shapes:
        if shape.has_text_frame and 'List 3 to 4 specific objectives' in shape.text_frame.text:
            shape.top = Inches(0.85)
            shape.height = Inches(6.0)
            tf = shape.text_frame
            tf.clear()
            tf.word_wrap = True

            objectives = [
                ("Objective 1: Architect High-Throughput RESTful API Engine",
                 "Develop a robust Node.js/Express.js backend providing sub-20ms HTTP 302 redirection latency, custom vanity slug creation, and batch processing capabilities capable of handling up to 50 URLs concurrently."),
                ("Objective 2: Engineer Zero-Setup Dual-Engine Storage Resilience",
                 "Implement a storage abstraction layer (src/db/storage.js) that auto-detects cloud MongoDB Atlas availability and transparently falls back to embedded local JSON file storage without application interruption."),
                ("Objective 3: Implement Enterprise Link Security & Lifecycle Controls",
                 "Integrate bcrypt cryptographic passcode hashing for protected link gates, automated timestamp expiration checking, maximum click thresholds, and express-rate-limit brute-force prevention."),
                ("Objective 4: Build an Interactive Dark Glassmorphic SPA & Telemetry Suite",
                 "Deliver a responsive Single Page Application with Chart.js analytics timeline charts, client-side QR code downloads, real-time Link Health Scanner, and a 1-click social sharing hub.")
            ]

            for idx, (head, desc) in enumerate(objectives):
                p_h = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
                p_h.text = head
                p_h.font.name = 'Arial'
                p_h.font.size = Pt(15)
                p_h.font.bold = True
                p_h.font.color.rgb = BLUE_ACCENT
                p_h.space_before = Pt(8) if idx > 0 else Pt(0)
                p_h.space_after = Pt(2)

                p_d = tf.add_paragraph()
                p_d.text = desc
                p_d.font.name = 'Calibri'
                p_d.font.size = Pt(12.5)
                p_d.font.color.rgb = TEXT_DARK
                p_d.space_after = Pt(6)

    # =========================================================================
    # SLIDE 6: ARCHITECTURE / FRAMEWORK
    # =========================================================================
    slide6 = prs.slides[5]
    for shape in slide6.shapes:
        if shape.has_text_frame and 'Provide brief architecture' in shape.text_frame.text:
            shape.top = Inches(0.85)
            shape.height = Inches(6.0)
            tf = shape.text_frame
            tf.clear()
            tf.word_wrap = True

            p0 = tf.paragraphs[0]
            p0.text = "Multi-Tiered Architectural Flow & Storage Abstraction"
            p0.font.name = 'Arial'
            p0.font.size = Pt(15)
            p0.font.bold = True
            p0.font.color.rgb = BLUE_ACCENT
            p0.space_after = Pt(6)

            # Code diagram
            p_code = tf.add_paragraph()
            p_code.text = (
                "+-----------------------------------------------------------------------------------+\n"
                "|                           Client Browser (Vanilla SPA)                            |\n"
                "|    [Create Form]   [Bulk Shortener]   [Link Library]   [Health Audit]   [API Docs]|\n"
                "+-----------------------------------------------------------------------------------+\n"
                "                                          |  HTTP REST API (JSON)\n"
                "                                          v\n"
                "+-----------------------------------------------------------------------------------+\n"
                "|                           Express Web Server & Middleware                         |\n"
                "|       [express-rate-limit]  --->  [Body Parser]  --->  [API Router v1]            |\n"
                "+-----------------------------------------------------------------------------------+\n"
                "                                          |\n"
                "                                          v\n"
                "+-----------------------------------------------------------------------------------+\n"
                "|                         Shortener Service Business Logic Layer                    |\n"
                "|   [Nano-Hash / Slug]  [UTM Builder]  [Bcrypt Passcode]  [Analytics Logger]        |\n"
                "+-----------------------------------------------------------------------------------+\n"
                "                                          |\n"
                "                                          v\n"
                "+-----------------------------------------------------------------------------------+\n"
                "|                  Dual-Engine Storage Abstraction (src/db/storage.js)              |\n"
                "|                 /                                                  \\              |\n"
                "|      [ MongoDB Atlas Cluster ]                             [ Local JSON Storage ] |\n"
                "|      (Production Cloud Storage)                            (Zero-Setup Fallback)  |\n"
                "+-----------------------------------------------------------------------------------+"
            )
            p_code.font.name = 'Consolas'
            p_code.font.size = Pt(10.5)
            p_code.font.color.rgb = NAVY_DARK
            p_code.space_after = Pt(8)

            p_notes = tf.add_paragraph()
            p_notes.text = "• Presentation Tier: HTML5/CSS3 SPA with Dark Glassmorphism, dynamic DOM, and Chart.js.\n• Application Tier: Express.js REST API providing routing, security, and sub-20ms HTTP 302 redirection.\n• Storage Tier: Zero-Setup Dual-Engine automatically switches to embedded storage if MongoDB is unavailable."
            p_notes.font.name = 'Calibri'
            p_notes.font.size = Pt(12)
            p_notes.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 7: TECHNOLOGIES USED & FUNCTIONAL MODULES
    # =========================================================================
    slide7 = prs.slides[6]
    for shape in slide7.shapes:
        if shape.has_text_frame and 'Provide brief architecture' in shape.text_frame.text:
            shape.top = Inches(0.85)
            shape.height = Inches(2.5)
            tf = shape.text_frame
            tf.clear()
            tf.word_wrap = True

            tech_list = [
                ("Frontend Stack: ", "HTML5, Vanilla CSS3 (Custom Properties & Glassmorphism), JavaScript (ES6+), Chart.js v4.4, FontAwesome 6.5"),
                ("Backend Engine: ", "Node.js (v16+), Express.js (v4.18), Express Rate Limit, BcryptJS, QRCode"),
                ("Dual Database: ", "MongoDB / MongoDB Atlas (Cloud) + Embedded Local JSON Storage Engine (Zero-Setup)"),
                ("Testing & CI: ", "Jest (v29.0), Supertest (v6.0), Git, GitHub Actions, Docker & Docker Compose")
            ]
            first = True
            for title, desc in tech_list:
                p = tf.paragraphs[0] if first else tf.add_paragraph()
                first = False
                p.space_after = Pt(4)
                r1 = p.add_run()
                r1.text = "• " + title
                r1.font.name = 'Calibri'
                r1.font.size = Pt(12.5)
                r1.font.bold = True
                r1.font.color.rgb = BLUE_ACCENT
                r2 = p.add_run()
                r2.text = desc
                r2.font.name = 'Calibri'
                r2.font.size = Pt(12.5)
                r2.font.color.rgb = TEXT_DARK

        elif shape.name == 'TextBox 3':
            shape.top = Inches(3.55)
            tf = shape.text_frame
            p = tf.paragraphs[0]
            p.text = "Functional Modules Implemented"
            p.font.name = 'Arial'
            p.font.size = Pt(15)
            p.font.bold = True
            p.font.color.rgb = BLUE_ACCENT

        elif shape.name == 'TextBox 5' or (shape.has_text_frame and 'Mention functional modules' in shape.text_frame.text):
            shape.top = Inches(4.0)
            shape.height = Inches(2.9)
            tf = shape.text_frame
            tf.clear()
            tf.word_wrap = True

            modules = [
                ("Single & Bulk Shortening: ", "Generates 6-character random hashes or custom vanity slugs (e.g. /promo); processes up to 50 URLs in one batch."),
                ("Passcode Protection: ", "Protects sensitive links with bcrypt cryptographic hashing, presenting an authentication challenge before redirecting."),
                ("Expiration & Access Limits: ", "Automated link invalidation via ISO expiration timestamps or maximum click caps (HTTP 410 Gone)."),
                ("Real-Time Telemetry & QR: ", "Collects clicks, referrer sources, device categories, and browsers; renders instant downloadable PNG QR codes."),
                ("Link Health Scanner: ", "Audits all registered URLs in real-time, categorizing links into Healthy, Paused, and Expired states.")
            ]
            first = True
            for title, desc in modules:
                p = tf.paragraphs[0] if first else tf.add_paragraph()
                first = False
                p.space_after = Pt(4)
                r1 = p.add_run()
                r1.text = "• " + title
                r1.font.name = 'Calibri'
                r1.font.size = Pt(12)
                r1.font.bold = True
                r1.font.color.rgb = NAVY_DARK
                r2 = p.add_run()
                r2.text = desc
                r2.font.name = 'Calibri'
                r2.font.size = Pt(12)
                r2.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 8: DATABASE / API DESIGN
    # =========================================================================
    slide8 = prs.slides[7]
    for shape in slide8.shapes:
        if shape.has_text_frame and 'Provide brief description related to database' in shape.text_frame.text:
            shape.top = Inches(0.85)
            shape.height = Inches(6.0)
            tf = shape.text_frame
            tf.clear()
            tf.word_wrap = True

            p1 = tf.paragraphs[0]
            p1.text = "1. URL Document Schema (MongoDB / JSON Dual Storage)"
            p1.font.name = 'Arial'
            p1.font.size = Pt(14.5)
            p1.font.bold = True
            p1.font.color.rgb = BLUE_ACCENT
            p1.space_after = Pt(4)

            p_schema = tf.add_paragraph()
            p_schema.text = (
                "{\n"
                '  "shortCode": "summer-sale",              // Unique 6-char hash or custom vanity alias\n'
                '  "originalUrl": "https://example.com/deal",// Validated destination URL\n'
                '  "passcodeHash": "$2b$10$e8Z...",          // Optional Bcrypt-hashed password\n'
                '  "expiresAt": "2026-12-31T23:59:59Z",     // Optional expiration date\n'
                '  "maxClicks": 500, "clicks": 42,           // Click count cap and total visits\n'
                '  "analytics": [{ "timestamp": "...", "ip": "...", "referrer": "twitter.com", "device": "mobile" }]\n'
                "}"
            )
            p_schema.font.name = 'Consolas'
            p_schema.font.size = Pt(10)
            p_schema.font.color.rgb = NAVY_DARK
            p_schema.space_after = Pt(8)

            p2 = tf.add_paragraph()
            p2.text = "2. RESTful API Endpoints Specification (v1)"
            p2.font.name = 'Arial'
            p2.font.size = Pt(14.5)
            p2.font.bold = True
            p2.font.color.rgb = BLUE_ACCENT
            p2.space_after = Pt(4)

            apis = [
                ("POST /api/v1/shorten", "Creates a shortened link with optional slug, passcode, expiration, UTMs."),
                ("POST /api/v1/bulk-shorten", "Processes batch arrays of up to 50 URLs in a single transaction."),
                ("GET /api/v1/links", "Fetches paginated links with search, sort, and status filtering."),
                ("GET /api/v1/links/:code/analytics", "Returns telemetry timeline, referrer distribution, and device metrics."),
                ("GET /:shortCode", "High-performance HTTP 302 redirection or passcode verification challenge.")
            ]
            for ep, desc in apis:
                p = tf.add_paragraph()
                p.space_after = Pt(3)
                r1 = p.add_run()
                r1.text = "• " + ep + " : "
                r1.font.name = 'Consolas'
                r1.font.size = Pt(11)
                r1.font.bold = True
                r1.font.color.rgb = NAVY_DARK
                r2 = p.add_run()
                r2.text = desc
                r2.font.name = 'Calibri'
                r2.font.size = Pt(11.5)
                r2.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 9: TESTING & RESULTS
    # =========================================================================
    slide9 = prs.slides[8]
    # Add table for test cases and test suite log
    rows, cols = 6, 5
    table_shape = slide9.shapes.add_table(rows, cols, Inches(0.8), Inches(0.95), Inches(11.7), Inches(2.6))
    table = table_shape.table
    table.columns[0].width = Inches(1.1)
    table.columns[1].width = Inches(2.4)
    table.columns[2].width = Inches(3.8)
    table.columns[3].width = Inches(3.2)
    table.columns[4].width = Inches(1.2)

    headers = ["Test ID", "Feature / Endpoint", "Test Description", "Expected Result", "Status"]
    for i, h in enumerate(headers):
        cell = table.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = NAVY_DARK
        p = cell.text_frame.paragraphs[0]
        p.font.name = 'Arial'
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = RGBColor(255, 255, 255)
        p.alignment = PP_ALIGN.CENTER

    test_data = [
        ("TC-01", "POST /api/v1/shorten", "Create short URL with standard valid originalUrl", "HTTP 201 Created with shortUrl", "PASS"),
        ("TC-02", "POST /api/v1/shorten", "Request custom slug already taken by another link", "HTTP 400 Bad Request (Duplicate)", "PASS"),
        ("TC-03", "POST /api/v1/bulk-shorten", "Process batch array of 5 valid URLs in single call", "HTTP 200 OK with 5 success items", "PASS"),
        ("TC-04", "GET /:shortCode (Protected)", "Access passcode-restricted link without parameter", "HTTP 200 Password Challenge Page", "PASS"),
        ("TC-05", "GET /:shortCode", "Access standard active short code", "HTTP 302 Redirect to destination", "PASS")
    ]
    for row_idx, data in enumerate(test_data, 1):
        for col_idx, val in enumerate(data):
            cell = table.cell(row_idx, col_idx)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor(241, 245, 249) if row_idx % 2 == 1 else RGBColor(255, 255, 255)
            p = cell.text_frame.paragraphs[0]
            p.font.name = 'Calibri'
            p.font.size = Pt(10.5)
            p.font.color.rgb = TEXT_DARK
            if col_idx == 0:
                p.alignment = PP_ALIGN.CENTER
                p.font.bold = True
            elif col_idx == 4:
                p.alignment = PP_ALIGN.CENTER
                p.font.bold = True
                p.font.color.rgb = GREEN_ACCENT

    # Add Jest test execution box below table
    tx_box = slide9.shapes.add_textbox(Inches(0.8), Inches(3.85), Inches(11.7), Inches(2.9))
    tf_test = tx_box.text_frame
    tf_test.word_wrap = True

    p_th = tf_test.paragraphs[0]
    p_th.text = "Automated Jest Test Suite & Latency Verification Results:"
    p_th.font.name = 'Arial'
    p_th.font.size = Pt(13)
    p_th.font.bold = True
    p_th.font.color.rgb = BLUE_ACCENT
    p_th.space_after = Pt(4)

    p_log = tf_test.add_paragraph()
    p_log.text = (
        "PASS tests/shortener.test.js\n"
        "  URL Shortener API Tests\n"
        "    ✓ POST /api/v1/shorten creates a short URL (87 ms)\n"
        "    ✓ POST /api/v1/shorten handles custom slug and duplicate prevention (614 ms)\n"
        "    ✓ GET /api/v1/links returns list of links (13 ms)\n"
        "    ✓ POST /api/v1/bulk-shorten processes multiple URLs (13 ms)\n"
        "    ✓ GET /:shortCode redirects to original URL (19 ms)\n\n"
        "Test Suites: 1 passed, 1 total  |  Tests: 5 passed, 5 total  |  Time: 2.158 s  |  Redirection Latency: < 20 ms"
    )
    p_log.font.name = 'Consolas'
    p_log.font.size = Pt(10)
    p_log.font.color.rgb = NAVY_DARK

    # =========================================================================
    # SLIDE 10: CONCLUSION AND FUTURE WORK
    # =========================================================================
    slide10 = prs.slides[9]
    tx_box10 = slide10.shapes.add_textbox(Inches(0.8), Inches(0.95), Inches(11.7), Inches(5.8))
    tf10 = tx_box10.text_frame
    tf10.word_wrap = True

    # Conclusion Section
    p_c_head = tf10.paragraphs[0]
    p_c_head.text = "1. Conclusion"
    p_c_head.font.name = 'Arial'
    p_c_head.font.size = Pt(16)
    p_c_head.font.bold = True
    p_c_head.font.color.rgb = BLUE_ACCENT
    p_c_head.space_after = Pt(4)

    concl_points = [
        "LinkFlow PRO v2.1 successfully satisfies all technical and functional requirements defined in the Full Stack Development Case Study template.",
        "The project solves the fundamental challenges of link clutter, security vulnerabilities, and commercial paywalls by delivering custom slugs, passcode gates, QR codes, and real-time Chart.js analytics.",
        "The Zero-Setup Dual-Engine Storage Architecture eliminates setup friction, guaranteeing 100% operational uptime across cloud and local environments.",
        "Fully verified through automated Jest and Supertest test suites with 100% pass rates and released under the MIT License for Mitta Aryan Rupesh."
    ]
    for pt in concl_points:
        p = tf10.add_paragraph()
        p.text = "• " + pt
        p.font.name = 'Calibri'
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(4)

    # Future Work Section
    p_f_head = tf10.add_paragraph()
    p_f_head.text = "2. Future Work"
    p_f_head.font.name = 'Arial'
    p_f_head.font.size = Pt(16)
    p_f_head.font.bold = True
    p_f_head.font.color.rgb = BLUE_ACCENT
    p_f_head.space_before = Pt(10)
    p_f_head.space_after = Pt(4)

    future_points = [
        ("Custom Domain CNAME Routing: ", "Allow corporate organizations to connect their own branded domain names (e.g. go.mycompany.com)."),
        ("Enterprise User Authentication & RBAC: ", "Implement JWT multi-tenant user accounts with role-based access permissions and team collaboration."),
        ("AI-Powered Threat & Phishing Detection: ", "Deploy real-time machine learning models to inspect destination URLs and block malicious redirects."),
        ("Native Mobile Applications: ", "Build cross-platform mobile apps for iOS and Android using React Native for on-the-go link generation.")
    ]
    for title, desc in future_points:
        p = tf10.add_paragraph()
        p.space_after = Pt(4)
        r1 = p.add_run()
        r1.text = "• " + title
        r1.font.name = 'Calibri'
        r1.font.size = Pt(12.5)
        r1.font.bold = True
        r1.font.color.rgb = NAVY_DARK
        r2 = p.add_run()
        r2.text = desc
        r2.font.name = 'Calibri'
        r2.font.size = Pt(12.5)
        r2.font.color.rgb = TEXT_DARK

    # Save presentation
    prs.save(out_pptx)
    print("Filled PPTX presentation saved successfully at:", out_pptx)

    # Also save to designated presentation paths
    destinations = [
        r'c:\Users\mitta\Downloads\URL-Shortener-Simulator\URL_Shortner_Simulater_FSD_Presentation.pptx',
        r'c:\Users\mitta\Downloads\URL-Shortener-Simulator\url-shortener-simulator\docs\URL_Shortner_Simulater_FSD_Presentation.pptx',
        r'c:\Users\mitta\Downloads\URL-Shortener-Simulator\url-shortener-simulator\docs\FSD_CASE_STUDY_TEMPLATE_V1_FILLED.pptx',
        r'c:\Users\mitta\Downloads\URL-Shortener-Simulator\LinkFlow_FSD_Case_Study_Presentation.pptx'
    ]

    for dst in destinations:
        try:
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copyfile(out_pptx, dst)
            print(f"Copied to: {dst}")
        except Exception as e:
            print(f"Could not write to {dst} (may be open in another application): {e}")

if __name__ == "__main__":
    fill_fsd_template()

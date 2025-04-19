# backend/utils/mock_generator.py
import random
import io
import uuid
import re # Import re module for template filling
from datetime import datetime, timedelta
# Ensure reportlab is installed: pip install reportlab
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    print("WARNING: reportlab library not found. PDF generation disabled. Run 'pip install reportlab'")


class MockDocumentGenerator:
    """
    Utility for generating mock EIS documents (PDF and Text) for testing.

    Creates realistic-looking Environmental Impact Statement documents
    with embedded public comments for testing the application.
    Requires 'reportlab' library for PDF generation.
    """

    # Sample content sections
    DOCUMENT_SECTIONS = [
        "Executive Summary",
        "Purpose and Need",
        "Proposed Action and Alternatives",
        "Affected Environment",
        "Environmental Consequences",
        "Consultation and Coordination",
        "Public Comments",
        "Appendices"
    ]

    # Sample comment templates
    COMMENT_TEMPLATES = [
        "I am concerned about the potential impact on {water_body} water quality. The EIS doesn't adequately address {issue}.",
        "The analysis of water quality impacts on {water_body} is insufficient. There is no consideration of {issue}.",
        "How will {issue} be prevented from contaminating {water_body} during and after construction?",
        "The proposed mitigation measures for {water_body} protection are inadequate and don't address {issue}.",
        "The EIS fails to consider impacts on {species} habitat in the {area} area.",
        "What measures will be taken to protect {species} during their {season} migration?",
        "The {species} population in {area} will be severely impacted by this project.",
        "The wildlife impact assessment doesn't address the effects on {species} breeding patterns in {area}.",
        "As a frequent {activity} user of the area, I {sentiment} the proposed changes to access in {area}.",
        "The {activity} opportunities in {area} will be {impact} by this project.",
        "Has there been consideration for {activity} users in the {area} section of the project?",
        "The proposed {facility} would greatly {impact} the {activity} experience in {area}.",
        "The EIS fails to acknowledge the historical significance of {site} to the {group} people.",
        "What measures will be taken to protect the {site} artifacts during construction?",
        "The cultural survey did not adequately consult with {group} representatives about {site}.",
        "The proposed mitigation for impacts to {site} does not respect {group} cultural values.",
        "This project will {impact} property values for homeowners in {area}.",
        "The economic analysis overestimates the number of {benefit} and doesn't account for {cost}.",
        "As a local business owner in {area}, I {sentiment} this project for its economic effects.",
        "The socioeconomic analysis fails to consider impacts on {group} communities in {area}.",
        "The air quality analysis doesn't account for {factor} that would affect {area} residents.",
        "How will {pollutant} emissions be monitored and mitigated during construction?",
        "The projected {pollutant} levels would exceed safe thresholds for sensitive populations in {area}.",
        "The cumulative air quality impacts from this project and nearby {source} have not been addressed.",
        "The public comment period should be extended to allow for more community input.",
        "The EIS should include alternative {alternative} that would have less environmental impact.",
        "The proposed timeline doesn't allow adequate time for proper {process}.",
        "I request that the agency hold additional public meetings in {area} to discuss these issues."
    ]

    # Variables to fill in the templates
    VARIABLES = {
        "water_body": ["river", "stream", "lake", "watershed", "aquifer", "wetland", "creek"],
        "issue": ["runoff", "sedimentation", "chemical leaching", "thermal pollution", "erosion", "nutrient loading"],
        "species": ["deer", "elk", "salmon", "trout", "eagle", "bear", "wolf", "songbird", "bat", "butterfly"],
        "area": ["northern", "southern", "eastern", "western", "riparian", "forest", "meadow", "mountain"],
        "season": ["spring", "summer", "fall", "winter"],
        "activity": ["hiking", "fishing", "hunting", "camping", "birdwatching", "kayaking", "cycling", "horseback riding"],
        "sentiment": ["support", "oppose", "have concerns about", "appreciate", "question"],
        "impact": ["improved", "diminished", "severely restricted", "enhanced", "moderately affected"],
        "facility": ["trail system", "access road", "visitor center", "campground", "parking area", "interpretive site"],
        "site": ["archaeological site", "sacred ground", "historical structure", "traditional gathering place", "petroglyphs"],
        "group": ["Native American", "settler", "mining", "agricultural", "indigenous", "local"],
        "benefit": ["jobs", "tourism revenue", "tax income", "infrastructure improvements"],
        "cost": ["local business disruption", "increased traffic", "noise pollution", "stress on local services"],
        "factor": ["prevailing winds", "temperature inversions", "seasonal patterns", "topography"],
        "pollutant": ["dust", "particulate matter", "nitrogen oxides", "sulfur dioxide", "ozone", "volatile organic compounds"],
        "source": ["industrial facilities", "existing roads", "agricultural activities", "wildfires"],
        "alternative": ["location", "technology", "scale", "phasing", "mitigation approach"],
        "process": ["revegetation", "monitoring", "community consultation", "adaptive management"]
    }

    @classmethod
    def _fill_template(cls, template):
        """Fill template placeholders with random variables."""
        # Find all placeholders like {variable_name}
        placeholders = re.findall(r'\{(\w+)\}', template)

        filled_template = template
        for placeholder in placeholders:
            if placeholder in cls.VARIABLES:
                # Choose a random value for the placeholder type
                value = random.choice(cls.VARIABLES[placeholder])
                # Replace the placeholder with the chosen value
                filled_template = filled_template.replace(f"{{{placeholder}}}", value, 1) # Replace only first instance if duplicates exist

        return filled_template

    @classmethod
    def generate_comment(cls):
        """Generate a single random comment by filling a template."""
        template = random.choice(cls.COMMENT_TEMPLATES)
        return cls._fill_template(template)

    @classmethod
    def generate_lorem_ipsum(cls, num_paragraphs=1):
        """Generates placeholder text."""
        lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        return "\n\n".join([lorem] * num_paragraphs)


    @classmethod
    def generate_pdf_document(cls, title=None, num_comments=20):
        """
        Generate a mock PDF document with comments.

        Args:
            title (str, optional): Optional document title. Defaults to None.
            num_comments (int, optional): Number of comments to include. Defaults to 20.

        Returns:
            io.BytesIO: BytesIO object containing the PDF document, or None if reportlab is not installed.
        """
        if not REPORTLAB_AVAILABLE:
            print("Error: Cannot generate PDF, reportlab library is missing.")
            return None

        # Create a BytesIO buffer to hold the PDF data
        buffer = io.BytesIO()

        # Create the PDF document template
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                leftMargin=72, rightMargin=72,
                                topMargin=72, bottomMargin=72)

        # Get default styles and add custom ones
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='Justify', alignment=TA_JUSTIFY))
        styles.add(ParagraphStyle(name='Center', alignment=TA_CENTER))
        styles.add(ParagraphStyle(name='CommentSubmitter', parent=styles['Heading3'], spaceBefore=12))
        styles.add(ParagraphStyle(name='CommentText', parent=styles['Justify'], spaceAfter=6))


        # Create story (list of flowables for the PDF)
        story = []

        # Title
        if not title:
            title = f"DRAFT Environmental Impact Statement - {random.choice(['Forest', 'Watershed', 'Wildlife', 'Recreation'])} Project"
        story.append(Paragraph(title, styles['Title']))
        story.append(Spacer(1, 12))

        # Generate date
        date = datetime.now() - timedelta(days=random.randint(30, 365))
        date_str = date.strftime("%B %d, %Y")
        story.append(Paragraph(f"Publication Date: {date_str}", styles['Normal']))
        story.append(Spacer(1, 24))

        # Add sections
        for section in cls.DOCUMENT_SECTIONS:
            if section != "Executive Summary": # Avoid page break before first section
                 story.append(PageBreak())
            story.append(Paragraph(section, styles['h1'])) # Use h1 style for sections
            story.append(Spacer(1, 12))

            # Add placeholder content for non-comment sections
            if section != "Public Comments":
                for _ in range(random.randint(2, 4)): # Add 2-4 paragraphs per section
                    story.append(Paragraph(cls.generate_lorem_ipsum(), styles['Justify']))
                    story.append(Spacer(1, 12))
            else:
                # Add comments in the Public Comments section
                story.append(Paragraph("The following public comments were received during the designated comment period:", styles['Normal']))
                story.append(Spacer(1, 18))

                for i in range(num_comments):
                    comment_text = cls.generate_comment()
                    # Simulate a submitter - could be randomized more
                    submitter = f"Comment Submitter #{random.randint(100, 999)} - Received { (date + timedelta(days=random.randint(1,30))).strftime('%Y-%m-%d') }"

                    story.append(Paragraph(submitter, styles['CommentSubmitter']))
                    story.append(Paragraph(comment_text, styles['CommentText']))
                    story.append(Spacer(1, 12)) # Space between comments

        # Build the PDF document in memory
        try:
            doc.build(story)
        except Exception as e:
            print(f"Error building PDF: {e}")
            return None


        # Reset buffer position to the beginning
        buffer.seek(0)
        return buffer

    @classmethod
    def generate_text_document(cls, title=None, num_comments=20):
        """
        Generate a mock plain text document with comments.

        Args:
            title (str, optional): Optional document title. Defaults to None.
            num_comments (int, optional): Number of comments to include. Defaults to 20.

        Returns:
            io.BytesIO: BytesIO object containing the UTF-8 encoded text document.
        """
        # Create a list to hold the lines of the text document
        content = []

        # Title
        if not title:
            title = f"DRAFT Environmental Impact Statement - {random.choice(['Forest', 'Watershed', 'Wildlife', 'Recreation'])} Project"
        content.append(title.upper())
        content.append("=" * len(title))
        content.append("") # Blank line

        # Generate date
        date = datetime.now() - timedelta(days=random.randint(30, 365))
        date_str = date.strftime("%B %d, %Y")
        content.append(f"Publication Date: {date_str}")
        content.append("")

        # Add sections
        for section in cls.DOCUMENT_SECTIONS:
            content.append("") # Blank line before section
            content.append(section.upper())
            content.append("-" * len(section))
            content.append("")

            # Add placeholder content for non-comment sections
            if section != "Public Comments":
                for _ in range(random.randint(2, 4)):
                    content.append(cls.generate_lorem_ipsum())
                    content.append("") # Blank line between paragraphs
            else:
                # Add comments in the Public Comments section
                content.append("The following public comments were received during the designated comment period:")
                content.append("")

                for i in range(num_comments):
                    comment_text = cls.generate_comment()
                    submitter = f"Comment Submitter #{random.randint(100, 999)} - Received { (date + timedelta(days=random.randint(1,30))).strftime('%Y-%m-%d') }"

                    content.append(submitter)
                    content.append("-" * len(submitter)) # Underline submitter
                    content.append(comment_text)
                    content.append("") # Blank line after each comment

        # Join all lines with newline characters and encode to UTF-8
        text_content = "\n".join(content).encode('utf-8')

        # Create a BytesIO buffer and write the encoded text
        buffer = io.BytesIO(text_content)

        # Reset buffer position to the beginning
        buffer.seek(0)
        return buffer

# Example usage (optional - good for testing the generator itself)
if __name__ == '__main__':
    print("Generating mock documents...")

    # Generate PDF
    pdf_buffer = MockDocumentGenerator.generate_pdf_document(num_comments=5)
    if pdf_buffer:
        with open("mock_eis_document.pdf", "wb") as f:
            f.write(pdf_buffer.getvalue())
        print("Generated mock_eis_document.pdf")
    else:
        print("Failed to generate PDF.")


    # Generate Text
    txt_buffer = MockDocumentGenerator.generate_text_document(num_comments=3)
    if txt_buffer:
        with open("mock_eis_document.txt", "wb") as f:
            f.write(txt_buffer.getvalue())
        print("Generated mock_eis_document.txt")
    else:
         print("Failed to generate Text document.")


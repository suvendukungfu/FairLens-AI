import io
from datetime import datetime

def generate_pdf_report(results, config):
    """
    Generates a PDF report using reportlab.
    If reportlab is missing, it returns a plain text summary instead.
    """
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        from reportlab.lib.units import inch

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.hexColor('#4f46e5'),
            spaceAfter=30
        )
        
        content = []
        
        # Header
        content.append(Paragraph("FairLens AI: Fairness Audit Report", title_style))
        content.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        content.append(Spacer(1, 0.2 * inch))
        
        # Dataset Info
        content.append(Paragraph("1. Dataset Summary", styles['Heading2']))
        dataset_info = results['dataset_info']
        info_data = [
            ["Filename", dataset_info['filename']],
            ["Total Rows", str(dataset_info['rows'])],
            ["Total Columns", str(dataset_info['cols'])],
            ["Target Column", config['target_column']],
            ["Sensitive Attributes", ", ".join(config['sensitive_attributes'])]
        ]
        t = Table(info_data, colWidths=[2*inch, 4*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        content.append(t)
        content.append(Spacer(1, 0.3 * inch))

        # Model Performance
        content.append(Paragraph("2. Model Performance", styles['Heading2']))
        perf = results['performance']
        perf_data = [
            ["Metric", "Value"],
            ["Accuracy", f"{perf['accuracy']*100:.1f}%"],
            ["Precision", f"{perf['precision']*100:.1f}%"],
            ["Recall", f"{perf['recall']*100:.1f}%"],
            ["F1 Score", f"{perf['f1']*100:.1f}%"]
        ]
        t2 = Table(perf_data, colWidths=[2*inch, 2*inch])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.hexColor('#4f46e5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ]))
        content.append(t2)
        content.append(Spacer(1, 0.3 * inch))

        # Fairness Score
        content.append(Paragraph("3. Fairness Analysis", styles['Heading2']))
        content.append(Paragraph(f"Overall Fairness Score: <b>{results['bias_score']}/100</b>", styles['Normal']))
        content.append(Spacer(1, 0.1 * inch))
        
        # Bias Flags
        if results['bias_flags']:
            content.append(Paragraph("Detected Bias Flags:", styles['Heading3']))
            for flag in results['bias_flags']:
                flag_text = f"<b>[{flag['severity'].upper()}] {flag['bias_type']}</b>: {flag['description']}"
                content.append(Paragraph(flag_text, styles['Normal']))
                content.append(Spacer(1, 0.05 * inch))
        
        content.append(Spacer(1, 0.3 * inch))
        
        # Explanations
        content.append(Paragraph("4. AI Explanations", styles['Heading2']))
        for exp in results['explanations']:
            content.append(Paragraph(f"• {exp}", styles['Normal']))
            content.append(Spacer(1, 0.05 * inch))

        doc.build(content)
        buffer.seek(0)
        return buffer.read(), "application/pdf"

    except Exception as e:
        # Fallback to text
        output = io.StringIO()
        output.write("FairLens AI: Fairness Audit Report\n")
        output.write("="*30 + "\n\n")
        output.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        output.write(f"Dataset: {results['dataset_info']['filename']}\n")
        output.write(f"Rows: {results['dataset_info']['rows']}\n")
        output.write(f"Fairness Score: {results['bias_score']}/100\n\n")
        output.write("AI EXPLANATIONS:\n")
        for exp in results['explanations']:
            output.write(f"- {exp}\n")
        
        return output.getvalue().encode(), "text/plain"

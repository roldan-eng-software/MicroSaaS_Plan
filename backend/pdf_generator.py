from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from io import BytesIO
from datetime import datetime
from dateutil.parser import isoparse

def generate_budget_pdf(customer_name, customer_email, customer_phone, budget_data):
    """
    Gera um PDF profissional de orçamento
    
    Args:
        customer_name: Nome do cliente
        customer_email: Email do cliente
        customer_phone: Telefone do cliente
        budget_data: Dicionário com dados do orçamento
            {
                'id': str,
                'description': str,
                'amount': float,
                'status': str,
                'created_at': str (ISO format)
            }
    """
    
    # Criar um arquivo em memória (BytesIO)
    pdf_buffer = BytesIO()
    
    # Configurar o documento
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
    )
    
    # Lista para armazenar os elementos do PDF
    elements = []
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#374151'),
        spaceAfter=6,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#4b5563'),
        spaceAfter=6,
    )
    
    # Título
    elements.append(Paragraph("ORÇAMENTO", title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Informações da empresa (você pode customizar)
    elements.append(Paragraph("Marcenaria MDF", heading_style))
    elements.append(Paragraph("CNPJ: XX.XXX.XXX/XXXX-XX", normal_style))
    elements.append(Paragraph("Telefone: (XX) XXXXX-XXXX", normal_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Dados do cliente
    elements.append(Paragraph("DADOS DO CLIENTE", heading_style))
    client_data = [
        ['Nome:', customer_name],
        ['Email:', customer_email],
        ['Telefone:', customer_phone],
    ]
    client_table = Table(client_data, colWidths=[1.5*inch, 4*inch])
    client_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 9),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#4b5563')),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
    ]))
    elements.append(client_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Dados do Orçamento
    elements.append(Paragraph("DETALHES DO ORÇAMENTO", heading_style))
    
    # Converter data ISO para formato legível
    try:
        created_date = isoparse(budget_data['created_at']).strftime('%d/%m/%Y %H:%M')
    except:
        created_date = budget_data['created_at']
    
    budget_details = [
        ['ID do Orçamento:', budget_data['id']],
        ['Data:', created_date],
        ['Status:', budget_data['status'].upper()],
    ]
    budget_table = Table(budget_details, colWidths=[1.5*inch, 4*inch])
    budget_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 9),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#4b5563')),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
    ]))
    elements.append(budget_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Descrição do Orçamento
    elements.append(Paragraph("DESCRIÇÃO", heading_style))
    elements.append(Paragraph(budget_data['description'], normal_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Valor Total
    amount_style = ParagraphStyle(
        'AmountStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#059669'),
        alignment=TA_RIGHT,
        fontName='Helvetica-Bold'
    )
    elements.append(Paragraph(f"Valor Total: R$ {budget_data['amount']:.2f}", amount_style))
    elements.append(Spacer(1, 0.5*inch))
    
    # Rodapé
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#9ca3af'),
        alignment=TA_CENTER,
    )
    elements.append(Paragraph(
        f"Gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')} | Marcenaria MDF",
        footer_style
    ))
    
    # Gerar PDF
    doc.build(elements)
    
    # Retornar o buffer
    pdf_buffer.seek(0)
    return pdf_buffer

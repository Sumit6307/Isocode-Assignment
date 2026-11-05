import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_styled_document(md_path, docx_path):
    doc = Document()
    
    # Page setup - 1 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    in_code_block = False
    code_lines = []
    
    table_lines = []
    in_table = False

    def flush_table():
        nonlocal table_lines, in_table
        if not table_lines:
            return
        
        # Parse table lines
        rows_data = []
        for t_line in table_lines:
            t_line = t_line.strip()
            if not t_line or t_line.startswith('| :---') or t_line.startswith('|:---') or t_line.startswith('|---'):
                continue
            cols = [c.strip() for c in t_line.strip('|').split('|')]
            if cols:
                rows_data.append(cols)
                
        if rows_data:
            num_cols = max(len(r) for r in rows_data)
            table = doc.add_table(rows=len(rows_data), cols=num_cols)
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            table.style = 'Table Grid'
            
            for r_idx, row in enumerate(rows_data):
                for c_idx, cell_value in enumerate(row):
                    if c_idx < num_cols:
                        cell = table.cell(r_idx, c_idx)
                        cell.text = cell_value.replace('**', '').replace('`', '')
                        # Style header row
                        if r_idx == 0:
                            shading_elm = parse_xml(r'<w:shd {} w:fill="0F172A"/>'.format(nsdecls('w')))
                            cell._tc.get_or_add_tcPr().append(shading_elm)
                            for p in cell.paragraphs:
                                for run in p.runs:
                                    run.font.bold = True
                                    run.font.color.rgb = RGBColor(255, 255, 255)
                                    run.font.size = Pt(9.5)
                        else:
                            for p in cell.paragraphs:
                                for run in p.runs:
                                    run.font.size = Pt(9)
                                    run.font.color.rgb = RGBColor(51, 65, 85)
                                    
            doc.add_paragraph() # Spacing after table
            
        table_lines = []
        in_table = False

    def flush_code():
        nonlocal code_lines, in_code_block
        if not code_lines:
            return
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.4)
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(6)
        
        # Add a light background box if possible or styled mono text
        code_text = "\n".join(code_lines)
        run = p.add_run(code_text)
        run.font.name = 'Consolas'
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(30, 41, 59)
        
        code_lines = []
        in_code_block = False

    for line in lines:
        stripped = line.strip()
        
        # Check code fence
        if stripped.startswith('```'):
            if in_code_block:
                flush_code()
            else:
                if in_table:
                    flush_table()
                in_code_block = True
            continue
            
        if in_code_block:
            code_lines.append(line.rstrip('\r\n'))
            continue
            
        # Check table
        if stripped.startswith('|') and stripped.endswith('|'):
            in_table = True
            table_lines.append(stripped)
            continue
        elif in_table:
            flush_table()
            
        if not stripped:
            continue
            
        # Title (H1)
        if stripped.startswith('# '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run(stripped[2:])
            run.font.name = 'Calibri'
            run.font.size = Pt(22)
            run.font.bold = True
            run.font.color.rgb = RGBColor(15, 23, 42) # Slate-900
            continue
            
        # H2
        if stripped.startswith('## '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(stripped[3:])
            run.font.name = 'Calibri'
            run.font.size = Pt(15)
            run.font.bold = True
            run.font.color.rgb = RGBColor(30, 58, 138) # Blue-900
            continue
            
        # H3
        if stripped.startswith('### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run(stripped[4:])
            run.font.name = 'Calibri'
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = RGBColor(51, 65, 85) # Slate-700
            continue
            
        # Horizontal Rule
        if stripped.startswith('---'):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run('_______________________________________________________________________________')
            run.font.color.rgb = RGBColor(226, 232, 240)
            run.font.size = Pt(8)
            continue
            
        # Bullet list
        if stripped.startswith('* ') or stripped.startswith('- '):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            text = stripped[2:]
            # parse bold
            parts = re.split(r'(\*\*.*?\*\*)', text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.font.bold = True
                else:
                    r = p.add_run(part)
                r.font.size = Pt(10)
                r.font.color.rgb = RGBColor(51, 65, 85)
            continue
            
        # Numbered list
        match_num = re.match(r'^(\d+\.)\s+(.*)', stripped)
        if match_num:
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.25)
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            num_label = match_num.group(1)
            text = match_num.group(2)
            
            r_num = p.add_run(num_label + " ")
            r_num.font.bold = True
            r_num.font.size = Pt(10)
            
            parts = re.split(r'(\*\*.*?\*\*)', text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.font.bold = True
                else:
                    r = p.add_run(part)
                r.font.size = Pt(10)
                r.font.color.rgb = RGBColor(51, 65, 85)
            continue
            
        # Normal paragraph
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        parts = re.split(r'(\*\*.*?\*\*)', stripped)
        for part in parts:
            if part.startswith('**') and part.endswith('**'):
                r = p.add_run(part[2:-2])
                r.font.bold = True
            else:
                r = p.add_run(part)
            r.font.size = Pt(10)
            r.font.color.rgb = RGBColor(30, 41, 59)
            
    if in_table:
        flush_table()
    if in_code_block:
        flush_code()
        
    doc.save(docx_path)
    print(f"Generated {docx_path} successfully!")

if __name__ == '__main__':
    create_styled_document('technical-design-document.md', 'Technical-Design-Document.docx')

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function flattenObject(obj: any, prefix = "") {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const pre = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value, pre));
    } else {
      acc[pre] = Array.isArray(value) ? JSON.stringify(value) : value;
    }
    return acc;
  }, {} as Record<string, any>);
}

export function generatePdfFromJsonWithSignature(
  data: any[],
  title: string = "Report"
) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleTextWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleTextWidth) / 2, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const subTitle = "Issued by CrewFoodPlanner Inc.";
  const subTextWidth = doc.getTextWidth(subTitle);
  doc.text(subTitle, (pageWidth - subTextWidth) / 2, 28);

  if (!Array.isArray(data) || data.length === 0) {
    doc.text("No data to display", 14, 40);
    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
    return;
  }

  const flattenedData = data.map((item) => flattenObject(item));
  const headers = Object.keys(flattenedData[0]);
  const body = flattenedData.map((row) => headers.map((h) => row[h] ?? ""));

  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: body,
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    theme: "grid",
  });

  const finalY = (doc as any).lastAutoTable.finalY || 35;

  const signatureSpacing = 20;
  doc.setFontSize(12);

  const labels = ["Full Name:", "Signature:", "Decryption:"];
  labels.forEach((label, i) => {
    const y = finalY + signatureSpacing + i * 15;
    doc.text(label, 14, y);
    doc.line(45, y, pageWidth - 20, y);
  });

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

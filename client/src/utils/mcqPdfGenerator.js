import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates an official, beautifully formatted PDF report for 30-MCQ tests.
 * Requirements:
 * - Wrong questions displayed in RED
 * - Right questions answered displayed in GREEN
 * - Not attempted questions displayed in YELLOW
 */
export function generateMcqPdfReport(testResult, candidateEmail = "") {
  if (!testResult) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Executive Dark Slate Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, "F");

  // Sky Blue Accent Line
  doc.setFillColor(56, 189, 248); // sky-400
  doc.rect(0, 40, pageWidth, 2, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("INTERVIEW ACE AI - MOCK MCQ TEST", 14, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Official Technical Assessment Scorecard & Detailed AI Evaluation", 14, 26);
  doc.text(
    `Test ID: ${testResult.testId || "MCQ-7821"} • 30 Questions • 25 Minutes Time-Bound`,
    14,
    34
  );

  // Score Badge in Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(pageWidth - 72, 11, 58, 22, 3, 3, "F");

  doc.setTextColor(56, 189, 248);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(
    `SCORE: ${testResult.score}/${testResult.totalQuestions || 30}`,
    pageWidth - 68,
    21
  );

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Accuracy: ${testResult.percentage}% (${testResult.status || "Evaluated"})`,
    pageWidth - 68,
    28
  );

  // 2. Candidate & Test Overview Table
  const minsSpent = Math.floor((testResult.timeSpentSeconds || 0) / 60);
  const secsSpent = (testResult.timeSpentSeconds || 0) % 60;
  const timeFormatted = `${minsSpent}m ${secsSpent}s (out of 25m)`;

  const overviewRows = [
    [
      "Candidate Email",
      testResult.userEmail || candidateEmail || "candidate@interviewace.ai",
      "Assessment Date",
      testResult.date || new Date().toISOString().split("T")[0],
    ],
    [
      "Target Role",
      testResult.role || "Full Stack Developer",
      "Experience Level",
      testResult.experience || "Fresher",
    ],
    [
      "Total Time Taken",
      timeFormatted,
      "Evaluation Status",
      testResult.status || "Completed",
    ],
  ];

  autoTable(doc, {
    startY: 48,
    body: overviewRows,
    theme: "plain",
    styles: { fontSize: 8.5, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 35 },
      1: { fontStyle: "bold", cellWidth: 55 },
      2: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 35 },
      3: { fontStyle: "bold", cellWidth: 55 },
    },
    margin: { left: 14, right: 14 },
  });

  // 3. COLOR-CODED KPI SUMMARY CARDS
  const startYKPI = (doc.lastAutoTable?.finalY || 70) + 4;
  const cardWidth = (pageWidth - 28 - 9) / 4; // 4 cards

  // Card 1: Total
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, startYKPI, cardWidth, 16, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL QUESTIONS", 18, startYKPI + 5);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${testResult.totalQuestions || 30}`, 18, startYKPI + 12);

  // Card 2: GREEN - Correct Answers
  doc.setFillColor(220, 252, 231); // green-100
  doc.roundedRect(14 + cardWidth + 3, startYKPI, cardWidth, 16, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(22, 101, 52); // green-800
  doc.text("RIGHT / CORRECT (GREEN)", 14 + cardWidth + 7, startYKPI + 5);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${testResult.correctAnswers || 0}`, 14 + cardWidth + 7, startYKPI + 12);

  // Card 3: RED - Wrong Answers
  doc.setFillColor(254, 226, 226); // red-100
  doc.roundedRect(14 + (cardWidth + 3) * 2, startYKPI, cardWidth, 16, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(185, 28, 28); // red-700
  doc.text("WRONG / INCORRECT (RED)", 14 + (cardWidth + 3) * 2 + 5, startYKPI + 5);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${testResult.wrongAnswers || 0}`, 14 + (cardWidth + 3) * 2 + 5, startYKPI + 12);

  // Card 4: YELLOW - Not Attempted
  const unattemptedCount =
    testResult.unanswered ??
    testResult.unattempted ??
    Math.max(
      0,
      (testResult.totalQuestions || 30) -
        ((testResult.correctAnswers || 0) + (testResult.wrongAnswers || 0))
    );

  doc.setFillColor(254, 243, 199); // amber-100
  doc.roundedRect(14 + (cardWidth + 3) * 3, startYKPI, cardWidth, 16, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text("NOT ATTEMPTED (YELLOW)", 14 + (cardWidth + 3) * 3 + 4, startYKPI + 5);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${unattemptedCount}`, 14 + (cardWidth + 3) * 3 + 4, startYKPI + 12);

  // 4. Topic Competency Breakdown
  const startYTopics = startYKPI + 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("TOPIC COMPETENCY & ACCURACY BREAKDOWN", 14, startYTopics);

  const topicRows = (testResult.topicBreakdown || []).map((t) => [
    t.topic,
    `${t.correct} / ${t.total}`,
    `${t.percentage}%`,
    t.percentage >= 80 ? "Proficient" : t.percentage >= 60 ? "Competent" : "Needs Review",
  ]);

  autoTable(doc, {
    startY: startYTopics + 3,
    head: [["Technical Domain / Topic", "Score", "Accuracy", "Mastery Level"]],
    body: topicRows,
    theme: "striped",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  // 5. COLOR-CODED 30-QUESTION TABLE
  // Color specifications:
  // RIGHT questions: GREEN (Text [22, 101, 52], Fill [220, 252, 231])
  // WRONG questions: RED (Text [185, 28, 28], Fill [254, 226, 226])
  // NOT ATTEMPTED questions: YELLOW (Text [180, 83, 9], Fill [254, 243, 199])

  const startYQuestions = (doc.lastAutoTable?.finalY || 135) + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("30-QUESTION DETAILED EVALUATION & ANSWERS", 14, startYQuestions);

  const questionRows = (testResult.answers || []).map((a, idx) => {
    const isUnattempted = a.selectedOption === undefined || a.selectedOption === -1;
    const isRight = !isUnattempted && a.isCorrect;
    const isWrong = !isUnattempted && !a.isCorrect;

    let statusText = "NOT ATTEMPTED";
    if (isRight) statusText = "RIGHT";
    if (isWrong) statusText = "WRONG";

    const selectedText = isUnattempted
      ? "(Not Attempted)"
      : (a.options && a.options[a.selectedOption]) || `Option ${a.selectedOption + 1}`;

    const correctText = (a.options && a.options[a.correctOption]) || `Option ${a.correctOption + 1}`;

    return [
      `Q${idx + 1}`,
      a.question,
      selectedText,
      correctText,
      statusText,
      a.explanation || "Correct choice as per technical standards.",
    ];
  });

  autoTable(doc, {
    startY: startYQuestions + 3,
    head: [["#", "Question Prompt", "Candidate Answer", "Correct Answer", "Status", "AI Explanation"]],
    body: questionRows,
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.2,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 9, fontStyle: "bold", halign: "center" },
      1: { cellWidth: 45 },
      2: { cellWidth: 32 },
      3: { cellWidth: 32 },
      4: { cellWidth: 22, fontStyle: "bold", halign: "center" },
      5: { cellWidth: 42 },
    },
    // COLOR-CODING IMPLEMENTATION
    // Right questions in GREEN, Wrong questions in RED, Not attempted in YELLOW
    didParseCell: function (data) {
      if (data.section === "body") {
        const rowData = data.row.raw;
        const status = rowData[4]; // "RIGHT", "WRONG", "NOT ATTEMPTED"

        if (status === "RIGHT") {
          // Status badge cell
          if (data.column.index === 4) {
            data.cell.styles.fillColor = [220, 252, 231]; // Light green background
            data.cell.styles.textColor = [22, 101, 52]; // Dark green text
            data.cell.styles.fontStyle = "bold";
          } else if (data.column.index === 0) {
            data.cell.styles.textColor = [22, 101, 52];
            data.cell.styles.fillColor = [240, 253, 244];
          } else if (data.column.index === 2) {
            data.cell.styles.textColor = [22, 101, 52];
            data.cell.styles.fontStyle = "bold";
          }
        } else if (status === "WRONG") {
          // Status badge cell
          if (data.column.index === 4) {
            data.cell.styles.fillColor = [254, 226, 226]; // Light red background
            data.cell.styles.textColor = [185, 28, 28]; // Dark red text
            data.cell.styles.fontStyle = "bold";
          } else if (data.column.index === 0) {
            data.cell.styles.textColor = [185, 28, 28];
            data.cell.styles.fillColor = [254, 242, 242];
          } else if (data.column.index === 2) {
            data.cell.styles.textColor = [185, 28, 28];
            data.cell.styles.fontStyle = "bold";
          }
        } else if (status === "NOT ATTEMPTED") {
          // Status badge cell
          if (data.column.index === 4) {
            data.cell.styles.fillColor = [254, 243, 199]; // Light yellow background
            data.cell.styles.textColor = [180, 83, 9]; // Dark yellow text
            data.cell.styles.fontStyle = "bold";
          } else if (data.column.index === 0) {
            data.cell.styles.textColor = [180, 83, 9];
            data.cell.styles.fillColor = [254, 252, 232];
          } else if (data.column.index === 2) {
            data.cell.styles.textColor = [180, 83, 9];
            data.cell.styles.fontStyle = "italic";
          }
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // Footer on each page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Interview Ace AI | Official Mock MCQ Performance Report | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  const safeRole = (testResult.role || "Technical").replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`InterviewAce_MCQ_${safeRole}_Report.pdf`);
}

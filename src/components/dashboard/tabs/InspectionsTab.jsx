// components/dashboard/tabs/InspectionsTab.jsx
import React, { useState } from "react";
import jsPDF from "jspdf";
import { getInspections } from "@/services/inspections/inspectionService";
import InspectionTable from "../InspectionTable";
import InspectionDetail from "../InspectionDetail";
import StoreInspections from "../StoreInspections";

const InspectionsTab = ({
  selectedStore,
  dateRange,
  searchQuery,
  selectedInspection,
  onSelectInspection,
  itemsPerPage,
  onTotalCountChange,
  showNotification,
  dashboardRef,
  exportOptions,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inspections, setInspections] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);

  // Handle delete action
  const handleInspectionDelete = async (inspectionId) => {
    try {
      // In a real app, you would call a service to delete the inspection
      // await deleteInspection(inspectionId);

      // For now, we'll just log the deletion
      console.log("Delete inspection:", inspectionId);

      // Reset selected inspection if the deleted one was selected
      if (selectedInspection && selectedInspection.id === inspectionId) {
        onSelectInspection(null);
      }

      // Show success notification
      showNotification("Inspection deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting inspection:", error);
      showNotification("Failed to delete inspection", "error");
    }
  };

  // Function to show issues directly
  const handleViewIssues = (inspection) => {
    // Filter only the failed items for this inspection
    if (inspection.items) {
      const failedItems = inspection.items.filter(
        (item) => item.status === "fail"
      );
      if (failedItems.length > 0) {
        // Set the selected inspection and view its details
        onSelectInspection({
          ...inspection,
          items: failedItems, // Only show the failed items
        });
      } else {
        showNotification("No issues found for this inspection", "info");
      }
    } else {
      showNotification("No detailed item data available", "warning");
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of the element on page change
    if (dashboardRef?.current) {
      dashboardRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Handle export to PDF
  const handleExportToPDF = async () => {
    try {
      setExportLoading(true);

      // Fetch data for export
      const { data } = await getInspections({
        storeId: selectedStore,
        startDate: dateRange.start,
        endDate: dateRange.end,
        searchQuery,
        itemsPerPage: 100, // Get more data for the report
        sortField: "timestamp",
        sortDirection: "desc",
      });

      // Create PDF and set properties based on options
      const pdf = new jsPDF(
        exportOptions.paperSize === "landscape" ? "l" : "p",
        "mm",
        exportOptions.paperSize
      );

      // Add title
      pdf.setFontSize(20);
      pdf.text("Inspection Report", 105, 15, { align: "center" });

      // Add store info and date range
      pdf.setFontSize(12);
      const storeName =
        selectedStore === "all"
          ? "All Stores"
          : data.length > 0
          ? data[0].storeName
          : "Selected Store";

      pdf.text(`Store: ${storeName}`, 20, 30);
      pdf.text(
        `Date Range: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`,
        20,
        40
      );
      pdf.text(`Total Inspections: ${data.length}`, 20, 50);

      // Add logo if enabled
      if (exportOptions.includeLogo) {
        // In a real app, you would load a company logo
        // For this example, just draw a placeholder
        pdf.setFillColor(59, 130, 246); // Blue color
        pdf.rect(150, 20, 30, 15, "F");
        pdf.setTextColor(255);
        pdf.setFontSize(10);
        pdf.text("LOGO", 165, 30, { align: "center" });
        pdf.setTextColor(0);
        pdf.setFontSize(12);
      }

      // Add table headers
      pdf.setFontSize(10);
      pdf.text("Date", 20, 70);
      pdf.text("Inspector", 70, 70);
      pdf.text("Issues", 120, 70);
      pdf.text("Status", 160, 70);

      // Add line under headers
      pdf.line(20, 72, 190, 72);

      // Add table data
      let y = 80;

      // Limit rows based on detail level
      const maxRows =
        exportOptions.detailLevel === "summary"
          ? 10
          : exportOptions.detailLevel === "basic"
          ? 20
          : 50;
      const exportData = data.slice(0, maxRows);

      exportData.forEach((inspection, index) => {
        const date =
          inspection.timestamp instanceof Date
            ? inspection.timestamp.toLocaleDateString()
            : new Date(inspection.timestamp).toLocaleDateString();

        pdf.text(date, 20, y);
        pdf.text(inspection.submittedBy || "Unknown", 70, y);
        pdf.text(inspection.issueItems?.toString() || "0", 120, y);
        pdf.text(inspection.issueItems > 0 ? "Issues Found" : "Passed", 160, y);

        y += 10;

        // Add more details if full detail level is selected
        if (exportOptions.detailLevel === "full" && inspection.items) {
          // Add issues details
          const failedItems = inspection.items.filter(
            (item) => item.status === "fail"
          );
          if (failedItems.length > 0) {
            pdf.setFontSize(8);
            pdf.text("Issues:", 30, y);
            y += 5;

            failedItems.forEach((item, i) => {
              if (y > 270) {
                pdf.addPage();
                y = 20;
              }

              pdf.text(
                `- Item #${item.id}: ${item.description.substring(0, 60)}`,
                30,
                y
              );
              y += 4;
            });

            pdf.setFontSize(10);
          }
        }

        // Add new page if needed
        if (y > 270 && index < exportData.length - 1) {
          pdf.addPage();
          y = 20;
          // Add headers on new page
          pdf.text("Date", 20, y);
          pdf.text("Inspector", 70, y);
          pdf.text("Issues", 120, y);
          pdf.text("Status", 160, y);
          pdf.line(20, y + 2, 190, y + 2);
          y += 10;
        }
      });

      // Add footer with date
      const currentDate = new Date().toLocaleDateString();
      pdf.setFontSize(8);
      pdf.text(`Generated on: ${currentDate}`, 20, 290);

      // Save PDF
      pdf.save(`inspection-report-${currentDate}.pdf`);

      showNotification("PDF exported successfully", "success");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      showNotification("Failed to export PDF", "error");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="mb-6">
      {/* Recent inspections - First part of the dashboard */}
      {!selectedInspection && (
        <div className="mb-6">
          <StoreInspections
            selectedStore={selectedStore}
            dateRange={dateRange}
            limit={5}
            onViewDetail={onSelectInspection}
          />
        </div>
      )}

      {/* Inspection data table or detail view */}
      {selectedInspection ? (
        /* Inspection detail view */
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <InspectionDetail
            inspection={selectedInspection}
            onBack={() => onSelectInspection(null)}
            onDelete={handleInspectionDelete}
          />
        </div>
      ) : (
        /* Inspection table */
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
          <InspectionTable
            storeId={selectedStore}
            dateRange={dateRange}
            searchQuery={searchQuery}
            onSelect={onSelectInspection}
            onDelete={handleInspectionDelete}
            onViewIssues={handleViewIssues}
            onTotalCountChange={onTotalCountChange}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onTotalPagesChange={setTotalPages}
            setInspections={setInspections}
          />

          {/* Pagination rendered here or in a separate component */}
          {/* ... */}
        </div>
      )}

      {/* Export PDF function passed via props up to Dashboard Filters */}
      {/* This would be used in a real app to bind the export function to the Export button */}
    </div>
  );
};

export default InspectionsTab;

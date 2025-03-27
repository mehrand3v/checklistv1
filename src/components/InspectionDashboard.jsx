import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { getDocuments } from "@/services/db";
import {
  getInspectionsWithIssues,
  getInspectionStatsByStore,
} from "@/services/storeService";
import { logPageView } from "@/services/analytics";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Search,
  Clipboard,
  RefreshCw,
  Clock,
  User,
  Store,
  ListChecks,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const InspectionDashboard = () => {
  const [inspections, setInspections] = useState([]);
  const [filteredInspections, setFilteredInspections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inspectionsWithIssues, setInspectionsWithIssues] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    logPageView("inspection_dashboard");
    fetchInspections();
    fetchInspectionsWithIssues();
  }, []);

  useEffect(() => {
    filterInspections();
  }, [searchTerm, inspections, dateFilter, activeFilter]);

  const fetchInspections = async () => {
    try {
      setIsLoading(true);
      const fetchedInspections = await getDocuments("inspections");

      // Sort by date (newest first)
      const sortedInspections = fetchedInspections.sort(
        (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
      );

      setInspections(sortedInspections);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      setIsLoading(false);
    }
  };

  const fetchInspectionsWithIssues = async () => {
    try {
      const issues = await getInspectionsWithIssues(5);
      setInspectionsWithIssues(issues);
    } catch (error) {
      console.error("Error fetching inspections with issues:", error);
    }
  };

  const filterInspections = () => {
    // Start with all inspections
    let filtered = [...inspections];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (inspection) =>
          (inspection.inspector &&
            inspection.inspector
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (inspection.storeNumber &&
            inspection.storeNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const today = dayjs();
      let startDate;

      switch (dateFilter) {
        case "today":
          startDate = today.startOf("day");
          break;
        case "week":
          startDate = today.subtract(7, "day");
          break;
        case "month":
          startDate = today.subtract(30, "day");
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter((inspection) =>
          dayjs(inspection.date).isAfter(startDate)
        );
      }
    }

    // Apply status filter
    if (activeFilter === "issues") {
      filtered = filtered.filter(
        (inspection) =>
          inspection.checklistItems &&
          inspection.checklistItems.some((item) => item.status === false)
      );
    } else if (activeFilter === "completed") {
      filtered = filtered.filter(
        (inspection) =>
          inspection.checklistItems &&
          inspection.checklistItems.every((item) => item.status === true)
      );
    }

    setFilteredInspections(filtered);
  };

  const openInspectionDetails = (inspection) => {
    setSelectedInspection(inspection);
  };

  const closeInspectionDetails = () => {
    setSelectedInspection(null);
  };

  const getItemStatusColor = (item) => {
    if (item.status === true) return "text-green-600";
    if (item.status === false) {
      return item.corrected ? "text-yellow-600" : "text-red-600";
    }
    return "text-gray-500";
  };

  const getInspectionStatusBadge = (inspection) => {
    if (!inspection.checklistItems) return null;

    const allPassed = inspection.checklistItems.every(
      (item) => item.status === true
    );
    const hasFailed = inspection.checklistItems.some(
      (item) => item.status === false && item.corrected !== true
    );

    if (allPassed) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          All Passed
        </Badge>
      );
    } else if (hasFailed) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          Has Issues
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          Issues Fixed
        </Badge>
      );
    }
  };

  const getInspectionStats = () => {
    const total = inspections.length;
    const withIssues = inspections.filter(
      (inspection) =>
        inspection.checklistItems &&
        inspection.checklistItems.some((item) => item.status === false)
    ).length;

    const completed = inspections.filter(
      (inspection) =>
        inspection.checklistItems &&
        inspection.checklistItems.every((item) => item.status === true)
    ).length;

    return { total, withIssues, completed };
  };

  const handleStartNewInspection = () => {
    // Navigate to the SwipeChecklist component
    navigate("/inspection/new");
  };

  const stats = getInspectionStats();

  return (
    <div className="container mx-auto p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Inspection Dashboard
          </h1>
          <p className="text-gray-500">Monitor and manage store inspections</p>
        </div>

        <Button
          onClick={handleStartNewInspection}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Clipboard className="mr-2 h-4 w-4" /> Start New Inspection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Inspections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Clipboard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              With Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold">{stats.withIssues}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Complete & Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {inspectionsWithIssues.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-yellow-600" />
              Recent Inspections with Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40">
              <div className="space-y-3">
                {inspectionsWithIssues.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => openInspectionDetails(inspection)}
                  >
                    <div className="flex items-center">
                      <XCircle className="h-5 w-5 text-red-500 mr-3" />
                      <div>
                        <p className="font-medium">
                          Store {inspection.storeNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {dayjs(inspection.date).format("MMM D, YYYY")} •{" "}
                          {inspection.inspector}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 lg:p-6 border-b">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeFilter === "all"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveFilter("all")}
              >
                All Inspections
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeFilter === "issues"
                    ? "bg-red-100 text-red-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveFilter("issues")}
              >
                With Issues
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeFilter === "completed"
                    ? "bg-green-100 text-green-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveFilter("completed")}
              >
                Complete & Passed
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search inspector or store..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2">
                <select
                  className="border rounded-md px-3 py-2 bg-white text-sm"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>

                <Button
                  onClick={fetchInspections}
                  variant="outline"
                  size="icon"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Inspections Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>Store Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                    <p className="text-gray-500">Loading inspections...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredInspections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <Clipboard className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No inspections found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Try adjusting your filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInspections.map((inspection) => (
                <TableRow
                  key={inspection.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openInspectionDetails(inspection)}
                >
                  <TableCell>
                    {dayjs(inspection.date).format("MMM D, YYYY")}
                  </TableCell>
                  <TableCell>{inspection.inspector}</TableCell>
                  <TableCell>{inspection.storeNumber}</TableCell>
                  <TableCell>{getInspectionStatusBadge(inspection)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInspectionDetails(inspection);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Inspection Details Modal */}
      <Dialog open={!!selectedInspection} onOpenChange={closeInspectionDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Clipboard className="mr-2 h-5 w-5 text-blue-600" />
              Inspection Details
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            {selectedInspection && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-500">
                            Date:
                          </span>
                          <span className="ml-2">
                            {dayjs(selectedInspection.date).format(
                              "MMMM D, YYYY"
                            )}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-500">
                            Inspector:
                          </span>
                          <span className="ml-2">
                            {selectedInspection.inspector}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <Store className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-500">
                            Store Number:
                          </span>
                          <span className="ml-2">
                            {selectedInspection.storeNumber}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-500">
                            Completed At:
                          </span>
                          <span className="ml-2">
                            {selectedInspection.completedAt
                              ? dayjs(
                                  selectedInspection.completedAt.toDate
                                    ? selectedInspection.completedAt.toDate()
                                    : selectedInspection.completedAt
                                ).format("hh:mm A")
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">Inspection Summary</h3>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-green-50 p-2 rounded">
                            <p className="text-xl font-bold text-green-600">
                              {selectedInspection.checklistItems?.filter(
                                (item) => item.status === true
                              ).length || 0}
                            </p>
                            <p className="text-xs text-gray-600">Passed</p>
                          </div>

                          <div className="bg-yellow-50 p-2 rounded">
                            <p className="text-xl font-bold text-yellow-600">
                              {selectedInspection.checklistItems?.filter(
                                (item) =>
                                  item.status === false &&
                                  item.corrected === true
                              ).length || 0}
                            </p>
                            <p className="text-xs text-gray-600">Fixed</p>
                          </div>

                          <div className="bg-red-50 p-2 rounded">
                            <p className="text-xl font-bold text-red-600">
                              {selectedInspection.checklistItems?.filter(
                                (item) =>
                                  item.status === false &&
                                  item.corrected !== true
                              ).length || 0}
                            </p>
                            <p className="text-xs text-gray-600">Issues</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium mb-3 flex items-center">
                    <ListChecks className="h-4 w-4 mr-2 text-blue-600" />
                    Checklist Items
                  </h3>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInspection?.checklistItems?.map(
                        (item, index) => (
                          <TableRow key={item.id || index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {item.description}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`flex items-center ${getItemStatusColor(
                                  item
                                )}`}
                              >
                                {item.status === true ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                                    <span>Passed</span>
                                  </>
                                ) : item.status === false ? (
                                  item.corrected ? (
                                    <>
                                      <AlertCircle className="h-4 w-4 mr-1 text-yellow-600" />
                                      <span>Fixed On-site</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 mr-1 text-red-600" />
                                      <span>Failed</span>
                                    </>
                                  )
                                ) : (
                                  <>
                                    <div className="h-4 w-4 mr-1 bg-gray-200 rounded-full" />
                                    <span>Not Checked</span>
                                  </>
                                )}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              {item.details ? (
                                <p
                                  className="text-sm text-gray-600 truncate"
                                  title={item.details}
                                >
                                  {item.details}
                                </p>
                              ) : (
                                <span className="text-sm text-gray-400">
                                  No details
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={closeInspectionDetails}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InspectionDashboard;

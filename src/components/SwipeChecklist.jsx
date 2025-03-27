import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  X,
  AlertTriangle,
  Calendar,
  Store,
  User,
  ChevronRight,
  ListChecks,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coffee,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  Utensils,
  Trash2,
  Droplets,
  Thermometer,
  ClipboardCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { addDocument, getDocuments } from "@/services/db";
import { logCustomEvent } from "@/services/analytics";

const morningChecklistItems = [
  {
    id: 1,
    description: "Is the hotdog/Grill Area clean?",
    icon: "Utensils",
  },
  {
    id: 2,
    description:
      "Are there product Tags/IDs available for each product on roller grill?",
    icon: "ClipboardCheck",
  },
  {
    id: 3,
    description: "Hotdog Buns labeled and are in date?",
    icon: "ShoppingCart",
  },
  {
    id: 4,
    description: "Are tongs clean? Are Tongs in place?",
    icon: "Utensils",
  },
  {
    id: 5,
    description: "Fresh Condiments and Bottle Condiments labeled?",
    icon: "Droplets",
  },
  {
    id: 6,
    description: "Under Counter Hotdog Containers labeled properly?",
    icon: "ClipboardCheck",
  },
  { id: 7, description: "Is fountain area clean?", icon: "Droplets" },
  {
    id: 8,
    description: "Are fountain machine nozzles free of any buildup?",
    icon: "Droplets",
  },
  {
    id: 9,
    description:
      "Are top of coffee machine and container tops free of beans and dust?",
    icon: "Coffee",
  },
  { id: 10, description: "Is coffee area clean?", icon: "Coffee" },
  {
    id: 11,
    description:
      "Do cold creamers have expiration labels on them and machine free from buildup?",
    icon: "Thermometer",
  },
  {
    id: 12,
    description: "Pizza Warmer / Flexserve free of any expired products?",
    icon: "Thermometer",
  },
  {
    id: 13,
    description:
      "Does bakery case has all labels/tags that include calories information",
    icon: "ClipboardCheck",
  },
  {
    id: 14,
    description: 'Only "Approved" chemicals in chemical area?',
    icon: "AlertCircle",
  },
  {
    id: 15,
    description: "Any chemical bottle without lid?",
    icon: "AlertCircle",
  },
  {
    id: 16,
    description: "Santizer Bucket prepared and labeled?",
    icon: "Droplets",
  },
  {
    id: 17,
    description: "Santizer Sink Prepared and labeled?",
    icon: "Droplets",
  },
  {
    id: 18,
    description: "Sanitizer bottle prepared and labeled?",
    icon: "Droplets",
  },
  {
    id: 19,
    description: "Handwashing Sink free of any clutter and Employee Cups/Mugs",
    icon: "Droplets",
  },
  {
    id: 20,
    description: "Ecosure Logs are in Conspicuous and visible place?",
    icon: "ClipboardCheck",
  },
  {
    id: 21,
    description:
      "Restrooms Clean and stocked with Handwashing soap,tissue and paper towels?",
    icon: "Droplets",
  },
  { id: 22, description: "Dumspter Lid Closed?", icon: "Trash2" },
  {
    id: 23,
    description: "Paper Towels available near handwashing sink?",
    icon: "Droplets",
  },
  { id: 24, description: "Mops Stored properly?", icon: "Droplets" },
  {
    id: 25,
    description: "Cashier knows about 6 food allergens?",
    icon: "AlertCircle",
  },
  { id: 26, description: "Microwaves clean?", icon: "Utensils" },
];

// Map of icon names to Lucide React components
const iconMap = {
  ShoppingCart: ShoppingCart,
  ListChecks: ListChecks,
  Coffee: Coffee,
  AlertCircle: AlertCircle,
  CheckCircle2: CheckCircle2,
  Utensils: Utensils,
  Trash2: Trash2,
  Droplets: Droplets,
  Thermometer: Thermometer,
  ClipboardCheck: ClipboardCheck,
};

const SwipeChecklist = () => {
  const [inspector, setInspector] = useState("");
  const [storeNumber, setStoreNumber] = useState("");
  const [storeOptions, setStoreOptions] = useState([]);
  const [date, setDate] = useState(new Date());
  const [checklistItems, setChecklistItems] = useState(
    morningChecklistItems.map((item) => ({
      ...item,
      status: null,
      details: "",
      corrected: null,
    }))
  );

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [detailsModal, setDetailsModal] = useState(false);
  const [modalDetails, setModalDetails] = useState({
    details: "",
    corrected: null,
  });
  const [isInspectionStarted, setIsInspectionStarted] = useState(false);
  const [summaryModal, setSummaryModal] = useState(false);
  const [itemSelectModal, setItemSelectModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [skippedItemsModal, setSkippedItemsModal] = useState(false);
  const [skipReason, setSkipReason] = useState("");

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Fetch store numbers if available
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const stores = await getDocuments("stores");
        if (stores.length > 0) {
          setStoreOptions(stores.map((store) => store.storeNumber || store.id));
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, []);

  const handleSwipe = (status) => {
    if (!status) {
      setDetailsModal(true);
    } else {
      const updatedItems = [...checklistItems];
      updatedItems[currentItemIndex].status = true;
      setChecklistItems(updatedItems);
      moveToNextItem();

      // Log event for analytics
      logCustomEvent("inspection_item_passed", {
        itemId: updatedItems[currentItemIndex].id,
        description: updatedItems[currentItemIndex].description,
      });
    }
  };

  const handleDetailsSubmit = () => {
    const updatedItems = [...checklistItems];
    updatedItems[currentItemIndex].status = false;
    updatedItems[currentItemIndex].details = modalDetails.details;
    updatedItems[currentItemIndex].corrected = modalDetails.corrected;
    setChecklistItems(updatedItems);
    setDetailsModal(false);
    moveToNextItem();

    // Log event for analytics
    logCustomEvent("inspection_item_failed", {
      itemId: updatedItems[currentItemIndex].id,
      description: updatedItems[currentItemIndex].description,
      corrected: modalDetails.corrected,
    });
  };

  const moveToNextItem = () => {
    if (currentItemIndex < checklistItems.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setModalDetails({ details: "", corrected: null });
    } else {
      // Show summary modal when all items are completed
      setSummaryModal(true);
    }
  };

  const moveToPreviousItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    }
  };

  const jumpToItem = (index) => {
    setCurrentItemIndex(index);
    setItemSelectModal(false);
  };

  const startInspection = async () => {
    if (!inspector || !storeNumber || !date) {
      alert("Please fill in all inspection details");
      return;
    }

    setIsInspectionStarted(true);

    // Log event for analytics
    logCustomEvent("inspection_started", {
      inspector,
      storeNumber,
      date: dayjs(date).format("YYYY-MM-DD"),
    });
  };

  const finishInspection = async () => {
    // First mark items that were navigated with arrows but not answered as skipped
    const updatedItems = [...checklistItems];
    let hasSkipped = false;

    updatedItems.forEach((item, index) => {
      if (item.status === null) {
        hasSkipped = true;
      }
    });

    // Check for skipped items
    if (hasSkipped && !skipReason) {
      setSkippedItemsModal(true);
      return;
    }

    try {
      const inspectionData = {
        inspector,
        storeNumber,
        date: dayjs(date).format("YYYY-MM-DD"),
        checklistItems: updatedItems,
        completedAt: new Date(),
        skipReason: skipReason || null,
      };

      await addDocument("inspections", inspectionData);

      // Log event for analytics
      logCustomEvent("inspection_completed", {
        inspector,
        storeNumber,
        passedItems: updatedItems.filter((item) => item.status === true).length,
        failedItems: updatedItems.filter((item) => item.status === false)
          .length,
        skippedItems: updatedItems.filter((item) => item.status === null)
          .length,
      });

      // Reset everything
      setInspector("");
      setStoreNumber("");
      setDate(new Date());
      setChecklistItems(
        morningChecklistItems.map((item) => ({
          ...item,
          status: null,
          details: "",
          corrected: null,
        }))
      );
      setCurrentItemIndex(0);
      setIsInspectionStarted(false);
      setSummaryModal(false);
      setSkipReason("");
    } catch (error) {
      console.error("Error saving inspection:", error);
      alert("Failed to save inspection");
    }
  };

  const currentItem = checklistItems[currentItemIndex];
  const IconComponent =
    currentItem && iconMap[currentItem.icon]
      ? iconMap[currentItem.icon]
      : ListChecks;

  const getStatusSummary = () => {
    const passed = checklistItems.filter((item) => item.status === true).length;
    const failed = checklistItems.filter(
      (item) => item.status === false
    ).length;
    const corrected = checklistItems.filter(
      (item) => item.status === false && item.corrected === true
    ).length;
    const uncorrected = failed - corrected;
    const skipped = checklistItems.filter(
      (item) => item.status === null
    ).length;

    return { passed, failed, corrected, uncorrected, skipped };
  };

  // Helper function to get status label
  const getItemStatusLabel = (index) => {
    const item = checklistItems[index];
    if (item.status === true) return "Passed";
    if (item.status === false) {
      return item.corrected ? "Fixed" : "Failed";
    }
    return "Not Checked";
  };

  // Page transition variants for smoother animations
  const pageTransition = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: {
      type: "tween",
      ease: "easeInOut",
      duration: 0.3,
    },
  };

  if (!isInspectionStarted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-4"
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 text-white p-4 rounded-full">
              <ListChecks size={32} />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Morning Inspection
          </h2>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <User className="text-blue-500" />
              <Input
                placeholder="Inspector Name"
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Store className="text-blue-500" />
              <Input
                placeholder="Store Number"
                value={storeNumber}
                onChange={(e) => setStoreNumber(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                list="store-options"
              />
              {storeOptions.length > 0 && (
                <datalist id="store-options">
                  {storeOptions.map((store) => (
                    <option key={store} value={store} />
                  ))}
                </datalist>
              )}
            </div>

            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Calendar className="text-blue-500" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="pl-0 text-left font-normal"
                  >
                    {date ? dayjs(date).format("YYYY-MM-DD") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              onClick={startInspection}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg font-medium py-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
              disabled={!inspector || !storeNumber || !date}
            >
              Start Inspection
              <ChevronRight className="ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col"
    >
      {/* Progress Indicator - for mobile, placed at the top */}
      {isMobileView && (
        <div className="px-4 pt-4 pb-2 bg-white shadow-lg sticky top-0 z-10 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                <Clock size={16} />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  PROGRESS
                </div>
                <div className="text-base font-semibold text-gray-800">
                  {currentItemIndex >= checklistItems.length - 1
                    ? 100
                    : Math.round(
                        (currentItemIndex / (checklistItems.length - 1)) * 100
                      )}
                  % Complete
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setItemSelectModal(true)}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <ListChecks size={16} className="mr-2" />
              Jump
            </Button>
          </div>

          {/* Progress indicators */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-1 mb-0.5">
                <span className="text-xs font-medium text-gray-600">
                  Item {currentItemIndex + 1}/{checklistItems.length}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span
                  className="text-xs font-medium"
                  style={{
                    color:
                      currentItem && currentItem.status === true
                        ? "#10B981"
                        : currentItem && currentItem.status === false
                        ? "#EF4444"
                        : "#6B7280",
                  }}
                >
                  {currentItem
                    ? getItemStatusLabel(currentItemIndex)
                    : "Not Checked"}
                </span>
              </div>

              {/* Enhanced progress bar for mobile */}
              <div className="relative">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-in-out relative"
                    style={{
                      width: `${
                        currentItemIndex >= checklistItems.length - 1
                          ? 100
                          : Math.max(
                              3,
                              (currentItemIndex / (checklistItems.length - 1)) *
                                100
                            )
                      }%`,
                      background: "linear-gradient(to right, #818CF8, #6366F1)",
                    }}
                  >
                    <div className="absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-indigo-400 to-transparent opacity-70"></div>
                  </div>
                </div>

                {/* Pulse dot indicator */}
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 rounded-full shadow-md flex items-center justify-center animate-pulse"
                  style={{
                    left: `${
                      currentItemIndex >= checklistItems.length - 1
                        ? 97
                        : Math.min(
                            97,
                            Math.max(
                              0,
                              (currentItemIndex / (checklistItems.length - 1)) *
                                100
                            )
                          )
                    }%`,
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#FFFFFF",
                    border: "2px solid #6366F1",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mini status indicators */}
          <div className="flex overflow-x-auto pb-1 -mx-4 px-4 space-x-0.5">
            {checklistItems
              .slice(0, Math.min(20, checklistItems.length))
              .map((item, index) => {
                let bgColor = "bg-gray-200";
                if (item.status === true) {
                  bgColor = "bg-green-500";
                } else if (item.status === false) {
                  bgColor = item.corrected ? "bg-yellow-500" : "bg-red-500";
                } else if (index === currentItemIndex) {
                  bgColor = "bg-indigo-500";
                }

                return (
                  <div
                    key={item.id}
                    className={`h-1 flex-1 ${bgColor} rounded-full cursor-pointer transition-all duration-300`}
                    onClick={() => jumpToItem(index)}
                  />
                );
              })}
            {checklistItems.length > 20 && (
              <div className="text-xs pl-1 text-gray-400">...</div>
            )}
          </div>
        </div>
      )}

      {/* Issue Details Modal */}
      <Dialog open={detailsModal} onOpenChange={setDetailsModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 text-red-500" /> Issue Detected
            </DialogTitle>
            <DialogDescription>
              Provide details about the problem
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Describe the issue in detail"
            value={modalDetails.details}
            onChange={(e) =>
              setModalDetails((prev) => ({
                ...prev,
                details: e.target.value,
              }))
            }
            className="h-32 border-2 border-red-100 focus:border-red-300"
          />

          <div className="flex justify-center space-x-4 mt-4">
            <Button
              variant={modalDetails.corrected === true ? "default" : "outline"}
              onClick={() =>
                setModalDetails((prev) => ({ ...prev, corrected: true }))
              }
              className={`flex-1 ${
                modalDetails.corrected === true
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "border-green-500 text-green-500 hover:bg-green-50"
              }`}
            >
              <CheckCircle2 className="mr-2" /> Fixed On-Site
            </Button>
            <Button
              variant={modalDetails.corrected === false ? "default" : "outline"}
              onClick={() =>
                setModalDetails((prev) => ({ ...prev, corrected: false }))
              }
              className={`flex-1 ${
                modalDetails.corrected === false
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "border-red-500 text-red-500 hover:bg-red-50"
              }`}
            >
              <XCircle className="mr-2" /> Needs Action
            </Button>
          </div>

          <Button
            onClick={handleDetailsSubmit}
            disabled={!modalDetails.details || modalDetails.corrected === null}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Submit
          </Button>
        </DialogContent>
      </Dialog>

      {/* Summary Modal */}
      <Dialog open={summaryModal} onOpenChange={setSummaryModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-blue-600">
              <ListChecks className="mr-2 text-blue-500" /> Inspection Summary
            </DialogTitle>
            <DialogDescription>
              Review and submit your inspection results
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Inspector</p>
                <p className="font-semibold">{inspector}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Store</p>
                <p className="font-semibold">{storeNumber}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Date</p>
                <p className="font-semibold">
                  {dayjs(date).format("YYYY-MM-DD")}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Time</p>
                <p className="font-semibold">{dayjs().format("HH:mm")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="flex justify-center">
                  <CheckCircle2 className="text-green-500 mb-1" size={24} />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {getStatusSummary().passed}
                </p>
                <p className="text-sm text-green-600">Items Passed</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="flex justify-center">
                  <XCircle className="text-red-500 mb-1" size={24} />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {getStatusSummary().failed}
                </p>
                <p className="text-sm text-red-600">Items Failed</p>
              </div>
            </div>

            {getStatusSummary().skipped > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg text-center mb-6">
                <div className="flex justify-center">
                  <AlertCircle className="text-yellow-500 mb-1" size={24} />
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {getStatusSummary().skipped}
                </p>
                <p className="text-sm text-yellow-600">Items Skipped</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-yellow-600 border-yellow-300 hover:bg-yellow-100"
                  onClick={() => setItemSelectModal(true)}
                >
                  View Skipped Items
                </Button>
              </div>
            )}

            {getStatusSummary().failed > 0 && (
              <div className="mb-6 space-y-2">
                <p className="font-medium text-gray-700">Failed Items:</p>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {checklistItems
                    .filter((item) => item.status === false)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`p-2 rounded-md ${
                          item.corrected ? "bg-yellow-50" : "bg-red-50"
                        }`}
                      >
                        <div className="flex items-start">
                          <div
                            className={`p-1 rounded-full ${
                              item.corrected ? "bg-yellow-100" : "bg-red-100"
                            } mr-2 mt-0.5`}
                          >
                            {item.corrected ? (
                              <AlertCircle
                                size={14}
                                className="text-yellow-600"
                              />
                            ) : (
                              <XCircle size={14} className="text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {item.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.details}
                            </p>
                            <p className="text-xs font-medium mt-1">
                              {item.corrected ? (
                                <span className="text-yellow-600">
                                  Fixed on-site
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  Needs action
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={finishInspection}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Submit Inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Selection Modal */}
      <Dialog open={itemSelectModal} onOpenChange={setItemSelectModal}>
        <DialogContent className="sm:max-w-[425px] max-w-[90vw] max-h-[80vh] overflow-auto p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center text-indigo-600 text-lg sm:text-xl">
              <ListChecks className="mr-2 text-indigo-500 flex-shrink-0" />
              {summaryModal ? "Skipped Items" : "Jump to Item"}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {summaryModal
                ? "Review items that weren't completed"
                : "Select any item to navigate to it"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            {checklistItems
              .filter((item) => !summaryModal || item.status === null)
              .map((item, index) => {
                let statusClass = "bg-gray-100 border-gray-200";
                let statusColor = "text-gray-400";
                let statusIcon = null;
                const originalIndex = checklistItems.findIndex(
                  (i) => i.id === item.id
                );

                if (item.status === true) {
                  statusClass = "bg-green-50 border-green-200";
                  statusColor = "text-green-500";
                  statusIcon = (
                    <CheckCircle2
                      size={20}
                      className="text-green-500 flex-shrink-0"
                    />
                  );
                } else if (item.status === false) {
                  if (item.corrected) {
                    statusClass = "bg-yellow-50 border-yellow-200";
                    statusColor = "text-yellow-500";
                    statusIcon = (
                      <AlertCircle
                        size={20}
                        className="text-yellow-500 flex-shrink-0"
                      />
                    );
                  } else {
                    statusClass = "bg-red-50 border-red-200";
                    statusColor = "text-red-500";
                    statusIcon = (
                      <XCircle
                        size={20}
                        className="text-red-500 flex-shrink-0"
                      />
                    );
                  }
                } else {
                  statusIcon = (
                    <Clock size={20} className="text-gray-400 flex-shrink-0" />
                  );
                }

                // Get icon for this item
                const ItemIcon = iconMap[item.icon] || ListChecks;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border ${statusClass} cursor-pointer hover:bg-opacity-80 transition-all duration-150 flex items-center justify-between`}
                    onClick={() => {
                      jumpToItem(originalIndex);
                      if (summaryModal) setSummaryModal(false);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-indigo-600 text-sm font-medium">
                          {originalIndex + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">
                          {item.description}
                        </p>
                        <p className={`text-xs ${statusColor} mt-0.5`}>
                          {item.status === true
                            ? "Passed"
                            : item.status === false
                            ? item.corrected
                              ? "Fixed"
                              : "Failed"
                            : "Not checked"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center ml-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                        <ItemIcon
                          size={18}
                          className={
                            item.icon === "Utensils"
                              ? "text-orange-500"
                              : item.icon === "Coffee"
                              ? "text-amber-700"
                              : item.icon === "Droplets"
                              ? "text-blue-500"
                              : item.icon === "Thermometer"
                              ? "text-red-500"
                              : item.icon === "ClipboardCheck"
                              ? "text-indigo-500"
                              : item.icon === "ShoppingCart"
                              ? "text-green-500"
                              : item.icon === "Trash2"
                              ? "text-gray-600"
                              : item.icon === "AlertCircle"
                              ? "text-yellow-500"
                              : "text-indigo-400"
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Skipped Items Modal */}
      <Dialog open={skippedItemsModal} onOpenChange={setSkippedItemsModal}>
        <DialogContent className="sm:max-w-[425px] max-w-[90vw] p-4 sm:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3 pb-2">
            <DialogTitle className="flex items-center text-yellow-600 text-lg sm:text-xl">
              <AlertCircle className="mr-2 text-yellow-500 flex-shrink-0" />
              <span>Incomplete Inspection</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Please explain why {getStatusSummary().skipped} item
              {getStatusSummary().skipped !== 1 ? "s were" : " was"} skipped
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Explain the reason for skipping these items..."
            value={skipReason}
            onChange={(e) => setSkipReason(e.target.value)}
            className="h-24 sm:h-32 border-2 border-yellow-100 focus:border-yellow-300 text-sm sm:text-base mt-2"
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSkippedItemsModal(false);
                setItemSelectModal(true);
              }}
              className="border-blue-300 text-blue-600 hover:bg-blue-50 w-full sm:w-auto order-2 sm:order-1"
              size={isMobileView ? "sm" : "default"}
            >
              <ListChecks size={16} className="mr-2" /> Complete All Items
            </Button>
            <Button
              onClick={() => {
                setSkippedItemsModal(false);
                finishInspection();
              }}
              disabled={!skipReason}
              className="bg-yellow-500 hover:bg-yellow-600 text-white w-full sm:w-auto order-1 sm:order-2"
              size={isMobileView ? "sm" : "default"}
            >
              <Check size={16} className="mr-2" /> Submit With Explanation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className="flex-grow flex flex-col justify-center items-center p-4"
        style={{
          paddingBottom: isMobileView ? "140px" : "4px",
          paddingTop: isMobileView ? "100px" : "16px",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItemIndex}
            {...pageTransition}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="outline"
                size="icon"
                onClick={moveToPreviousItem}
                disabled={currentItemIndex === 0}
                className="h-10 w-10 rounded-full"
              >
                <ArrowLeft size={18} />
              </Button>
              <div className="flex justify-center">
                <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                  <IconComponent
                    size={32}
                    className={`${
                      currentItem.icon === "Utensils"
                        ? "text-orange-500"
                        : currentItem.icon === "Coffee"
                        ? "text-brown-600"
                        : currentItem.icon === "Droplets"
                        ? "text-blue-500"
                        : currentItem.icon === "Thermometer"
                        ? "text-red-500"
                        : currentItem.icon === "ClipboardCheck"
                        ? "text-indigo-500"
                        : currentItem.icon === "ShoppingCart"
                        ? "text-green-500"
                        : currentItem.icon === "Trash2"
                        ? "text-gray-600"
                        : currentItem.icon === "AlertCircle"
                        ? "text-yellow-500"
                        : "text-blue-600"
                    }`}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={moveToNextItem}
                disabled={currentItemIndex === checklistItems.length - 1}
                className="h-10 w-10 rounded-full"
              >
                <ArrowRight size={18} />
              </Button>
            </div>

            <div className="mb-8 text-xl font-medium text-center text-gray-800">
              {currentItem.description}
            </div>

            <div className="flex flex-col space-y-4 mt-8">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white py-8 rounded-xl text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => handleSwipe(true)}
              >
                <Check className="mr-3" size={24} /> Yes, Passed
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-red-500 text-red-500 hover:bg-red-50 py-8 rounded-xl text-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => handleSwipe(false)}
              >
                <X className="mr-3" size={24} /> No, Issue Found
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Indicator - for desktop, placed at the bottom */}
      {!isMobileView && (
        <div className="p-4 bg-white shadow-lg rounded-t-xl mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center text-blue-600">
              <Clock className="mr-2" size={18} />
              <span className="text-sm font-medium">
                Item {currentItemIndex + 1} of {checklistItems.length}
              </span>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setItemSelectModal(true)}
                className="text-blue-600 mr-2"
              >
                <ListChecks size={16} className="mr-1" />
                Jump to Item
              </Button>
              <div className="text-sm font-medium text-blue-600">
                {Math.round((currentItemIndex / checklistItems.length) * 100)}%
                Complete
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end"
              style={{
                width: `${Math.max(
                  5,
                  (currentItemIndex / checklistItems.length) * 100
                )}%`,
              }}
            >
              {currentItemIndex > 0 && (
                <div className="h-2 w-2 bg-white rounded-full mr-1 animate-pulse"></div>
              )}
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex flex-wrap gap-1">
            {checklistItems.map((item, index) => {
              let bgColor = "bg-gray-300";
              if (index < currentItemIndex) {
                bgColor =
                  item.status === true
                    ? "bg-green-500"
                    : item.corrected === true
                    ? "bg-yellow-500"
                    : "bg-red-500";
              } else if (index === currentItemIndex) {
                bgColor = "bg-blue-500 animate-pulse";
              }

              return (
                <div
                  key={item.id}
                  className={`w-2 h-2 rounded-full ${bgColor} cursor-pointer transition-all duration-200 hover:scale-150`}
                  onClick={() => jumpToItem(index)}
                  title={`${index + 1}. ${item.description}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SwipeChecklist;

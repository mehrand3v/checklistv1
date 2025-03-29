import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import useInspections from "@/hooks/useInspections"; // Import our custom hook

const InspectionSwipeCards = ({ onComplete }) => {
  const [inspectionItems, setInspectionItems] = useState(inspectionData);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [failReason, setFailReason] = useState("");
  const [inspectionResults, setInspectionResults] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Use our custom hook
  const { submitInspection } = useInspections();

  // Submit all inspection results to Firebase
  const handleSubmitInspection = async () => {
    try {
      // Submit data through our hook
      await submitInspection(inspectionResults);

      alert("Inspection submitted successfully!");

      // Reset the form for a new inspection
      setInspectionItems([...inspectionData]);
      setInspectionResults([]);
      setIsCompleted(false);

      // Notify parent component that inspection is complete
      if (onComplete && typeof onComplete === "function") {
        onComplete();
      }
    } catch (error) {
      console.error("Error submitting inspection:", error);
      alert("Error submitting inspection. Please try again.");
    }
  };

  // Handle the swipe left (fail) action
  const handleFail = (item) => {
    setCurrentItem(item);
    setShowModal(true);
  };

  // Handle the swipe right (pass) action
  const handlePass = (item) => {
    const result = {
      id: item.id,
      description: item.description,
      status: "pass",
    };

    setInspectionResults((prev) => [...prev, result]);
  };

  // Submit fail reason from modal
  const submitFailReason = () => {
    if (!failReason.trim()) {
      alert("Please describe the issue before submitting");
      return;
    }

    const result = {
      id: currentItem.id,
      description: currentItem.description,
      status: "fail",
      failReason: failReason,
    };

    setInspectionResults((prev) => [...prev, result]);
    setFailReason("");
    setShowModal(false);
  };

  // Check if all items have been inspected
  useEffect(() => {
    if (
      inspectionResults.length === inspectionData.length &&
      inspectionData.length > 0
    ) {
      setIsCompleted(true);
    }
  }, [inspectionResults]);

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="grid h-[600px] w-full max-w-md place-items-center bg-neutral-100 rounded-lg mb-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='%23d4d4d4'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
      >
        {inspectionItems.length > 0 ? (
          inspectionItems.map((item) => (
            <InspectionCard
              key={item.id}
              items={inspectionItems}
              setItems={setInspectionItems}
              onFail={() => handleFail(item)}
              onPass={() => handlePass(item)}
              {...item}
            />
          ))
        ) : (
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">Inspection Complete</h3>
            <p>All {inspectionResults.length} items have been reviewed.</p>
            <p className="mt-2">
              Passed:{" "}
              {
                inspectionResults.filter((item) => item.status === "pass")
                  .length
              }{" "}
              items
              <br />
              Failed:{" "}
              {
                inspectionResults.filter((item) => item.status === "fail")
                  .length
              }{" "}
              items
            </p>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="w-full max-w-md mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>
            {inspectionResults.length} of {inspectionData.length} completed
          </span>
          <span>
            {Math.round(
              (inspectionResults.length / inspectionData.length) * 100
            )}
            %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{
              width: `${
                (inspectionResults.length / inspectionData.length) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Submit button - only show when all items are inspected */}
      {isCompleted && (
        <button
          onClick={handleSubmitInspection}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Submit Inspection Results
        </button>
      )}

      {/* Instruction text */}
      {inspectionItems.length > 0 && (
        <div className="mt-4 text-center text-gray-600 text-sm">
          <p>Swipe RIGHT if the item PASSES inspection</p>
          <p>Swipe LEFT if the item FAILS inspection</p>
        </div>
      )}

      {/* Fail reason modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-red-600">Failed Item</h3>
            <p className="mb-4">{currentItem?.description}</p>

            <label className="block mb-2 font-medium">
              Describe the issue in detail:
            </label>
            <textarea
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4 h-32"
              placeholder="Enter detailed description of the issue..."
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={submitFailReason}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InspectionCard = ({
  id,
  description,
  items,
  setItems,
  onFail,
  onPass,
}) => {
  const x = useMotionValue(0);
  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
  const background = useTransform(
    x,
    [-150, 0, 150],
    [
      "rgba(239, 68, 68, 0.2)",
      "rgba(255, 255, 255, 1)",
      "rgba(34, 197, 94, 0.2)",
    ]
  );

  // Visual indicators for swipe direction
  const failOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0]);
  const passOpacity = useTransform(x, [0, 50, 150], [0, 0.5, 1]);

  const isFront = id === items[items.length - 1].id;
  const rotate = useTransform(() => {
    const offset = isFront ? 0 : id % 2 ? 6 : -6;
    return `${rotateRaw.get() + offset}deg`;
  });

  const handleDragEnd = () => {
    if (x.get() < -100) {
      // Swiped Left - Fail
      setItems((pv) => pv.filter((v) => v.id !== id));
      onFail && onFail();
    } else if (x.get() > 100) {
      // Swiped Right - Pass
      setItems((pv) => pv.filter((v) => v.id !== id));
      onPass && onPass();
    }
  };

  return (
    <motion.div
      className="relative h-96 w-72 origin-bottom rounded-lg shadow-lg hover:cursor-grab active:cursor-grabbing overflow-hidden"
      style={{
        gridRow: 1,
        gridColumn: 1,
        x,
        rotate,
        background,
        transition: "0.125s transform",
        boxShadow: isFront
          ? "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
          : undefined,
      }}
      animate={{
        scale: isFront ? 1 : 0.98,
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{
        left: 0,
        right: 0,
      }}
      onDragEnd={handleDragEnd}
    >
      {/* Card Content */}
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <span className="text-gray-500 mb-2">Item {id}</span>
        <h2 className="text-xl font-bold mb-4">{description}</h2>

        {/* Swipe indicators */}
        <div className="absolute inset-x-0 bottom-10 flex justify-between px-6">
          <motion.div
            style={{ opacity: failOpacity }}
            className="flex items-center text-red-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="font-bold">FAIL</span>
          </motion.div>

          <motion.div
            style={{ opacity: passOpacity }}
            className="flex items-center text-green-600"
          >
            <span className="font-bold">PASS</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default InspectionSwipeCards;

// Your inspection data
const inspectionData = [
  { id: 1, description: "Is the hotdog/Grill Area clean ?" },
  {
    id: 2,
    description:
      "Are there product Tags/IDs available for each product on roller grill ?",
  },
  { id: 3, description: "Hotdog Buns labeled and are in date ?" },
  { id: 4, description: "Are tongs clean ? Are Tongs in place ?" },
  { id: 5, description: "Fresh Condiments and Bottle Condiments labeled ?" },
  { id: 6, description: "Under Counter Hotdog Containers labeled properly ?" },
  { id: 7, description: "Is fountain area clean ?" },
  { id: 8, description: "Are fountain machine nozzles free of any buildup ?" },
  {
    id: 9,
    description:
      "Are top of coffee machine and container tops free of beans and dust ?",
  },
  { id: 10, description: "Is coffee area clean ?" },
  {
    id: 11,
    description:
      "Do cold creamers have expiration labels on them and machine free from buildup ?",
  },
  {
    id: 12,
    description: "Pizza Warmer / Flexserve free of any expired products ?",
  },
  {
    id: 13,
    description:
      "Does bakery case has all labels/tags that include calories information",
  },
  { id: 14, description: 'Only "Approved" chemicals in chemical area ?' },
  { id: 15, description: "Any chemical bottle without lid ?" },
  { id: 16, description: "Santizer Bucket prepared and labeled ?" },
  { id: 17, description: "Santizer Sink Prepared and labeled ?" },
  { id: 18, description: "Sanitizer bottle prepared and labeled ?" },
  {
    id: 19,
    description: "Handwashing Sink free of any clutter and Employee Cups/Mugs",
  },
  {
    id: 20,
    description: "Ecosure Logs are in Conspicuous and visible place ?",
  },
  {
    id: 21,
    description:
      "Restrooms Clean and stocked with Handwashing soap,tissue and paper towels ?",
  },
  { id: 22, description: "Dumspter Lid Closed ?" },
  { id: 23, description: "Paper Towels available near handwashing sink ?" },
  { id: 24, description: "Mops Stored properly ?" },
  { id: 25, description: "Cashier knows about 6 food allergens ?" },
  { id: 26, description: "Microwaves clean ?" },
];

// src/components/SwipeChecklist.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import JSConfetti from "js-confetti";
import { Toaster, toast } from "sonner";
import {
  Check,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Utensils,
  Droplet,
  Home,
  Trash2,
  PenTool,
  ShoppingCart,
  Calendar,
  User,
  Building,
  FileCheck,
  Pizza,
  Zap,
  Clipboard,
  Keyboard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { addDocument } from "@/services/db";
import { logCustomEvent } from "@/services/analytics";
import { ANALYTICS_EVENTS } from "@/services/analytics";
import useSwipeGesture from "../hooks/useInspections";

// Constants
const QUESTIONS = [
  { id: 1, description: "Is the hotdog/Grill Area clean?" },
  {
    id: 2,
    description:
      "Are there product Tags/IDs available for each product on roller grill?",
  },
  { id: 3, description: "Hotdog Buns labeled and are in date?" },
  { id: 4, description: "Are tongs clean? Are Tongs in place?" },
  { id: 5, description: "Fresh Condiments and Bottle Condiments labeled?" },
  { id: 6, description: "Under Counter Hotdog Containers labeled properly?" },
  { id: 7, description: "Is fountain area clean?" },
  { id: 8, description: "Are fountain machine nozzles free of any buildup?" },
  {
    id: 9,
    description:
      "Are top of coffee machine and container tops free of beans and dust?",
  },
  { id: 10, description: "Is coffee area clean?" },
  {
    id: 11,
    description:
      "Do cold creamers have expiration labels on them and machine free from buildup?",
  },
  {
    id: 12,
    description: "Pizza Warmer / Flexserve free of any expired products?",
  },
  {
    id: 13,
    description:
      "Does bakery case has all labels/tags that include calories information",
  },
  { id: 14, description: 'Only "Approved" chemicals in chemical area?' },
  { id: 15, description: "Any chemical bottle without lid?" },
  { id: 16, description: "Santizer Bucket prepared and labeled?" },
  { id: 17, description: "Santizer Sink Prepared and labeled?" },
  { id: 18, description: "Sanitizer bottle prepared and labeled?" },
  {
    id: 19,
    description: "Handwashing Sink free of any clutter and Employee Cups/Mugs",
  },
  { id: 20, description: "Ecosure Logs are in Conspicuous and visible place?" },
  {
    id: 21,
    description:
      "Restrooms Clean and stocked with Handwashing soap,tissue and paper towels?",
  },
  { id: 22, description: "Dumspter Lid Closed?" },
  { id: 23, description: "Paper Towels available near handwashing sink?" },
  { id: 24, description: "Mops Stored properly?" },
  { id: 25, description: "Cashier knows about 6 food allergens?" },
  { id: 26, description: "Microwaves clean?" },
];

const confettiInstance = new JSConfetti();

const SwipeChecklist = () => {
  // State
  const [state, setState] = useState({
    startTime: null,
    currentQuestion: 0,
    answers: {},
    issueDetails: {},
    isSubmitting: false,
    isIntroComplete: false,
    showIssueModal: false,
    currentIssueId: null,
    currentIssueDetail: "",
    isIssueFixed: false,
    showSummary: false,
    inspectionSummary: null,
  });

  // Refs
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      inspectorName: "",
      storeNumber: "",
      date: new Date().toISOString().substr(0, 10),
    },
  });

  // Derived values
  const totalQuestions = QUESTIONS.length;
  const progress = (state.currentQuestion / totalQuestions) * 100;
  const currentQuestionId = QUESTIONS[state.currentQuestion]?.id;

  // Helpers
  const getIconForQuestion = (questionId) => {
    const iconMap = {
      1: <Utensils className="text-orange-500" />,
      2: <PenTool className="text-blue-500" />,
      3: <ShoppingCart className="text-green-500" />,
      4: <Utensils className="text-purple-500" />,
      5: <Droplet className="text-red-500" />,
      6: <Clipboard className="text-teal-500" />,
      7: <Droplet className="text-cyan-500" />,
      8: <Droplet className="text-blue-500" />,
      9: <Coffee className="text-amber-700" />,
      10: <Coffee className="text-amber-500" />,
      11: <Droplet className="text-blue-400" />,
      12: <Pizza className="text-red-600" />,
      13: <ShoppingCart className="text-green-600" />,
      14: <AlertCircle className="text-yellow-500" />,
      15: <AlertCircle className="text-red-500" />,
      16: <Droplet className="text-blue-600" />,
      17: <Droplet className="text-blue-500" />,
      18: <Droplet className="text-cyan-500" />,
      19: <Droplet className="text-sky-500" />,
      20: <Clipboard className="text-violet-500" />,
      21: <Home className="text-indigo-500" />,
      22: <Trash2 className="text-slate-500" />,
      23: <PenTool className="text-emerald-500" />,
      24: <Utensils className="text-gray-600" />,
      25: <User className="text-pink-500" />,
      26: <Zap className="text-yellow-600" />,
    };
    return iconMap[questionId] || <FileCheck className="text-gray-500" />;
  };

  const calculatePassRate = useCallback(() => {
    const totalAnswers = Object.values(state.answers).length;
    const passedAnswers = Object.values(state.answers).filter(
      (a) => a === true
    ).length;
    return totalAnswers > 0 ? (passedAnswers / totalAnswers) * 100 : 0;
  }, [state.answers]);

  // Handlers
  const handleAnswer = useCallback(
    (questionId, answer) => {
      if (answer === false) {
        logCustomEvent("question_answered", {
          question_id: questionId,
          question_text:
            QUESTIONS.find((q) => q.id === questionId)?.description || "",
          answer: "no",
        });
        setState((prev) => ({
          ...prev,
          currentIssueId: questionId,
          currentIssueDetail: prev.issueDetails[questionId]?.detail || "",
          isIssueFixed: prev.issueDetails[questionId]?.fixed || false,
          showIssueModal: true,
        }));
      } else {
        logCustomEvent("question_answered", {
          question_id: questionId,
          question_text:
            QUESTIONS.find((q) => q.id === questionId)?.description || "",
          answer: "yes",
        });

        const newAnswers = { ...state.answers, [questionId]: answer };
        setState((prev) => ({ ...prev, answers: newAnswers }));

        if (state.currentQuestion < QUESTIONS.length - 1) {
          setState((prev) => ({
            ...prev,
            currentQuestion: prev.currentQuestion + 1,
          }));
        } else {
          handleSubmit(newAnswers);
        }
      }
    },
    [state.answers, state.currentQuestion]
  );

  const handleIssueDetailSubmit = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isSubmitting: true }));

      const newIssueDetails = {
        ...state.issueDetails,
        [state.currentIssueId]: {
          detail: state.currentIssueDetail,
          fixed: state.isIssueFixed,
        },
      };

      const newAnswers = { ...state.answers, [state.currentIssueId]: false };

      await logCustomEvent("issue_reported", {
        question_id: state.currentIssueId,
        question_text:
          QUESTIONS.find((q) => q.id === state.currentIssueId)?.description ||
          "",
        is_fixed: state.isIssueFixed,
      });

      setState((prev) => ({
        ...prev,
        issueDetails: newIssueDetails,
        answers: newAnswers,
        showIssueModal: false,
        currentIssueDetail: "",
        isIssueFixed: false,
        isSubmitting: false,
      }));

      if (state.currentQuestion < QUESTIONS.length - 1) {
        setState((prev) => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
        }));
      } else {
        handleSubmit(newAnswers);
      }
    } catch (error) {
      console.error("Error reporting issue:", error);
      toast.error("Failed to submit issue. Please try again.");
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [
    state.currentIssueId,
    state.currentIssueDetail,
    state.isIssueFixed,
    state.issueDetails,
    state.answers,
    state.currentQuestion,
  ]);

  const handleSubmit = useCallback(
    async (answers = state.answers) => {
      try {
        setState((prev) => ({ ...prev, isSubmitting: true }));

        const formValues = form.getValues();
        const passedCount = Object.values(answers).filter(
          (a) => a === true
        ).length;
        const totalCount = Object.values(answers).length;
        const calculatedPassRate =
          totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

        const inspectionData = {
          inspectorName: formValues.inspectorName,
          storeNumber: formValues.storeNumber,
          date: formValues.date,
          answers: Object.entries(answers).map(([questionId, value]) => {
            const qId = parseInt(questionId);
            return {
              questionId: qId,
              description:
                QUESTIONS.find((q) => q.id === qId)?.description || "",
              value,
              ...(value === false && state.issueDetails[questionId]
                ? {
                    issueDetail: state.issueDetails[questionId].detail,
                    isFixed: state.issueDetails[questionId].fixed,
                  }
                : {}),
            };
          }),
          passRate: calculatedPassRate,
        };

        // Set summary data for modal
        setState((prev) => ({
          ...prev,
          inspectionSummary: inspectionData,
          showSummary: true,
          isSubmitting: false,
        }));

        // Save to Firestore
        await addDocument("inspections", inspectionData);

        await logCustomEvent(ANALYTICS_EVENTS.FORM_SUBMIT, {
          form_type: "inspection",
          store_number: formValues.storeNumber,
          inspector_name: formValues.inspectorName,
          pass_rate: calculatedPassRate,
          total_questions: totalCount,
          failed_questions: totalCount - passedCount,
          inspection_duration_seconds: state.startTime
            ? Math.floor((new Date() - state.startTime) / 1000)
            : 0,
        });

        confettiInstance.addConfetti({
          confettiColors: [
            "#ff0a54",
            "#ff477e",
            "#ff7096",
            "#ff85a1",
            "#fbb1bd",
            "#f9bec7",
          ],
          confettiRadius: 6,
          confettiNumber: 500,
        });

        toast.success("Inspection submitted successfully!");
        localStorage.removeItem("inspectionProgress");
      } catch (error) {
        console.error("Error submitting inspection:", error);
        toast.error("Failed to submit inspection. Please try again.");
        logCustomEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
          error_type: "submission_error",
          error_message: error.message,
        });
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [form, state.answers, state.issueDetails, state.startTime]
  );

  const handlePrevious = useCallback(() => {
    if (state.currentQuestion > 0) {
      setState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    }
  }, [state.currentQuestion]);

  const handleIntroSubmit = useCallback((data) => {
    setState((prev) => ({
      ...prev,
      isIntroComplete: true,
      startTime: new Date(),
    }));

    logCustomEvent("inspection_started", {
      store_number: data.storeNumber,
      inspector_name: data.inspectorName,
    });

    toast.success(
      `Welcome, ${data.inspectorName}! Let's inspect Store #${data.storeNumber}`
    );
  }, []);

  const handleSwipeLeft = useCallback(() => {
    if (
      state.currentQuestion < QUESTIONS.length - 1 &&
      state.answers[currentQuestionId] !== undefined
    ) {
      setState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
      }));
    }
  }, [state.currentQuestion, state.answers, currentQuestionId]);

  const handleSwipeRight = useCallback(() => {
    if (state.currentQuestion > 0) {
      setState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    }
  }, [state.currentQuestion]);

  const handleQuestionClick = useCallback((questionIndex) => {
    setState((prev) => ({ ...prev, currentQuestion: questionIndex }));
  }, []);

 useSwipeGesture(cardRef, handleSwipeLeft, handleSwipeRight);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        if (e.key === "ArrowLeft" && state.currentQuestion > 0) {
          handlePrevious();
        } else if (
          e.key === "ArrowRight" &&
          state.currentQuestion < QUESTIONS.length - 1
        ) {
          if (state.answers[currentQuestionId] !== undefined) {
            setState((prev) => ({
              ...prev,
              currentQuestion: prev.currentQuestion + 1,
            }));
          }
        }

        if (e.key === "y" || e.key === "Y") {
          handleAnswer(currentQuestionId, true);
        } else if (e.key === "n" || e.key === "N") {
          handleAnswer(currentQuestionId, false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    state.currentQuestion,
    state.answers,
    currentQuestionId,
    handleAnswer,
    handlePrevious,
  ]);

  useEffect(() => {
    if (state.showIssueModal) {
      const textarea = document.getElementById("issue-details");
      if (textarea) {
        setTimeout(() => textarea.focus(), 100);
      }
    }
  }, [state.showIssueModal]);

  useEffect(() => {
    const savedProgress = localStorage.getItem("inspectionProgress");
    if (savedProgress) {
      try {
        const {
          formData,
          answers: savedAnswers,
          issueDetails: savedIssues,
          currentQ,
        } = JSON.parse(savedProgress);

        if (formData) form.reset(formData);
        if (savedAnswers)
          setState((prev) => ({ ...prev, answers: savedAnswers }));
        if (savedIssues)
          setState((prev) => ({ ...prev, issueDetails: savedIssues }));
        if (currentQ !== undefined && currentQ < QUESTIONS.length) {
          setState((prev) => ({ ...prev, currentQuestion: currentQ }));
        }

        if (formData && formData.inspectorName && formData.storeNumber) {
          setState((prev) => ({
            ...prev,
            isIntroComplete: true,
            startTime: new Date(),
          }));
        }

        toast.info("Loaded your saved progress", { duration: 3000 });
      } catch (e) {
        console.error("Error restoring saved progress:", e);
        localStorage.removeItem("inspectionProgress");
      }
    }
  }, []);

  useEffect(() => {
    if (state.isIntroComplete) {
      const formData = form.getValues();
      const progressData = {
        formData,
        answers: state.answers,
        issueDetails: state.issueDetails,
        currentQ: state.currentQuestion,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem("inspectionProgress", JSON.stringify(progressData));
    }
  }, [
    state.answers,
    state.issueDetails,
    state.currentQuestion,
    state.isIntroComplete,
    form,
  ]);

  // Components
  const QuestionStatusIndicator = useMemo(
    () =>
      ({ questions, answers, currentQuestion, onQuestionClick }) => {
        return (
          <div className="flex flex-wrap gap-1 my-2">
            {questions.map((question, index) => {
              const isAnswered = answers[question.id] !== undefined;
              const isCurrent = index === currentQuestion;
              const isPassed = answers[question.id] === true;
              const isFailed = answers[question.id] === false;

              let bgColor = "bg-gray-200";
              if (isCurrent) bgColor = "bg-blue-500";
              else if (isPassed) bgColor = "bg-green-500";
              else if (isFailed) bgColor = "bg-red-500";

              return (
                <button
                  key={question.id}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${bgColor} ${
                    isCurrent ? "ring-2 ring-blue-300" : ""
                  } ${isAnswered ? "cursor-pointer" : "cursor-not-allowed"}`}
                  disabled={!isAnswered && !isCurrent}
                  onClick={() =>
                    isAnswered || isCurrent ? onQuestionClick(index) : null
                  }
                  aria-label={`Question ${index + 1} ${
                    isPassed
                      ? "(Passed)"
                      : isFailed
                      ? "(Failed)"
                      : "(Unanswered)"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        );
      },
    []
  );

  const KeyboardShortcutsHelp = useMemo(
    () => () =>
      (
        <div className="absolute top-2 right-2">
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
              aria-label="Keyboard shortcuts help"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <div className="absolute right-0 w-64 p-2 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <p className="text-xs font-medium text-gray-700 mb-1">
                Keyboard Shortcuts:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>
                  <span className="inline-block bg-gray-100 px-1 rounded">
                    Y
                  </span>{" "}
                  - Answer "Yes"
                </li>
                <li>
                  <span className="inline-block bg-gray-100 px-1 rounded">
                    N
                  </span>{" "}
                  - Answer "No"
                </li>
                <li>
                  <span className="inline-block bg-gray-100 px-1 rounded">
                    ←
                  </span>{" "}
                  - Previous question
                </li>
                <li>
                  <span className="inline-block bg-gray-100 px-1 rounded">
                    →
                  </span>{" "}
                  - Next question
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <Toaster position="top-center" richColors />

      {/* Issue Detail Modal */}
      <Dialog
        open={state.showIssueModal}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, showIssueModal: open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-600 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Issue Details
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Please provide details about this issue.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Question:
              </h4>
              <p className="text-gray-900">
                {QUESTIONS.find((q) => q.id === state.currentIssueId)
                  ?.description || ""}
              </p>
            </div>

            <div>
              <label
                htmlFor="issue-details"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                What's wrong? Please describe the issue:
              </label>
              <Textarea
                id="issue-details"
                value={state.currentIssueDetail}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    currentIssueDetail: e.target.value,
                  }))
                }
                placeholder="Describe the issue in detail..."
                className="min-h-[100px] border-red-200 focus:border-red-500"
                required
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="issue-fixed"
                checked={state.isIssueFixed}
                onCheckedChange={(checked) =>
                  setState((prev) => ({ ...prev, isIssueFixed: checked }))
                }
                className="mt-1 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <label
                htmlFor="issue-fixed"
                className="text-sm font-medium text-gray-700 leading-tight"
              >
                I fixed this issue during the inspection
              </label>
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              className="border-gray-300"
              disabled={state.currentIssueDetail.trim() === ""}
              onClick={() =>
                setState((prev) => ({ ...prev, showIssueModal: false }))
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              disabled={
                state.currentIssueDetail.trim() === "" || state.isSubmitting
              }
              onClick={handleIssueDetailSubmit}
            >
              {state.isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Submitting...
                </>
              ) : (
                "Submit & Continue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!state.isIntroComplete ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Card className="border-blue-200 shadow-lg bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
              <CardDescription className="text-blue-100">
                Start your daily store inspection
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleIntroSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="inspectorName"
                    rules={{ required: "Inspector name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Inspector Name
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-blue-500" />
                            <Input
                              placeholder="Enter your name"
                              className="border-blue-200 focus:border-blue-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storeNumber"
                    rules={{ required: "Store number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Store Number
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Building className="h-5 w-5 text-blue-500" />
                            <Input
                              placeholder="Enter store number"
                              className="border-blue-200 focus:border-blue-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Inspection Date
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            <Input
                              type="date"
                              className="border-blue-200 focus:border-blue-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 rounded-md transition-all duration-200 mt-4"
                  >
                    Start Inspection
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="mb-6 sticky top-0 z-10 bg-white bg-opacity-95 p-3 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-semibold text-gray-700">
                Progress: {state.currentQuestion + 1} of {totalQuestions}
              </div>
              <div className="text-sm font-medium text-blue-600">
                {Math.round(progress)}%
              </div>
            </div>
            <Progress
              value={progress}
              className="h-2 bg-gray-200"
              style={{
                "--progress-indicator": "hsl(var(--primary))",
              }}
              aria-label={`Question progress: ${
                state.currentQuestion + 1
              } of ${totalQuestions}`}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            />

            <QuestionStatusIndicator
              questions={QUESTIONS}
              answers={state.answers}
              currentQuestion={state.currentQuestion}
              onQuestionClick={handleQuestionClick}
            />

            <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
              <span>Pass Rate: {calculatePassRate().toFixed(0)}%</span>
              <span>
                {Object.values(state.answers).filter((a) => a === true).length}{" "}
                Passed /
                {Object.values(state.answers).filter((a) => a === false).length}{" "}
                Failed
              </span>
            </div>

            <KeyboardShortcutsHelp />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentQuestion}
              ref={cardRef}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border border-blue-200 shadow-lg overflow-hidden bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {getIconForQuestion(QUESTIONS[state.currentQuestion].id)}
                      <CardTitle className="ml-2 text-lg">
                        Question {state.currentQuestion + 1}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <p className="text-gray-700 text-lg mb-4">
                    {QUESTIONS[state.currentQuestion].description}
                  </p>
                </CardContent>

                <CardFooter className="flex justify-between p-4 bg-gray-50 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                    onClick={handlePrevious}
                    disabled={state.currentQuestion === 0}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="destructive"
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-none"
                      onClick={() => handleAnswer(currentQuestionId, false)}
                      disabled={state.isSubmitting}
                    >
                      <X className="mr-1 h-5 w-5" />
                      No
                    </Button>

                    <Button
                      type="button"
                      variant="default"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-none"
                      onClick={() => handleAnswer(currentQuestionId, true)}
                      disabled={state.isSubmitting}
                    >
                      {state.isSubmitting ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="mr-1 h-5 w-5" />
                          Yes
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default SwipeChecklist;

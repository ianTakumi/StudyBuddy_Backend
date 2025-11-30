import { supabase } from "../configs/supabase.js";

export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      due_date,
      time_limit,
      total_points,
      question_count,
      quiz_type,
      questions = [],
    } = req.body;
    const { classId } = req.params;
    const class_id = classId;
    console.log("📥 Received quiz data:", JSON.stringify(req.body, null, 2));

    // Validate required fields
    if (!class_id || !title || !due_date || !time_limit || !total_points) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .insert([
        {
          class_id,
          title,
          description: description || "",
          due_date: new Date(due_date),
          time_limit: parseInt(time_limit),
          total_points: parseInt(total_points),
          question_count: parseInt(question_count) || questions.length,
          quiz_type: quiz_type || "multiple_choice",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
      .select()
      .single();

    if (quizError) throw quizError;

    // Process questions based on quiz type
    if (questions.length > 0) {
      const questionsWithQuizId = questions.map((question, index) => {
        let processedOptions = [];
        let processedCorrectAnswer = question.correctAnswer;

        // Handle options based on quiz type
        if (quiz_type === "true_false") {
          // Auto-generate true/false options
          processedOptions = [
            {
              option_text: "True",
              is_correct:
                question.correctAnswer === "True" ||
                question.correctAnswer === "TRUE",
            },
            {
              option_text: "False",
              is_correct:
                question.correctAnswer === "False" ||
                question.correctAnswer === "FALSE",
            },
          ];
          // Ensure correct_answer is stored consistently
          processedCorrectAnswer =
            question.correctAnswer === "True" ||
            question.correctAnswer === "TRUE"
              ? "True"
              : "False";
        } else if (quiz_type === "multiple_choice") {
          // Use provided options for multiple choice
          if (question.options && Array.isArray(question.options)) {
            processedOptions = question.options.map((opt) => ({
              option_text: opt.option_text || opt.text || "",
              is_correct: Boolean(opt.is_correct),
            }));
          }
        }

        console.log(`✅ Processed question ${index + 1}:`, {
          type: quiz_type,
          options: processedOptions,
          correct_answer: processedCorrectAnswer,
        });

        return {
          quiz_id: quizData.id,
          question: question.question,
          type: quiz_type,
          options: processedOptions,
          correct_answer: processedCorrectAnswer,
          points: parseInt(question.points) || 1,
          order_index: question.order_index || index,
          created_at: new Date(),
          updated_at: new Date(),
        };
      });

      console.log(
        "📝 Processed questions:",
        JSON.stringify(questionsWithQuizId, null, 2)
      );

      const { error: questionsError } = await supabase
        .from("quiz_questions")
        .insert(questionsWithQuizId);

      if (questionsError) throw questionsError;
    }

    // Fetch the complete quiz with questions
    const { data: completeQuiz, error: fetchError } = await supabase
      .from("quizzes")
      .select(
        `
        *,
        quiz_questions (*)
      `
      )
      .eq("id", quizData.id)
      .single();

    if (fetchError) throw fetchError;

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: completeQuiz,
    });
  } catch (error) {
    console.error("❌ Create quiz error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { classId, quizId } = req.params;
    const {
      title,
      description,
      due_date,
      time_limit,
      total_points,
      question_count,
      quiz_type,
      questions = [],
    } = req.body;

    // Validate required fields
    if (!title || !due_date || !time_limit || !total_points) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if quiz exists and belongs to class
    const { data: existingQuiz, error: checkError } = await supabase
      .from("quizzes")
      .select("id, quiz_type")
      .eq("id", quizId)
      .eq("class_id", classId)
      .single();

    if (checkError || !existingQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Update quiz basic info
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .update({
        title,
        description: description || "",
        due_date: new Date(due_date),
        time_limit: parseInt(time_limit),
        total_points: parseInt(total_points),
        question_count: parseInt(question_count) || questions.length,
        quiz_type: quiz_type || "multiple_choice",
        updated_at: new Date(),
      })
      .eq("id", quizId)
      .eq("class_id", classId)
      .select()
      .single();

    if (quizError) throw quizError;

    // Update questions if provided
    if (questions.length > 0) {
      // First, delete existing questions
      const { error: deleteError } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("quiz_id", quizId);

      if (deleteError) throw deleteError;

      // Then insert updated questions
      const questionsWithQuizId = questions.map((question, index) => {
        let processedOptions = [];
        let processedCorrectAnswer = question.correctAnswer;

        // Handle options based on quiz type
        if (quiz_type === "true_false") {
          // Auto-generate true/false options
          processedOptions = [
            {
              option_text: "True",
              is_correct:
                question.correctAnswer === "True" ||
                question.correctAnswer === "TRUE",
            },
            {
              option_text: "False",
              is_correct:
                question.correctAnswer === "False" ||
                question.correctAnswer === "FALSE",
            },
          ];
          // Ensure correct_answer is stored consistently
          processedCorrectAnswer =
            question.correctAnswer === "True" ||
            question.correctAnswer === "TRUE"
              ? "True"
              : "False";
        } else if (quiz_type === "multiple_choice") {
          // Use provided options for multiple choice
          if (question.options && Array.isArray(question.options)) {
            processedOptions = question.options.map((opt) => ({
              option_text: opt.option_text || opt.text || "",
              is_correct: Boolean(opt.is_correct),
            }));
          }
        }

        return {
          quiz_id: quizId,
          question: question.question,
          type: quiz_type,
          options: processedOptions,
          correct_answer: processedCorrectAnswer,
          points: parseInt(question.points) || 1,
          order_index: question.order_index || index,
          created_at: new Date(),
          updated_at: new Date(),
        };
      });

      const { error: questionsError } = await supabase
        .from("quiz_questions")
        .insert(questionsWithQuizId);

      if (questionsError) throw questionsError;
    }

    // Fetch the complete updated quiz with questions
    const { data: completeQuiz, error: fetchError } = await supabase
      .from("quizzes")
      .select(
        `
        *,
        quiz_questions (*)
      `
      )
      .eq("id", quizId)
      .single();

    if (fetchError) throw fetchError;

    res.json({
      success: true,
      message: "Quiz updated successfully",
      data: completeQuiz,
    });
  } catch (error) {
    console.error("Update quiz error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { classId, quizId, questionId } = req.params;
    const { question, type, options, correct_answer, points, order_index } =
      req.body;

    // Verify the quiz exists and belongs to class
    const { data: existingQuiz, error: checkError } = await supabase
      .from("quizzes")
      .select("id, quiz_type")
      .eq("id", quizId)
      .eq("class_id", classId)
      .single();

    if (checkError || !existingQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    let processedOptions = options || [];
    let processedCorrectAnswer = correct_answer;

    // Handle options based on quiz type
    if (existingQuiz.quiz_type === "true_false") {
      // Auto-generate true/false options
      processedOptions = [
        {
          option_text: "True",
          is_correct: correct_answer === "True" || correct_answer === "TRUE",
        },
        {
          option_text: "False",
          is_correct: correct_answer === "False" || correct_answer === "FALSE",
        },
      ];
      // Ensure correct_answer is stored consistently
      processedCorrectAnswer =
        correct_answer === "True" || correct_answer === "TRUE"
          ? "True"
          : "False";
    } else if (existingQuiz.quiz_type === "multiple_choice") {
      // Use provided options for multiple choice
      if (options && Array.isArray(options)) {
        processedOptions = options.map((opt) => ({
          option_text: opt.option_text || opt.text || "",
          is_correct: Boolean(opt.is_correct),
        }));
      }
    }

    const { data, error } = await supabase
      .from("quiz_questions")
      .update({
        question,
        type: type || existingQuiz.quiz_type,
        options: processedOptions,
        correct_answer: processedCorrectAnswer,
        points: parseInt(points) || 1,
        order_index: order_index || 0,
        updated_at: new Date(),
      })
      .eq("id", questionId)
      .eq("quiz_id", quizId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Question updated successfully",
      data,
    });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Keep all other functions the same (getQuizzesByClass, getQuizById, deleteQuiz, etc.)
export const getQuizzesByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required",
      });
    }

    const { data, error } = await supabase
      .from("quizzes")
      .select(
        `
        *,
        quiz_questions (*)
      `
      )
      .eq("class_id", classId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Get quizzes error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const { classId, quizId } = req.params;

    const { data, error } = await supabase
      .from("quizzes")
      .select(
        `
        *,
        quiz_questions (*)
      `
      )
      .eq("id", quizId)
      .eq("class_id", classId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { classId, quizId } = req.params;

    // Check if quiz exists and belongs to class
    const { data: existingQuiz, error: checkError } = await supabase
      .from("quizzes")
      .select("id")
      .eq("id", quizId)
      .eq("class_id", classId)
      .single();

    if (checkError || !existingQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const { error } = await supabase
      .from("quizzes")
      .delete()
      .eq("id", quizId)
      .eq("class_id", classId);

    if (error) throw error;

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getQuizSubmissions = async (req, res) => {
  try {
    const { classId, quizId } = req.params;

    const { data, error } = await supabase
      .from("quiz_submissions")
      .select(
        `
        *,
        users (
          first_name,
          last_name,
          email
        )
      `
      )
      .eq("quiz_id", quizId)
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Get quiz submissions error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getQuizQuestions = async (req, res) => {
  try {
    const { classId, quizId } = req.params;

    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Get quiz questions error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getQuizzesByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    // Get classes created by this teacher, then get quizzes for those classes
    const { data: classes, error: classesError } = await supabase
      .from("classes")
      .select("id")
      .eq("teacher_id", teacherId);

    if (classesError) throw classesError;

    if (!classes || classes.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const classIds = classes.map((cls) => cls.id);

    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select(
        `
        *,
        quiz_questions (*),
        classes (
          name,
          subject
        )
      `
      )
      .in("class_id", classIds)
      .order("created_at", { ascending: false });

    if (quizzesError) throw quizzesError;

    res.json({
      success: true,
      data: quizzes || [],
    });
  } catch (error) {
    console.error("Get quizzes by teacher error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getQuizForTaking = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Get quiz basic info
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Get quiz questions with options
    const { data: questions, error: questionsError } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (questionsError) throw questionsError;

    // For student view, remove correct answers from options
    const sanitizedQuestions = questions.map((question) => {
      if (question.type === "multiple_choice" && question.options) {
        const sanitizedOptions = question.options.map((option) => ({
          option_text: option.option_text,
          id: option.id || Math.random().toString(), // Add ID for frontend
        }));
        return {
          ...question,
          options: sanitizedOptions,
          correct_answer: undefined, // Remove correct answer
        };
      }
      return {
        ...question,
        correct_answer: undefined, // Remove correct answer for all question types
      };
    });

    res.json({
      success: true,
      data: {
        ...quiz,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    console.error("Get quiz for taking error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// NEW: Submit quiz answers
export const submitQuiz = async (req, res) => {
  try {
    const { quiz_id, student_id, answers, time_spent } = req.body;

    // Validate required fields
    if (!quiz_id || !student_id || !answers) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Get quiz questions with correct answers for grading
    const { data: questions, error: questionsError } = await supabase
      .from("quiz_questions")
      .select("id, correct_answer, points, options, type")
      .eq("quiz_id", quiz_id);

    if (questionsError) throw questionsError;

    // Grade the quiz
    let totalScore = 0;
    let totalPossiblePoints = 0;
    const gradedAnswers = answers.map((submittedAnswer) => {
      const question = questions.find(
        (q) => q.id === submittedAnswer.questionId
      );
      if (!question) {
        return {
          ...submittedAnswer,
          isCorrect: false,
          pointsEarned: 0,
        };
      }

      totalPossiblePoints += question.points;

      let isCorrect = false;

      // Check answer based on question type
      if (question.type === "multiple_choice") {
        // Find the correct option
        const correctOption = question.options.find((opt) => opt.is_correct);
        isCorrect =
          correctOption && submittedAnswer.answer === correctOption.option_text;
      } else if (question.type === "true_false") {
        isCorrect = submittedAnswer.answer === question.correct_answer;
      } else if (question.type === "short_answer") {
        // For short answer, do case-insensitive comparison
        isCorrect =
          submittedAnswer.answer.toLowerCase().trim() ===
          question.correct_answer.toLowerCase().trim();
      }

      const pointsEarned = isCorrect ? question.points : 0;
      totalScore += pointsEarned;

      return {
        ...submittedAnswer,
        isCorrect,
        pointsEarned,
      };
    });

    // Save submission to database
    const { data: submission, error: submissionError } = await supabase
      .from("quiz_submissions")
      .insert([
        {
          quiz_id,
          user_id: student_id,
          answers: gradedAnswers,
          score: totalScore,
          total_points: totalPossiblePoints,
          time_spent: time_spent || 0,
          submitted_at: new Date(),
        },
      ])
      .select()
      .single();

    if (submissionError) throw submissionError;

    res.json({
      success: true,
      data: {
        submission,
        score: totalScore,
        total_points: totalPossiblePoints,
        graded_answers: gradedAnswers,
      },
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// NEW: Get quiz results for student
export const getQuizResults = async (req, res) => {
  try {
    const { quizId, studentId } = req.params;

    const { data: submission, error } = await supabase
      .from("quiz_submissions")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", studentId)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Get quiz results error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

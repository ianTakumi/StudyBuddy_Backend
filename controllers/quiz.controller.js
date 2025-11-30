// controllers/quizController.js
import { supabase } from "../configs/supabase.js";

export const createQuiz = async (req, res) => {
  try {
    const { title, description, subject, questions, time_limit, is_public } =
      req.body;

    const { data, error } = await supabase
      .from("quizzes")
      .insert([
        {
          user_id: req.user.id,
          title,
          description,
          subject,
          questions,
          time_limit,
          is_public: is_public || false,
          created_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const { subject, is_public } = req.query;

    let query = supabase
      .from("quizzes")
      .select("*")
      .or(`user_id.eq.${req.user.id},is_public.eq.true`)
      .order("created_at", { ascending: false });

    if (subject) {
      query = query.eq("subject", subject);
    }

    if (is_public !== undefined) {
      query = query.eq("is_public", is_public === "true");
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const attemptQuiz = async (req, res) => {
  try {
    const { quiz_id, answers, time_spent } = req.body;

    // Get quiz questions
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("questions")
      .eq("id", quiz_id)
      .single();

    if (quizError) throw quizError;

    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (question.correctAnswer === answers[index]) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / quiz.questions.length) * 100;

    // Save attempt
    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert([
        {
          user_id: req.user.id,
          quiz_id,
          answers,
          score,
          time_spent,
          completed_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({
      attempt: data,
      score: Math.round(score * 100) / 100,
      correct_answers: correctAnswers,
      total_questions: quiz.questions.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuizAttempts = async (req, res) => {
  try {
    const { quiz_id } = req.query;

    let query = supabase
      .from("quiz_attempts")
      .select("*, quizzes(title, subject)")
      .eq("user_id", req.user.id)
      .order("completed_at", { ascending: false });

    if (quiz_id) {
      query = query.eq("quiz_id", quiz_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

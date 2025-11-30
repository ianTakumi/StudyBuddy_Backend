// controllers/progressController.js
import { supabase } from "../configs/supabase.js";

export const createStudySession = async (req, res) => {
  try {
    const { schedule_id, subject, duration_minutes, notes, resources_used } =
      req.body;

    const { data, error } = await supabase
      .from("study_sessions")
      .insert([
        {
          user_id: req.user.id,
          schedule_id,
          subject,
          duration_minutes,
          notes,
          resources_used,
          session_date: new Date(),
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

export const getStudySessions = async (req, res) => {
  try {
    const { start_date, end_date, subject } = req.query;

    let query = supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", req.user.id)
      .order("session_date", { ascending: false });

    if (start_date && end_date) {
      query = query
        .gte("session_date", start_date)
        .lte("session_date", end_date);
    }

    if (subject) {
      query = query.eq("subject", subject);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProgressStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "week" } = req.query; // week, month, year

    let dateFilter = new Date();
    if (period === "week") {
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (period === "month") {
      dateFilter.setMonth(dateFilter.getMonth() - 1);
    } else if (period === "year") {
      dateFilter.setFullYear(dateFilter.getFullYear() - 1);
    }

    // Get study sessions for period
    const { data: sessions, error: sessionsError } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("session_date", dateFilter.toISOString());

    if (sessionsError) throw sessionsError;

    // Get quiz attempts for period
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", dateFilter.toISOString());

    if (quizzesError) throw quizzesError;

    const totalStudyTime = sessions.reduce(
      (total, session) => total + (session.duration_minutes || 0),
      0
    );
    const averageQuizScore =
      quizzes.length > 0
        ? quizzes.reduce((total, quiz) => total + (quiz.score || 0), 0) /
          quizzes.length
        : 0;

    res.json({
      total_study_sessions: sessions.length,
      total_study_minutes: totalStudyTime,
      completed_quizzes: quizzes.length,
      average_quiz_score: Math.round(averageQuizScore * 100) / 100,
      study_sessions_by_subject: sessions.reduce((acc, session) => {
        acc[session.subject] = (acc[session.subject] || 0) + 1;
        return acc;
      }, {}),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/userController.js
import { supabase } from "../configs/supabase.js";

export const updateProfile = async (req, res) => {
  try {
    const { fname, lname, avatar_url, study_preferences, bio } = req.body;

    // Validate required fields
    if (!fname || !lname) {
      return res.status(400).json({
        error: "First name and last name are required",
      });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        fname,
        lname,
        avatar_url,
        study_preferences,
        bio,
        updated_at: new Date(),
      })
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "Profile updated successfully",
      user: data,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get study sessions count
    const { data: sessions, error: sessionsError } = await supabase
      .from("study_sessions")
      .select("id")
      .eq("user_id", userId);

    if (sessionsError) throw sessionsError;

    // Get completed quizzes count
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quiz_attempts")
      .select("id")
      .eq("user_id", userId);

    if (quizzesError) throw quizzesError;

    // Get total study time
    const { data: studyTime, error: timeError } = await supabase
      .from("study_sessions")
      .select("duration_minutes")
      .eq("user_id", userId);

    if (timeError) throw timeError;

    const totalStudyTime = studyTime.reduce(
      (total, session) => total + (session.duration_minutes || 0),
      0
    );

    // Get flashcard sets count
    const { data: flashcardSets, error: setsError } = await supabase
      .from("flashcard_sets")
      .select("id")
      .eq("user_id", userId);

    if (setsError) throw setsError;

    res.json({
      total_study_sessions: sessions?.length || 0,
      completed_quizzes: quizzes?.length || 0,
      total_study_minutes: totalStudyTime,
      flashcard_sets_created: flashcardSets?.length || 0,
      streak_days: calculateStreak(userId), // You'll need to implement this
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate streak (you need to implement this)
const calculateStreak = (userId) => {
  // Implement your streak calculation logic here
  return 0;
};

// Get user dashboard data
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent study sessions
    const { data: recentSessions, error: sessionsError } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("session_date", { ascending: false })
      .limit(5);

    if (sessionsError) throw sessionsError;

    // Get recent quiz attempts
    const { data: recentQuizzes, error: quizzesError } = await supabase
      .from("quiz_attempts")
      .select("*, quizzes(title, subject)")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(5);

    if (quizzesError) throw quizzesError;

    // Get upcoming schedules
    const today = new Date().toISOString().split("T")[0];
    const { data: upcomingSchedules, error: schedulesError } = await supabase
      .from("study_schedules")
      .select("*")
      .eq("user_id", userId)
      .gte("scheduled_date", today)
      .eq("completed", false)
      .order("scheduled_date", { ascending: true })
      .limit(5);

    if (schedulesError) throw schedulesError;

    res.json({
      recent_sessions: recentSessions || [],
      recent_quizzes: recentQuizzes || [],
      upcoming_schedules: upcomingSchedules || [],
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ error: error.message });
  }
};

import { supabase } from "../configs/supabase.js";

// Get all users
export const getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase.from("users").select("*");

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, email, phone } = req.body;
    const { userId } = req.params;

    console.log("🔄 Updating profile for user:", userId);

    // Validate required fields
    if (!first_name || !last_name || !email || !phone) {
      return res.status(400).json({
        error: "Fill up all the fields",
      });
    }

    // Step 1: Check if email is changing
    const { data: currentUser, error: currentError } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (currentError) {
      console.error("❌ Error fetching current user:", currentError);
      return res.status(400).json({
        error: "Failed to fetch current user data",
      });
    }

    const emailChanged = currentUser.email !== email;

    // Step 2: Update users table (INCLUDING email)
    console.log("💾 Updating users table...");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .update({
        first_name,
        last_name,
        email, // Update email in users table
        phone,
        updated_at: new Date(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (userError) {
      console.error("❌ Users table update error:", userError);
      return res.status(400).json({
        error: "Failed to update database: " + userError.message,
      });
    }

    console.log("✅ Users table updated successfully");

    // Step 3: Update Auth metadata (store new email in metadata)
    console.log("🔐 Updating Auth metadata...");
    const { data: authData, error: authError } =
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          first_name: first_name,
          last_name: last_name,
          phone: phone,
          email: email, // Store new email in metadata
          previous_email: currentUser.email, // Store old email for reference
        },
      });

    if (authError) {
      console.error("❌ Auth metadata update error:", authError);
      console.log(
        "⚠️ Auth metadata update failed, but users table was updated"
      );
    } else {
      console.log("✅ Auth metadata updated successfully");
    }

    console.log("✅ Profile updated successfully for user:", userId);

    // Return appropriate response
    const response = {
      success: true,
      message: "Profile updated successfully!",
      user: userData,
    };

    if (emailChanged) {
      response.note =
        "Email updated in database. For authentication, please continue using your original email address to login, or contact support to change your authentication email.";
      response.original_email = currentUser.email;
      response.new_email = email;
    }

    res.json(response);
  } catch (error) {
    console.error("💥 Update profile error:", error);
    res.status(500).json({
      error: "Internal server error during profile update",
    });
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

import { supabase } from "../configs/supabase.js";

// Get all study sessions for a user
export const getStudySessions = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: sessions, error } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch study sessions",
      });
    }

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single study session by ID
export const getStudySessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: session, error } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !session) {
      return res.status(404).json({
        success: false,
        message: "Study session not found",
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create new study session
export const createStudySession = async (req, res) => {
  try {
    const { subject, topic, date, time, duration, pomodoroSessions, user_id } =
      req.body;

    const { data: newSession, error } = await supabase
      .from("study_sessions")
      .insert([
        {
          subject,
          topic,
          date,
          time,
          duration,
          pomodoro_sessions: pomodoroSessions,
          user_id,
          completed: false,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create study session",
      });
    }

    res.status(201).json({
      success: true,
      message: "Study session created successfully",
      data: newSession,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update study session
export const updateStudySession = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Format the updates for Supabase
    const formattedUpdates = {};
    if (updates.subject !== undefined)
      formattedUpdates.subject = updates.subject;
    if (updates.topic !== undefined) formattedUpdates.topic = updates.topic;
    if (updates.date !== undefined) formattedUpdates.date = updates.date;
    if (updates.time !== undefined) formattedUpdates.time = updates.time;
    if (updates.duration !== undefined)
      formattedUpdates.duration = updates.duration;
    if (updates.pomodoroSessions !== undefined)
      formattedUpdates.pomodoro_sessions = updates.pomodoroSessions;
    if (updates.completed !== undefined)
      formattedUpdates.completed = updates.completed;

    const { data: updatedSession, error } = await supabase
      .from("study_sessions")
      .update(formattedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update study session",
      });
    }

    res.json({
      success: true,
      message: "Study session updated successfully",
      data: updatedSession,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete study session
export const deleteStudySession = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("study_sessions")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete study session",
      });
    }

    res.json({
      success: true,
      message: "Study session deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

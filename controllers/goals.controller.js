import { supabase } from "../configs/supabase.js";

// Get all goals for a user
export const getGoals = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("study_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      goals: data || [],
    });
  } catch (error) {
    console.error("Get goals error:", error);
    res.status(500).json({
      error: "Failed to fetch goals",
    });
  }
};

// Create a new goal
export const createGoal = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Goal title is required",
      });
    }

    const { data, error } = await supabase
      .from("study_goals")
      .insert([
        {
          user_id: userId,
          title: title.trim(),
          completed: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Goal created successfully",
      goal: data,
    });
  } catch (error) {
    console.error("Create goal error:", error);
    res.status(500).json({
      error: "Failed to create goal",
    });
  }
};

// Update goal (toggle completion)
export const updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { completed } = req.body;

    const { data, error } = await supabase
      .from("study_goals")
      .update({
        completed: completed,
        updated_at: new Date(),
      })
      .eq("id", goalId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Goal updated successfully",
      goal: data,
    });
  } catch (error) {
    console.error("Update goal error:", error);
    res.status(500).json({
      error: "Failed to update goal",
    });
  }
};

// Delete goal
export const deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    const { error } = await supabase
      .from("study_goals")
      .delete()
      .eq("id", goalId);

    if (error) throw error;

    res.json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Delete goal error:", error);
    res.status(500).json({
      error: "Failed to delete goal",
    });
  }
};

// Toggle goal completion
export const toggleGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    // First get current goal
    const { data: goal, error: fetchError } = await supabase
      .from("study_goals")
      .select("completed")
      .eq("id", goalId)
      .single();

    if (fetchError) throw fetchError;

    // Toggle completion status
    const { data, error } = await supabase
      .from("study_goals")
      .update({
        completed: !goal.completed,
        updated_at: new Date(),
      })
      .eq("id", goalId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Goal toggled successfully",
      goal: data,
    });
  } catch (error) {
    console.error("Toggle goal error:", error);
    res.status(500).json({
      error: "Failed to toggle goal",
    });
  }
};

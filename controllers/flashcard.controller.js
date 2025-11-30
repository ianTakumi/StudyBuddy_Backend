import { supabase } from "../configs/supabase.js";

// Get all flashcard sets for a user
export const getFlashcardSets = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: sets, error } = await supabase
      .from("flashcard_sets")
      .select(
        `
        *,
        flashcards (*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch flashcard sets",
      });
    }

    res.json({
      success: true,
      data: sets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single flashcard set by ID
export const getFlashcardSetById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: set, error } = await supabase
      .from("flashcard_sets")
      .select(
        `
        *,
        flashcards (*)
      `
      )
      .eq("id", id)
      .single();

    if (error || !set) {
      return res.status(404).json({
        success: false,
        message: "Flashcard set not found",
      });
    }

    res.json({
      success: true,
      data: set,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create new flashcard set
export const createFlashcardSet = async (req, res) => {
  try {
    const { title, description, subject, user_id } = req.body;

    const { data: newSet, error } = await supabase
      .from("flashcard_sets")
      .insert([
        {
          title,
          description: description || "",
          subject,
          user_id,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create flashcard set",
      });
    }

    res.status(201).json({
      success: true,
      message: "Flashcard set created successfully",
      data: newSet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update flashcard set
export const updateFlashcardSet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject } = req.body;

    // Check if set exists
    const { data: existingSet, error: fetchError } = await supabase
      .from("flashcard_sets")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingSet) {
      return res.status(404).json({
        success: false,
        message: "Flashcard set not found",
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (subject) updateData.subject = subject;

    const { data: updatedSet, error } = await supabase
      .from("flashcard_sets")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update flashcard set",
      });
    }

    res.json({
      success: true,
      message: "Flashcard set updated successfully",
      data: updatedSet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete flashcard set
export const deleteFlashcardSet = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if set exists
    const { data: existingSet, error: fetchError } = await supabase
      .from("flashcard_sets")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingSet) {
      return res.status(404).json({
        success: false,
        message: "Flashcard set not found",
      });
    }

    // Delete will cascade to flashcards due to foreign key constraint
    const { error } = await supabase
      .from("flashcard_sets")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete flashcard set",
      });
    }

    res.json({
      success: true,
      message: "Flashcard set deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create new flashcard
export const createFlashcard = async (req, res) => {
  try {
    const { question, answer, flashcard_set_id } = req.body;

    // Check if set exists
    const { data: existingSet, error: setError } = await supabase
      .from("flashcard_sets")
      .select("id")
      .eq("id", flashcard_set_id)
      .single();

    if (setError || !existingSet) {
      return res.status(404).json({
        success: false,
        message: "Flashcard set not found",
      });
    }

    const { data: newFlashcard, error } = await supabase
      .from("flashcards")
      .insert([
        {
          question,
          answer,
          flashcard_set_id,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create flashcard",
      });
    }

    res.status(201).json({
      success: true,
      message: "Flashcard created successfully",
      data: newFlashcard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update flashcard
export const updateFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    // Check if flashcard exists
    const { data: existingFlashcard, error: fetchError } = await supabase
      .from("flashcards")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingFlashcard) {
      return res.status(404).json({
        success: false,
        message: "Flashcard not found",
      });
    }

    const updateData = {};
    if (question) updateData.question = question;
    if (answer) updateData.answer = answer;

    const { data: updatedFlashcard, error } = await supabase
      .from("flashcards")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update flashcard",
      });
    }

    res.json({
      success: true,
      message: "Flashcard updated successfully",
      data: updatedFlashcard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete flashcard
export const deleteFlashcard = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if flashcard exists
    const { data: existingFlashcard, error: fetchError } = await supabase
      .from("flashcards")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingFlashcard) {
      return res.status(404).json({
        success: false,
        message: "Flashcard not found",
      });
    }

    const { error } = await supabase.from("flashcards").delete().eq("id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete flashcard",
      });
    }

    res.json({
      success: true,
      message: "Flashcard deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

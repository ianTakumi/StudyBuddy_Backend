import { supabase } from "../configs/supabase.js";

// Get all flashcard sets for a class for admin dashboard
export const getAllFlashcardSetsForClass = async (req, res) => {
  try {
    const { data: sets, error } = await supabase
      .from("flashcard_sets_class")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      success: true,
      data: sets,
    });
  } catch (err) {
    console.log("Error fetching flashcard sets for class:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all flashcard sets for a specific class
export const getFlashcardSetsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const { data: sets, error } = await supabase
      .from("flashcard_sets_class")
      .select(
        `
        *,
        flashcards_class (*)
      `,
      )
      .eq("class_id", classId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch flashcard sets",
        error: error.message,
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
      .from("flashcard_sets_class")
      .select(
        `
        *,
        flashcards_class (*)
      `,
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

// Create new flashcard set for a class
export const createFlashcardSet = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Check if class exists
    const { data: classExists, error: classError } = await supabase
      .from("classes")
      .select("id")
      .eq("id", classId)
      .single();

    if (classError || !classExists) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const { data: newSet, error } = await supabase
      .from("flashcard_sets_class")
      .insert([
        {
          title,
          description: description || "",
          class_id: classId,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create flashcard set",
        error: error.message,
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
    const { title, description } = req.body;

    // Check if set exists
    const { data: existingSet, error: fetchError } = await supabase
      .from("flashcard_sets_class")
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
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    updateData.updated_at = new Date();

    const { data: updatedSet, error } = await supabase
      .from("flashcard_sets_class")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update flashcard set",
        error: error.message,
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
      .from("flashcard_sets_class")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingSet) {
      return res.status(404).json({
        success: false,
        message: "Flashcard set not found",
      });
    }

    // Delete will cascade to flashcards_class due to foreign key constraint
    const { error } = await supabase
      .from("flashcard_sets_class")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete flashcard set",
        error: error.message,
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

// Create new flashcard in a set
export const createFlashcard = async (req, res) => {
  try {
    const { setId } = req.params;
    const { question, answer } = req.body;

    // Validate required fields
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question and answer are required",
      });
    }

    // Check if flashcard set exists
    const { data: existingSet, error: setError } = await supabase
      .from("flashcard_sets_class")
      .select("id")
      .eq("id", setId)
      .single();

    if (setError || !existingSet) {
      return res.status(404).json({
        success: false,
        message: "Flashcard set not found",
      });
    }

    const { data: newFlashcard, error } = await supabase
      .from("flashcards_class")
      .insert([
        {
          question,
          answer,
          flashcard_set_class_id: setId,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create flashcard",
        error: error.message,
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
      .from("flashcards_class")
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
    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    updateData.updated_at = new Date();

    const { data: updatedFlashcard, error } = await supabase
      .from("flashcards_class")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update flashcard",
        error: error.message,
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
      .from("flashcards_class")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingFlashcard) {
      return res.status(404).json({
        success: false,
        message: "Flashcard not found",
      });
    }

    const { error } = await supabase
      .from("flashcards_class")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete flashcard",
        error: error.message,
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

// Get all flashcards in a set
export const getFlashcardsBySet = async (req, res) => {
  try {
    const { setId } = req.params;

    // Check if set exists
    const { data: existingSet, error: setError } = await supabase
      .from("flashcard_sets_class")
      .select("id")
      .eq("id", setId)
      .single();

    if (setError || !existingSet) {
      return res.status(404).json({
        success: false,
        message: "Flashcard set not found",
      });
    }

    const { data: flashcards, error } = await supabase
      .from("flashcards_class")
      .select("*")
      .eq("flashcard_set_class_id", setId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch flashcards",
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: flashcards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

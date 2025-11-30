import { supabase } from "../configs/supabase.js";

export const createFlashcardSet = async (req, res) => {
  try {
    const { title, description, subject, cards, is_public } = req.body;

    const { data, error } = await supabase
      .from("flashcard_sets")
      .insert([
        {
          user_id: req.user.id,
          title,
          description,
          subject,
          cards,
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

export const getFlashcardSets = async (req, res) => {
  try {
    const { subject, is_public } = req.query;

    let query = supabase
      .from("flashcard_sets")
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

export const studyFlashcards = async (req, res) => {
  try {
    const { set_id, card_id, difficulty } = req.body;

    const { data, error } = await supabase
      .from("flashcard_study_sessions")
      .insert([
        {
          user_id: req.user.id,
          set_id,
          card_id,
          difficulty, // easy, medium, hard
          studied_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/resourceController.js
import { supabase } from "../configs/supabase.js";

export const createResource = async (req, res) => {
  try {
    const { title, description, subject, resource_type, url, content, tags } =
      req.body;

    const { data, error } = await supabase
      .from("learning_resources")
      .insert([
        {
          user_id: req.user.id,
          title,
          description,
          subject,
          resource_type, // pdf, video, link, note
          url,
          content,
          tags: tags || [],
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

export const getResources = async (req, res) => {
  try {
    const { subject, resource_type, tag } = req.query;

    let query = supabase
      .from("learning_resources")
      .select("*")
      .or(`user_id.eq.${req.user.id},is_public.eq.true`)
      .order("created_at", { ascending: false });

    if (subject) {
      query = query.eq("subject", subject);
    }

    if (resource_type) {
      query = query.eq("resource_type", resource_type);
    }

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("learning_resources")
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("learning_resources")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (error) throw error;

    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

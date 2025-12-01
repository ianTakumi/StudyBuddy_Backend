import { supabase } from "../configs/supabase.js";

// Submit contact form
export const submitContact = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, subject, message } = req.body;

    console.log("📧 Contact form submission:", { email, subject });

    // Validate required fields
    if (!first_name || !last_name || !email || !subject || !message) {
      return res.status(400).json({
        error: "All required fields must be filled out",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address",
      });
    }

    // Insert contact into database
    const { data, error } = await supabase
      .from("contacts")
      .insert([
        {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.trim(),
          phone: phone ? phone.trim() : null,
          subject: subject.trim(),
          message: message.trim(),
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Contact submission error:", error);
      return res.status(400).json({
        error: "Failed to submit contact form: " + error.message,
      });
    }

    console.log("✅ Contact submitted successfully:", data.id);

    res.status(201).json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
      contact: data,
    });
  } catch (error) {
    console.error("💥 Contact submission error:", error);
    res.status(500).json({
      error: "Internal server error during contact submission",
    });
  }
};

// Get all contacts (for admin)
export const getContacts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      contacts: data,
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      error: "Failed to fetch contacts",
    });
  }
};

// Update contact status (for admin)
export const updateContactStatus = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "read", "replied", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
      });
    }

    const { data, error } = await supabase
      .from("contacts")
      .update({ status })
      .eq("id", contactId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Contact status updated",
      contact: data,
    });
  } catch (error) {
    console.error("Update contact status error:", error);
    res.status(500).json({
      error: "Failed to update contact status",
    });
  }
};

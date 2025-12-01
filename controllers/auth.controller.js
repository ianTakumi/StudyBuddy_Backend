// controllers/authController.js
import { supabase } from "../configs/supabase.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, role } = req.body;
    console.log("📝 Registration attempt:", { email, firstName, lastName });

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: "Email, password, first name, and last name are required",
      });
    }

    // Sign up user WITHOUT email confirmation
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || "",
          role: role || "student",
        },
        // ⬇️ ITO ANG IMPORTANTE - disable email confirmation
        emailConfirm: false,
      },
    });

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(400).json({
        error: error.message,
      });
    }

    if (data.user) {
      console.log("✅ User created:", data.user.id);

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          email: data.user.email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || "",
          role: role || "student",
          created_at: new Date(),
        },
      ]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Continue anyway - user is created in auth
      }

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: data.user.id,
          email: data.user.email,
          first_name: firstName,
          last_name: lastName,
          role: role || "student",
        },
        // Include session if auto-login is needed
        session: data.session,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    res.json({
      message: "Login successful",
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        phone: profile?.phone,
        created_at: profile?.created_at,
        updated_at: profile?.updated_at,
        role: profile?.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) throw error;

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/reset-password`,
    });

    if (error) throw error;

    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.params;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long",
      });
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("❌ User not found in database:", userError);
      return res.status(404).json({
        error: "User not found",
      });
    }

    const userEmail = userData.email;

    // Step 2: Reauthenticate user with current password
    console.log("🔑 Verifying current password...");
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

    if (authError) {
      console.error("❌ Current password verification failed:", authError);
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    // Step 3: Update password directly
    console.log("🔄 Updating password...");
    const { data: updateData, error: updateError } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    if (updateError) {
      console.error("❌ Password update failed:", updateError);
      return res.status(400).json({
        error: "Failed to update password. Please try again.",
      });
    }

    console.log("✅ Password updated successfully for user:", userId);

    res.json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    console.error("💥 Update password error:", error);
    res.status(500).json({
      error: "Internal server error during password update",
    });
  }
};

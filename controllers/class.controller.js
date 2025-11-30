import { supabase } from "../configs/supabase.js";

// Generate unique class code
const generateClassCode = async () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if code already exists
    const { data: existingClass, error } = await supabase
      .from("classes")
      .select("id")
      .eq("class_code", code)
      .single();

    if (!existingClass) {
      isUnique = true;
    }
  }

  return code;
};

// Get all classes for a teacher
export const getClasses = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const { data: classes, error } = await supabase
      .from("classes")
      .select(
        `
        *,
        class_students(count)
      `
      )
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch classes",
      });
    }

    // Format the response to include student_count
    const formattedClasses = classes.map((classItem) => ({
      ...classItem,
      student_count: classItem.class_students[0]?.count || 0,
    }));

    res.json({
      success: true,
      data: formattedClasses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single class by ID
export const getClassById = async (req, res) => {
  try {
    const { teacherId, id } = req.params;

    const { data: classData, error } = await supabase
      .from("classes")
      .select(
        `
        *,
        class_students(count)
      `
      )
      .eq("id", id)
      .eq("teacher_id", teacherId)
      .single();

    if (error || !classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Format response
    const formattedClass = {
      ...classData,
      student_count: classData.class_students[0]?.count || 0,
    };

    res.json({
      success: true,
      data: formattedClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create new class
export const createClass = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { name, subject, gradeLevel, schedule, room, description } = req.body;

    // Generate unique class code
    const classCode = await generateClassCode();

    const { data: newClass, error } = await supabase
      .from("classes")
      .insert([
        {
          name,
          subject,
          grade_level: gradeLevel,
          schedule: schedule || "",
          room: room || "",
          description: description || "",
          teacher_id: teacherId,
          class_code: classCode,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create class",
      });
    }

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: newClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update class
export const updateClass = async (req, res) => {
  try {
    const { teacherId, id } = req.params;
    const { name, subject, gradeLevel, schedule, room, description } = req.body;

    // Check if class exists and belongs to teacher
    const { data: existingClass, error: fetchError } = await supabase
      .from("classes")
      .select("id")
      .eq("id", id)
      .eq("teacher_id", teacherId)
      .single();

    if (fetchError || !existingClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (subject) updateData.subject = subject;
    if (gradeLevel) updateData.grade_level = gradeLevel;
    if (schedule !== undefined) updateData.schedule = schedule;
    if (room !== undefined) updateData.room = room;
    if (description !== undefined) updateData.description = description;

    const { data: updatedClass, error } = await supabase
      .from("classes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update class",
      });
    }

    res.json({
      success: true,
      message: "Class updated successfully",
      data: updatedClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete class
export const deleteClass = async (req, res) => {
  try {
    const { teacherId, id } = req.params;

    // Check if class exists and belongs to teacher
    const { data: existingClass, error: fetchError } = await supabase
      .from("classes")
      .select("id")
      .eq("id", id)
      .eq("teacher_id", teacherId)
      .single();

    if (fetchError || !existingClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const { error } = await supabase.from("classes").delete().eq("id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete class",
      });
    }

    res.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Generate new class code for existing class
export const generateNewClassCode = async (req, res) => {
  try {
    const { teacherId, id } = req.params;

    // Check if class exists and belongs to teacher
    const { data: existingClass, error: fetchError } = await supabase
      .from("classes")
      .select("id")
      .eq("id", id)
      .eq("teacher_id", teacherId)
      .single();

    if (fetchError || !existingClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Generate new unique class code
    const newClassCode = await generateClassCode();

    const { data: updatedClass, error } = await supabase
      .from("classes")
      .update({ class_code: newClassCode })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate new class code",
      });
    }

    res.json({
      success: true,
      message: "New class code generated successfully",
      data: updatedClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get students in a class
export const getClassStudents = async (req, res) => {
  try {
    const { teacherId, id } = req.params;
    console.log("Fetching students for class:", { teacherId, id });

    // Check if class exists and belongs to teacher
    const { data: existingClass, error: classError } = await supabase
      .from("classes")
      .select("id")
      .eq("id", id)
      .eq("teacher_id", teacherId)
      .single();

    if (classError || !existingClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Step 1: Get user_ids from class_students
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("class_students")
      .select("user_id, enrolled_at")
      .eq("class_id", id);

    if (enrollmentsError) {
      console.error("Error fetching enrollments:", enrollmentsError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch student enrollments",
      });
    }

    if (!enrollments || enrollments.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Step 2: Get user details from users table
    const userIds = enrollments.map((enrollment) => enrollment.user_id);

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, first_name,last_name, email, created_at")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user details",
      });
    }

    // Step 3: Combine the data
    const formattedStudents = enrollments
      .map((enrollment) => {
        const user = users.find((u) => u.id === enrollment.user_id);
        return {
          id: user?.id,
          first_name: user?.first_name,
          last_name: user?.last_name,
          email: user?.email,
          enrolled_at: enrollment.enrolled_at,
          created_at: user?.created_at,
        };
      })
      .filter((student) => student.id); // Remove any null entries

    console.log(`Found ${formattedStudents.length} students in class`);

    res.json({
      success: true,
      data: formattedStudents,
    });
  } catch (error) {
    console.error("Unexpected error in getClassStudents:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Remove student from class (Updated)
export const removeStudentFromClass = async (req, res) => {
  try {
    const { teacherId, id, studentId } = req.params;

    // Check if class exists and belongs to teacher
    const { data: existingClass, error: classError } = await supabase
      .from("classes")
      .select("id")
      .eq("id", id)
      .eq("teacher_id", teacherId)
      .single();

    if (classError || !existingClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Remove student from class
    const { error } = await supabase
      .from("class_students")
      .delete()
      .eq("class_id", id)
      .eq("user_id", studentId); // Changed from student_id to user_id

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to remove student from class",
      });
    }

    res.json({
      success: true,
      message: "Student removed from class successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Join class using class code (Updated)
export const joinClassWithCode = async (req, res) => {
  try {
    const { classCode } = req.body;
    const { studentId } = req.params;

    if (!classCode) {
      return res.status(400).json({
        success: false,
        message: "Class code is required",
      });
    }

    // Find class by class code
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("id")
      .eq("class_code", classCode)
      .single();

    if (classError || !classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found with the provided code",
      });
    }

    // Check if student is already enrolled
    const { data: existingEnrollment, error: enrollmentError } = await supabase
      .from("class_students")
      .select("id")
      .eq("class_id", classData.id)
      .eq("user_id", studentId) // Changed from student_id to user_id
      .single();

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Student is already enrolled in this class",
      });
    }

    // Enroll student in class
    const { data: enrollment, error } = await supabase
      .from("class_students")
      .insert([
        {
          class_id: classData.id,
          user_id: studentId, // Changed from student_id to user_id
          enrolled_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to join class",
      });
    }

    res.status(201).json({
      success: true,
      message: "Successfully joined class",
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStudentClasses = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log("Fetching classes for student:", { studentId });

    // Step 1: Get class_ids from class_students
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("class_students")
      .select("class_id, enrolled_at")
      .eq("user_id", studentId); // Changed from student_id to user_id

    if (enrollmentsError) {
      console.error("Error fetching enrollments:", enrollmentsError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch student enrollments",
      });
    }

    if (!enrollments || enrollments.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Step 2: Get class details from classes table
    const classIds = enrollments.map((enrollment) => enrollment.class_id);

    const { data: classes, error: classesError } = await supabase
      .from("classes")
      .select(
        "id, name, subject, grade_level, class_code, schedule, room, description, teacher_id, created_at"
      )
      .in("id", classIds);

    if (classesError) {
      console.error("Error fetching classes:", classesError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch class details",
      });
    }

    // Step 3: Get teacher details for each class
    const teacherIds = [...new Set(classes.map((cls) => cls.teacher_id))];

    const { data: teachers, error: teachersError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .in("id", teacherIds);

    if (teachersError) {
      console.error("Error fetching teachers:", teachersError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch teacher details",
      });
    }

    // Step 4: Combine the data
    const formattedClasses = enrollments
      .map((enrollment) => {
        const classItem = classes.find((cls) => cls.id === enrollment.class_id);
        const teacher = teachers.find((t) => t.id === classItem?.teacher_id);

        if (!classItem) return null;

        return {
          id: classItem.id,
          name: classItem.name,
          subject: classItem.subject,
          grade_level: classItem.grade_level,
          class_code: classItem.class_code,
          schedule: classItem.schedule,
          room: classItem.room,
          description: classItem.description,
          teacher_id: classItem.teacher_id,
          created_at: classItem.created_at,
          enrolled_at: enrollment.enrolled_at,
          teacher: teacher
            ? {
                first_name: teacher.first_name,
                last_name: teacher.last_name,
                email: teacher.email,
              }
            : null,
        };
      })
      .filter((classItem) => classItem !== null);

    console.log(`Found ${formattedClasses.length} classes for student`);

    res.json({
      success: true,
      data: formattedClasses,
    });
  } catch (error) {
    console.error("Unexpected error in getStudentClasses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get students in a class (for student perspective)
export const getClassStudentsForStudent = async (req, res) => {
  try {
    const { studentId, classId } = req.params;
    console.log("Fetching classmates for student:", { studentId, classId });

    // Step 1: Check if student is enrolled in the class
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("class_students")
      .select("id")
      .eq("class_id", classId)
      .eq("user_id", studentId)
      .single();

    if (enrollmentError || !enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this class",
      });
    }

    // Step 2: Get all user_ids from class_students for this class
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("class_students")
      .select("user_id, enrolled_at")
      .eq("class_id", classId);

    if (enrollmentsError) {
      console.error("Error fetching enrollments:", enrollmentsError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch class enrollments",
      });
    }

    if (!enrollments || enrollments.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Step 3: Get user details from users table (exclude the current student)
    const userIds = enrollments.map((enrollment) => enrollment.user_id);

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, created_at")
      .in("id", userIds)
      .neq("id", studentId); // Exclude the current student

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user details",
      });
    }

    // Step 4: Combine the data and format response
    const classmates = enrollments
      .map((enrollment) => {
        const user = users.find((u) => u.id === enrollment.user_id);
        if (!user) return null; // Skip if user not found (shouldn't happen)

        return {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          enrolled_at: enrollment.enrolled_at,
          member_since: user.created_at,
        };
      })
      .filter((classmate) => classmate !== null) // Remove null entries
      .sort((a, b) => a.first_name.localeCompare(b.first_name)); // Sort by first name

    console.log(`Found ${classmates.length} classmates in class`);

    res.json({
      success: true,
      data: classmates,
    });
  } catch (error) {
    console.error("Unexpected error in getClassStudentsForStudent:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

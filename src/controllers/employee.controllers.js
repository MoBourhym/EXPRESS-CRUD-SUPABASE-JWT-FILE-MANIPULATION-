import { supabase } from "../config/db.js";
import { parse } from "json2csv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import PDFDocument from 'pdfkit-table'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadFile = async (filePath, file) => {
  const { data, error } = await supabase.storage
    .from("docs")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  // Get the public URL of the uploaded file
  const { data: publicURLData } = supabase.storage
    .from("docs")
    .getPublicUrl(filePath);
  return publicURLData.publicUrl; // Return the public URL of the uploaded file
};

const getAllEmployees = async (req, res) => {
  try {
    // Fetch employees data from Supabase
    const { data, error } = await supabase.from("employees").select(`
        id,
        name,
        email,
        number,
        position,
        salary,
        cin,
        cnss,
        avatar,
        department_id,
        department:departments!department_id (
          name
        )
      `);

    if (error) {
      throw new Error(error.message);
    }

    // Format data for consistent response
    const formattedData = data.map((employee) => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      number: employee.number,
      position: employee.position,
      salary: employee.salary,
      cin: employee.cin,
      cnss: employee.cnss,
      avatar: employee.avatar,
      departmentId: employee.department_id,
      department: employee.department?.name || "Unknown", // Handle null or missing department
    }));

    // Send the formatted data as response
    res.status(200).json(formattedData);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching employees", error: err.message });
  }
};

const addEmployee = async (req, res) => {
  const { id, name, email, number, position, departement_id, salary } =
    req.body;
  console.log(req.body);

  try {
    const avatarPath = req.files["avatar"]
      ? `avatars/${name}_avatar.${req.files["avatar"][0].originalname
          .split(".")
          .pop()}`
      : null;
    const cinPath = req.files["cin"] ? `cin/${name}_cin.pdf` : null;
    const cnssPath = req.files["cnss"] ? `cnss/${name}_cnss.pdf` : null;

    let avatarUrl, cinUrl, cnssUrl;

    if (avatarPath) {
      avatarUrl = await uploadFile(avatarPath, req.files["avatar"][0]);
    }
    if (cinPath) {
      cinUrl = await uploadFile(cinPath, req.files["cin"][0]);
    }
    if (cnssPath) {
      cnssUrl = await uploadFile(cnssPath, req.files["cnss"][0]);
    }

    const { data, error } = await supabase.from("employees").insert([
      {
        name,
        email,
        position,
        cin: cinUrl,
        cnss: cnssUrl,
        department_id: departement_id,
        salary,
        number,
        avatar: avatarUrl,
      },
    ]);

    if (error) {
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error creating employee", error: err.message });
  }
};

const insertToBucketTest = async (req, res) => {
  const { name, id } = { name: "ahmed", id: 3 };
  console.log(req.files);
  try {
    const avatarPath = req.files["avatar"] ? `avatars/${name} ${id}.jpg` : null;

    let avatarUrl, cinUrl, cnssUrl;

    if (avatarPath) {
      avatarUrl = await uploadFile(avatarPath, req.files["avatar"][0]);
    }
    res.json(avatarUrl);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error creating employee", error: err.message });
  }
};

const deleteEmployeeDocuments = async (name) => {
  try {
    // Helper function to remove files with different extensions
    const removeFile = async (path) => {
      const extensions = ["png", "jpg", "jpeg"];
      for (const ext of extensions) {
        const { error } = await supabase.storage
          .from("avatars")
          .remove([`${path}.${ext}`]);
        if (!error) return; // Stop trying once a file is successfully deleted
      }
      throw new Error(`Failed to delete file for path: ${path}`);
    };

    // Remove avatar file (any of the supported extensions)
    await removeFile(`avatars/${name}_avatar`);

    // Remove CIN document
    const { error: cinError } = await supabase.storage
      .from("cin")
      .remove([`cin/${name}_cin.pdf`]);

    if (cinError) throw new Error(cinError.message);

    // Remove CNSS document
    const { error: cnssError } = await supabase.storage
      .from("cnss")
      .remove([`cnss/${name}_cnss.pdf`]);

    if (cnssError) throw new Error(cnssError.message);

    return true; // Return success
  } catch (err) {
    throw new Error(`Error deleting employee documents: ${err.message}`);
  }
};


const updateEmployee = async (req, res) => {
  const { id, name, email, number, position, departement_id, salary } =
    req.body;

  try {
    const avatarPath = req.files["avatar"]
      ? `profile/${req.files["avatar"][0].filename}`
      : null;
    const cinPath = req.files["cin"]
      ? `cin/${req.files["cin"][0].filename}`
      : null;
    const cnssPath = req.files["cnss"]
      ? `cnss/${req.files["cnss"][0].filename}`
      : null;

    // Delete existing files if new ones are provided
    if (avatarPath || cinPath || cnssPath) {
      await deleteEmployeeDocuments(name);
    }

    let avatarUrl, cinUrl, cnssUrl;

    if (avatarPath) {
      avatarUrl = await uploadFile(avatarPath, req.files["avatar"][0].buffer);
    }
    if (cinPath) {
      cinUrl = await uploadFile(cinPath, req.files["cin"][0].buffer);
    }
    if (cnssPath) {
      cnssUrl = await uploadFile(cnssPath, req.files["cnss"][0].buffer);
    }

    const { data, error } = await supabase
      .from("employees")
      .update({
        name,
        email,
        position,
        cin: cinUrl,
        cnss: cnssUrl,
        department_id: departement_id,
        salary,
        number,
        avatar: avatarUrl,
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    if (data.length > 0) {
      res.status(200).json({ message: "Employee updated successfully." });
    } else {
      res.status(404).json({ message: "Employee not found." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  const { name } = req.query;

  try {
    // Delete the employee record from the database
    const { error: deleteError } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (deleteError) throw new Error(deleteError.message);

    // Delete associated files
    await deleteEmployeeDocuments(name);

    // Success response
    res.status(200).json({ message: "Employee deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




const downloadData = async (req, res) => {
  const { format } = req.params; // Get format from URL params
  console.log(format);

  try {
    // Fetch data from the 'employees' table
    const { data, error } = await supabase.from("employees").select(`
      id,
      name,
      email,
      number,
      position,
      salary,
      cin,
      cnss,
      avatar,
      department_id,
      department:departments!department_id (name)
    `);

    if (error) throw error;

  
    const fileName = `table-data.${format}`;
    const filePath = path.join(__dirname, fileName);

    if (format === "json") {
      // Generate JSON file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } else if (format === "csv") {
      // Convert data to CSV and save
      const csvData = parse(data);
      fs.writeFileSync(filePath, csvData);
    } else if (format === "pdf") {
      // Generate PDF file
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=employees.pdf");
      doc.pipe(res);

      // Title
      doc.fontSize(18).text("Employee Records", { align: "center" });
      doc.moveDown(2);
  
      // Prepare Table Data
      const tableData = {
        headers: ["ID", "Name", "Email", "Position", "Department", "Salary"],
        rows: data.map((employee) => [
          employee.id,
          employee.name,
          employee.email,
          employee.position,
          employee.department?.name || "N/A",
          employee.salary,
        ]),
      };
  
      // Add Table to PDF
      await doc.table(tableData, {
        prepareHeader: () => doc.fontSize(10).font("Helvetica-Bold"),
        prepareRow: (row, i) => doc.fontSize(10).font("Helvetica"),
        columnSpacing: 10,
        x: 50,
        y: doc.y + 10, // Start below the title
      });
  
      // Finalize the PDF
      doc.end();
    } else {
      return res.status(400).send('Invalid format. Use "json", "csv", or "pdf".');
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error during file download:", err);
      }

      if (format === "csv" || format === "json") 
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Error processing table data:", error.message);
    res.status(500).send("Error processing table data.");
  }
};
const PDF = async (req, res) => {
  try {
    // Fetch employee data from Supabase
    const { data, error } = await supabase
      .from("employees")
      .select(`
        id,
        name,
        email,
        number,
        position,
        salary,
        cin,
        cnss,
        avatar,
        department_id,
        department:departments!department_id (name)
      `);

    if (error) throw error;



    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ message: "No employee data found" });
    }

    // Initialize PDF document
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=employees.pdf");
    doc.pipe(res);

    // Title
    doc.fontSize(18).text("Employee Records", { align: "center" });
    doc.moveDown(2);

    // Prepare Table Data
    const tableData = {
      headers: ["ID", "Name", "Email", "Position", "Department", "Salary"],
      rows: data.map((employee) => [
        employee.id,
        employee.name,
        employee.email,
        employee.position,
        employee.department?.name || "N/A",
        employee.salary,
      ]),
    };

    // Add Table to PDF
    await doc.table(tableData, {
      prepareHeader: () => doc.fontSize(10).font("Helvetica-Bold"),
      prepareRow: (row, i) => doc.fontSize(10).font("Helvetica"),
      columnSpacing: 10,
      x: 50,
      y: doc.y + 10, // Start below the title
    });

    // Finalize the PDF
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate PDF");
  }
};

export {
  PDF,
  insertToBucketTest,
  downloadData,
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
};

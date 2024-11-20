import { supabase } from "../config/db.js";
import { parse }  from 'json2csv';
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs"
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
  console.log('hey emp')
  try {
    const { data, error } = await  supabase
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
      department:departments!department_id (
     name
    ) 
    `);
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
      departementid:employee.department_id,
      department: employee.department.name , // Handle null or missing department name
    }));


  
    res.status(200).json(formattedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addEmployee = async (req, res) => {
  const { id, name, email, number, position, departement_id, salary } =
    req.body;
    console.log(req.body)

 

   
  try {
    const avatarPath = req.files["avatar"] ? `avatars/${name}_avatar.${req.files["avatar"][0].originalname.split(".").pop()}` : null;
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

const insertToBucketTest=async(req, res) => {
  const {name,id}={name:'ahmed',id:3}
  console.log(req.files)
  try {
    const avatarPath = req.files["avatar"] ? `avatars/${name} ${id}.jpg` : null;
   

    let avatarUrl, cinUrl, cnssUrl;

    if (avatarPath) {
      avatarUrl = await uploadFile(avatarPath, req.files["avatar"][0]);
    }
    res.json(avatarUrl)
  }
 catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error creating employee", error: err.message });
  }


}





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

    // Helper function to remove files with different extensions
    const removeFile = async (path) => {
      const extensions = ['png', 'jpg', 'jpeg'];
      for (const ext of extensions) {
        const { error } = await supabase.storage.from('avatars').remove([`${path}.${ext}`]);
        if (!error) return; // Stop trying once a file is successfully deleted
      }
      throw new Error(`Failed to delete file for path: ${path}`);
    };

    // Remove avatar file (any of the supported extensions)
    await removeFile(`avatars/${name}_avatar`);

    // Remove other files
    const { error: cinError } = await supabase
      .storage
      .from('cin')
      .remove([`cin/${name}_cin.pdf`]);

    if (cinError) throw new Error(cinError.message);

    const { error: cnssError } = await supabase
      .storage
      .from('cnss')
      .remove([`cnss/${name}_cnss.pdf`]);

    if (cnssError) throw new Error(cnssError.message);

    // Success response
    res.status(200).json({ message: "Employee deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const downloadData = async (req, res) => {
  const { format } = req.params; 
  console.log(format)
  try {
      // Fetch table data from Supabase
      const { data, error } = await supabase.from('employees').select('*');
      if (error) throw error;

      // Generate a temporary file path
      const fileName = `table-data.${format}`;
      const filePath = path.join(__dirname, fileName);

      // Convert data to the desired format
      if (format === 'json') {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      } else if (format === 'csv') {
          const csvData = parse(data); // Convert JSON to CSV
          fs.writeFileSync(filePath, csvData);
      } else {
          return res.status(400).send('Invalid format. Use "json" or "csv".');
      }

     
      res.download(filePath, fileName, (err) => {
          if (err) {
              console.error('Error during file download:', err);
          }
         
          fs.unlinkSync(filePath);
      });
  } catch (error) {
      console.error('Error processing table data:', error.message);
      res.status(500).send('Error processing table data.');
  }
}

export { insertToBucketTest,downloadData,getAllEmployees, addEmployee, updateEmployee, deleteEmployee };

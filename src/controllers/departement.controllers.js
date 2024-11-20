import { supabase } from "../config/db.js";





const getAllDepartment = async (req, res) => {
  try {
    const { data, error } = await supabase.from("departments").select(`id,name,responsibleid`);
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addDepartement = async (req, res) => {
  const { name, respId } = req.body;
  
  try {
    const { data, error } = await supabase
      .from("departments")
      .insert({ name:name, responsibleid:req.body.responsibleid });
    if (error) throw error;
    res.status(201).json({message:"Dep created succefully"});
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating Departement", error: err.message });
  }
};

const getDepartementEmployees = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("employees")
      .select(
        `
      id,
      name,
      email,
      number,
      position,
      salary,
      
      avatar`
      )
      .eq("department_id", id);

    const formattedData = data.map((employee) => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      number: employee.number,
      position: employee.position,
      salary: employee.salary,
      avatar: employee.avatar,
    }));

    res.status(200).json(formattedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("departments").select(`id,name,responsibleid`).eq(`id`,id);
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const deleteDepartement = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from("departments")
      .delete("*")
      .eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "departement deleted succefully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { getDepartmentById,getDepartementEmployees, addDepartement, deleteDepartement,getAllDepartment };

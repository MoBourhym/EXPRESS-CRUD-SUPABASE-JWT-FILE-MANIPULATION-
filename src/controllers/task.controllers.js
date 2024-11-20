import { supabase } from "../config/db.js";

 
const getAllTasks = async (req, res) => {
  try {
    const { data, error } = await supabase.from("tasks").select(`title,description,start_time,end_time`).eq('is_done',false);
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new task
const addTask = async (req, res) => {
  const { title, description, start_time, end_time  } = req.body;
  try {
    const { data, error } = await supabase.from("tasks").insert([
      { admin_id:1,title :title, description:description,start_time: start_time,end_time: end_time }
    ]);
    if (error) throw error;
    res.status(201).json({message:"task created succefully"});
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
};


const completeTask = async (req, res) => {
  const { id} = req.params;
  try {
    const { data, error } = await supabase
      .from("tasks")
      .update({ 'is_done':true })
      .eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "task completed successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export { getAllTasks, addTask, completeTask };

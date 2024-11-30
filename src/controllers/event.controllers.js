import { supabase } from "../config/db.js";

// Get all events
const getAllEvents = async (req, res) => {
  console.log(req.cookies)
  try {
    const { data, error } = await supabase.from("events").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new event
const addEvent = async (req, res) => {
  const { title, date, time, duration, location, description } = req.body;
  try {
    const { data, error } = await supabase.from("events").insert([
      { title, date, time, duration, location, description }
    ]);
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error creating event', error: err.message });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  const { id, title, date, time, duration, location, description } = req.body;
  try {
    const { data, error } = await supabase
      .from("events")
      .update({ title, date, time, duration, location, description })
      .eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "Event updated successfully.", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { getAllEvents, addEvent, updateEvent, deleteEvent };

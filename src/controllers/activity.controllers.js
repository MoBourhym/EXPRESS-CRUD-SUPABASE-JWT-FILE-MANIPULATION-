import { format } from "path";
import { supabase } from "../config/db.js";

const getAllActivity = async (req, res) => {
  try {
    const { data, error } = await supabase.from("activities").select(`
       *
      `);
    if (error) throw error;

    console.log(data);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDayActivity = async (req, res) => {
  const date = req.query.date; // Extract date from query parameters
  console.log("Requested date:", date);

  try {
    const { data, error } = await supabase
      .from("activities")
      .select(
        `
          activity_id,
          employees (
            name,
            position,
            avatar,

          ),
          in_time,
          out_time,
          work_time,
          break_time,
          overtime,
          status
        `
      )
      .eq("activity_date", date); // Query by activity_date

    if (error) throw error;

    // Format data to match the desired structure
    const formattedData = data.map((a) => ({
      id: a.activity_id,
      name: a.employees.name,
      position: a.employees.position,
      avatar: a.employees.avatar,
      in_time: a.in_time,
      out_time: a.out_time,
      work_time: a.work_time,
      break_time: a.break_time,
      overtime: a.overtime,
      status: a.status,
    }));

    console.log("Formatted Data:", formattedData);
    res.status(200).json(formattedData); // Send formatted data
  } catch (err) {
    console.error("Error retrieving data:", err.message);
    res.status(500).json({ message: err.message });
  }
};
const getAverageWorkTime = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    const { data, error } = await supabase
      .from("activities")
      .select("work_time, activity_date")
      .gte("activity_date", startDate.toISOString())
      .lte("activity_date", endDate.toISOString());

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.json({
        averageWorkTime: Array(30).fill(0),
        message: "No data for the past 30 days",
      });
    }

    // Helper to parse work_time into minutes
    const parseWorkTimeToMinutes = (workTime) => {
      if (!workTime) return 0; // Handle null or empty strings

      let hours = 0;
      let minutes = 0;

      const hourMatch = workTime.match(/(\d+)\s*h/); // Match hours, e.g., "02h"
      const minuteMatch = workTime.match(/(\d+)\s*m/); // Match minutes, e.g., "30m"

      if (hourMatch) {
        hours = parseInt(hourMatch[1], 10);
      }
      if (minuteMatch) {
        minutes = parseInt(minuteMatch[1], 10);
      }

      return hours * 60 + minutes;
    };

    // Initialize an array to store average work time for each of the last 30 days
    const averageWorkTime = [];
    for (let i = 0; i < 30; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      const dayString = currentDay.toISOString().split("T")[0]; // Format date as YYYY-MM-DD

      // Filter records for the current day
      const dayRecords = data.filter(
        (record) => record.activity_date === dayString
      );

      if (dayRecords.length > 0) {
        // Calculate the average work time for the day
        const totalMinutes = dayRecords.reduce((sum, record) => {
          return sum + parseWorkTimeToMinutes(record.work_time);
        }, 0);
        const averageMinutes = totalMinutes / dayRecords.length;

        averageWorkTime.push(averageMinutes);
      } else {
        // If no records, push 0 for that day
        averageWorkTime.push(0);
      }
    }

    // Send the array of average work times
    res.json(averageWorkTime);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getActivityById = async (req, res) => {
  const { id } = req.params;
 
  try {
    const { data, error } = await supabase
      .from("activities")
      .select(`
        employees:employee_id (
          name,
          position,
          avatar,
          email,
          number,
          salary,
          cin,
          cnss,
          department:department_id ( 
            name
          )
        ),
        activity_id,
        activity_date,
        in_time,
        out_time,
        work_time,
        break_time,
        overtime,
        status
      `)
      .eq("employees.id", id)
      .not("employees", "is", null);

    if (error) throw error;

   const  formattedData = data.map((a) => ({
      name: a.employees.name,
      position: a.employees.position,
      avatar: a.employees.avatar,
      email: a.employees.email,
      number: a.employees.number,
      salary:a.employees.salary,
      cin: a.employees.cin,
      cnss: a.employees.cnss,
      department:a.employees.department.name,
      id: a.activity_id,
      date:a.activity_date,
      in_time: a.in_time,
      out_time: a.out_time,
      work_time: a.work_time,
      break_time: a.break_time,
      overtime: a.overtime,
      status: a.status,
    }));
    res.status(200).json(formattedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export { getAllActivity, getActivityById, getAverageWorkTime, getDayActivity };

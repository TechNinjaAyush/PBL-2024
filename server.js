const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3001;

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pict123',
  database: 'digi_sub_tick',
  insecureAuth: true,
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Serve static HTML files from the 'public' directory
app.use(express.static('public'));

// Define routes

// Route for Student 1 dashboard
app.get('/student1', (req, res) => {
  const rollNo = 23246;

  // SQL query to retrieve data
  const query = `
  SELECT s_name, attendance, CG_mks, PA_mks, roll_no
  FROM student
  WHERE roll_no = 23246;  
  `;

  connection.query(query, [rollNo], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.json(results);
  });
});


// Route for Student 2 dashboard
app.get('/student2', (req, res) => {
  // Fetch data from the 'marks' and 'student' tables
  const query = `
  SELECT s_name, attendance, CG_mks, PA_mks, roll_no
  FROM student
  WHERE roll_no = 23264;  
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.json(results);
  });
});

// Add a route for Teacher 1 dashboard
app.get('/teacher1', (req, res) => {
  // Fetch data for students and teacher details under Teacher 1 for CG
  const query = `
  SELECT student.roll_no, student.s_name, student.CG_mks, teacher.t_name, teacher.is_CC, subject.sub_name
  FROM student
  JOIN teacher ON student.CG_mks IS NOT NULL AND teacher.sub_code = 214453 AND teacher.teacher_id = 1
  JOIN subject ON subject.sub_code = teacher.sub_code;
  
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Send data to the HTML template
    res.json(results);
  });
});

app.get('/teacher2', (req, res) => {
  // Fetch data for students and teacher details under Teacher 2 for PA
  const query = `
    SELECT student.roll_no, student.s_name, student.PA_mks, teacher.t_name, teacher.is_CC, subject.sub_name
    FROM student
    JOIN teacher ON student.PA_mks IS NOT NULL AND teacher.sub_code = 214451 AND teacher.teacher_id = 2
    JOIN subject ON subject.sub_code = teacher.sub_code;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Send data to the HTML template
    res.json(results);
  });
});

app.get('/allStudents', (req, res) => {
  const query = `
    SELECT roll_no, s_name, attendance
    FROM student;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching all students data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.json(results);
  });
});


app.post('/updateMarks/:subject/:marks/:rollNo/:teacherId', (req, res) => {
  const { subject, marks, rollNo, teacherId } = req.params;

  // SQL query to update marks based on the subject, roll_no, and teacher_id
  const updateQuery = `
    UPDATE student
    SET ${mysql.escapeId(`${subject}_mks`)} = ?
    WHERE roll_no = ?
      AND roll_no IN (SELECT roll_no FROM teacher WHERE teacher_id = ? AND sub_code = (SELECT sub_code FROM subject WHERE sub_name = ?));
  `;

  // Execute the update query
  connection.query(updateQuery, [marks, rollNo, teacherId, subject], (err, results) => {
    if (err) {
      console.error('Error updating marks:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Send a success message or appropriate response
    res.json({ message: 'Marks updated successfully' });
  });
});

app.post('/updateAttendance/:newAttendance/:rollNo', (req, res) => {
  const { newAttendance, rollNo } = req.params;

  // SQL query to update attendance based on roll_no
  const updateAttendanceQuery = `
    UPDATE student
    SET attendance = ?
    WHERE roll_no = ?;
  `;

  // Execute the update attendance query
  connection.query(updateAttendanceQuery, [newAttendance, rollNo], (err, results) => {
    if (err) {
      console.error('Error updating attendance:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Send a success message or appropriate response
    res.json({ message: 'Attendance updated successfully' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

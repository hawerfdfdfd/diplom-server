const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "",
  database: "store",
});

// Обновленный GET /employees с JOIN
app.get("/employees", (req, res) => {
  const SQL = `
    SELECT 
      e.employee_id,
      e.first_name,
      e.last_name,
      e.email,
      e.phone_number,
      e.hire_date,
      e.job_title,
      e.qualification,
      e.salary,
      e.department_id,
      d.department_name,
      ws.working_hours,
      ws.shift_type
    FROM employees e
    LEFT JOIN departments d 
      ON e.department_id = d.department_id
    LEFT JOIN workschedules ws 
      ON e.employee_id = ws.employee_id
  `;

  db.query(SQL, (err, results) => {
    if (err) {
      console.error("Ошибка получения сотрудников:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// app.put("/employees/:id", (req, res) => {
//   const employeeId = req.params.id;
//   const updateData = req.body; // обновляемые данные из запроса

//   // запрос к базе данных для обновления сотрудника.
//   const SQL =
//     "UPDATE employees SET vacationStartDate = ?, vacationEndDate = ?, vacationType = ?, scheduleHours = ?, scheduleShiftType = ? WHERE employee_id = ?";
//   const values = [
//     updateData.vacationStartDate,
//     updateData.vacationEndDate,
//     updateData.vacationType,
//     updateData.scheduleHours,
//     updateData.scheduleShiftType,
//     employeeId,
//   ];

//   db.query(SQL, values, (err, result) => {
//     if (err) {
//       console.error("Ошибка при обновлении данных:", err);
//       return res.status(500).json({ error: "Ошибка при обновлении данных" });
//     }
//     res.json({ message: "Данные обновлены", data: updateData });
//   });
// });

app.get("/departments", (req, res) => {
  const sqlQuery = "SELECT * FROM departments";
  db.query(sqlQuery, (err, result) => {
    if (err) {
      console.error("Ошибка выполнения запроса:", err);
      res.status(500).json({ error: "Ошибка выполнения запроса" });
    } else {
      res.json(result);
    }
  });
});

app.get("/reports", (req, res) => {
  const sqlQuery = "SELECT * FROM reports";
  db.query(sqlQuery, (err, result) => {
    if (err) {
      console.error("Ошибка выполнения запроса:", err);
      res.status(500).json({ error: "Ошибка выполнения запроса" });
    } else {
      res.json(result);
    }
  });
});

app.get("/vacations", (req, res) => {
  const sqlQuery = "SELECT * FROM vacations";
  db.query(sqlQuery, (err, result) => {
    if (err) {
      console.error("Ошибка выполнения запроса:", err);
      res.status(500).json({ error: "Ошибка выполнения запроса" });
    } else {
      res.json(result);
    }
  });
});

app.get("/workschedules", (req, res) => {
  const sqlQuery = "SELECT * FROM workschedules";
  db.query(sqlQuery, (err, result) => {
    if (err) {
      console.error("Ошибка выполнения запроса:", err);
      res.status(500).json({ error: "Ошибка выполнения запроса" });
    } else {
      res.json(result);
    }
  });
});

app.post("/login", (req, res) => {
  const sentloginUserName = req.body.LoginUserName;
  const sentLoginPassword = req.body.LoginPassword;

  const SQL = "SELECT * FROM employees WHERE first_name = ? && last_name = ?";

  const Values = [sentloginUserName, sentLoginPassword];
  db.query(SQL, Values, (err, results) => {
    if (err) {
      res.send({ error: err });
    }
    if (results.length > 0) {
      res.send(results);
    } else {
      res.send({ message: `не найдено` });
    }
  });
});

// Обновление записи отпуска
app.put("/vacations/:id", (req, res) => {
  const vacationId = req.params.id;
  const { start_date, end_date, vacation_type } = req.body;
  const SQL =
    "UPDATE vacations SET start_date = ?, end_date = ?, vacation_type = ? WHERE vacation_id = ?";
  const values = [start_date, end_date, vacation_type, vacationId];

  db.query(SQL, values, (err, result) => {
    if (err) {
      console.error("Ошибка обновления отпуска:", err);
      return res.status(500).json({ error: "Ошибка обновления отпуска" });
    }
    res.json({ message: "Отпуск обновлен", data: req.body });
  });
});

// Обновление записи смены
app.put("/workschedules/:id", (req, res) => {
  const scheduleId = req.params.id;
  const { working_hours, shift_type } = req.body;
  const SQL =
    "UPDATE workschedules SET working_hours = ?, shift_type = ? WHERE schedule_id = ?";
  const values = [working_hours, shift_type, scheduleId];

  db.query(SQL, values, (err, result) => {
    if (err) {
      console.error("Ошибка обновления смены:", err);
      return res.status(500).json({ error: "Ошибка обновления смены" });
    }
    res.json({ message: "Смена обновлена", data: req.body });
  });
});

// Обновление записи отдела
app.put("/departments/:id", (req, res) => {
  const departmentId = req.params.id;
  const { department_name } = req.body;
  console.log("Подключение к БД использует базу:", db.config.database);
  db.query(
    "SELECT * FROM departments WHERE department_id = ?",
    [departmentId],
    (err, rows) => {
      if (err) console.error("Ошибка SELECT перед UPDATE:", err);
      else console.log("Существующая запись перед UPDATE:", rows);

      // Теперь сам UPDATE
      db.query(
        "UPDATE departments SET department_name = ? WHERE department_id = ?",
        [department_name, departmentId],
        (err2, result) => {
          if (err2) {
            console.error("Ошибка обновления отдела:", err2);
            return res.status(500).json({ error: "Ошибка обновления отдела" });
          }

          console.log("UPDATE result:", result);

          // Теперь проверим после
          db.query(
            "SELECT * FROM departments WHERE department_id = ?",
            [departmentId],
            (err3, rowsAfter) => {
              if (err3) console.error("Ошибка SELECT после UPDATE:", err3);
              else console.log("Запись после UPDATE:", rowsAfter);
              res.json({ message: "Отдел обновлен", data: req.body });
            }
          );
        }
      );
    }
  );
});

// Обновление записи отчёта
app.put("/reports/:id", (req, res) => {
  const reportId = req.params.id;
  const { report_description, report_date, report_data } = req.body;
  const SQL =
    "UPDATE reports SET report_description = ?, report_date = ?, report_data = ? WHERE report_id = ?";
  const values = [report_description, report_date, report_data, reportId];

  db.query(SQL, values, (err, result) => {
    if (err) {
      console.error("Ошибка обновления отчёта:", err);
      return res.status(500).json({ error: "Ошибка обновления отчёта" });
    }
    res.json({ message: "Отчёт обновлен", data: req.body });
  });
});

// ваш файл server.js или index.js
app.put("/employees/:id", (req, res) => {
  const employeeId = req.params.id;
  const updateData = req.body; // { first_name, last_name, ..., qualification, salary }

  // 1) Обновляем только поля employees
  const SQL_UPDATE = `
    UPDATE employees
    SET first_name = ?, last_name = ?, email = ?,
        phone_number = ?, hire_date = ?, job_title = ?,
        qualification = ?, salary = ?
    WHERE employee_id = ?
  `;
  const values = [
    updateData.first_name,
    updateData.last_name,
    updateData.email,
    updateData.phone_number,
    updateData.hire_date,
    updateData.job_title,
    updateData.qualification,
    updateData.salary,
    employeeId,
  ];

  db.query(SQL_UPDATE, values, (err, result) => {
    if (err) {
      console.error("Ошибка при обновлении сотрудника:", err);
      return res
        .status(500)
        .json({ error: "Ошибка при обновлении сотрудника" });
    }

    // 2) После успешного UPDATE делаем SELECT для получения полной записи
    const SQL_SELECT = `
      SELECT e.*, d.department_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE e.employee_id = ?
    `;
    db.query(SQL_SELECT, [employeeId], (err2, rows) => {
      if (err2) {
        console.error("Ошибка при получении обновлённых данных:", err2);
        return res.status(500).json({ error: "Ошибка при получении данных" });
      }
      res.json({ message: "Сотрудник обновлён", data: rows[0] });
    });
  });
});

// Приём нового заявления
app.post("/mails", (req, res) => {
  const { employee_id, subject, start_date, end_date, reason } = req.body;
  const SQL = `
    INSERT INTO mails (employee_id, subject, start_date, end_date, reason)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(
    SQL,
    [employee_id, subject, start_date, end_date, reason],
    (err, result) => {
      if (err) {
        console.error("Ошибка вставки заявления:", err);
        return res.status(500).json({ error: "DB insert error" });
      }
      // Вернём созданный ID
      res.json({
        id: result.insertId,
        employee_id,
        subject,
        start_date,
        end_date,
        reason,
      });
    }
  );
});

// И, разумеется, существующий GET /mails оставляем, чтобы фронт мог их получать
app.get("/mails", (req, res) => {
  const sql = `
    SELECT 
      m.id,
      m.subject,
      m.start_date,
      m.end_date,
      m.reason,
      m.admin_comment,
      m.mail_status,
      e.first_name,
      e.last_name
    FROM mails AS m
    JOIN employees AS e ON m.employee_id = e.employee_id
    WHERE m.mail_status = 'pending'
    ORDER BY m.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    // Собираем поле employeeName
    const mails = results.map((row) => ({
      id: row.id,
      subject: row.subject,
      start_date: row.start_date,
      end_date: row.end_date,
      reason: row.reason,
      admin_comment: row.admin_comment,
      mail_status: row.mail_status,
      employeeName: `${row.first_name} ${row.last_name}`,
    }));
    res.json(mails);
  });
});

// вернуть все заявления данного сотрудника
// И поправим главный GET, чтобы не возвращать уже прочитанные:
// вернуть только непомеченные как прочитанные заявления данного сотрудника
app.get("/mails/employee/:id", (req, res) => {
  const empId = req.params.id;
  const sql = `
    SELECT 
      m.id,
      m.subject,
      m.start_date,
      m.end_date,
      m.reason,
      m.admin_comment,
      m.mail_status
    FROM mails AS m
    WHERE m.employee_id = ?
      AND m.mail_status <> 'read'
    ORDER BY m.created_at DESC
  `;
  db.query(sql, [empId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// PUT /mails/:id/approve
app.put("/mails/:id/approve", (req, res) => {
  const mailId = req.params.id;
  const { adminComment } = req.body;

  const getSQL = `SELECT * FROM mails WHERE id = ?`;
  db.query(getSQL, [mailId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ error: "Mail not found" });
    }
    const mail = results[0];
    const days =
      (new Date(mail.end_date) - new Date(mail.start_date)) /
        (1000 * 60 * 60 * 24) +
      1;
    const hoursToDeduct = days * 4.5;

    // Вычитаем часы из таблицы workschedules
    const updateScheduleSQL = `
      UPDATE workschedules
      SET working_hours = working_hours - ?
      WHERE employee_id = ?
    `;
    db.query(updateScheduleSQL, [hoursToDeduct, mail.employee_id], (err2) => {
      if (err2) {
        return res
          .status(500)
          .json({ error: "Failed to update employee hours" });
      }

      // Обновляем статус и комментарий
      const updateMailSQL = `
          UPDATE mails
          SET mail_status = 'approved',
              admin_comment = ?
          WHERE id = ?
        `;
      db.query(updateMailSQL, [adminComment, mailId], (err3) => {
        if (err3) {
          return res.status(500).json({ error: "Failed to update mail" });
        }
        res.json({ message: "Заявление одобрено", mailId });
      });
    });
  });
});

// PUT /mails/:id/reject
app.put("/mails/:id/reject", (req, res) => {
  const mailId = req.params.id;
  const { adminComment } = req.body;

  const updateMailSQL = `
    UPDATE mails
    SET mail_status = 'rejected',
        admin_comment = ?
    WHERE id = ?
  `;
  db.query(updateMailSQL, [adminComment, mailId], (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to update mail" });
    }
    res.json({ message: "Заявление отклонено", mailId });
  });
});

// PUT /mails/:id/read
app.put("/mails/:id/read", (req, res) => {
  const mailId = req.params.id;
  const sql = `
    UPDATE mails
    SET mail_status = 'read'
    WHERE id = ?
  `;
  db.query(sql, [mailId], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ message: "Отмечено как прочитанное", mailId });
  });
});

// DELETE /mails/:id
app.delete("/mails/:id", (req, res) => {
  const mailId = req.params.id;
  const sql = `DELETE FROM mails WHERE id = ?`;
  db.query(sql, [mailId], (err, result) => {
    if (err) return res.status(500).json({ error: "DB delete error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Mail not found" });
    res.json({ message: "Заявление удалено", mailId });
  });
});

app.listen(3002, () => {
  console.log("Server is working on 3002 port");
});

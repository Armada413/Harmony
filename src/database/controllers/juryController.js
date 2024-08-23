import db from "../db.js";

const template = async (req, res) => {
  try {
  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const createReport = async (req, res) => {
  const reportLimit = 3;
  try {
    const { user_discord, suspect_discord, type, offense, message_link } =
      req.body;

    const userReports = await db.query(
      "SELECT * FROM reports WHERE user_discord = $1 AND timestamp >= NOW() - INTERVAL '48 hours';",
      [user_discord]
    );

    const reportedSelf = suspect_discord == user_discord ? true : false;

    const suspectIsFound = userReports.rows.some(
      (report) => report.suspect_discord == suspect_discord
    );

    // Filter reports to check how many were made in the last 24 hours
    const reportsLast24Hours = userReports.rows.filter(
      (report) =>
        new Date(report.timestamp) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const reachedLimit = reportsLast24Hours.length >= 3 ? true : false;

    // Check if report fits the requirements
    if (reportedSelf) throw new Error("Members can't report self");
    else if (suspectIsFound)
      throw new Error("Member already reported this suspect in the last 48hrs");
    else if (reachedLimit)
      throw new Error("Member has already made 3 reports in the last 24hrs");

    //   If all requirements met, then add report
    await db.query(
      "INSERT INTO reports (user_discord, suspect_discord, type, offense, message_link) VALUES ($1, $2, $3, $4, $5);",
      [user_discord, suspect_discord, type, offense, message_link]
    );

    const suspectTable = await db.query(
      "SELECT * FROM users WHERE discord_id = $1;",
      [suspect_discord]
    );

    // If suspect is in a case
    if (suspectTable.rows[0].reports === null) {
      res.status(201).json({
        success: true,
        message:
          "Your report has been submitted successfully: SUSPECT HAS ACTIVE CASE",
      });
    } else {
      await db.query(
        "UPDATE users SET reports = reports + 1 WHERE discord_id = $1;",
        [suspect_discord]
      );

      // If user reaches report limit (3), then make a case
      if (suspectTable.rows[0].reports + 1 >= reportLimit) {
        await db.query("UPDATE users SET reports = $1 WHERE discord_id = $2;", [
          null,
          suspect_discord,
        ]);

        // Add case to cases table
        const newCase = await db.query(
          "INSERT INTO cases (type, suspect_discord, offense, message_link) VALUES ($1, $2, $3, $4) RETURNING id;",
          [type, suspect_discord, offense, message_link]
        );

        res.status(201).json({
          success: true,
          case: true,
          caseId: newCase.rows[0].id,
          message:
            "Your report has been submitted successfully: CASE HAS BEEN CREATED",
        });
      } else {
        res.status(201).json({
          success: true,
          case: false,
          message: "Your report has been submitted successfully",
        });
      }
    }
  } catch (error) {
    // If the user reports someone that is not from the database
    if (error.constraint === "reports_suspect_discord_fkey") {
      console.error("Suspect is not in the users database");

      res.status(400).json({
        success: false,
        case: false,
        message: "Suspect is not from the server",
      });
    } else {
      console.error("Error in authController.js adding user:", {
        message: error.message,
      });

      res.status(400).json({
        success: false,
        case: false,
        message: error.message,
      });
    }
  }
};

// TODO: Need to make it so that it selects multiple users at random, not just 1
const createJuryRequest = async (req, res) => {
  try {
    const { case_id } = req.body;
    // Get all users who are not in a case, is a collaborator, has not served yet and is not in a selection process
    const validJury = await db.query(
      "SELECT discord_id FROM users WHERE reports < $1 AND collaborator = $2 AND served = $3;",
      [3, true, false]
    );

    if (validJury.rows.length > 0) {
      const randomIndex = Math.floor(Math.random() * validJury.rows.length);
      const juror = validJury.rows[randomIndex].discord_id;

      const createRequest = await db.query(
        "INSERT INTO jury_request (user_discord, case_id) VALUES ($1, $2) RETURNING id",
        [juror, case_id]
      );
      res.status(200).json({
        success: true,
        juror: juror,
        requestId: createRequest.rows[0].id,
      });
    } else {
      res.status(200).json({
        success: false,
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateJuryAttendance = async (req, res) => {
  try {
    const { request_id, attendance } = req.body;
    const date = new Date().toISOString();
    // If the value passed is valid, update the attendance of the user
    if (attendance === true) {
      const updateJury = await db.query(
        "UPDATE jury_request SET attending = $1, finished = $2 WHERE id = $3 RETURNING case_id, user_discord;",
        [attendance, date, request_id]
      );

      const caseId = updateJury.rows[0].case_id;
      const userId = updateJury.rows[0].user_discord;

      await db.query("UPDATE users SET served = $1 WHERE discord_id = $2", [
        null,
        userId,
      ]);

      // Check if there is already a jury queue with the current case id
      const juryList = await db.query(
        "SELECT * FROM jury_12 WHERE case_id = $1",
        [caseId]
      );
      if (juryList.rows.length === 0) {
        await db.query(
          "INSERT INTO jury_12 (case_id, user_discord_1) VALUES ($1, $2) RETURNING id",
          [caseId, userId]
        );
      } else {
        const juryRow = juryList.rows[0];

        let updateColumn = null;
        // Check which column is null so we can insert the juror
        for (let i = 1; i <= 12; i++) {
          if (juryRow[`user_discord_${i}`] === null) {
            updateColumn = `user_discord_${i}`;
            break;
          }
        }

        // Add the juror to the null column we found
        if (updateColumn) {
          await db.query(
            `UPDATE jury_12 SET ${updateColumn} = $1 WHERE case_id = $2`,
            [userId, caseId]
          );
        }
      }

      res.status(200).json({
        success: true,
      });
    } else if (attendance === false) {
      await db.query(
        "UPDATE jury_request SET attending = $1, finished = $2 WHERE id = $3;",
        [attendance, date, request_id]
      );

      res.status(200).json({
        success: true,
      });
    } else {
      throw new Error(
        "juryController.js: The value passed as attendance in req.body is not valid"
      );
    }
  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  createJuryRequest,
  createReport,
  updateJuryAttendance,
};

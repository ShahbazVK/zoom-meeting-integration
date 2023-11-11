// 1 - instant (a meeting that was created and happened right then)
// 2 - scheduled (a non-recurring meeting that was created but happened at a future date/time)
// 3 - recurring, no fixed time ( a recurring meeting that never ends)
// 8 - recurring, fixed time ( a recurring meeting that stops recurring at some specific time in the future)

const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const auth_token_url = "https://zoom.us/oauth/token";
const api_base_url = "https://api.zoom.us/v2";
const account_id = "account_id";
const username = "username";
const password = "password";

app.post("/", async (req, res) => {
  createMeeting(req, res, "ML meeting", 10, "2023-11-11T16:50:43.095Z"); //date in ISO format
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const createMeeting = async (req, res, topic, duration, start_time) => {
  try {
    const authResponse = await axios.post(
      `${auth_token_url}?grant_type=account_credentials&account_id=${account_id}`,
      {},
      {
        auth: {
          username: username,
          password: password,
        },
      }
    );

    if (authResponse.status !== 200) {
      console.log("Unable to get access token");
      return;
    }

    const access_token = authResponse.data.access_token;

    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };

    // const startTime = "2023-11-11T16:41:43.095Z";

    const payload = {
      topic: topic,
      duration: duration,
      start_time: start_time,
      type: 2,
    };

    const meetingResponse = await axios.post(
      `${api_base_url}/users/me/meetings`,
      payload,
      { headers }
    );

    if (meetingResponse.status !== 201) {
      console.log("Unable to generate meeting link");
      return;
    }

    const response_data = meetingResponse.data;

    const content = {
      meeting_url: response_data.join_url,
      password: response_data.password,
      meetingTime: response_data.start_time,
      purpose: response_data.topic,
      duration: response_data.duration,
      message: "Success",
      status: 1,
    };
    console.log(response_data);
    res.json(content);
  } catch (error) {
    res.send("error");
  }
};

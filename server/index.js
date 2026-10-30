require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { errorHandler, notFoundHandler } = require("./src/middleware/errorHandler");
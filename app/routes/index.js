const path = require("path");
const rateLimit = require("express-rate-limit");
const SessionHandler = require("./session");
const ProfileHandler = require("./profile");
const BenefitsHandler = require("./benefits");
const ContributionsHandler = require("./contributions");
const AllocationsHandler = require("./allocations");
const MemosHandler = require("./memos");
const ResearchHandler = require("./research");
const { environmentalScripts } = require("../../config/config");
const ErrorHandler = require("./error").errorHandler;

const index = (app, db) => {
  "use strict";

  const sessionHandler = new SessionHandler(db);
  const profileHandler = new ProfileHandler(db);
  const benefitsHandler = new BenefitsHandler(db);
  const contributionsHandler = new ContributionsHandler(db);
  const allocationsHandler = new AllocationsHandler(db);
  const memosHandler = new MemosHandler(db);
  const researchHandler = new ResearchHandler(db);

  const isLoggedIn = sessionHandler.isLoggedInMiddleware;
  const isAdmin = sessionHandler.isAdminUserMiddleware;

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
  });

  app.use(limiter);

  app.get("/", sessionHandler.displayWelcomePage);
  app.get("/login", sessionHandler.displayLoginPage);
  app.post("/login", limiter, sessionHandler.handleLoginRequest);
  app.get("/signup", sessionHandler.displaySignupPage);
  app.post("/signup", limiter, sessionHandler.handleSignup);
  app.get("/logout", sessionHandler.displayLogoutPage);
  app.get("/dashboard", isLoggedIn, sessionHandler.displayWelcomePage);
  app.get("/profile", isLoggedIn, profileHandler.displayProfile);
  app.post("/profile", isLoggedIn, limiter, profileHandler.handleProfileUpdate);
  app.get(
    "/contributions",
    isLoggedIn,
    contributionsHandler.displayContributions
  );
  app.post(
    "/contributions",
    isLoggedIn,
    limiter,
    contributionsHandler.handleContributionsUpdate
  );
  app.get("/benefits", isLoggedIn, benefitsHandler.displayBenefits);
  app.post(
    "/benefits",
    isLoggedIn,
    isAdmin,
    limiter,
    benefitsHandler.updateBenefits
  );
  app.get(
    "/allocations/:userId",
    isLoggedIn,
    allocationsHandler.displayAllocations
  );
  app.get("/memos", isLoggedIn, memosHandler.displayMemos);
  app.post("/memos", isLoggedIn, limiter, memosHandler.addMemos);

  const allowedUrls = [
    "/home",
    "/profile",
    "/dashboard"
  ];

  function isAllowedUrl(path) {
    return allowedUrls.includes(path);
  }

  const app = require("express")();

  app.get("/redirect", function (req, res) {
    // Validate the target URL
    let target = req.query["target"];
    if (isAllowedUrl(target)) {
      res.redirect(target);
    } else {
      res.redirect("/home");
    }
  });

  app.get("/tutorial", (req, res) => {
    return res.render("tutorial/a1", { environmentalScripts });
  });

  app.get("/tutorial/:page", (req, res) => {
    const { page } = req.params;
    const allowedPages = ["a1", "a2", "a3"];
    if (!allowedPages.includes(page)) {
      res.status(403).send("Forbidden");
      return;
    }
    const tutorialRoot = path.join(__dirname, "../../views/tutorial");
    const resolvedPath = path.resolve(tutorialRoot, page);
    if (!resolvedPath.startsWith(tutorialRoot)) {
      res.status(403).send("Forbidden");
      return;
    }
    return res.render(`tutorial/${page}`, { environmentalScripts });
  });

  app.get("/research", isLoggedIn, researchHandler.displayResearch);
  app.use(ErrorHandler);
};

module.exports = index;

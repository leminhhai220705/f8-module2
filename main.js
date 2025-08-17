import volumeSliding from "./js/components/volumeSliding.js";
import tooltip from "./js/components/tooltip.js";
import home from "./js/pages/home.js";
import register from "./js/auth/register.js";
import login from "./js/auth/login.js";
import logout from "./js/auth/logout.js";
import newPlaylistLogic from "./js/components/newPlaylistLogic.js";
import sideBar from "./js/layouts/sidebar.js";
import newPublicPlaylist from "./js/components/newPublicPlaylist.js";
import contextMenuHandling from "./js/components/contextMenuHandling.js";
import footer from "./js/layouts/footer.js";
import trackToPlaylist from "./js/components/trackToPlaylist.js";
import trackPlaying from "./js/components/trackplaying.js";
// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const signupBtn = document.querySelector(".signup-btn");
  const loginBtn = document.querySelector(".login-btn");
  const authModal = document.getElementById("authModal");
  const modalClose = document.getElementById("modalClose");
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const showLoginBtn = document.getElementById("showLogin");
  const showSignupBtn = document.getElementById("showSignup");

  // Function to show signup form
  function showSignupForm() {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  }

  // Function to show login form
  function showLoginForm() {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  }

  // Function to open modal
  function openModal() {
    authModal.classList.add("show");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  // Open modal with Sign Up form when clicking Sign Up button
  signupBtn.addEventListener("click", function () {
    showSignupForm();
    openModal();
  });

  // Open modal with Login form when clicking Login button
  loginBtn.addEventListener("click", function () {
    showLoginForm();
    openModal();
  });

  // Close modal function
  function closeModal() {
    authModal.classList.remove("show");
    document.body.style.overflow = "auto"; // Restore scrolling
  }

  // Close modal when clicking close button
  modalClose.addEventListener("click", closeModal);

  // Close modal when clicking overlay (outside modal container)
  authModal.addEventListener("click", function (e) {
    if (e.target === authModal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && authModal.classList.contains("show")) {
      closeModal();
    }
  });

  // Switch to Login form
  showLoginBtn.addEventListener("click", function () {
    showLoginForm();
  });

  // Switch to Signup form
  showSignupBtn.addEventListener("click", function () {
    showSignupForm();
  });
});

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
  const userAvatar = document.getElementById("userAvatar");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  // Toggle dropdown when clicking avatar
  userAvatar.addEventListener("click", function (e) {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });

  // Close dropdown when pressing Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && userDropdown.classList.contains("show")) {
      userDropdown.classList.remove("show");
    }
  });

  // Handle logout button click
  logoutBtn.addEventListener("click", function () {
    // Close dropdown first
    userDropdown.classList.remove("show");

    // TODO: Students will implement logout logic here
  });
});

// Other functionality
document.addEventListener("DOMContentLoaded", async () => {
  // TODO: Implement other functionality here

  // handleVolumeSLiding
  volumeSliding.executeSlidingLogic();

  // handleTooltip
  tooltip.handleDisplayTooltip();

  // Execute HomePage
  await home.executeHome();

  // Handle Register
  await register.handleRegister();

  // Handle Login
  await login.handleLogin();

  // Handle Logout
  logout.handleLogout();

  // Handle Logic Add
  await newPlaylistLogic.handleAllNewPlaylist();

  // Handle Sidebar
  await sideBar.handleSidebar();

  // Handle Add Public Playlist
  newPublicPlaylist.handleAddPublicPlaylist();

  // // handle playing track
  // trackPlaying.playingTrack();

  // render footer
  await footer.handleFooter(true);

  trackToPlaylist.handleAddTrackToPlaylist();

  // Handle Context Menu
  contextMenuHandling.handleContextMenu();
});

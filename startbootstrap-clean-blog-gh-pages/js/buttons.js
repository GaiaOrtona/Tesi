// Colori per ciascun tema
const themeColors = {
    "#themechildhood": "#fcd600", // Rosa chiaro
    "#themelove": "#FFB5E8", // Viola chiaro
    "#themesocio_economic_status": "#B5FFB5", // Verde chiaro
    "#themereligion": "#FFE5B5", // Arancione chiaro
    "#themepolitics": "#B5D6FF", // Blu chiaro
  };
  
  // Track active theme
  let activeTheme = null;
  
  // Function to handle theme highlighting and button states
  function highlightTheme(selectedTheme) {
    // If clicking the same theme that's already active, deactivate it
    if (activeTheme === selectedTheme) {
      // Remove all highlights
      document.querySelectorAll("[data-theme]").forEach((element) => {
        element.style.backgroundColor = "transparent";
        element.classList.remove("highlighted");
      });
      // Remove active state from button
      document.querySelector(`[data-theme-btn="${selectedTheme}"]`).classList.remove("active");
      activeTheme = null;
    } else {
      // Remove previous highlighting and button states
      document.querySelectorAll("[data-theme]").forEach((element) => {
        element.style.backgroundColor = "transparent";
        element.classList.remove("highlighted");
      });
      document.querySelectorAll(".theme-btn").forEach((btn) => {
        btn.classList.remove("active");
      });
  
      // Highlight new selection
      const themeElements = document.querySelectorAll(`[data-theme="${selectedTheme}"]`);
      const highlightColor = themeColors[selectedTheme];
      if (highlightColor) {
        themeElements.forEach((element) => {
          element.style.backgroundColor = highlightColor;
          element.classList.add("highlighted");
        });
        // Scroll to first element
        if (themeElements.length > 0) {
          themeElements[0].scrollIntoView({ behavior: "smooth", block: "center" });
        }
        // Add active state to button
        document.querySelector(`[data-theme-btn="${selectedTheme}"]`).classList.add("active");
        activeTheme = selectedTheme;
      }
    }
  }
  
  // Event listeners per ogni bottone
  document.getElementById("politicsBtn").addEventListener("click", function () {
    highlightTheme("#themepolitics");
  });
  
  document.getElementById("religionBtn").addEventListener("click", function () {
    highlightTheme("#themereligion");
  });
  
  document
    .getElementById("socioEconomicBtn")
    .addEventListener("click", function () {
      highlightTheme("#themesocio_economic_status");
    });
  
  document.getElementById("loveBtn").addEventListener("click", function () {
    highlightTheme("#themelove");
  });
  
  document.getElementById("childhoodBtn").addEventListener("click", function () {
    highlightTheme("#themechildhood");
  });
  
  
  
  document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelector(".button-container");
    const sidebar = document.querySelector(".sidebar");
    const header = document.querySelector("header");
    let ticking = false;
  
    const x = 70
    
    function setInitialPosition() {
      const headerHeight = header.offsetHeight;
      sidebar.style.top = `${headerHeight + x}px`;
    }
  
    setInitialPosition();
  
    function updatePosition() {
      const headerHeight = header.offsetHeight;
      const headerRect = header.getBoundingClientRect();
      const sidebarInitialOffset = headerHeight + x;
      
      // Calculate how far we've scrolled past the header
      const scrolledPastHeader = -headerRect.bottom;
      
      if (scrolledPastHeader >= 0) {
        // We're past the header
        sidebar.style.transform = 'translateY(0)';
        sidebar.classList.add("fixed");
      } else {
        // We're still at or above the header
        sidebar.classList.remove("fixed");
        sidebar.style.transform = 'none';
      }
    }
  
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updatePosition();
          ticking = false;
        });
        ticking = true;
      }
    });
  
    window.addEventListener('resize', setInitialPosition);
  });
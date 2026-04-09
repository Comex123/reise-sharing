(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function euro(value) {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(value));
  }

  function formatRange(startDate, endDate) {
    return formatDate(startDate) + " bis " + formatDate(endDate);
  }

  function tripDays(trip) {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diff = Math.round((end - start) / 86400000) + 1;
    return diff > 0 ? diff : 1;
  }

  function excerpt(text, maxLength) {
    const value = String(text || "").trim();
    if (value.length <= maxLength) {
      return value;
    }

    return value.slice(0, maxLength - 3).trimEnd() + "...";
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function getTrips() {
    return window.StorageApi.getTrips();
  }

  function getProfile() {
    return window.StorageApi.getProfile();
  }

  function getRequests() {
    return window.StorageApi.getRequests();
  }

  function getHostById(hostId) {
    return window.AppData.users.find(function (user) {
      return user.id === hostId;
    }) || window.AppData.users[0];
  }

  function unlockLabel(value) {
    if (value === "after-request") {
      return "nach Anfrage";
    }

    return "nach Bestaetigung";
  }

  function groupTypeLabel(trip) {
    return trip.groupType || "Offen";
  }

  function matchTypes(trip) {
    if (Array.isArray(trip.matchTypes) && trip.matchTypes.length) {
      return trip.matchTypes;
    }

    return ["Offen"];
  }

  function tripCardMarkup(trip) {
    const host = getHostById(trip.hostId);
    const safeId = encodeURIComponent(trip.id);
    const safeStyles = trip.styles.map(function (style) {
      return '<span class="trip-chip">' + escapeHtml(style) + '</span>';
    }).join("");
    const safeMatchTypes = matchTypes(trip).map(function (type) {
      return escapeHtml(type);
    }).join(", ");

    return [
      '<article class="trip-card card-surface">',
      '  <div class="trip-topline">',
      '    <span class="trip-chip trip-chip-route">' + escapeHtml(trip.startCity) + ' -> ' + escapeHtml(trip.destinationCity) + '</span>',
      '    <span class="status-pill">' + escapeHtml(trip.status) + '</span>',
      '  </div>',
      '  <div class="trip-title-row">',
      '    <div>',
      '      <h3>' + escapeHtml(trip.title) + '</h3>',
      '      <p class="trip-copy">' + escapeHtml(formatRange(trip.startDate, trip.endDate)) + '</p>',
      '    </div>',
      '    <strong>' + euro(trip.budgetPerPerson) + '</strong>',
      '  </div>',
      '  <div class="trip-meta">',
      '    <span class="meta-pill">' + escapeHtml(trip.country) + '</span>',
      '    <span class="meta-pill">' + tripDays(trip) + ' Tage</span>',
      '    <span class="meta-pill">' + trip.seats + ' freie Plaetze</span>',
      '    <span class="meta-pill">Startet als: ' + escapeHtml(groupTypeLabel(trip)) + '</span>',
      '    <span class="meta-pill">Passend fuer: ' + safeMatchTypes + '</span>',
      '  </div>',
      '  <p class="trip-copy">' + escapeHtml(excerpt(trip.notes, 90)) + '</p>',
      '  <div class="trip-card-footer">',
      '    <div class="trip-tags">' + safeStyles + '</div>',
      '    <p class="trip-host">Mit ' + escapeHtml(host.name) + ' - Kontakt ' + escapeHtml(unlockLabel(trip.contactUnlock)) + '</p>',
      '  </div>',
      '  <div class="trip-actions">',
      '    <a class="button button-primary" href="reise-detail.html?id=' + safeId + '">Details ansehen</a>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function renderTrips(targetId, trips) {
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    if (!trips.length) {
      target.innerHTML = '<div class="empty-state">Keine Reisen passen gerade zu deinem Filter.</div>';
      return;
    }

    target.innerHTML = trips.map(tripCardMarkup).join("");
  }

  function renderEmptyList(target, text) {
    target.innerHTML = '<div class="empty-state">' + escapeHtml(text) + "</div>";
  }

  function updateHomeMetrics(trips) {
    const totalTrips = trips.length;
    const totalBudget = trips.reduce(function (sum, trip) {
      return sum + Number(trip.budgetPerPerson || 0);
    }, 0);
    const totalSeats = trips.reduce(function (sum, trip) {
      return sum + Number(trip.seats || 0);
    }, 0);
    const averageBudget = totalTrips ? Math.round(totalBudget / totalTrips) : 0;

    setText("homeTripCount", String(totalTrips));
    setText("homeAvgBudget", euro(averageBudget));
    setText("homeOpenSeats", String(totalSeats));
  }

  function initHome() {
    const trips = getTrips();
    updateHomeMetrics(trips);
    renderTrips("featuredTrips", trips.slice(0, 4));
  }

  function initTripsPage() {
    const destinationInput = document.getElementById("filterDestination");
    const budgetInput = document.getElementById("filterBudget");
    const styleSelect = document.getElementById("filterStyle");
    const groupTypeSelect = document.getElementById("filterGroupType");
    const matchTypeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-match-type]"));
    const clearFiltersButton = document.getElementById("clearFilters");
    let activeMatchType = "";

    function updateMatchTypeButtons(value) {
      activeMatchType = value;
      matchTypeButtons.forEach(function (button) {
        const isActive = button.dataset.matchType === value;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    }

    function applyFilters() {
      const destination = destinationInput.value.trim().toLowerCase();
      const budget = Number(budgetInput.value || 0);
      const style = styleSelect.value;
      const groupType = groupTypeSelect.value;
      const selectedMatchType = activeMatchType;
      const filtered = getTrips().filter(function (trip) {
        const destinationText = [trip.destinationCity, trip.country, trip.startCity].join(" ").toLowerCase();
        const matchesDestination = !destination || destinationText.includes(destination);
        const matchesBudget = !budget || Number(trip.budgetPerPerson) <= budget;
        const matchesStyle = !style || trip.styles.includes(style);
        const matchesGroupType = !groupType || groupTypeLabel(trip) === groupType;
        const matchesMatchType = !selectedMatchType || matchTypes(trip).includes(selectedMatchType);
        return matchesDestination && matchesBudget && matchesStyle && matchesGroupType && matchesMatchType;
      });

      setText("tripCount", filtered.length + (filtered.length === 1 ? " Reise" : " Reisen"));
      renderTrips("tripGrid", filtered);
    }

    [destinationInput, budgetInput, styleSelect, groupTypeSelect].forEach(function (element) {
      element.addEventListener("input", applyFilters);
      element.addEventListener("change", applyFilters);
    });

    matchTypeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        updateMatchTypeButtons(button.dataset.matchType);
        applyFilters();
      });
    });

    if (clearFiltersButton) {
      clearFiltersButton.addEventListener("click", function () {
        destinationInput.value = "";
        budgetInput.value = "";
        styleSelect.value = "";
        groupTypeSelect.value = "";
        updateMatchTypeButtons("");
        applyFilters();
      });
    }

    updateMatchTypeButtons("");
    applyFilters();
  }

  function initDetailPage() {
    const target = document.getElementById("tripDetail");
    if (!target) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const tripId = params.get("id");
    const trip = getTrips().find(function (entry) {
      return entry.id === tripId;
    }) || getTrips()[0];

    if (!trip) {
      target.innerHTML = '<div class="empty-state">Keine Reise gefunden.</div>';
      return;
    }

    const host = getHostById(trip.hostId);
    const styleMarkup = trip.styles.map(function (style) {
      return '<span class="trip-chip">' + escapeHtml(style) + "</span>";
    }).join("");
    const matchTypeMarkup = matchTypes(trip).map(function (type) {
      return '<span class="meta-pill">' + escapeHtml(type) + "</span>";
    }).join("");

    target.innerHTML = [
      '<article class="detail-card card-surface">',
      '  <p class="eyebrow">Oeffentliche Reiseinfos</p>',
      '  <div class="trip-title-row">',
      '    <div>',
      '      <h2>' + escapeHtml(trip.title) + '</h2>',
      '      <p class="lead">' + escapeHtml(trip.startCity) + ' -> ' + escapeHtml(trip.destinationCity) + ", " + escapeHtml(trip.country) + "</p>",
      '    </div>',
      '    <span class="status-pill">' + escapeHtml(trip.status) + "</span>",
      '  </div>',
      '  <div class="detail-stats">',
      '    <span class="meta-pill">' + escapeHtml(formatRange(trip.startDate, trip.endDate)) + "</span>",
      '    <span class="meta-pill">' + tripDays(trip) + ' Tage</span>',
      '    <span class="meta-pill">' + trip.seats + ' freie Plaetze</span>',
      '    <span class="meta-pill">' + euro(trip.budgetPerPerson) + " pro Person</span>",
      "  </div>",
      '  <p class="trip-copy">' + escapeHtml(trip.notes) + "</p>",
      '  <div class="trip-tags">' + styleMarkup + "</div>",
      '  <div class="detail-audience">',
      '    <div>',
      '      <p class="eyebrow">Reisekonstellation</p>',
      '      <p class="trip-copy">Startet aktuell als <strong>' + escapeHtml(groupTypeLabel(trip)) + "</strong>.</p>",
      "    </div>",
      '    <div>',
      '      <p class="eyebrow">Besonders passend fuer</p>',
      '      <div class="detail-stats">' + matchTypeMarkup + "</div>",
      "    </div>",
      "  </div>",
      '  <div class="trip-actions">',
      '    <button class="button button-primary" type="button" id="requestButton">Anfrage senden</button>',
      '    <a class="button button-secondary" href="reisen.html">Zurueck zur Liste</a>',
      "  </div>",
      "</article>",
      '<aside class="detail-sidebar card-surface">',
      "  <div>",
      '    <p class="eyebrow">Gastgeber</p>',
      '    <h3>' + escapeHtml(host.name) + "</h3>",
      '    <p class="trip-copy">' + escapeHtml(host.about) + "</p>",
      '    <div class="profile-meta">',
      '      <span class="meta-pill">' + escapeHtml(host.homeBase) + "</span>",
      '      <span class="meta-pill">' + escapeHtml(host.languages.join(", ")) + "</span>",
      '      <span class="meta-pill">' + (host.verified ? "Verifiziert" : "Nicht verifiziert") + "</span>",
      "    </div>",
      "  </div>",
      "  <div>",
      '    <p class="eyebrow">Jetzt sichtbar</p>',
      '    <ul class="privacy-list">',
      "      <li>Startstadt und Ziel</li>",
      "      <li>Datum, Budget und Reisestil</li>",
      "      <li>Kurze persoenliche Beschreibung</li>",
      "    </ul>",
      "  </div>",
      "  <div>",
      '    <p class="eyebrow">Noch verborgen</p>',
      '    <ul class="privacy-list">',
      "      <li>Telefonnummer</li>",
      "      <li>Genaue Unterkunft</li>",
      "      <li>Treffpunkt und private Kontaktdaten</li>",
      "    </ul>",
      "  </div>",
      "</aside>"
    ].join("");

    const requestButton = document.getElementById("requestButton");
    requestButton.addEventListener("click", function () {
      window.alert("Fuer die Reise \"" + trip.title + "\" wuerde hier eine Anfrage an den Gastgeber gesendet werden.");
    });
  }

  function initCreatePage() {
    const form = document.getElementById("tripForm");
    const message = document.getElementById("createMessage");

    if (!form || !message) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const data = new FormData(form);
      const selectedMatchTypes = data.getAll("matchTypes");

      if (!selectedMatchTypes.length) {
        message.textContent = "Bitte waehle mindestens eine passende Reisekonstellation aus.";
        message.classList.add("is-error");
        return;
      }

      const trip = {
        id: "t" + Date.now(),
        hostId: "u1",
        title: String(data.get("title")).trim(),
        startCity: String(data.get("startCity")).trim(),
        destinationCity: String(data.get("destinationCity")).trim(),
        country: String(data.get("country")).trim(),
        startDate: data.get("startDate"),
        endDate: data.get("endDate"),
        seats: Number(data.get("seats")),
        budgetPerPerson: Number(data.get("budgetPerPerson")),
        groupType: data.get("groupType"),
        matchTypes: selectedMatchTypes,
        styles: String(data.get("styles")).split(",").map(function (entry) {
          return entry.trim();
        }).filter(Boolean),
        notes: String(data.get("notes")).trim(),
        contactUnlock: data.get("contactUnlock"),
        status: "Offen"
      };

      window.StorageApi.addTrip(trip);
      form.reset();
      message.classList.remove("is-error");
      message.textContent = 'Reise gespeichert. Du findest sie jetzt in "Reisen" und im Profil.';
    });
  }

  function initProfilePage() {
    const profileCard = document.getElementById("profileCard");
    const hostedTrips = document.getElementById("hostedTrips");
    const requestList = document.getElementById("requestList");
    const profile = getProfile();

    if (!profileCard || !hostedTrips || !requestList) {
      return;
    }

    profileCard.innerHTML = [
      '<p class="eyebrow">Profil</p>',
      "<h2>" + escapeHtml(profile.name) + "</h2>",
      '<p class="trip-copy">' + escapeHtml(profile.about) + "</p>",
      '<div class="profile-meta">',
      '  <span class="meta-pill">' + escapeHtml(profile.homeBase) + "</span>",
      '  <span class="meta-pill">' + escapeHtml(profile.languages.join(", ")) + "</span>",
      '  <span class="meta-pill">' + (profile.verified ? "Verifiziert" : "Nicht verifiziert") + "</span>",
      "</div>",
      '<div class="trip-tags">' + profile.interests.map(function (interest) {
        return '<span class="trip-chip">' + escapeHtml(interest) + "</span>";
      }).join("") + "</div>"
    ].join("");

    const ownTrips = getTrips().filter(function (trip) {
      return trip.hostId === profile.id;
    });

    if (!ownTrips.length) {
      renderEmptyList(hostedTrips, "Noch keine eigenen Reisen angelegt.");
    } else {
      hostedTrips.innerHTML = ownTrips.map(function (trip) {
        return [
          '<div class="stack-item">',
          "  <strong>" + escapeHtml(trip.title) + "</strong>",
          '  <p class="trip-copy">' + escapeHtml(trip.startCity) + " -> " + escapeHtml(trip.destinationCity) + " | " + escapeHtml(formatRange(trip.startDate, trip.endDate)) + "</p>",
          '  <a class="text-link" href="reise-detail.html?id=' + encodeURIComponent(trip.id) + '">Zur Detailseite</a>',
          "</div>"
        ].join("");
      }).join("");
    }

    const requests = getRequests();
    if (!requests.length) {
      renderEmptyList(requestList, "Aktuell gibt es keine offenen Anfragen.");
    } else {
      requestList.innerHTML = requests.map(function (request) {
        return [
          '<div class="stack-item">',
          "  <strong>" + escapeHtml(request.applicantName) + "</strong>",
          '  <p class="trip-copy">' + escapeHtml(request.message) + "</p>",
          '  <span class="status-pill">' + escapeHtml(request.status) + "</span>",
          "</div>"
        ].join("");
      }).join("");
    }
  }

  function init() {
    const page = document.body.dataset.page;

    if (page === "home") {
      initHome();
    }

    if (page === "trips") {
      initTripsPage();
    }

    if (page === "detail") {
      initDetailPage();
    }

    if (page === "create") {
      initCreatePage();
    }

    if (page === "profile") {
      initProfilePage();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();

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

  function formatDateTime(value) {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
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

  function getStays() {
    return window.AppData.stays || [];
  }

  function getProfile() {
    return window.StorageApi.getProfile();
  }

  function setProfile(profileId) {
    return window.StorageApi.setProfile(profileId);
  }

  function getRequests() {
    return window.StorageApi.getRequests();
  }

  function getCostPlans() {
    return window.StorageApi.getCostPlans();
  }

  function getChats() {
    return window.StorageApi.getChats();
  }

  function addRequest(request) {
    return window.StorageApi.addRequest(request);
  }

  function saveCostPlan(costPlan) {
    return window.StorageApi.saveCostPlan(costPlan);
  }

  function upsertChat(chat) {
    return window.StorageApi.upsertChat(chat);
  }

  function addChatMessage(chatId, message) {
    return window.StorageApi.addChatMessage(chatId, message);
  }

  function getUserById(userId) {
    return window.AppData.users.find(function (user) {
      return user.id === userId;
    }) || window.AppData.users[0];
  }

  function getHostById(hostId) {
    return getUserById(hostId);
  }

  function getTripById(tripId) {
    return getTrips().find(function (trip) {
      return trip.id === tripId;
    });
  }

  function getCostPlanByTripId(tripId) {
    return getCostPlans().find(function (costPlan) {
      return costPlan.tripId === tripId;
    });
  }

  function getChatById(chatId) {
    return getChats().find(function (chat) {
      return chat.id === chatId;
    });
  }

  function findChatForTripAndUsers(tripId, firstUserId, secondUserId) {
    return getChats().find(function (chat) {
      const participantIds = Array.isArray(chat.participantIds) ? chat.participantIds : [];
      return chat.tripId === tripId && participantIds.includes(firstUserId) && participantIds.includes(secondUserId);
    });
  }

  function chatMessages(chat) {
    return (chat && Array.isArray(chat.messages) ? chat.messages.slice() : []).sort(function (left, right) {
      return new Date(left.sentAt) - new Date(right.sentAt);
    });
  }

  function chatPartner(chat, currentUserId) {
    const participantIds = Array.isArray(chat && chat.participantIds) ? chat.participantIds : [];
    const partnerId = participantIds.find(function (id) {
      return id !== currentUserId;
    }) || currentUserId;
    return getUserById(partnerId);
  }

  function chatPreview(chat) {
    const messages = chatMessages(chat);
    const lastMessage = messages[messages.length - 1];
    return lastMessage ? excerpt(lastMessage.text, 72) : "Noch keine Nachricht";
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

  function tripListingType(trip) {
    return trip && trip.listingType === "request" ? "request" : "offer";
  }

  function tripListingLabel(trip) {
    return tripListingType(trip) === "request" ? "Anfrage" : "Angebot";
  }

  function tripOriginLabel(trip) {
    return trip && trip.startCity ? trip.startCity : "Start offen";
  }

  function tripDestinationLabel(trip) {
    if (trip && trip.destinationCity) {
      return trip.destinationCity;
    }

    if (trip && trip.regionLabel) {
      return trip.regionLabel;
    }

    if (trip && trip.country) {
      return trip.country;
    }

    return "Ziel offen";
  }

  function tripRouteLabel(trip) {
    return tripOriginLabel(trip) + " -> " + tripDestinationLabel(trip);
  }

  function tripSeatLabel(trip) {
    if (tripListingType(trip) === "request") {
      return trip.seats + (trip.seats === 1 ? " passender Match gesucht" : " passende Matches gesucht");
    }

    return trip.seats + " freie Plaetze";
  }

  function tripListingHint(trip) {
    if (tripListingType(trip) === "request") {
      return "Offene Reiseanfrage mit flexiblen Details";
    }

    return "Konkretes Angebot mit sichtbaren Reisedaten";
  }

  function tripTravelMode(trip) {
    if (trip && (trip.travelMode === "solo" || trip.travelMode === "hybrid" || trip.travelMode === "shared")) {
      return trip.travelMode;
    }

    return "shared";
  }

  function tripTravelModeLabel(trip) {
    const labels = {
      shared: "Gemeinsam",
      solo: "Solo",
      hybrid: "Solo + offen"
    };

    return labels[tripTravelMode(trip)] || "Gemeinsam";
  }

  function tripTravelModeHint(trip) {
    const hints = {
      shared: "Der Trip ist auf gemeinsames Reisen, Kontakt und Kostenteilung ausgelegt.",
      solo: "Du kannst diesen Trip komplett alleine machen und die App nur fuer Planung, Sicherheit und Struktur nutzen.",
      hybrid: "Du kannst solo starten und nur dann passende Leute dazunehmen, wenn es wirklich passt."
    };

    return hints[tripTravelMode(trip)] || hints.shared;
  }

  function tripTimingMode(trip) {
    return trip && trip.timingMode === "flexible" ? "flexible" : "fixed";
  }

  function tripTimingLabel(trip) {
    if (tripTimingMode(trip) === "flexible") {
      return "Flexibel im Zeitraum";
    }

    return "Feste Daten";
  }

  function tripTimingRange(trip) {
    if (tripTimingMode(trip) === "flexible") {
      return "Flexibel zwischen " + formatRange(trip.startDate, trip.endDate);
    }

    return formatRange(trip.startDate, trip.endDate);
  }

  function tripPlanningLabel(trip) {
    if (tripListingType(trip) === "request") {
      return "Ziel und genauer Ablauf werden noch abgestimmt";
    }

    if (tripTimingMode(trip) === "flexible") {
      return "Termin wird gemeinsam festgelegt";
    }

    return tripDays(trip) + " Tage";
  }

  function splitMethodLabel(method) {
    const labels = {
      "equal-all": "Alles gleich teilen",
      "host-prepays": "Host zahlt zuerst, dann Ausgleich",
      "self-pay-food": "Food individuell, Rest geteilt"
    };

    return labels[method] || "Alles gleich teilen";
  }

  function splitMethodHint(method) {
    const hints = {
      "equal-all": "Alle Hauptkosten laufen in einen gemeinsamen Topf und werden direkt pro Kopf angezeigt.",
      "host-prepays": "Unterkunft oder Tickets kann eine Person zuerst zahlen, die App zeigt danach den fairen Ausgleich pro Kopf.",
      "self-pay-food": "Fahrt, Unterkunft und Extras werden geteilt. Essen bleibt bewusst flexibel pro Person."
    };

    return hints[method] || hints["equal-all"];
  }

  function createDefaultCostPlan(trip) {
    const participantCount = tripTravelMode(trip) === "solo" ? 1 : Math.max(2, Number(trip.seats || 1) + 1);
    const total = Math.max(Number(trip.budgetPerPerson || 0) * participantCount, 0);
    const transport = Math.round(total * 0.24);
    const stay = Math.round(total * 0.5);
    const food = Math.round(total * 0.18);
    const extras = Math.max(total - transport - stay - food, 0);

    return {
      id: "cp-" + trip.id,
      tripId: trip.id,
      participantCount: participantCount,
      splitMethod: "equal-all",
      transport: transport,
      stay: stay,
      food: food,
      extras: extras,
      note: "Vorlaeufige App-Aufteilung auf Basis des angegebenen Budgets.",
      status: "Noch offen"
    };
  }

  function normalizeCostPlan(rawPlan, trip) {
    const basePlan = rawPlan || createDefaultCostPlan(trip);

    return {
      id: basePlan.id || "cp-" + trip.id,
      tripId: trip.id,
      participantCount: Math.max(1, Number(basePlan.participantCount || 1)),
      splitMethod: basePlan.splitMethod || "equal-all",
      transport: Math.max(0, Number(basePlan.transport || 0)),
      stay: Math.max(0, Number(basePlan.stay || 0)),
      food: Math.max(0, Number(basePlan.food || 0)),
      extras: Math.max(0, Number(basePlan.extras || 0)),
      note: String(basePlan.note || "").trim(),
      status: basePlan.status || "Noch offen"
    };
  }

  function costPlanTotal(plan) {
    return Number(plan.transport || 0) + Number(plan.stay || 0) + Number(plan.food || 0) + Number(plan.extras || 0);
  }

  function costPlanChargeableTotal(plan) {
    if (plan.splitMethod === "self-pay-food") {
      return Number(plan.transport || 0) + Number(plan.stay || 0) + Number(plan.extras || 0);
    }

    return costPlanTotal(plan);
  }

  function costPerPerson(plan) {
    const participantCount = Math.max(1, Number(plan.participantCount || 1));
    return Math.round(costPlanChargeableTotal(plan) / participantCount);
  }

  function contactModeLabel(mode) {
    const labels = {
      "app-chat": "Anonymer App-Chat",
      "fit-check": "Match-Check",
      "contact-unlock": "Kontaktfreigabe spaeter"
    };

    return labels[mode] || "Kontaktanfrage";
  }

  function normalizeTransportMode(value) {
    const allowed = ["car", "train", "plane", "bus", "ferry", "open"];
    return allowed.includes(value) ? value : "open";
  }

  function transportModeLabel(value) {
    const labels = {
      car: "Auto",
      train: "Bahn",
      plane: "Flugzeug",
      bus: "Bus",
      ferry: "Faehre",
      open: "Noch offen"
    };

    return labels[normalizeTransportMode(value)] || "Noch offen";
  }

  function inferTransportMode(trip) {
    const noteText = String(trip && trip.notes || "").toLowerCase();

    if (noteText.includes("flug")) {
      return "plane";
    }

    if (noteText.includes("bahn") || noteText.includes("zug")) {
      return "train";
    }

    if (noteText.includes("faehr")) {
      return "ferry";
    }

    if (noteText.includes("bus")) {
      return "bus";
    }

    if (noteText.includes("auto") || noteText.includes("van") || noteText.includes("mietwagen")) {
      return "car";
    }

    return "open";
  }

  function tripArrivalMode(trip) {
    return normalizeTransportMode(trip && trip.arrivalMode ? trip.arrivalMode : inferTransportMode(trip));
  }

  function tripDepartureMode(trip) {
    return normalizeTransportMode(trip && trip.departureMode ? trip.departureMode : tripArrivalMode(trip));
  }

  function tripTransportSummary(trip) {
    const arrival = tripArrivalMode(trip);
    const departure = tripDepartureMode(trip);

    if (arrival === departure) {
      return transportModeLabel(arrival) + " hin & zurueck";
    }

    return "Hin: " + transportModeLabel(arrival) + " | Zurueck: " + transportModeLabel(departure);
  }

  function legacyAudienceLabel(value) {
    const labels = {
      Single: "Singles",
      Paar: "Paare",
      Familie: "Familien",
      Freundesgruppe: "Freundesgruppen"
    };

    return labels[value] || value;
  }

  function tripAudiences(trip) {
    if (Array.isArray(trip.audiences) && trip.audiences.length) {
      return trip.audiences;
    }

    if (Array.isArray(trip.matchTypes) && trip.matchTypes.length) {
      return trip.matchTypes.map(legacyAudienceLabel);
    }

    if (trip.groupType === "Alleinerziehend") {
      return ["Alleinerziehend", "Familien"];
    }

    if (trip.groupType) {
      return [legacyAudienceLabel(trip.groupType)];
    }

    return ["Offen"];
  }

  function hasTripLocation(trip) {
    return Number.isFinite(Number(trip.lat)) && Number.isFinite(Number(trip.lng));
  }

  function highlightTripCard(tripId) {
    const cards = Array.prototype.slice.call(document.querySelectorAll(".trip-card[data-trip-id]"));

    cards.forEach(function (card) {
      card.classList.toggle("is-selected", tripId && card.dataset.tripId === tripId);
    });

    const activeCard = cards.find(function (card) {
      return card.dataset.tripId === tripId;
    });

    if (activeCard) {
      activeCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function tripMapPopupMarkup(trip) {
    const host = getHostById(trip.hostId);

    return [
      '<div class="trip-map-popup">',
      '  <p class="eyebrow">' + escapeHtml(tripListingLabel(trip)) + "</p>",
      '  <strong>' + escapeHtml(trip.title) + "</strong>",
      '  <p>' + escapeHtml(tripDestinationLabel(trip)) + ", " + escapeHtml(trip.country) + "</p>",
      '  <p class="mini-note">' + escapeHtml(tripTimingRange(trip)) + "</p>",
      '  <p class="mini-note">Mit ' + escapeHtml(host.name) + " | " + euro(trip.budgetPerPerson) + " | " + escapeHtml(tripTravelModeLabel(trip)) + "</p>",
      '  <a class="text-link" href="reise-detail.html?id=' + encodeURIComponent(trip.id) + '">Details ansehen</a>',
      "</div>"
    ].join("");
  }

  function tripMarkerIcon(trip) {
    const isRequest = tripListingType(trip) === "request";

    return window.L.divIcon({
      className: "trip-map-marker",
      iconSize: isRequest ? [104, 52] : [92, 50],
      iconAnchor: isRequest ? [52, 52] : [46, 50],
      popupAnchor: [0, -44],
      html: [
        '<div class="map-marker-bubble' + (isRequest ? " is-request" : "") + '">',
        '  <strong>' + escapeHtml(isRequest ? "Anfrage" : euro(trip.budgetPerPerson)) + "</strong>",
        '  <span>' + escapeHtml(isRequest ? tripDestinationLabel(trip) : tripSeatLabel(trip)) + "</span>",
        "</div>"
      ].join("")
    });
  }

  function stayPopupMarkup(stay) {
    const linkedTrips = (stay.requestTripIds || []).map(function (tripId) {
      return getTripById(tripId);
    }).filter(Boolean);
    const linkedTripMarkup = linkedTrips.slice(0, 2).map(function (trip) {
      return '<span class="meta-pill">' + escapeHtml(tripListingLabel(trip) + ": " + tripDestinationLabel(trip)) + "</span>";
    }).join("");

    return [
      '<div class="trip-map-popup">',
      '  <p class="eyebrow">Stay Signal</p>',
      '  <strong>' + escapeHtml(stay.name) + "</strong>",
      '  <p>' + escapeHtml(stay.city) + ", " + escapeHtml(stay.country) + "</p>",
      '  <p class="mini-note">' + escapeHtml(stay.type) + " | ab " + euro(stay.nightlyPrice) + " pro Nacht</p>",
      '  <p class="mini-note">' + stay.requestTripIds.length + (stay.requestTripIds.length === 1 ? " passender MatchTrip sichtbar" : " passende MatchTrips sichtbar") + "</p>",
      linkedTripMarkup ? '  <div class="trip-tags">' + linkedTripMarkup + "</div>" : "",
      "</div>"
    ].join("");
  }

  function stayMarkerIcon(stay) {
    return window.L.divIcon({
      className: "trip-map-marker",
      iconSize: [100, 52],
      iconAnchor: [50, 52],
      popupAnchor: [0, -44],
      html: [
        '<div class="map-marker-bubble is-stay">',
        '  <strong>' + escapeHtml("ab " + euro(stay.nightlyPrice)) + "</strong>",
        '  <span>' + stay.requestTripIds.length + " Signals</span>",
        "</div>"
      ].join("")
    });
  }

  function createTripPickerIcon() {
    return window.L.divIcon({
      className: "trip-map-marker",
      iconSize: [92, 50],
      iconAnchor: [46, 50],
      html: [
        '<div class="map-marker-bubble is-picker">',
        "  <strong>Neu</strong>",
        "  <span>Marker</span>",
        "</div>"
      ].join("")
    });
  }

  function createTripsMap(containerId, summaryId) {
    const container = document.getElementById(containerId);
    const summary = document.getElementById(summaryId);

    if (!container) {
      return null;
    }

    if (!window.L) {
      container.innerHTML = '<div class="map-fallback">Die Karte konnte lokal gerade nicht geladen werden.</div>';

      if (summary) {
        summary.textContent = "Karte aktuell nicht verfuegbar.";
      }

      return {
        render: function () {}
      };
    }

    const map = window.L.map(containerId, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([49.2, 10.6], 4);

    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const markerLayer = window.L.layerGroup().addTo(map);

    function fitMap(points) {
      if (!points.length) {
        map.setView([49.2, 10.6], 4);
        return;
      }

      if (points.length === 1) {
        map.setView([Number(points[0].lat), Number(points[0].lng)], 6);
        return;
      }

      const bounds = window.L.latLngBounds(points.map(function (point) {
        return [Number(point.lat), Number(point.lng)];
      }));

      map.fitBounds(bounds.pad(0.22), {
        maxZoom: 6
      });
    }

    function render(trips, filters) {
      const locationTrips = trips.filter(hasTripLocation);
      const destination = filters && filters.destination ? filters.destination : "";
      const style = filters && filters.style ? filters.style : "";
      const visibleTripIds = trips.map(function (trip) {
        return trip.id;
      });
      const visibleStays = getStays().filter(function (stay) {
        const stayText = [stay.name, stay.city, stay.region, stay.country].join(" ").toLowerCase();
        const matchesDestination = !destination || stayText.includes(destination);
        const matchesStyle = !style || (Array.isArray(stay.vibes) && stay.vibes.includes(style));
        const matchesTrips = !visibleTripIds.length || (stay.requestTripIds || []).some(function (tripId) {
          return visibleTripIds.includes(tripId);
        });
        return matchesDestination && matchesStyle && matchesTrips;
      });

      markerLayer.clearLayers();

      locationTrips.forEach(function (trip) {
        const marker = window.L.marker([Number(trip.lat), Number(trip.lng)], {
          icon: tripMarkerIcon(trip),
          title: trip.title
        });

        marker.bindPopup(tripMapPopupMarkup(trip));
        marker.on("click", function () {
          highlightTripCard(trip.id);
        });
        marker.addTo(markerLayer);
      });

      visibleStays.forEach(function (stay) {
        const marker = window.L.marker([Number(stay.lat), Number(stay.lng)], {
          icon: stayMarkerIcon(stay),
          title: stay.name
        });

        marker.bindPopup(stayPopupMarkup(stay));
        marker.addTo(markerLayer);
      });

      if (summary) {
        const requestCount = trips.filter(function (trip) {
          return tripListingType(trip) === "request";
        }).length;
        const offerCount = trips.length - requestCount;
        summary.textContent = offerCount + " Angebote | " + requestCount + " Anfragen | " + visibleStays.length + " Ferienhaeuser";
      }

      fitMap(locationTrips.concat(visibleStays));
      window.setTimeout(function () {
        map.invalidateSize();
      }, 0);
    }

    window.addEventListener("resize", function () {
      map.invalidateSize();
    });

    return {
      render: render
    };
  }

  function createTripPickerMap() {
    const container = document.getElementById("createTripMap");
    const latInput = document.querySelector('input[name="lat"]');
    const lngInput = document.querySelector('input[name="lng"]');
    const status = document.getElementById("mapSelectionStatus");
    const resetButton = document.getElementById("resetCreateMap");

    if (!container || !latInput || !lngInput || !status) {
      return null;
    }

    function setStatus(text, isError) {
      status.textContent = text;
      status.classList.toggle("is-error", Boolean(isError));
    }

    if (!window.L) {
      container.innerHTML = '<div class="map-fallback">Die Karte konnte lokal gerade nicht geladen werden.</div>';
      setStatus("Leaflet ist gerade nicht verfuegbar.", true);
      return {
        reset: function () {}
      };
    }

    const map = window.L.map("createTripMap", {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([49.2, 10.6], 4);

    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let marker = null;

    function setMarker(lat, lng) {
      const nextLat = Number(lat.toFixed(4));
      const nextLng = Number(lng.toFixed(4));

      if (!marker) {
        marker = window.L.marker([nextLat, nextLng], {
          icon: createTripPickerIcon()
        }).addTo(map);
      } else {
        marker.setLatLng([nextLat, nextLng]);
      }

      latInput.value = String(nextLat);
      lngInput.value = String(nextLng);
      setStatus("Marker gesetzt bei " + nextLat + ", " + nextLng + ".", false);
    }

    function reset() {
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }

      latInput.value = "";
      lngInput.value = "";
      map.setView([49.2, 10.6], 4);
      setStatus("Noch kein Marker gesetzt.", false);
    }

    map.on("click", function (event) {
      setMarker(event.latlng.lat, event.latlng.lng);
    });

    if (resetButton) {
      resetButton.addEventListener("click", reset);
    }

    window.setTimeout(function () {
      map.invalidateSize();
    }, 0);

    return {
      reset: reset
    };
  }

  function smartContactPlan(trip) {
    const audiences = tripAudiences(trip);

    if (tripListingType(trip) === "request") {
      return {
        recommendedMode: "app-chat",
        title: "Offene Anfrage zuerst sortieren",
        description: "Noch bevor alles feststeht, kann der erste Kontakt locker und anonym starten.",
        steps: [
          "Zuerst nur grobe Region, Zeitraum und Vibe teilen.",
          "Dann gemeinsam schauen, ob Ort und Unterkunft ueberhaupt zusammenpassen.",
          "Private Daten erst nach einem echten Match freigeben."
        ]
      };
    }

    if (tripTravelMode(trip) === "solo") {
      return {
        recommendedMode: "app-chat",
        title: "Kontakt nur wenn du willst",
        description: "Der Trip ist solo ausgelegt. Du kannst die App auch nur fuer Struktur, Tipps oder spaeteren Kontakt nutzen.",
        steps: [
          "Die Reise funktioniert komplett ohne feste Gruppe.",
          "Wenn du magst, startest du spaeter einen lockeren App-Chat.",
          "Private Daten bleiben bis zu deinem Okay verborgen."
        ]
      };
    }

    if (audiences.includes("Familien") || audiences.includes("Alleinerziehend") || groupTypeLabel(trip) === "Alleinerziehend") {
      return {
        recommendedMode: "fit-check",
        title: "Ruhiger Kennenlern-Flow",
        description: "Erst Erwartungen abgleichen, dann langsam mehr freigeben.",
        steps: [
          "Nur Alias und erste Frage werden geteilt.",
          "Dann folgt ein kurzer Match-Check zu Tempo, Alltag und Erwartungen.",
          "Erst danach koennen private Kontaktdaten freigegeben werden."
        ]
      };
    }

    if (audiences.includes("Studenten") || trip.styles.includes("Budget")) {
      return {
        recommendedMode: "app-chat",
        title: "Budget-Check zuerst",
        description: "Ideal fuer flexible Trips mit Kostenfokus und schnellem Erstkontakt.",
        steps: [
          "Start ueber Alias statt private Nummer.",
          "Kurz Budget, Route und Unterkunft abgleichen.",
          "Kontaktfreigabe nur bei beidseitigem Interesse."
        ]
      };
    }

    if (audiences.includes("Paare") || groupTypeLabel(trip) === "Paar") {
      return {
        recommendedMode: "contact-unlock",
        title: "Kurzprofil vor direktem Kontakt",
        description: "Erst Intro austauschen, dann Kontakte spaeter freigeben.",
        steps: [
          "Kurze Intro-Nachricht senden.",
          "Gastgeber sieht zuerst nur Profilkarte und Verfuegbarkeit.",
          "Danach kann ein geschuetzter Kontakt freigeschaltet werden."
        ]
      };
    }

    return {
      recommendedMode: "app-chat",
      title: "Anonym starten",
      description: "Der sichere Standard fuer erste Kontakte in der App.",
      steps: [
        "Zuerst nur Alias und Intro sichtbar.",
        "Dann gemeinsamer Match-Check in der App.",
        "Kontaktdaten erst nach beidseitigem Okay."
      ]
    };
  }

  function tripCardMarkup(trip) {
    const host = getHostById(trip.hostId);
    const costPlan = getCostPlanByTripId(trip.id);
    const safeId = encodeURIComponent(trip.id);
    const safeStyles = trip.styles.map(function (style) {
      return '<span class="trip-chip">' + escapeHtml(style) + '</span>';
    }).join("");
    const safeAudiences = tripAudiences(trip).map(function (audience) {
      return escapeHtml(audience);
    }).join(", ");

    return [
      '<article class="trip-card card-surface" data-trip-id="' + escapeHtml(trip.id) + '" data-listing-type="' + escapeHtml(tripListingType(trip)) + '">',
      '  <div class="trip-topline">',
      '    <span class="trip-chip trip-chip-kind' + (tripListingType(trip) === "request" ? " trip-chip-request" : " trip-chip-offer") + '">' + escapeHtml(tripListingLabel(trip)) + '</span>',
      '    <span class="trip-chip trip-chip-route">' + escapeHtml(tripRouteLabel(trip)) + '</span>',
      '    <span class="status-pill">' + escapeHtml(trip.status) + '</span>',
      '  </div>',
      '  <div class="trip-title-row">',
      '    <div>',
      '      <h3>' + escapeHtml(trip.title) + '</h3>',
      '      <p class="trip-copy">' + escapeHtml(tripTimingRange(trip)) + '</p>',
      '    </div>',
      '    <strong>' + euro(trip.budgetPerPerson) + '</strong>',
      '  </div>',
      '  <div class="trip-meta">',
      '    <span class="meta-pill">' + escapeHtml(trip.country) + '</span>',
      trip.regionLabel ? '    <span class="meta-pill">Region: ' + escapeHtml(trip.regionLabel) + "</span>" : "",
      '    <span class="meta-pill">' + escapeHtml(tripTravelModeLabel(trip)) + '</span>',
      '    <span class="meta-pill">' + escapeHtml(tripTimingLabel(trip)) + '</span>',
      '    <span class="meta-pill">' + escapeHtml(tripPlanningLabel(trip)) + '</span>',
      '    <span class="meta-pill">' + escapeHtml(tripTransportSummary(trip)) + '</span>',
      '    <span class="meta-pill">' + escapeHtml(tripSeatLabel(trip)) + '</span>',
      hasTripLocation(trip) ? '    <span class="meta-pill">Marker live</span>' : "",
      costPlan && tripListingType(trip) !== "request" ? '    <span class="meta-pill">Kostenplan live: ' + escapeHtml(euro(costPerPerson(normalizeCostPlan(costPlan, trip)))) + "</span>" : "",
      '    <span class="meta-pill">Startet als: ' + escapeHtml(groupTypeLabel(trip)) + '</span>',
      '    <span class="meta-pill">Zielgruppen: ' + safeAudiences + '</span>',
      '  </div>',
      '  <p class="trip-copy">' + escapeHtml(excerpt(trip.notes, 90)) + '</p>',
      '  <div class="trip-card-footer">',
      '    <div class="trip-tags">' + safeStyles + '</div>',
      '    <p class="trip-host">Mit ' + escapeHtml(host.name) + ' - ' + escapeHtml(tripListingHint(trip)) + '</p>',
      '  </div>',
      '  <div class="trip-actions">',
      '    <a class="button button-primary" href="reise-detail.html?id=' + safeId + '">' + escapeHtml(tripListingType(trip) === "request" ? "Anfrage ansehen" : "Details ansehen") + '</a>',
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
      target.innerHTML = '<div class="empty-state">Keine MatchTrips passen gerade zu deinem Filter.</div>';
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
    const timingSelect = document.getElementById("filterTiming");
    const travelModeSelect = document.getElementById("filterTravelMode");
    const arrivalModeSelect = document.getElementById("filterArrivalMode");
    const departureModeSelect = document.getElementById("filterDepartureMode");
    const listingTypeSelect = document.getElementById("filterListingType");
    const audienceButtons = Array.prototype.slice.call(document.querySelectorAll("[data-audience]"));
    const clearFiltersButton = document.getElementById("clearFilters");
    const tripMap = createTripsMap("tripMap", "mapSummary");
    let activeAudience = "";

    function updateAudienceButtons(value) {
      activeAudience = value;
      audienceButtons.forEach(function (button) {
        const isActive = button.dataset.audience === value;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    }

    function applyFilters() {
      const destination = destinationInput.value.trim().toLowerCase();
      const budget = Number(budgetInput.value || 0);
      const style = styleSelect.value;
      const groupType = groupTypeSelect.value;
      const timingMode = timingSelect.value;
      const travelMode = travelModeSelect.value;
      const arrivalMode = arrivalModeSelect.value;
      const departureMode = departureModeSelect.value;
      const listingType = listingTypeSelect.value;
      const selectedAudience = activeAudience;
      const filtered = getTrips().filter(function (trip) {
        const destinationText = [trip.destinationCity, trip.regionLabel, trip.country, trip.startCity].join(" ").toLowerCase();
        const matchesDestination = !destination || destinationText.includes(destination);
        const matchesBudget = !budget || Number(trip.budgetPerPerson) <= budget;
        const matchesStyle = !style || trip.styles.includes(style);
        const matchesGroupType = !groupType || groupTypeLabel(trip) === groupType;
        const matchesTiming = !timingMode || tripTimingMode(trip) === timingMode;
        const matchesTravelMode = !travelMode || tripTravelMode(trip) === travelMode;
        const matchesArrivalMode = !arrivalMode || tripArrivalMode(trip) === arrivalMode;
        const matchesDepartureMode = !departureMode || tripDepartureMode(trip) === departureMode;
        const matchesListingType = !listingType || tripListingType(trip) === listingType;
        const matchesAudience = !selectedAudience || tripAudiences(trip).includes(selectedAudience);
        return matchesDestination && matchesBudget && matchesStyle && matchesGroupType && matchesTiming && matchesTravelMode && matchesArrivalMode && matchesDepartureMode && matchesListingType && matchesAudience;
      });

      setText("tripCount", filtered.length + (filtered.length === 1 ? " MatchTrip" : " MatchTrips"));
      renderTrips("tripGrid", filtered);
      highlightTripCard("");

      if (tripMap) {
        tripMap.render(filtered, {
          destination: destination,
          style: style
        });
      }
    }

    [destinationInput, budgetInput, styleSelect, groupTypeSelect, timingSelect, travelModeSelect, arrivalModeSelect, departureModeSelect, listingTypeSelect].forEach(function (element) {
      element.addEventListener("input", applyFilters);
      element.addEventListener("change", applyFilters);
    });

    audienceButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        updateAudienceButtons(button.dataset.audience);
        applyFilters();
      });
    });

    if (clearFiltersButton) {
      clearFiltersButton.addEventListener("click", function () {
        destinationInput.value = "";
        budgetInput.value = "";
        styleSelect.value = "";
        groupTypeSelect.value = "";
        timingSelect.value = "";
        travelModeSelect.value = "";
        arrivalModeSelect.value = "";
        departureModeSelect.value = "";
        listingTypeSelect.value = "";
        updateAudienceButtons("");
        applyFilters();
      });
    }

    updateAudienceButtons("");
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
    const contactPlan = smartContactPlan(trip);
    const costPlan = normalizeCostPlan(getCostPlanByTripId(trip.id), trip);
    const profile = getProfile();
    const isOwnTrip = profile.id === trip.hostId;
    const existingChat = findChatForTripAndUsers(trip.id, profile.id, trip.hostId);
    const relatedChats = getChats().filter(function (chat) {
      return chat.tripId === trip.id && Array.isArray(chat.participantIds) && chat.participantIds.includes(profile.id);
    });
    const styleMarkup = trip.styles.map(function (style) {
      return '<span class="trip-chip">' + escapeHtml(style) + "</span>";
    }).join("");
    const audienceMarkup = tripAudiences(trip).map(function (audience) {
      return '<span class="meta-pill">' + escapeHtml(audience) + "</span>";
    }).join("");
    const primaryActionMarkup = existingChat && !isOwnTrip
      ? '<a class="button button-primary" href="chat.html?id=' + encodeURIComponent(existingChat.id) + '">Chat mit ' + escapeHtml(chatPartner(existingChat, profile.id).name) + " oeffnen</a>"
      : isOwnTrip
        ? (relatedChats.length
          ? '<a class="button button-primary" href="chat.html?id=' + encodeURIComponent(relatedChats[0].id) + '">Reaktionen oeffnen</a>'
          : '<a class="button button-primary" href="profil.html">Zum Profil</a>')
        : '<button class="button button-primary" type="button" id="requestButton">' + escapeHtml(tripListingType(trip) === "request" ? "Auf Anfrage reagieren" : (tripTravelMode(trip) === "solo" ? "Optionalen Connect starten" : "Connect starten")) + "</button>";
    const connectShellMarkup = isOwnTrip
      ? [
        '  <div class="smart-contact-shell">',
        '    <p class="eyebrow">Deine Anzeige</p>',
        "    <h3>Du bist hier der Host</h3>",
        '    <p class="trip-copy">So sieht deine Anzeige fuer andere aus. Reaktionen, Connects und Chats findest du gesammelt im Profil.</p>',
        relatedChats.length
          ? '    <a class="button button-primary" href="chat.html?id=' + encodeURIComponent(relatedChats[0].id) + '">Ersten Chat oeffnen</a>'
          : '    <a class="button button-secondary" href="profil.html">Zum Profil</a>',
        "  </div>"
      ].join("")
      : existingChat
        ? [
          '  <div class="smart-contact-shell">',
          '    <p class="eyebrow">Chat aktiv</p>',
          '    <h3>Du schreibst schon mit ' + escapeHtml(chatPartner(existingChat, profile.id).name) + "</h3>",
          '    <p class="trip-copy">Die erste Reaktion ist schon raus. Jetzt koennt ihr sicher abklaeren, ob Unterkunft, Kosten und Reise-Vibe wirklich zusammenpassen.</p>',
          '    <a class="button button-primary" href="chat.html?id=' + encodeURIComponent(existingChat.id) + '">Chat oeffnen</a>',
          "  </div>"
        ].join("")
        : [
          '  <div class="smart-contact-shell">',
          '    <p class="eyebrow">Connect Flow</p>',
          '    <h3>' + escapeHtml(contactPlan.title) + "</h3>",
          '    <p class="trip-copy">' + escapeHtml(contactPlan.description) + "</p>",
          '    <ul class="smart-step-list">' + contactPlan.steps.map(function (step) {
            return "<li>" + escapeHtml(step) + "</li>";
          }).join("") + "</ul>",
          '    <form id="smartConnectForm" class="smart-connect-form">',
          '      <input type="hidden" name="contactMode" id="contactModeInput" value="' + escapeHtml(contactPlan.recommendedMode) + '" />',
          '      <div class="contact-mode-grid">',
          '        <button type="button" class="contact-mode" data-contact-mode="app-chat">Anonym starten</button>',
          '        <button type="button" class="contact-mode" data-contact-mode="fit-check">Match-Check</button>',
          '        <button type="button" class="contact-mode" data-contact-mode="contact-unlock">Spaeter freigeben</button>',
          "      </div>",
          '      <div class="smart-form-grid">',
          '        <label>',
          '          <span>Dein Name oder Alias</span>',
          '          <input name="applicantName" type="text" placeholder="z. B. Lina oder TravelLina" required />',
          "        </label>",
          '        <label>',
          '          <span>Wann passt dir Kontakt?</span>',
          '          <input name="preferredWindow" type="text" placeholder="z. B. abends oder flexibel" required />',
          "        </label>",
          "      </div>",
          '      <label>',
          '        <span>Erste Nachricht</span>',
          '        <textarea name="message" rows="4" placeholder="Warum passt dieser Trip gut zu dir?" required></textarea>',
          "      </label>",
          '      <button class="button button-primary" type="submit">Sicheren Erstkontakt senden</button>',
          '      <p id="smartConnectMessage" class="status-message smart-connect-message"></p>',
          "    </form>",
          "  </div>"
        ].join("");

    target.innerHTML = [
      '<article class="detail-card card-surface">',
      '  <p class="eyebrow">' + escapeHtml(tripListingType(trip) === "request" ? "Oeffentliche Anfrage" : "Oeffentliche Reiseinfos") + "</p>",
      '  <div class="detail-route-hero">',
      '    <span class="trip-chip trip-chip-route">' + escapeHtml(tripRouteLabel(trip)) + "</span>",
      '    <span class="status-pill">' + escapeHtml(trip.status) + "</span>",
      "  </div>",
      '  <div class="trip-title-row">',
      '    <div>',
      '      <h2>' + escapeHtml(trip.title) + '</h2>',
      '      <p class="lead">' + escapeHtml(tripOriginLabel(trip)) + ' -> ' + escapeHtml(tripDestinationLabel(trip)) + ", " + escapeHtml(trip.country) + "</p>",
      '    </div>',
      '    <strong>' + euro(trip.budgetPerPerson) + '</strong>',
      '  </div>',
      '  <div class="detail-signal-grid">',
      '    <article class="detail-signal"><span>Zeitraum</span><strong>' + escapeHtml(tripTimingRange(trip)) + "</strong></article>",
      '    <article class="detail-signal"><span>Planung</span><strong>' + escapeHtml(tripPlanningLabel(trip)) + "</strong></article>",
      '    <article class="detail-signal"><span>Typ</span><strong>' + escapeHtml(tripListingLabel(trip)) + "</strong></article>",
      '    <article class="detail-signal"><span>Matchs</span><strong>' + escapeHtml(tripSeatLabel(trip)) + "</strong></article>",
      '    <article class="detail-signal"><span>An- und Abreise</span><strong>' + escapeHtml(tripTransportSummary(trip)) + "</strong></article>",
      '    <article class="detail-signal"><span>Kontakt</span><strong>' + escapeHtml(unlockLabel(trip.contactUnlock)) + "</strong></article>",
      "  </div>",
      '  <p class="trip-copy">' + escapeHtml(trip.notes) + "</p>",
      '  <div class="trip-tags">' + styleMarkup + "</div>",
      '  <div class="detail-audience">',
      '    <div>',
      '      <p class="eyebrow">Reisekonstellation</p>',
      '      <p class="trip-copy">Startet aktuell als <strong>' + escapeHtml(groupTypeLabel(trip)) + "</strong>.</p>",
      "    </div>",
      '    <div>',
      '      <p class="eyebrow">Terminmodell</p>',
      '      <p class="trip-copy"><strong>' + escapeHtml(tripTimingLabel(trip)) + "</strong> - " + escapeHtml(tripPlanningLabel(trip)) + "</p>",
      "    </div>",
      '    <div>',
      '      <p class="eyebrow">Anfragegrad</p>',
      '      <p class="trip-copy"><strong>' + escapeHtml(tripListingLabel(trip)) + "</strong> - " + escapeHtml(tripListingHint(trip)) + "</p>",
      "    </div>",
      '    <div>',
      '      <p class="eyebrow">Reiseoption</p>',
      '      <p class="trip-copy"><strong>' + escapeHtml(tripTravelModeLabel(trip)) + "</strong> - " + escapeHtml(tripTravelModeHint(trip)) + "</p>",
      "    </div>",
      '    <div>',
      '      <p class="eyebrow">Mobilitaet</p>',
      '      <p class="trip-copy"><strong>Anreise:</strong> ' + escapeHtml(transportModeLabel(tripArrivalMode(trip))) + ' | <strong>Abreise:</strong> ' + escapeHtml(transportModeLabel(tripDepartureMode(trip))) + "</p>",
      "    </div>",
      '    <div>',
      '      <p class="eyebrow">Zielgruppen</p>',
      '      <div class="detail-stats">' + audienceMarkup + "</div>",
      "    </div>",
      "  </div>",
      '  <section class="cost-plan-shell">',
      '    <div class="app-section-header compact-header">',
      '      <div>',
      '        <p class="eyebrow">Kostenklarheit</p>',
      '        <h3>' + escapeHtml(tripListingType(trip) === "request" ? "Budgetrahmen direkt in der App" : "Kostenteilung direkt in der App") + '</h3>',
      "      </div>",
      '      <span class="status-pill" id="costPlanStatusValue">' + escapeHtml(costPlan.status) + "</span>",
      "    </div>",
      '    <div class="cost-kpi-grid">',
      '      <article class="cost-kpi"><span>Gesamt</span><strong id="costTotalValue">' + euro(costPlanTotal(costPlan)) + "</strong></article>",
      '      <article class="cost-kpi"><span>Teilbar</span><strong id="costSharedValue">' + euro(costPlanChargeableTotal(costPlan)) + "</strong></article>",
      '      <article class="cost-kpi"><span>Pro Person</span><strong id="costPerPersonValue">' + euro(costPerPerson(costPlan)) + "</strong></article>",
      "    </div>",
      '    <p id="costSplitHelp" class="mini-note">' + escapeHtml(splitMethodHint(costPlan.splitMethod)) + "</p>",
      '    <form id="costPlanForm" class="cost-plan-form">',
      '      <div class="cost-plan-grid">',
      '        <label><span>Personen gesamt</span><input name="participantCount" type="number" min="1" value="' + escapeHtml(costPlan.participantCount) + '" required /></label>',
      '        <label><span>Anreise</span><input name="transport" type="number" min="0" step="10" value="' + escapeHtml(costPlan.transport) + '" required /></label>',
      '        <label><span>Unterkunft</span><input name="stay" type="number" min="0" step="10" value="' + escapeHtml(costPlan.stay) + '" required /></label>',
      '        <label><span>Food</span><input name="food" type="number" min="0" step="10" value="' + escapeHtml(costPlan.food) + '" required /></label>',
      '        <label><span>Extras</span><input name="extras" type="number" min="0" step="10" value="' + escapeHtml(costPlan.extras) + '" required /></label>',
      '        <label><span>Abrechnungsmodell</span><select name="splitMethod"><option value="equal-all"' + (costPlan.splitMethod === "equal-all" ? " selected" : "") + '>Alles gleich teilen</option><option value="host-prepays"' + (costPlan.splitMethod === "host-prepays" ? " selected" : "") + '>Host zahlt zuerst</option><option value="self-pay-food"' + (costPlan.splitMethod === "self-pay-food" ? " selected" : "") + '>Food individuell</option></select></label>',
      "      </div>",
      '      <label><span>Notiz zur Kostenteilung</span><textarea name="note" rows="3" placeholder="z. B. Unterkunft bucht der Host, Food bleibt flexibel.">' + escapeHtml(costPlan.note) + "</textarea></label>",
      '      <div class="form-actions">',
      '        <button class="button button-primary" type="submit">Kostenplan speichern</button>',
      '        <span class="mini-note">Die App zeigt dann allen transparent, was geteilt wird.</span>',
      "      </div>",
      '      <p id="costPlanMessage" class="status-message smart-connect-message"></p>',
      "    </form>",
      "  </section>",
      '  <div class="trip-actions">',
      primaryActionMarkup,
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
      tripListingType(trip) === "request" ? "      <li>Startregion, Zeitraum und Budgetrahmen</li>" : "      <li>Startstadt und Ziel</li>",
      tripListingType(trip) === "request" ? "      <li>Vibe, Zielgruppen und grobe Wunschregion</li>" : "      <li>Datum, Budget und Reisestil</li>",
      "      <li>Kurze persoenliche Beschreibung</li>",
      "    </ul>",
      "  </div>",
      "  <div>",
      '    <p class="eyebrow">Noch verborgen</p>',
      '    <ul class="privacy-list">',
      tripListingType(trip) === "request" ? "      <li>Exakter Ort und finale Unterkunft</li>" : "      <li>Telefonnummer</li>",
      tripListingType(trip) === "request" ? "      <li>Telefonnummer und private Kontaktdaten</li>" : "      <li>Genaue Unterkunft</li>",
      tripListingType(trip) === "request" ? "      <li>Treffpunkt und persoenliche Routendetails</li>" : "      <li>Treffpunkt und private Kontaktdaten</li>",
      "    </ul>",
      "  </div>",
      connectShellMarkup,
      "</aside>"
    ].join("");

    const requestButton = document.getElementById("requestButton");
    const smartForm = document.getElementById("smartConnectForm");
    const smartMessage = document.getElementById("smartConnectMessage");
    const modeInput = document.getElementById("contactModeInput");
    const modeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-contact-mode]"));
    const costPlanForm = document.getElementById("costPlanForm");
    const costPlanMessage = document.getElementById("costPlanMessage");
    const costTotalValue = document.getElementById("costTotalValue");
    const costSharedValue = document.getElementById("costSharedValue");
    const costPerPersonValue = document.getElementById("costPerPersonValue");
    const costPlanStatusValue = document.getElementById("costPlanStatusValue");
    const costSplitHelp = document.getElementById("costSplitHelp");

    if (smartForm) {
      const applicantField = smartForm.elements.namedItem("applicantName");
      const preferredWindowField = smartForm.elements.namedItem("preferredWindow");
      const messageField = smartForm.elements.namedItem("message");

      if (applicantField && !applicantField.value) {
        applicantField.value = profile.name;
      }

      if (preferredWindowField && !preferredWindowField.value) {
        preferredWindowField.value = "Heute Abend oder morgen";
      }

      if (messageField && !messageField.value) {
        messageField.value = "Hi " + host.name.split(" ")[0] + ", dein MatchTrip wirkt passend fuer mich. Ich wuerde gern erst Zeitraum, Kosten und Vibe hier im Chat abgleichen.";
      }
    }

    function readCostPlanForm(statusOverride) {
      if (!costPlanForm) {
        return normalizeCostPlan(costPlan, trip);
      }

      const formData = new FormData(costPlanForm);
      return normalizeCostPlan({
        id: costPlan.id,
        tripId: trip.id,
        participantCount: formData.get("participantCount"),
        splitMethod: formData.get("splitMethod"),
        transport: formData.get("transport"),
        stay: formData.get("stay"),
        food: formData.get("food"),
        extras: formData.get("extras"),
        note: formData.get("note"),
        status: statusOverride || costPlan.status || "Noch offen"
      }, trip);
    }

    function updateCostPlanPreview(plan) {
      if (!costTotalValue || !costSharedValue || !costPerPersonValue || !costPlanStatusValue || !costSplitHelp) {
        return;
      }

      costTotalValue.textContent = euro(costPlanTotal(plan));
      costSharedValue.textContent = euro(costPlanChargeableTotal(plan));
      costPerPersonValue.textContent = euro(costPerPerson(plan));
      costPlanStatusValue.textContent = plan.status;
      costSplitHelp.textContent = splitMethodHint(plan.splitMethod);
    }

    function updateContactMode(mode) {
      modeInput.value = mode;
      modeButtons.forEach(function (button) {
        const isActive = button.dataset.contactMode === mode;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      if (smartMessage) {
        smartMessage.classList.remove("is-error");
        smartMessage.textContent = "Empfohlen: " + contactModeLabel(mode);
      }
    }

    updateContactMode(contactPlan.recommendedMode);

    modeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        updateContactMode(button.dataset.contactMode);
      });
    });

    if (requestButton) {
      requestButton.addEventListener("click", function () {
        if (smartForm) {
          smartForm.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    if (costPlanForm) {
      updateCostPlanPreview(costPlan);

      costPlanForm.addEventListener("input", function () {
        updateCostPlanPreview(readCostPlanForm("Entwurf"));
      });

      costPlanForm.addEventListener("change", function () {
        updateCostPlanPreview(readCostPlanForm("Entwurf"));
      });

      costPlanForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const nextPlan = readCostPlanForm("Transparent");
        saveCostPlan(nextPlan);
        updateCostPlanPreview(nextPlan);

        if (costPlanMessage) {
          costPlanMessage.classList.remove("is-error");
          costPlanMessage.textContent = "Kostenplan gespeichert. Die App zeigt jetzt den Pro-Kopf-Betrag und das Abrechnungsmodell direkt im Trip.";
        }
      });
    }

    if (smartForm && smartMessage) {
      smartForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(smartForm);
        const now = new Date();
        const nowIso = now.toISOString();
        const request = {
          id: "r" + now.getTime(),
          tripId: trip.id,
          applicantId: profile.id,
          applicantName: String(formData.get("applicantName")).trim(),
          message: String(formData.get("message")).trim(),
          contactMode: formData.get("contactMode"),
          privacyStage: formData.get("contactMode") === "app-chat" ? "Anonym" : "Alias sichtbar",
          preferredWindow: String(formData.get("preferredWindow")).trim(),
          nextStep: "Chat ist offen und ihr koennt direkt schreiben",
          status: "Chat offen"
        };

        if (!request.applicantName || !request.message || !request.preferredWindow) {
          smartMessage.textContent = "Bitte Alias, Kontaktzeit und Nachricht ausfuellen.";
          smartMessage.classList.add("is-error");
          return;
        }

        addRequest(request);
        upsertChat({
          id: "c" + now.getTime(),
          tripId: trip.id,
          requestId: request.id,
          participantIds: [profile.id, trip.hostId],
          lastMessageAt: new Date(now.getTime() + 60000).toISOString(),
          messages: [
            {
              id: "m" + now.getTime(),
              senderId: profile.id,
              text: request.message,
              sentAt: nowIso
            },
            {
              id: "m" + (now.getTime() + 1),
              senderId: trip.hostId,
              text: "Hi " + request.applicantName + ", ich habe deine Anfrage gesehen. Lass uns hier erst entspannt Unterkunft, Kosten und Timing abgleichen.",
              sentAt: new Date(now.getTime() + 60000).toISOString()
            }
          ]
        });
        window.location.href = "chat.html?id=" + encodeURIComponent("c" + now.getTime());
      });
    }
  }

  function initCreatePage() {
    const form = document.getElementById("tripForm");
    const message = document.getElementById("createMessage");
    const tripPicker = createTripPickerMap();
    const profile = getProfile();
    const timingModeSelect = document.getElementById("timingModeSelect");
    const timingHint = document.getElementById("timingHint");
    const travelModeSelect = document.getElementById("travelModeSelect");
    const travelModeHint = document.getElementById("travelModeHint");
    const arrivalModeSelect = document.getElementById("arrivalModeSelect");
    const departureModeSelect = document.getElementById("departureModeSelect");
    const listingTypeSelect = document.getElementById("listingTypeSelect");
    const listingTypeHint = document.getElementById("listingTypeHint");
    const destinationInput = form ? form.querySelector('input[name="destinationCity"]') : null;
    const countryInput = form ? form.querySelector('input[name="country"]') : null;
    const destinationLabel = destinationInput ? destinationInput.previousElementSibling : null;
    const countryLabel = countryInput ? countryInput.previousElementSibling : null;
    const seatsInput = form ? form.querySelector('input[name="seats"]') : null;
    const seatsLabel = seatsInput ? seatsInput.previousElementSibling : null;
    const startLabel = form ? form.querySelector('input[name="startDate"]').previousElementSibling : null;
    const endLabel = form ? form.querySelector('input[name="endDate"]').previousElementSibling : null;

    if (!form || !message) {
      return;
    }

    function updateTimingUi() {
      if (!timingModeSelect || !timingHint || !startLabel || !endLabel) {
        return;
      }

      if (timingModeSelect.value === "flexible") {
        startLabel.textContent = "Fruehester Start";
        endLabel.textContent = "Spaeteste Rueckkehr";
        timingHint.textContent = "Du bietest dich flexibel in einem Zeitraum an. Die genauen Tage koennt ihr spaeter zusammen festlegen.";
        return;
      }

      startLabel.textContent = "Startdatum";
      endLabel.textContent = "Enddatum";
      timingHint.textContent = "Du stellst einen Trip mit festen Daten ein.";
    }

    if (timingModeSelect) {
      timingModeSelect.addEventListener("change", updateTimingUi);
      updateTimingUi();
    }

    function updateTravelModeUi() {
      if (!travelModeSelect || !travelModeHint) {
        return;
      }

      if (travelModeSelect.value === "solo") {
        travelModeHint.textContent = "Der Trip kann komplett alleine stattfinden. Die App hilft eher bei Planung, Sicherheit und Struktur.";
        return;
      }

      if (travelModeSelect.value === "hybrid") {
        travelModeHint.textContent = "Du kannst solo starten und nur dann passende Leute dazunehmen, wenn sich wirklich ein guter Match ergibt.";
        return;
      }

      travelModeHint.textContent = "Der Trip ist auf gemeinsames Reisen und Kostenteilung ausgelegt.";
    }

    if (travelModeSelect) {
      travelModeSelect.addEventListener("change", updateTravelModeUi);
      updateTravelModeUi();
    }

    function updateListingTypeUi() {
      if (!listingTypeSelect || !listingTypeHint || !destinationInput || !destinationLabel || !countryLabel || !seatsInput || !seatsLabel) {
        return;
      }

      if (listingTypeSelect.value === "request") {
        destinationInput.required = false;
        destinationInput.placeholder = "optional z. B. Amsterdam";
        if (countryInput) {
          countryInput.placeholder = "z. B. Holland oder Niederlande";
        }
        destinationLabel.textContent = "Zielort optional";
        countryLabel.textContent = "Land oder Region";
        seatsLabel.textContent = "Wie viele passende Leute suchst du?";
        listingTypeHint.textContent = "Du stellst eine offene Anfrage ein. Zeitraum darf flexibel sein und der genaue Zielort kann spaeter entstehen.";

        if (timingModeSelect) {
          timingModeSelect.value = "flexible";
          updateTimingUi();
        }

        if (travelModeSelect) {
          travelModeSelect.value = "hybrid";
          updateTravelModeUi();
        }

        if (arrivalModeSelect) {
          arrivalModeSelect.value = "open";
        }

        if (departureModeSelect) {
          departureModeSelect.value = "open";
        }

        return;
      }

      destinationInput.required = true;
      destinationInput.placeholder = "Prag";
      if (countryInput) {
        countryInput.placeholder = "Tschechien";
      }
      destinationLabel.textContent = "Zielort";
      countryLabel.textContent = "Land";
      seatsLabel.textContent = "Freie Plaetze";
      listingTypeHint.textContent = "Du stellst ein konkretes Angebot mit Region, Daten und Match-Option ein.";
    }

    if (listingTypeSelect) {
      listingTypeSelect.addEventListener("change", updateListingTypeUi);
      updateListingTypeUi();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const data = new FormData(form);
      const selectedAudiences = data.getAll("audiences");

      if (!selectedAudiences.length) {
        message.textContent = "Bitte waehle mindestens eine Zielgruppe aus.";
        message.classList.add("is-error");
        return;
      }

      if (listingTypeSelect && listingTypeSelect.value !== "request" && !String(data.get("destinationCity") || "").trim()) {
        message.textContent = "Bitte gib fuer ein Angebot einen Zielort an.";
        message.classList.add("is-error");
        return;
      }

      if (!data.get("lat") || !data.get("lng")) {
        message.textContent = "Bitte setze einen Marker fuer die Zielregion.";
        message.classList.add("is-error");
        return;
      }

      const trip = {
        id: "t" + Date.now(),
        hostId: profile.id,
        listingType: data.get("listingType") || "offer",
        title: String(data.get("title")).trim(),
        startCity: String(data.get("startCity")).trim(),
        destinationCity: String(data.get("destinationCity")).trim(),
        regionLabel: (data.get("listingType") === "request" ? String(data.get("country")).trim() : ""),
        country: String(data.get("country")).trim(),
        startDate: data.get("startDate"),
        endDate: data.get("endDate"),
        timingMode: data.get("timingMode"),
        travelMode: data.get("travelMode"),
        arrivalMode: normalizeTransportMode(data.get("arrivalMode")),
        departureMode: normalizeTransportMode(data.get("departureMode")),
        seats: Number(data.get("seats")),
        budgetPerPerson: Number(data.get("budgetPerPerson")),
        lat: Number(data.get("lat")),
        lng: Number(data.get("lng")),
        groupType: data.get("groupType"),
        audiences: selectedAudiences,
        styles: String(data.get("styles")).split(",").map(function (entry) {
          return entry.trim();
        }).filter(Boolean),
        notes: String(data.get("notes")).trim(),
        contactUnlock: data.get("contactUnlock"),
        status: data.get("listingType") === "request" ? "Anfrage offen" : "Offen"
      };

      window.StorageApi.addTrip(trip);
      form.reset();
      if (tripPicker) {
        tripPicker.reset();
      }
      updateTimingUi();
      updateTravelModeUi();
      updateListingTypeUi();
      message.classList.remove("is-error");
      message.textContent = data.get("listingType") === "request"
        ? 'Anfrage fuer ' + profile.name + ' gespeichert. Sie ist jetzt auf der Karte, unter "Entdecken" und im Profil sichtbar.'
        : 'MatchTrip fuer ' + profile.name + ' gespeichert. Du findest ihn jetzt unter "Entdecken" und im Profil.';
    });
  }

  function initProfilePage() {
    const profileCard = document.getElementById("profileCard");
    const profileSwitcher = document.getElementById("profileSwitcher");
    const hostedTrips = document.getElementById("hostedTrips");
    const chatList = document.getElementById("chatList");
    const requestList = document.getElementById("requestList");
    const costPlanList = document.getElementById("costPlanList");
    const profile = getProfile();

    if (!profileCard || !hostedTrips || !requestList || !costPlanList) {
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
      '  <span class="status-pill">Aktiv in der Demo</span>',
      "</div>",
      '<div class="trip-tags">' + profile.interests.map(function (interest) {
        return '<span class="trip-chip">' + escapeHtml(interest) + "</span>";
      }).join("") + "</div>"
    ].join("");

    if (profileSwitcher) {
      const demoProfiles = (window.AppData.demoProfileIds || []).map(getUserById);

      if (!demoProfiles.length) {
        renderEmptyList(profileSwitcher, "Noch keine Demo-Profile eingerichtet.");
      } else {
        profileSwitcher.innerHTML = demoProfiles.map(function (user) {
          return [
            '<button class="profile-switch-button' + (user.id === profile.id ? " is-active" : "") + '" type="button" data-profile-id="' + escapeHtml(user.id) + '">',
            '  <strong>' + escapeHtml(user.name) + "</strong>",
            '  <span>' + escapeHtml(user.homeBase) + " | " + escapeHtml(excerpt(user.about, 54)) + "</span>",
            "</button>"
          ].join("");
        }).join("");

        Array.prototype.slice.call(profileSwitcher.querySelectorAll("[data-profile-id]")).forEach(function (button) {
          button.addEventListener("click", function () {
            setProfile(button.dataset.profileId);
            window.location.reload();
          });
        });
      }
    }

    const ownTrips = getTrips().filter(function (trip) {
      return trip.hostId === profile.id;
    });

    if (!ownTrips.length) {
      renderEmptyList(hostedTrips, "Noch keine eigenen MatchTrips angelegt.");
    } else {
      hostedTrips.innerHTML = ownTrips.map(function (trip) {
        return [
          '<div class="stack-item">',
          '  <div class="trip-topline">',
          '    <span class="trip-chip trip-chip-kind' + (tripListingType(trip) === "request" ? " trip-chip-request" : " trip-chip-offer") + '">' + escapeHtml(tripListingLabel(trip)) + "</span>",
          '    <span class="status-pill">' + escapeHtml(trip.status) + "</span>",
          "  </div>",
          "  <strong>" + escapeHtml(trip.title) + "</strong>",
          '  <p class="trip-copy stack-item-route">' + escapeHtml(tripRouteLabel(trip)) + " | " + escapeHtml(tripTimingRange(trip)) + "</p>",
          '  <p class="mini-note stack-item-copy">' + escapeHtml(tripListingHint(trip)) + " | " + escapeHtml(tripSeatLabel(trip)) + "</p>",
          '  <p class="mini-note stack-item-copy">' + escapeHtml(tripTransportSummary(trip)) + "</p>",
          trip.regionLabel ? '  <p class="mini-note stack-item-copy">Region: ' + escapeHtml(trip.regionLabel) + " | " + escapeHtml(trip.country) + "</p>" : '  <p class="mini-note stack-item-copy">' + escapeHtml(trip.country) + " | " + escapeHtml(tripTravelModeLabel(trip)) + "</p>",
          '  <a class="text-link" href="reise-detail.html?id=' + encodeURIComponent(trip.id) + '">Zur Detailseite</a>',
          "</div>"
        ].join("");
      }).join("");
    }

    const profileChats = getChats().filter(function (chat) {
      return Array.isArray(chat.participantIds) && chat.participantIds.includes(profile.id);
    }).sort(function (left, right) {
      return new Date(right.lastMessageAt || 0) - new Date(left.lastMessageAt || 0);
    });

    if (chatList) {
      if (!profileChats.length) {
        renderEmptyList(chatList, "Noch kein aktiver Chat. Reagiere auf einen MatchTrip und der Chat startet hier.");
      } else {
        chatList.innerHTML = profileChats.map(function (chat) {
          const partner = chatPartner(chat, profile.id);
          const trip = getTripById(chat.tripId);

          return [
            '<div class="stack-item">',
            "  <strong>" + escapeHtml(partner.name) + "</strong>",
            '  <p class="trip-copy">' + escapeHtml(trip ? trip.title : "Allgemeiner MatchTrip") + "</p>",
            '  <p class="mini-note stack-item-copy">' + escapeHtml(chatPreview(chat)) + "</p>",
            '  <p class="mini-note">Letzte Aktivitaet: ' + escapeHtml(formatDateTime(chat.lastMessageAt || new Date().toISOString())) + "</p>",
            '  <a class="text-link" href="chat.html?id=' + encodeURIComponent(chat.id) + '">Chat oeffnen</a>',
            "</div>"
          ].join("");
        }).join("");
      }
    }

    const requests = getRequests().filter(function (request) {
      const trip = getTripById(request.tripId);
      return request.applicantId === profile.id || (trip && trip.hostId === profile.id);
    });

    if (!requests.length) {
      renderEmptyList(requestList, "Aktuell gibt es keine passenden Reaktionen oder Anfragen.");
    } else {
      requestList.innerHTML = requests.map(function (request) {
        const trip = getTripById(request.tripId);
        const isSent = request.applicantId === profile.id;
        const counterParty = isSent
          ? (trip ? getHostById(trip.hostId) : null)
          : (request.applicantId ? getUserById(request.applicantId) : null);
        const linkedChat = trip && counterParty
          ? findChatForTripAndUsers(trip.id, profile.id, counterParty.id)
          : null;

        return [
          '<div class="stack-item">',
          "  <strong>" + escapeHtml(isSent ? "Du an " + (counterParty ? counterParty.name : "Match") : (request.applicantName + " an dich")) + "</strong>",
          '  <p class="trip-copy">' + escapeHtml(trip ? trip.title : "Allgemeine Anfrage") + "</p>",
          '  <p class="trip-copy">' + escapeHtml(request.message) + "</p>",
          '  <p class="mini-note">Kontaktweg: ' + escapeHtml(contactModeLabel(request.contactMode || "")) + " | " + escapeHtml(request.privacyStage || "Standard") + "</p>",
          '  <p class="mini-note">Naechster Schritt: ' + escapeHtml(request.nextStep || "Kontakt pruefen") + "</p>",
          '  <span class="status-pill">' + escapeHtml(request.status) + "</span>",
          linkedChat ? '  <a class="text-link" href="chat.html?id=' + encodeURIComponent(linkedChat.id) + '">Zum Chat</a>' : "",
          "</div>"
        ].join("");
      }).join("");
    }

    const ownCostPlans = getCostPlans().filter(function (costPlan) {
      const trip = getTripById(costPlan.tripId);
      return trip && trip.hostId === profile.id;
    });

    if (!ownCostPlans.length) {
      renderEmptyList(costPlanList, "Noch kein Kostenplan gespeichert.");
    } else {
      costPlanList.innerHTML = ownCostPlans.map(function (costPlan) {
        const trip = getTripById(costPlan.tripId);
        const normalizedPlan = normalizeCostPlan(costPlan, trip || { id: costPlan.tripId, budgetPerPerson: 0, seats: 1 });

        return [
          '<div class="stack-item">',
          "  <strong>" + escapeHtml(trip ? trip.title : "Allgemeiner Trip") + "</strong>",
          '  <p class="trip-copy">' + escapeHtml(splitMethodLabel(normalizedPlan.splitMethod)) + "</p>",
          '  <p class="mini-note">Gesamt: ' + escapeHtml(euro(costPlanTotal(normalizedPlan))) + " | Teilbar: " + escapeHtml(euro(costPlanChargeableTotal(normalizedPlan))) + "</p>",
          '  <p class="mini-note">Pro Person: ' + escapeHtml(euro(costPerPerson(normalizedPlan))) + " | " + escapeHtml(normalizedPlan.status) + "</p>",
          trip ? '  <a class="text-link" href="reise-detail.html?id=' + encodeURIComponent(trip.id) + '">Kostenplan oeffnen</a>' : "",
          "</div>"
        ].join("");
      }).join("");
    }
  }

  function initChatPage() {
    const threadList = document.getElementById("chatThreadList");
    const chatScreen = document.getElementById("chatScreen");
    const profileBadge = document.getElementById("chatProfileBadge");
    const profile = getProfile();

    if (!threadList || !chatScreen) {
      return;
    }

    if (profileBadge) {
      profileBadge.textContent = profile.name;
    }

    const chats = getChats().filter(function (chat) {
      return Array.isArray(chat.participantIds) && chat.participantIds.includes(profile.id);
    }).sort(function (left, right) {
      return new Date(right.lastMessageAt || 0) - new Date(left.lastMessageAt || 0);
    });

    if (!chats.length) {
      renderEmptyList(threadList, "Noch kein Chat offen.");
      chatScreen.innerHTML = '<div class="empty-state">Reagiere auf einen MatchTrip oder wechsle im Profil auf Daniel oder Mel, um die Demo-Konversation zu sehen.</div>';
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const activeChat = chats.find(function (chat) {
      return chat.id === params.get("id");
    }) || chats[0];

    threadList.innerHTML = chats.map(function (chat) {
      const trip = getTripById(chat.tripId);
      const partner = chatPartner(chat, profile.id);
      const isActive = activeChat && activeChat.id === chat.id;

      return [
        '<a class="chat-thread-link' + (isActive ? " is-active" : "") + '" href="chat.html?id=' + encodeURIComponent(chat.id) + '">',
        '  <strong>' + escapeHtml(partner.name) + "</strong>",
        '  <span>' + escapeHtml(trip ? trip.title : "Allgemeiner MatchTrip") + "</span>",
        '  <small>' + escapeHtml(chatPreview(chat)) + "</small>",
        "</a>"
      ].join("");
    }).join("");

    const activeTrip = getTripById(activeChat.tripId);
    const activePartner = chatPartner(activeChat, profile.id);
    const messagesMarkup = chatMessages(activeChat).map(function (message) {
      const isOwnMessage = message.senderId === profile.id;
      const sender = getUserById(message.senderId);

      return [
        '<article class="chat-bubble' + (isOwnMessage ? " is-own" : "") + '">',
        '  <p class="chat-bubble-meta">' + escapeHtml(sender.name) + " | " + escapeHtml(formatDateTime(message.sentAt)) + "</p>",
        '  <p>' + escapeHtml(message.text) + "</p>",
        "</article>"
      ].join("");
    }).join("");

    chatScreen.innerHTML = [
      '<div class="chat-screen-header">',
      '  <div>',
      '    <p class="eyebrow">Chat</p>',
      '    <h2>' + escapeHtml(activePartner.name) + "</h2>",
      '    <p class="trip-copy">' + escapeHtml(activeTrip ? activeTrip.title : "Allgemeiner MatchTrip") + "</p>",
      "  </div>",
      '  <div class="chat-screen-actions">',
      activeTrip ? '    <a class="button button-secondary button-small" href="reise-detail.html?id=' + encodeURIComponent(activeTrip.id) + '">Zum MatchTrip</a>' : "",
      '    <a class="button button-secondary button-small" href="profil.html">Profil wechseln</a>',
      "  </div>",
      "</div>",
      '<p class="mini-note">Aktiv als ' + escapeHtml(profile.name) + '. Du kannst im Profil zwischen Daniel und Mel wechseln und den Chat aus beiden Perspektiven sehen.</p>',
      '<div class="chat-message-list">' + messagesMarkup + "</div>",
      '<form id="chatReplyForm" class="chat-reply-form">',
      '  <textarea name="message" rows="3" placeholder="Schreib hier deine naechste Nachricht..." required></textarea>',
      '  <div class="form-actions">',
      '    <button class="button button-primary" type="submit">Nachricht senden</button>',
      '    <span id="chatReplyStatus" class="mini-note"></span>',
      "  </div>",
      "</form>"
    ].join("");

    const replyForm = document.getElementById("chatReplyForm");
    const replyStatus = document.getElementById("chatReplyStatus");

    if (replyForm) {
      replyForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(replyForm);
        const text = String(formData.get("message") || "").trim();

        if (!text) {
          if (replyStatus) {
            replyStatus.textContent = "Bitte erst eine Nachricht schreiben.";
          }
          return;
        }

        addChatMessage(activeChat.id, {
          id: "m" + Date.now(),
          senderId: profile.id,
          text: text,
          sentAt: new Date().toISOString()
        });

        window.location.href = "chat.html?id=" + encodeURIComponent(activeChat.id);
      });
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

    if (page === "chat") {
      initChatPage();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();

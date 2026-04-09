(function () {
  const KEYS = {
    trips: "reiseSharing.trips",
    requests: "reiseSharing.requests",
    profile: "reiseSharing.profile",
    costPlans: "reiseSharing.costPlans",
    chats: "reiseSharing.chats"
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function read(key, fallback) {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return clone(fallback);
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return clone(fallback);
    }
  }

  function write(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function mergeSeedItems(storedItems, seedItems) {
    const stored = Array.isArray(storedItems) ? clone(storedItems) : [];
    const seedMap = new Map(seedItems.map(function (item) {
      return [item.id, clone(item)];
    }));

    const merged = stored.map(function (item) {
      if (seedMap.has(item.id)) {
        const seeded = seedMap.get(item.id);
        seedMap.delete(item.id);
        return seeded;
      }

      return item;
    });

    seedMap.forEach(function (item) {
      merged.push(item);
    });

    return merged;
  }

  function getTrips() {
    const storedTrips = read(KEYS.trips, []);
    const trips = storedTrips.length ? mergeSeedItems(storedTrips, window.AppData.trips) : clone(window.AppData.trips);
    write(KEYS.trips, trips);
    return trips;
  }

  function saveTrips(trips) {
    write(KEYS.trips, trips);
  }

  function addTrip(trip) {
    const trips = getTrips();
    trips.unshift(trip);
    saveTrips(trips);
    return trip;
  }

  function getRequests() {
    const storedRequests = read(KEYS.requests, []);
    const requests = storedRequests.length ? mergeSeedItems(storedRequests, window.AppData.requests) : clone(window.AppData.requests);
    write(KEYS.requests, requests);
    return requests;
  }

  function saveRequests(requests) {
    write(KEYS.requests, requests);
  }

  function addRequest(request) {
    const requests = getRequests();
    requests.unshift(request);
    saveRequests(requests);
    return request;
  }

  function getDefaultProfile() {
    const defaultId = window.AppData.defaultProfileId;
    return clone(window.AppData.users.find(function (user) {
      return user.id === defaultId;
    }) || window.AppData.users[0]);
  }

  function getProfile() {
    const profile = read(KEYS.profile, getDefaultProfile());
    write(KEYS.profile, profile);
    return profile;
  }

  function setProfile(profileId) {
    const nextProfile = window.AppData.users.find(function (user) {
      return user.id === profileId;
    });

    if (!nextProfile) {
      return getProfile();
    }

    write(KEYS.profile, nextProfile);
    return clone(nextProfile);
  }

  function getCostPlans() {
    const storedCostPlans = read(KEYS.costPlans, []);
    const costPlans = storedCostPlans.length ? mergeSeedItems(storedCostPlans, window.AppData.costPlans || []) : clone(window.AppData.costPlans || []);
    write(KEYS.costPlans, costPlans);
    return costPlans;
  }

  function saveCostPlans(costPlans) {
    write(KEYS.costPlans, costPlans);
  }

  function saveCostPlan(costPlan) {
    const costPlans = getCostPlans();
    const index = costPlans.findIndex(function (entry) {
      return entry.tripId === costPlan.tripId;
    });

    if (index >= 0) {
      costPlans[index] = clone(costPlan);
    } else {
      costPlans.unshift(clone(costPlan));
    }

    saveCostPlans(costPlans);
    return costPlan;
  }

  function getChats() {
    const storedChats = read(KEYS.chats, []);
    const chats = storedChats.length ? mergeSeedItems(storedChats, window.AppData.chats || []) : clone(window.AppData.chats || []);
    write(KEYS.chats, chats);
    return chats;
  }

  function saveChats(chats) {
    write(KEYS.chats, chats);
  }

  function upsertChat(chat) {
    const chats = getChats();
    const index = chats.findIndex(function (entry) {
      return entry.id === chat.id;
    });

    if (index >= 0) {
      chats[index] = clone(chat);
    } else {
      chats.unshift(clone(chat));
    }

    saveChats(chats);
    return chat;
  }

  function addChatMessage(chatId, message) {
    const chats = getChats();
    const index = chats.findIndex(function (entry) {
      return entry.id === chatId;
    });

    if (index === -1) {
      return null;
    }

    const chat = chats[index];
    chat.messages = Array.isArray(chat.messages) ? chat.messages : [];
    chat.messages.push(clone(message));
    chat.lastMessageAt = message.sentAt;
    chats[index] = chat;
    saveChats(chats);
    return clone(chat);
  }

  window.StorageApi = {
    getTrips,
    saveTrips,
    addTrip,
    getRequests,
    saveRequests,
    addRequest,
    getProfile,
    setProfile,
    getCostPlans,
    saveCostPlans,
    saveCostPlan,
    getChats,
    saveChats,
    upsertChat,
    addChatMessage
  };
})();

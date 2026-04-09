(function () {
  const KEYS = {
    trips: "reiseSharing.trips",
    requests: "reiseSharing.requests",
    profile: "reiseSharing.profile"
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

  function getProfile() {
    const profile = read(KEYS.profile, window.AppData.users[0]);
    write(KEYS.profile, profile);
    return profile;
  }

  window.StorageApi = {
    getTrips,
    saveTrips,
    addTrip,
    getRequests,
    getProfile
  };
})();

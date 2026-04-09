window.AppData = {
  users: [
    {
      id: "u1",
      name: "Mila Berger",
      homeBase: "Berlin",
      about: "Ich mag entspannte Staedtereisen, gutes Essen und klare Absprachen.",
      languages: ["Deutsch", "Englisch"],
      interests: ["Food", "Staedtereise", "Museen"],
      verified: true,
      contact: {
        email: "mila@example.local",
        phone: "+49 000 000000"
      }
    },
    {
      id: "u2",
      name: "Noah Stein",
      homeBase: "Muenchen",
      about: "Ich plane gern Roadtrips, fahre lange Strecken entspannt und teile Kosten transparent auf.",
      languages: ["Deutsch", "Englisch"],
      interests: ["Roadtrip", "Natur", "Sommer"],
      verified: true,
      contact: {
        email: "noah@example.local",
        phone: "+49 000 000001"
      }
    },
    {
      id: "u3",
      name: "Elena Russo",
      homeBase: "Koeln",
      about: "Ich reise gern fuer gutes Essen, schoene Altstaedte und kleine kreative Hotels.",
      languages: ["Deutsch", "Italienisch", "Englisch"],
      interests: ["Food", "Kultur", "Meer"],
      verified: true,
      contact: {
        email: "elena@example.local",
        phone: "+49 000 000002"
      }
    },
    {
      id: "u4",
      name: "Yasmin Keller",
      homeBase: "Hamburg",
      about: "Ich mag kurze, gut strukturierte Trips mit Natur, Bewegung und ruhiger Atmosphaere.",
      languages: ["Deutsch", "Englisch"],
      interests: ["Wandern", "Natur", "Wellness"],
      verified: false,
      contact: {
        email: "yasmin@example.local",
        phone: "+49 000 000003"
      }
    }
  ],
  trips: [
    {
      id: "t1",
      hostId: "u1",
      title: "Wochenende in Prag",
      startCity: "Berlin",
      destinationCity: "Prag",
      country: "Tschechien",
      startDate: "2026-06-12",
      endDate: "2026-06-15",
      seats: 2,
      budgetPerPerson: 120,
      styles: ["Staedtereise", "Food", "Budget"],
      notes: "Bahn, zentrale Unterkunft, viel zu Fuss und kleine Cafes. Ich suche entspannte Leute, die Planung moegen.",
      contactUnlock: "after-approval",
      status: "Offen"
    },
    {
      id: "t2",
      hostId: "u2",
      title: "Roadtrip an den Gardasee",
      startCity: "Muenchen",
      destinationCity: "Gardasee",
      country: "Italien",
      startDate: "2026-07-03",
      endDate: "2026-07-08",
      seats: 3,
      budgetPerPerson: 260,
      styles: ["Roadtrip", "Natur", "Meer"],
      notes: "Auto ist vorhanden. Benzin, Maut und Apartment werden geteilt. Fokus liegt auf Baden, kleinen Orten und lockerer Stimmung.",
      contactUnlock: "after-approval",
      status: "Offen"
    },
    {
      id: "t3",
      hostId: "u3",
      title: "Herbsttage in Porto",
      startCity: "Koeln",
      destinationCity: "Porto",
      country: "Portugal",
      startDate: "2026-10-01",
      endDate: "2026-10-06",
      seats: 1,
      budgetPerPerson: 340,
      styles: ["Staedtereise", "Food", "Meer"],
      notes: "Flug wird frueh gebucht, Unterkunft eher ruhig. Ich mag morgens planen und abends spontan sein.",
      contactUnlock: "after-request",
      status: "Offen"
    },
    {
      id: "t4",
      hostId: "u4",
      title: "Bled und Ljubljana mit dem Zug",
      startCity: "Hamburg",
      destinationCity: "Bled",
      country: "Slowenien",
      startDate: "2026-05-21",
      endDate: "2026-05-26",
      seats: 2,
      budgetPerPerson: 210,
      styles: ["Natur", "Budget", "Wandern"],
      notes: "Die Idee ist ein entspannter Mix aus See, Altstadt und leichten Wanderungen. Schlafen eher einfach, dafuer gute gemeinsame Tage.",
      contactUnlock: "after-approval",
      status: "Offen"
    },
    {
      id: "t5",
      hostId: "u1",
      title: "Amsterdam fuer Museen und Grachten",
      startCity: "Dortmund",
      destinationCity: "Amsterdam",
      country: "Niederlande",
      startDate: "2026-08-14",
      endDate: "2026-08-17",
      seats: 2,
      budgetPerPerson: 190,
      styles: ["Staedtereise", "Kultur", "Food"],
      notes: "Ein kompakter Trip mit frueher Buchung, Tagesplaenen und genug Raum fuer spontane Cafes und Museen.",
      contactUnlock: "after-request",
      status: "Offen"
    },
    {
      id: "t6",
      hostId: "u4",
      title: "Wanderwoche in Suedtirol",
      startCity: "Stuttgart",
      destinationCity: "Bozen",
      country: "Italien",
      startDate: "2026-09-05",
      endDate: "2026-09-11",
      seats: 3,
      budgetPerPerson: 390,
      styles: ["Natur", "Wandern", "Roadtrip"],
      notes: "Ich suche Leute, die frueh starten koennen, tagsueber gern draussen sind und abends lieber huettig als laut unterwegs sind.",
      contactUnlock: "after-approval",
      status: "Offen"
    },
    {
      id: "t7",
      hostId: "u3",
      title: "Valencia Sonne, Markt und Strand",
      startCity: "Frankfurt",
      destinationCity: "Valencia",
      country: "Spanien",
      startDate: "2026-06-18",
      endDate: "2026-06-23",
      seats: 2,
      budgetPerPerson: 430,
      styles: ["Meer", "Food", "Kultur"],
      notes: "Tagsueber Stadt und Strand, abends Tapas. Ich suche entspannte Leute mit normalem Schlafrhythmus und fairer Kostenplanung.",
      contactUnlock: "after-request",
      status: "Offen"
    },
    {
      id: "t8",
      hostId: "u1",
      title: "Paris in drei Tagen",
      startCity: "Koeln",
      destinationCity: "Paris",
      country: "Frankreich",
      startDate: "2026-11-06",
      endDate: "2026-11-09",
      seats: 1,
      budgetPerPerson: 250,
      styles: ["Staedtereise", "Kultur", "Food"],
      notes: "Kurzer Intensivtrip mit fruehem Zug, guter Lage und Fokus auf kleine Restaurants, Viertelspaziergaenge und ein Museum.",
      contactUnlock: "after-approval",
      status: "Offen"
    },
    {
      id: "t9",
      hostId: "u2",
      title: "Kuestenfahrt bis Split",
      startCity: "Nuernberg",
      destinationCity: "Split",
      country: "Kroatien",
      startDate: "2026-07-22",
      endDate: "2026-07-29",
      seats: 3,
      budgetPerPerson: 310,
      styles: ["Roadtrip", "Meer", "Budget"],
      notes: "Van ist da, Playlist auch. Gesucht werden Leute mit lockerer Art, die Fahrkosten sauber teilen und beim Planen mitdenken.",
      contactUnlock: "after-approval",
      status: "Offen"
    },
    {
      id: "t10",
      hostId: "u4",
      title: "Wellness-Wochenende im Schwarzwald",
      startCity: "Freiburg",
      destinationCity: "Titisee",
      country: "Deutschland",
      startDate: "2026-12-04",
      endDate: "2026-12-06",
      seats: 2,
      budgetPerPerson: 190,
      styles: ["Wellness", "Natur", "Budget"],
      notes: "Zwei ruhige Tage mit Spa, Spaziergaengen und wenig Programm. Perfekt fuer Leute, die einfach mal raus und runterkommen wollen.",
      contactUnlock: "after-approval",
      status: "Offen"
    }
  ],
  requests: [
    {
      id: "r1",
      tripId: "t1",
      applicantName: "Sina",
      message: "Ich reise gerne leicht und wuerde die Unterkunftskosten fair teilen.",
      status: "Offen"
    },
    {
      id: "r2",
      tripId: "t2",
      applicantName: "Jonas",
      message: "Ich uebernehme gerne Fahrten und bin sehr unkompliziert.",
      status: "Offen"
    },
    {
      id: "r3",
      tripId: "t7",
      applicantName: "Lara",
      message: "Ich suche genau so einen Mix aus Stadt und Meer und plane gern mit.",
      status: "Offen"
    },
    {
      id: "r4",
      tripId: "t10",
      applicantName: "Mert",
      message: "Wellness und ruhige Trips passen gut zu mir. Ich bin beim Organisieren sehr verlaesslich.",
      status: "Offen"
    }
  ]
};

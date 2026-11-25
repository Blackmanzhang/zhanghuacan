(() => {
  "use strict";

  if (window.parent === window) return;

  const surface = document.querySelector("#atlas-map");
  const origin = location.origin;
  const pins = new Map();
  let points;
  let projecting = false;
  let api;
  let map;
  let view;
  let rendered;
  let failed = false;

  function send(type, data) {
    window.parent.postMessage({ type, ...data }, origin);
  }

  const timeout = setTimeout(() => fail("unavailable"), 18000);

  function fail(status) {
    if (failed) return;
    failed = true;
    clearTimeout(timeout);
    send("atlas-map-status", { status });
  }

  function projectLocations() {
    const locations = view.locations;
    projecting = true;
    api.convertFrom(
      locations.map(([, coords]) => coords),
      "gps",
      (status, result) => {
        if (failed) return;
        if (status !== "complete" || result?.locations?.length !== locations.length) {
          const authorization = /KEY|SCODE|PRIVILEG|DOMAIN|SIGNATURE/i.test(result?.info || "");
          return fail(authorization ? "authorization" : "unavailable");
        }
        points = new Map(locations.map(([id], index) => [id, result.locations[index]]));
        mount();
      },
    );
  }

  function markerFor(place) {
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "atlas-pin";
    pin.append(document.createElement("span"));
    pin.addEventListener("click", (event) => {
      event.stopPropagation();
      send("atlas-map-select", { id: place.id });
    });
    pins.set(place.id, pin);
    return new api.Marker({
      content: pin,
      position: points.get(place.id),
      anchor: "center",
      offset: new api.Pixel(0, 0),
    });
  }

  function redrawOverlays() {
    map.clearMap();
    pins.clear();
    const lines = view.lines.map(([from, to]) => new api.Polyline({
      path: [points.get(from), points.get(to)],
      strokeColor: "#95672c",
      strokeWeight: 2,
      strokeOpacity: 0.9,
      strokeStyle: "dashed",
    }));
    map.add([...lines, ...view.places.map(markerFor)]);
  }

  function fitOverview() {
    map.setFitView(undefined, true, [68, 36, 40, 36], 10);
  }

  function updateLabels() {
    surface.toggleAttribute("data-show-labels", map.getZoom() >= 8);
  }

  function renderView() {
    const themeChanged = view.theme !== rendered?.theme;
    if (themeChanged) redrawOverlays();
    for (const place of view.places) {
      const pin = pins.get(place.id);
      pin.firstElementChild.textContent = place.city;
      pin.setAttribute("aria-label", place.city);
      if (place.id === view.selected) pin.setAttribute("aria-current", "location");
      else pin.removeAttribute("aria-current");
    }

    const selected = points.get(view.selected);
    if (!rendered && view.focusPlace) map.setZoomAndCenter(10, selected);
    else if (themeChanged || (rendered?.focusPlace && !view.focusPlace)) fitOverview();
    else if (rendered?.selected !== view.selected && !map.getBounds()?.contains(selected)) {
      map.setCenter(selected);
    }
    rendered = view;
    updateLabels();
  }

  function mount() {
    if (failed || !api || !view || !surface.clientWidth) return;
    try {
      if (!points) {
        if (!projecting) projectLocations();
        return;
      }
      if (!map) {
        map = new api.Map(surface, {
          viewMode: "2D",
          center: [111, 15],
          zoom: 5,
          scrollWheel: false,
          keyboardEnable: true,
          resizeEnable: true,
        });
        map.on("zoomend", updateLabels);
        const ready = () => {
          map.off("complete", ready);
          if (failed) return;
          clearTimeout(timeout);
          send("atlas-map-status", { status: "ready" });
        };
        map.on("complete", ready);
      }
      if (view !== rendered) renderView();
    } catch {
      fail("unavailable");
    }
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window.parent || event.origin !== origin) return;
    if (event.data?.type === "atlas-map-view") {
      view = event.data;
      mount();
    } else if (event.data?.type === "atlas-map-control" && map && !failed) {
      if (event.data.action === "in") map.zoomIn();
      if (event.data.action === "out") map.zoomOut();
      if (event.data.action === "overview") fitOverview();
    }
  });
  new ResizeObserver(mount).observe(surface);

  async function load() {
    try {
      const response = await fetch("/api/atlas-map-config", { cache: "no-store" });
      if (response.status === 404) return fail("service");
      if (response.status === 503) return fail("missing");
      if (!response.ok) return fail("unavailable");
      const { key } = await response.json();
      if (!key) return fail("missing");
      if (failed) return;

      window._AMapSecurityConfig = { serviceHost: origin + "/_AMapService" };
      window.initCultureAtlas = () => {
        delete window.initCultureAtlas;
        api = window.AMap;
        if (!api?.Map || !api?.convertFrom) return fail("unavailable");
        mount();
      };
      const src = new URL("https://webapi.amap.com/maps");
      src.search = new URLSearchParams({ v: "2.0", key, callback: "initCultureAtlas" });
      const script = document.createElement("script");
      script.src = src.href;
      script.onerror = () => fail("unavailable");
      document.head.append(script);
    } catch {
      fail("unavailable");
    }
  }

  load();
})();

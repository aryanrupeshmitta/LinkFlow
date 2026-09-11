document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const navButtons = document.querySelectorAll(".nav-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const storageEngineText = document.getElementById("storageEngineText");
  const statTotalLinks = document.getElementById("statTotalLinks");
  const statTotalClicks = document.getElementById("statTotalClicks");

  // Single Shortener Elements
  const singleShortenForm = document.getElementById("singleShortenForm");
  const toggleAdvancedBtn = document.getElementById("toggleAdvancedBtn");
  const advancedOptions = document.getElementById("advancedOptions");
  const shortenSubmitBtn = document.getElementById("shortenSubmitBtn");
  const resultBox = document.getElementById("resultBox");
  const resultOriginalUrl = document.getElementById("resultOriginalUrl");
  const resultShortUrl = document.getElementById("resultShortUrl");
  const copyShortUrlBtn = document.getElementById("copyShortUrlBtn");
  const viewQrBtn = document.getElementById("viewQrBtn");
  const viewAnalyticsBtn = document.getElementById("viewAnalyticsBtn");

  // Bulk Shortener Elements
  const bulkForm = document.getElementById("bulkForm");
  const bulkUrlsTextarea = document.getElementById("bulkUrlsTextarea");
  const bulkResultsContainer = document.getElementById("bulkResultsContainer");
  const bulkResultsBody = document.getElementById("bulkResultsBody");

  // Link Library Elements
  const refreshLibraryBtn = document.getElementById("refreshLibraryBtn");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const sortBySelect = document.getElementById("sortBySelect");
  const linksTableBody = document.getElementById("linksTableBody");

  // Modals
  const qrModal = document.getElementById("qrModal");
  const qrImage = document.getElementById("qrImage");
  const qrShortCodeText = document.getElementById("qrShortCodeText");
  const downloadPngBtn = document.getElementById("downloadPngBtn");

  const analyticsModal = document.getElementById("analyticsModal");
  const analyticsShortCode = document.getElementById("analyticsShortCode");
  const analyticsTotalClicks = document.getElementById("analyticsTotalClicks");
  const analyticsTopReferrer = document.getElementById("analyticsTopReferrer");
  const analyticsTopDevice = document.getElementById("analyticsTopDevice");
  const analyticsLogsBody = document.getElementById("analyticsLogsBody");

  let activeShortCodeForModal = null;
  let editingShortCode = null;
  let timelineChartInstance = null;
  let referrerChartInstance = null;

  // 1. Tab Switching System
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");

      navButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(targetTab).classList.add("active");

      if (targetTab === "links-tab") {
        loadLinkLibrary();
      }
    });
  });

  // 2. Advanced Controls Accordion
  toggleAdvancedBtn.addEventListener("click", () => {
    advancedOptions.classList.toggle("hidden");
    const icon = toggleAdvancedBtn.querySelector(".accordion-icon");
    if (advancedOptions.classList.contains("hidden")) {
      icon.className = "fa-solid fa-chevron-down accordion-icon";
    } else {
      icon.className = "fa-solid fa-chevron-up accordion-icon";
    }
  });

  // 3. Theme Toggle
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
  });

  // 4. Initial Platform Stats Fetch
  async function fetchStats() {
    try {
      const res = await fetch("/api/v1/stats");
      const data = await res.json();
      if (res.ok) {
        statTotalLinks.textContent = data.totalUrls || 0;
        statTotalClicks.textContent = data.totalClicks || 0;
        storageEngineText.textContent = data.storageEngine === "mongodb" ? "MongoDB Atlas" : "Embedded Local DB";
      }
    } catch {
      storageEngineText.textContent = "Local Engine";
    }
  }

  // 5. Submit Single Shorten Form
  singleShortenForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const originalUrl = document.getElementById("originalUrlInput").value;
    const customSlug = document.getElementById("customSlugInput").value;
    const title = document.getElementById("linkTitleInput").value;
    const passcode = document.getElementById("passcodeInput").value;
    const expiresAt = document.getElementById("expiresAtInput").value;
    const maxClicks = document.getElementById("maxClicksInput").value;
    const tags = document.getElementById("tagsInput").value
      ? document.getElementById("tagsInput").value.split(",").map((t) => t.trim())
      : [];

    const utmSource = document.getElementById("utmSource").value;
    const utmMedium = document.getElementById("utmMedium").value;
    const utmCampaign = document.getElementById("utmCampaign").value;
    const utm = (utmSource || utmMedium || utmCampaign) ? { source: utmSource, medium: utmMedium, campaign: utmCampaign } : null;

    shortenSubmitBtn.disabled = true;
    shortenSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Shortening...';

    try {
      const res = await fetch("/api/v1/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl,
          customSlug,
          title,
          passcode,
          expiresAt,
          maxClicks,
          tags,
          utm
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to shorten URL.");

      resultOriginalUrl.textContent = `Destination: ${data.originalUrl}`;
      resultShortUrl.href = data.shortUrl;
      resultShortUrl.textContent = data.shortUrl;

      activeShortCodeForModal = data.shortCode;

      resultBox.classList.remove("hidden");
      showToast("Short link created successfully!", "success");

      fetchStats();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      shortenSubmitBtn.disabled = false;
      shortenSubmitBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Shorten URL Now';
    }
  });

  // Copy Short URL Action
  copyShortUrlBtn.addEventListener("click", () => {
    const url = resultShortUrl.textContent;
    if (url) {
      navigator.clipboard.writeText(url);
      showToast("Short URL copied to clipboard!", "success");
    }
  });

  // View QR Code Action
  viewQrBtn.addEventListener("click", () => {
    if (activeShortCodeForModal) {
      openQrModal(activeShortCodeForModal);
    }
  });

  // View Analytics Action
  viewAnalyticsBtn.addEventListener("click", () => {
    if (activeShortCodeForModal) {
      openAnalyticsModal(activeShortCodeForModal);
    }
  });

  // 6. Submit Bulk Form
  bulkForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const lines = bulkUrlsTextarea.value.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) {
      showToast("Please enter at least one URL.", "error");
      return;
    }

    const items = lines.map((url) => ({ originalUrl: url }));
    const submitBtn = document.getElementById("bulkSubmitBtn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

    try {
      const res = await fetch("/api/v1/bulk-shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk process failed.");

      bulkResultsBody.innerHTML = data.results
        .map((r) => {
          if (r.status === "success") {
            return `
              <tr>
                <td>${escapeHtml(r.data.originalUrl)}</td>
                <td><a href="${r.data.shortUrl}" target="_blank">${r.data.shortUrl}</a></td>
                <td><span class="badge badge-active">Success</span></td>
                <td>
                  <button class="btn secondary-btn" onclick="navigator.clipboard.writeText('${r.data.shortUrl}'); alert('Copied!');">
                    <i class="fa-regular fa-copy"></i>
                  </button>
                </td>
              </tr>
            `;
          } else {
            return `
              <tr>
                <td>${escapeHtml(r.originalUrl)}</td>
                <td class="danger-color">${escapeHtml(r.error)}</td>
                <td><span class="badge badge-expired">Failed</span></td>
                <td>-</td>
              </tr>
            `;
          }
        })
        .join("");

      bulkResultsContainer.classList.remove("hidden");
      showToast(`Processed ${data.results.length} links!`, "success");
      fetchStats();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-gears"></i> Process Bulk Links';
    }
  });

  // 7. Load Link Library
  async function loadLinkLibrary() {
    const search = searchInput.value;
    const status = statusFilter.value;
    const sortBy = sortBySelect.value;

    linksTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading links...</td></tr>';

    try {
      const query = new URLSearchParams({ search, status, sortBy, limit: 100 });
      const res = await fetch(`/api/v1/links?${query.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error("Failed to load library.");

      if (!data.links || data.links.length === 0) {
        linksTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No short links match your criteria.</td></tr>';
        return;
      }

      linksTableBody.innerHTML = data.links
        .map((item) => {
          let statusBadge = '<span class="badge badge-active">Active</span>';
          if (item.isPaused) statusBadge = '<span class="badge badge-paused">Paused</span>';
          else if (item.isExpired) statusBadge = '<span class="badge badge-expired">Expired</span>';

          const createdDate = new Date(item.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
          });

          // Favicon URL
          let faviconHost = '';
          try { faviconHost = new URL(item.originalUrl).origin; } catch {}
          const faviconSrc = faviconHost ? `${faviconHost}/favicon.ico` : '';

          return `
            <tr>
              <td>
                <div class="link-meta">
                  ${faviconSrc ? `<img class="link-favicon" src="${escapeHtml(faviconSrc)}" onerror="this.style.display='none'" alt="" />` : ''}
                  <div class="link-meta-text">
                    <span class="link-title">${escapeHtml(item.title || item.shortCode)}</span>
                    <span class="link-original" title="${escapeHtml(item.originalUrl)}">${escapeHtml(item.originalUrl)}</span>
                  </div>
                </div>
              </td>
              <td>
                <a href="${item.shortUrl}" target="_blank" style="font-weight:700; color:var(--primary-accent);">${item.shortCode}</a>
              </td>
              <td><strong>${item.clicks || 0}</strong></td>
              <td>${createdDate}</td>
              <td>${statusBadge}</td>
              <td class="text-right">
                <div class="action-btn-group" style="justify-content: flex-end;">
                  <button class="btn secondary-btn" title="Copy URL" onclick="copyToClipboard('${item.shortUrl}')">
                    <i class="fa-regular fa-copy"></i>
                  </button>
                  <button class="btn secondary-btn" title="Share" onclick="openShareModal('${item.shortUrl}')">
                    <i class="fa-solid fa-share-nodes"></i>
                  </button>
                  <button class="btn secondary-btn" title="Edit Link" onclick="openEditModal('${item.shortCode}')">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn secondary-btn" title="QR Code" onclick="openQrModal('${item.shortCode}')">
                    <i class="fa-solid fa-qrcode"></i>
                  </button>
                  <button class="btn secondary-btn" title="Analytics" onclick="openAnalyticsModal('${item.shortCode}')">
                    <i class="fa-solid fa-chart-line"></i>
                  </button>
                  <button class="btn danger-btn" title="Delete Link" onclick="deleteLink('${item.shortCode}')">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("");
    } catch (err) {
      linksTableBody.innerHTML = '<tr><td colspan="6" class="text-center danger-color">Could not load links.</td></tr>';
    }
  }

  refreshLibraryBtn.addEventListener("click", loadLinkLibrary);
  searchInput.addEventListener("input", debounce(loadLinkLibrary, 300));
  statusFilter.addEventListener("change", loadLinkLibrary);
  sortBySelect.addEventListener("change", loadLinkLibrary);

  // CSV Export
  document.getElementById("exportCsvBtn").addEventListener("click", async () => {
    try {
      const res = await fetch("/api/v1/links?limit=10000");
      const data = await res.json();
      if (!res.ok) throw new Error("Could not export.");

      const rows = [["Short Code", "Short URL", "Original URL", "Title", "Clicks", "Created At", "Status"]];
      (data.links || []).forEach((item) => {
        rows.push([
          item.shortCode,
          item.shortUrl,
          item.originalUrl,
          item.title || "",
          item.clicks || 0,
          item.createdAt,
          item.isPaused ? "Paused" : item.isExpired ? "Expired" : "Active"
        ]);
      });

      const csvContent = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `linkflow-links-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      showToast("CSV exported!", "success");
    } catch (err) {
      showToast("Export failed: " + err.message, "error");
    }
  });

  // 8. Open QR Code Modal
  window.openQrModal = async function (shortCode) {
    try {
      const res = await fetch(`/api/v1/links/${shortCode}/qr`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate QR code.");

      qrImage.src = data.dataUrl;
      downloadPngBtn.href = data.dataUrl;
      qrShortCodeText.textContent = `Link: ${window.location.origin}/${shortCode}`;
      qrModal.classList.remove("hidden");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // 9. Open Analytics Modal
  window.openAnalyticsModal = async function (shortCode) {
    try {
      const res = await fetch(`/api/v1/links/${shortCode}/analytics`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load analytics.");

      analyticsShortCode.textContent = `/${shortCode}`;
      analyticsTotalClicks.textContent = data.totalClicks || 0;

      // Calculate Top Referrer
      const topRef = Object.entries(data.referrers || {}).sort((a, b) => b[1] - a[1])[0];
      analyticsTopReferrer.textContent = topRef ? topRef[0] : "Direct";

      // Calculate Top Device
      const topDev = Object.entries(data.devices || {}).sort((a, b) => b[1] - a[1])[0];
      analyticsTopDevice.textContent = topDev ? topDev[0] : "Desktop";

      // Render Charts
      renderCharts(data);

      // Render Logs
      analyticsLogsBody.innerHTML = (data.recentLogs || [])
        .map((log) => `
          <tr>
            <td>${new Date(log.timestamp).toLocaleString()}</td>
            <td>${escapeHtml(log.referer)}</td>
            <td>${escapeHtml(log.device)} / ${escapeHtml(log.os)}</td>
            <td>${escapeHtml(log.ip)} (${escapeHtml(log.country)})</td>
          </tr>
        `)
        .join("") || '<tr><td colspan="4">No click logs recorded yet.</td></tr>';

      analyticsModal.classList.remove("hidden");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  function renderCharts(data) {
    // Timeline Chart
    const timelineCtx = document.getElementById("timelineChart").getContext("2d");
    if (timelineChartInstance) timelineChartInstance.destroy();

    const timelineLabels = Object.keys(data.timeline || {});
    const timelineValues = Object.values(data.timeline || {});

    timelineChartInstance = new Chart(timelineCtx, {
      type: "line",
      data: {
        labels: timelineLabels.length > 0 ? timelineLabels : ["Today"],
        datasets: [{
          label: "Clicks",
          data: timelineValues.length > 0 ? timelineValues : [data.totalClicks],
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.15)",
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
          y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } }
        }
      }
    });

    // Referrer Chart
    const referrerCtx = document.getElementById("referrerChart").getContext("2d");
    if (referrerChartInstance) referrerChartInstance.destroy();

    const refLabels = Object.keys(data.referrers || {});
    const refValues = Object.values(data.referrers || {});

    referrerChartInstance = new Chart(referrerCtx, {
      type: "doughnut",
      data: {
        labels: refLabels.length > 0 ? refLabels : ["Direct"],
        datasets: [{
          data: refValues.length > 0 ? refValues : [1],
          backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"]
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom", labels: { color: "#94a3b8" } } }
      }
    });
  }

  // 10. Open Edit Modal
  window.openEditModal = async function (shortCode) {
    try {
      const res = await fetch(`/api/v1/links/${shortCode}`);
      const item = await res.json();
      if (!res.ok) throw new Error(item.error || "Failed to load link.");

      editingShortCode = shortCode;
      document.getElementById("editModalCode").textContent = `/${shortCode}`;
      document.getElementById("editOriginalUrl").value = item.originalUrl || "";
      document.getElementById("editTitle").value = item.title || "";
      document.getElementById("editPasscode").value = "";
      document.getElementById("editExpiresAt").value = item.expiresAt ? new Date(item.expiresAt).toISOString().slice(0,16) : "";
      document.getElementById("editMaxClicks").value = item.maxClicks || "";
      document.getElementById("editTags").value = Array.isArray(item.tags) ? item.tags.join(", ") : "";
      document.getElementById("editIsPaused").checked = Boolean(item.isPaused);

      document.getElementById("editModal").classList.remove("hidden");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Save Edit
  document.getElementById("saveEditBtn").addEventListener("click", async () => {
    if (!editingShortCode) return;

    const payload = {
      originalUrl: document.getElementById("editOriginalUrl").value,
      title: document.getElementById("editTitle").value,
      passcode: document.getElementById("editPasscode").value || null,
      expiresAt: document.getElementById("editExpiresAt").value || null,
      maxClicks: document.getElementById("editMaxClicks").value || null,
      tags: document.getElementById("editTags").value
        ? document.getElementById("editTags").value.split(",").map((t) => t.trim())
        : [],
      isPaused: document.getElementById("editIsPaused").checked
    };

    try {
      const res = await fetch(`/api/v1/links/${editingShortCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed.");

      document.getElementById("editModal").classList.add("hidden");
      showToast("Link updated successfully!", "success");
      loadLinkLibrary();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Delete Link Action
  window.deleteLink = async function (shortCode) {
    if (!confirm(`Are you sure you want to delete short link /${shortCode}?`)) return;

    try {
      const res = await fetch(`/api/v1/links/${shortCode}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");

      showToast("Link deleted successfully.", "success");
      loadLinkLibrary();
      fetchStats();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Copy helper
  window.copyToClipboard = function (text) {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  // Close modals
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close");
      document.getElementById(modalId).classList.add("hidden");
    });
  });

  // Close modal on backdrop click
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });
  });

  // Dynamic API Code Blocks
  function initApiDocs() {
    const base = window.location.origin;
    const codes = {
      apiCodeShorten: `curl -X POST "${base}/api/v1/shorten" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "originalUrl": "https://example.com/promo",\n    "customSlug": "summer-sale",\n    "passcode": "secret123",\n    "expiresAt": "2026-12-31T23:59:59Z",\n    "tags": ["marketing", "promo"]\n  }'`,
      apiRespShorten: `// Response 201 Created\n{\n  "shortCode": "summer-sale",\n  "shortUrl": "${base}/summer-sale",\n  "originalUrl": "https://example.com/promo",\n  "clicks": 0,\n  "createdAt": "2026-09-11T18:00:00.000Z"\n}`,
      apiCodeBulk: `curl -X POST "${base}/api/v1/bulk-shorten" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "items": [\n      { "originalUrl": "https://site1.com" },\n      { "originalUrl": "https://site2.com" }\n    ]\n  }'`,
      apiCodeList: `curl "${base}/api/v1/links?search=promo&status=active&limit=20&sortBy=clicks"`,
      apiCodeGet: `curl "${base}/api/v1/links/summer-sale"`,
      apiCodeUpdate: `curl -X PUT "${base}/api/v1/links/summer-sale" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "title": "Updated Title",\n    "isPaused": false,\n    "expiresAt": "2027-01-01T00:00:00Z"\n  }'`,
      apiCodeDelete: `curl -X DELETE "${base}/api/v1/links/summer-sale"`,
      apiCodeAnalytics: `curl "${base}/api/v1/links/summer-sale/analytics"`,
      apiCodeQr: `curl "${base}/api/v1/links/summer-sale/qr?format=png"`,
      apiCodeStats: `curl "${base}/api/v1/stats"`
    };

    Object.entries(codes).forEach(([id, code]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = code;
    });
  }

  // Utility Toast Notification
  function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function escapeHtml(text) {
    return String(text || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // 11. Social Share Modal
  window.openShareModal = function (shortUrl) {
    const enc = encodeURIComponent(shortUrl);
    const urlDisplay = document.getElementById("shareModalUrl");
    if (urlDisplay) urlDisplay.textContent = shortUrl;

    const twitter = document.getElementById("shareTwitter");
    if (twitter) twitter.href = `https://twitter.com/intent/tweet?url=${enc}&text=Check%20out%20this%20link`;

    const linkedin = document.getElementById("shareLinkedIn");
    if (linkedin) linkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`;

    const whatsapp = document.getElementById("shareWhatsApp");
    if (whatsapp) whatsapp.href = `https://wa.me/?text=${enc}`;

    const facebook = document.getElementById("shareFacebook");
    if (facebook) facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${enc}`;

    const email = document.getElementById("shareEmail");
    if (email) email.href = `mailto:?subject=Check%20out%20this%20link&body=${enc}`;

    const nativeBtn = document.getElementById("shareNative");
    if (nativeBtn) {
      nativeBtn.onclick = () => {
        if (navigator.share) {
          navigator.share({ title: "Shared Link", url: shortUrl }).catch(() => {});
        } else {
          navigator.clipboard.writeText(shortUrl);
          showToast("Link copied to clipboard!", "success");
        }
      };
    }

    const copyBtn = document.getElementById("copyShareUrlBtn");
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(shortUrl);
        showToast("Short URL copied!", "success");
      };
    }

    const modal = document.getElementById("shareModal");
    if (modal) modal.classList.remove("hidden");
  };

  // Share button in result box
  const shareResultBtn = document.getElementById("shareResultBtn");
  if (shareResultBtn) {
    shareResultBtn.addEventListener("click", () => {
      if (activeShortCodeForModal) {
        const fullUrl = `${window.location.origin}/${activeShortCodeForModal}`;
        openShareModal(fullUrl);
      }
    });
  }

  // 12. Link Health Checker
  const runHealthCheckBtn = document.getElementById("runHealthCheckBtn");
  if (runHealthCheckBtn) {
    runHealthCheckBtn.addEventListener("click", async () => {
      runHealthCheckBtn.disabled = true;
      runHealthCheckBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scanning Links...';

      const wrap = document.getElementById("healthTableWrap");
      const summary = document.getElementById("healthSummary");

      try {
        const res = await fetch("/api/v1/links?limit=200");
        const data = await res.json();
        const links = data.links || [];

        if (links.length === 0) {
          wrap.innerHTML = '<div class="empty-state"><i class="fa-solid fa-link-slash empty-icon"></i><p>No short links created yet. Create some links to run health checks!</p></div>';
          summary.classList.add("hidden");
          return;
        }

        let okCount = 0;
        let warnCount = 0;
        let errCount = 0;

        const evaluatedLinks = links.map((link) => {
          const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
          const isMaxedOut = link.maxClicks && link.clicks >= link.maxClicks;
          
          let status = "ok";
          let statusLabel = "Healthy";
          let badgeClass = "badge-active";

          if (link.isPaused) {
            status = "warn";
            statusLabel = "Paused";
            badgeClass = "badge-paused";
            warnCount++;
          } else if (isExpired) {
            status = "error";
            statusLabel = "Expired";
            badgeClass = "badge-expired";
            errCount++;
          } else if (isMaxedOut) {
            status = "error";
            statusLabel = "Click Limit Reached";
            badgeClass = "badge-expired";
            errCount++;
          } else {
            okCount++;
          }

          return { ...link, status, statusLabel, badgeClass };
        });

        document.getElementById("healthOkCount").textContent = okCount;
        document.getElementById("healthWarnCount").textContent = warnCount;
        document.getElementById("healthErrCount").textContent = errCount;
        summary.classList.remove("hidden");

        const rowsHtml = evaluatedLinks.map((item) => `
          <tr>
            <td>
              <div class="link-meta">
                <span class="link-title">${escapeHtml(item.title || item.shortCode)}</span>
                <span class="link-original">${escapeHtml(item.originalUrl)}</span>
              </div>
            </td>
            <td><a href="${item.shortUrl}" target="_blank" style="font-weight:700; color:var(--primary-accent);">${item.shortCode}</a></td>
            <td><strong>${item.clicks || 0}</strong></td>
            <td><span class="badge ${item.badgeClass}">${item.statusLabel}</span></td>
            <td class="text-right">
              <button class="btn secondary-btn" title="Edit Link" onclick="openEditModal('${item.shortCode}')">
                <i class="fa-solid fa-pen-to-square"></i> Edit
              </button>
            </td>
          </tr>
        `).join("");

        wrap.innerHTML = `
          <table class="data-table">
            <thead>
              <tr>
                <th>Title / Destination</th>
                <th>Short Code</th>
                <th>Clicks</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        `;
      } catch (err) {
        showToast("Health check failed: " + err.message, "error");
      } finally {
        runHealthCheckBtn.disabled = false;
        runHealthCheckBtn.innerHTML = '<i class="fa-solid fa-heart-pulse"></i> Run Health Scan';
      }
    });
  }

  // 13. Ctrl+K Keyboard Shortcut
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const input = document.getElementById("originalUrlInput");
      if (input) {
        const shortenerTabBtn = document.querySelector("[data-tab='shortener-tab']");
        if (shortenerTabBtn) shortenerTabBtn.click();
        input.focus();
        input.select();
      }
    }
  });

  // 14. Animated Mesh Background Canvas
  function initMeshCanvas() {
    const canvas = document.getElementById("meshCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, blobs;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    blobs = [
      { x: w * 0.2, y: h * 0.3, r: 380, color: "#6366f1", vx: 0.25, vy: 0.18 },
      { x: w * 0.8, y: h * 0.6, r: 320, color: "#8b5cf6", vx: -0.18, vy: 0.22 },
      { x: w * 0.5, y: h * 0.8, r: 350, color: "#ec4899", vx: 0.15, vy: -0.2 }
    ];

    function draw() {
      ctx.clearRect(0, 0, w, h);
      blobs.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x - b.r < 0 || b.x + b.r > w) b.vx *= -1;
        if (b.y - b.r < 0 || b.y + b.r > h) b.vy *= -1;

        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.color + "30");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  initMeshCanvas();

  // Load initial stats and API docs
  fetchStats();
  initApiDocs();
});


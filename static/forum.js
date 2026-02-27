async function postVote(url) {
    const response = await fetch(url, { method: "POST" });
    return response.json();
}

document.addEventListener("click", async (event) => {
    const threadBtn = event.target.closest(".js-thread-upvote");
    if (threadBtn) {
        const threadId = threadBtn.getAttribute("data-thread-id");
        if (!threadId) return;
        try {
            const result = await postVote(`/forum/thread/${threadId}/upvote`);
            if (result.success) {
                const score = threadBtn.querySelector(".js-thread-score");
                if (score) score.textContent = String(result.upvotes);
            }
        } catch (err) {
            console.error("Thread upvote failed", err);
        }
        return;
    }

    const commentBtn = event.target.closest(".js-comment-upvote");
    if (commentBtn) {
        const commentId = commentBtn.getAttribute("data-comment-id");
        if (!commentId) return;
        try {
            const result = await postVote(`/forum/comment/${commentId}/upvote`);
            if (result.success) {
                const score = commentBtn.querySelector(".js-comment-score");
                if (score) score.textContent = String(result.upvotes);
            }
        } catch (err) {
            console.error("Comment upvote failed", err);
        }
        return;
    }

    const reportBtn = event.target.closest(".js-report-btn");
    if (reportBtn) {
        const form = document.getElementById("forumReportForm");
        if (!form) return;
        const reason = window.prompt("Why are you reporting this content?");
        if (!reason || !reason.trim()) return;

        const typeInput = document.getElementById("forumReportType");
        const idInput = document.getElementById("forumReportId");
        const reasonInput = document.getElementById("forumReportReason");
        if (!typeInput || !idInput || !reasonInput) return;

        typeInput.value = reportBtn.getAttribute("data-content-type") || "";
        idInput.value = reportBtn.getAttribute("data-content-id") || "";
        reasonInput.value = reason.trim();
        form.submit();
    }
});

document.addEventListener("submit", async (event) => {
    const form = event.target.closest(".js-email-signup-form");
    if (!form) return;
    event.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const successEl = document.querySelector(".js-email-success");
    const errorEl = document.querySelector(".js-email-error");
    if (btn) btn.disabled = true;
    if (successEl) successEl.style.display = "none";
    if (errorEl) errorEl.style.display = "none";
    try {
        const fd = new FormData(form);
        const resp = await fetch(form.action, { method: "POST", body: fd });
        const data = await resp.json();
        if (data.success) {
            if (successEl) {
                successEl.textContent = data.message || "Tack! Du kommer få material inom kort.";
                successEl.style.display = "block";
            }
            form.reset();
        } else {
            if (errorEl) {
                errorEl.textContent = data.error || "Något gick fel.";
                errorEl.style.display = "block";
            }
        }
    } catch (err) {
        if (errorEl) {
            errorEl.textContent = "Nätverksfel. Försök igen.";
            errorEl.style.display = "block";
        }
    } finally {
        if (btn) btn.disabled = false;
    }
});

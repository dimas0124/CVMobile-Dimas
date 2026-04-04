$(document).ready(function() {
    
    /**
* 1. LOGIKA MENU MOBILE (HAMBURGER & OVERLAY)
 */
function toggleMenu(forceClose = false) {
    const $nav = $('#main-nav');
    const $overlay = $('#nav-overlay');
    const $hamburger = $('#hamburger');

    // Jika dipaksa tutup atau memang sudah terbuka
    if (forceClose || $nav.hasClass('open')) {
        $hamburger.removeClass('active');
        $nav.removeClass('open');
        $overlay.removeClass('active'); // Menghapus class active di CSS
        $('body').css('overflow', 'auto');
    } else {
        // Hanya jalan di layar mobile
        if (window.innerWidth <= 768) {
            $hamburger.addClass('active');
            $nav.addClass('open');
            $overlay.addClass('active'); // Memunculkan overlay
            $('body').css('overflow', 'hidden');
        }
    }
}

    // Event click hamburger
    $(document).on('click', '#hamburger', function(e) {
        e.preventDefault();
        toggleMenu();
    });

    // Event click overlay untuk menutup menu
    $(document).on('click', '#nav-overlay', function(e) {
        e.preventDefault();
        toggleMenu(true);
    });

    /**
     * 2. LOGIKA TEMA (DARK/LIGHT MODE)
     */
    function applyTheme(theme) {
        if (theme === "dark") {
            $("body").addClass("dark-mode");
            $("#theme-toggle").text("☀️");
        } else {
            $("body").removeClass("dark-mode");
            $("#theme-toggle").text("🌙");
        }
    }

    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    $(document).on("click", "#theme-toggle", function() {
        let newTheme = $("body").hasClass("dark-mode") ? "light" : "dark";
        localStorage.setItem("theme", newTheme);
        applyTheme(newTheme);
    });

    /**
     * 3. FUNGSI NAVIGASI SPA (AJAX)
     */
    function loadContent(page) {
        // 1. Ambil elemen #content (yang sekarang sudah punya background putih)
        const $content = $("#content");
    
        // 2. Beri efek transisi halus (menghilang sejenak)
        $content.animate({ opacity: 0, marginTop: "10px" }, 200, function() {
            
            // 3. Ambil data dari file eksternal (misal: about.html)
            $content.load(page, function(response, status, xhr) {
                
                // 4. Jika file tidak ketemu, tampilkan pesan error di dalam kotak putih tersebut
                if (status == "error") {
                    $content.html('<div style="padding:40px; text-align:center;"><h2>Opps!</h2><p>Halaman tidak ditemukan.</p></div>');
                }
                
                // 5. Munculkan kembali dengan animasi (efek fade-in)
                $content.css("marginTop", "0px").animate({ opacity: 1 }, 300);
                
                // 6. Scroll otomatis ke atas agar user tidak bingung saat pindah menu
                window.scrollTo({ top: 0, behavior: 'smooth' });
    
                // 7. Jalankan fungsi khusus jika yang dibuka halaman GitHub atau Contact
                if (page === "github.html") setTimeout(fetchGitHubData, 100);
                if (page === "contact.html") { 
                    restoreFormData(); 
                    displayReviews(); 
                }
            });
        });
    }

    /**
 * 4. EVENT CLICK NAVIGASI
 */
$(document).on("click", "#main-nav a", function(e) {
    e.preventDefault();
    e.stopPropagation(); // Stop klik agar tidak tembus ke overlay

    let id = $(this).attr("id");
    
    // Update menu aktif
    $("#main-nav a").removeClass("active");
    $(this).addClass("active");

    // Load konten
    if (id) {
        let targetPage = id.replace("nav-", "") + ".html";
        if (targetPage !== ".html") {
            loadContent(targetPage);
        }
    }

    // Tutup menu otomatis setelah klik (untuk mobile)
    if (window.innerWidth <= 768) {
        toggleMenu(true); 
    }
});

// Event klik overlay untuk menutup menu jika user klik di area hitam
$(document).on('click', '#nav-overlay', function(e) {
    toggleMenu(true);
});
    // Halaman default saat load pertama kali
    loadContent("home.html");

    /**
     * 5. LOGIKA RATING & ULASAN
     */
    $(document).on("click", ".star", function() {
        let val = $(this).data("value");
        $("#rating-value").val(val);
        $(".star").removeClass("active");
        $(this).prevAll().addBack().addClass("active");
    });

    function displayReviews() {
        const $list = $("#reviews-list");
        if ($list.length === 0) return;

        const reviews = JSON.parse(localStorage.getItem("user_reviews")) || [];
        let html = reviews.length === 0 ? "<p style='color: var(--text-muted); text-align: center; padding: 20px;'>Belum ada ulasan.</p>" : "";
        
        reviews.forEach((item, index) => {
            let stars = "★".repeat(item.rating) + "☆".repeat(5 - item.rating);
            html += `
            <div class="review-item fade-in" style="border: 1px solid var(--border-color); background: var(--bg-card); padding: 20px; border-radius: 12px; margin-bottom: 15px; position: relative;">
                <span onclick="removeReview(${index})" style="position: absolute; top: 15px; right: 15px; color: #ef4444; cursor: pointer; font-size: 0.75rem; font-weight: 600;">HAPUS</span>
                <strong style="color: var(--text-main); font-size: 1rem;">${item.name}</strong>
                <div style="color: #f59e0b; margin: 5px 0; font-size: 1.1rem;">${stars}</div>
                <p style="color: var(--text-muted); font-size: 0.95rem; margin: 5px 0 0; line-height: 1.5;">${item.message}</p>
            </div>`;
        });
        $list.html(html);
    }

    window.removeReview = function(index) {
        if (confirm("Hapus ulasan ini?")) {
            let reviews = JSON.parse(localStorage.getItem("user_reviews")) || [];
            reviews.splice(index, 1);
            localStorage.setItem("user_reviews", JSON.stringify(reviews));
            displayReviews();
        }
    };

    /**
     * 6. VALIDASI & SUBMIT FORM
     */
    $(document).on("submit", "#contact-form", function(e) {
        e.preventDefault();
        const name = $("#name").val().trim();
        const email = $("#email").val().trim();
        const message = $("#message").val().trim();
        const rating = parseInt($("#rating-value").val());

        if (name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && message.length >= 5 && rating > 0) {
            const $btn = $("#btn-submit");
            const originalText = $btn.text();
            
            $btn.prop("disabled", true).text("Mengirim...");
            
            setTimeout(() => {
                let reviews = JSON.parse(localStorage.getItem("user_reviews")) || [];
                reviews.unshift({ name, message, rating });
                
                localStorage.setItem("user_reviews", JSON.stringify(reviews));
                localStorage.removeItem("contactDraft");
                
                $("#contact-form").trigger("reset");
                $(".star").removeClass("active");
                $("#rating-value").val(0);
                $("#success-alert").fadeIn().delay(3000).fadeOut();
                
                $btn.prop("disabled", false).text(originalText);
                displayReviews();
            }, 800);
        } else {
            alert("Harap lengkapi form dan pilih rating bintang!");
        }
    });

    /**
     * 7. AUTO-SAVE DRAFT & GITHUB API
     */
    $(document).on("input", "#name, #email, #message", function() {
        localStorage.setItem("contactDraft", JSON.stringify({
            name: $("#name").val(), 
            email: $("#email").val(), 
            message: $("#message").val()
        }));
    });

    function restoreFormData() {
        const savedData = JSON.parse(localStorage.getItem("contactDraft"));
        if (savedData) {
            $("#name").val(savedData.name); 
            $("#email").val(savedData.email); 
            $("#message").val(savedData.message);
        }
    }

    function fetchGitHubData() {
        const username = "dimas0124"; 
        const $profile = $("#github-profile");
        if ($profile.length === 0) return;

        $.get(`https://api.github.com/users/${username}`, function(user) {
            $("#gh-avatar").attr("src", user.avatar_url);
            $("#gh-name").text(user.name || user.login);
            $("#gh-username").text("@" + user.login);
            $("#gh-repos").text(user.public_repos);
            
            $.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`, function(repos) {
                let html = "";
                repos.forEach(repo => {
                    html += `
                    <div class="repo-item" style="border: 1px solid var(--border-color); padding: 18px; border-radius: 12px; margin-bottom: 12px; background: var(--bg-card); transition: 0.3s;">
                        <a href="${repo.html_url}" target="_blank" style="text-decoration:none; color:var(--primary); font-weight:700; font-size:1.1rem;">${repo.name}</a>
                        <p style="margin:8px 0 0; font-size:0.9rem; color: var(--text-muted); line-height:1.4;">${repo.description || "Proyek Akademik Mahasiswa"}</p>
                    </div>`;
                });
                $("#gh-repo-list").html(html);
                $("#github-loading").hide();
                $profile.fadeIn();
            });
        }).fail(function() {
            $("#github-loading").html("<p>Gagal mengambil data dari API GitHub.</p>");
        });
    }
});
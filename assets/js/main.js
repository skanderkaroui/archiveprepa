/*
	Astral by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var $window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$main = $('#main'),
		$panels = $main.children('.panel'),
		$nav = $('#nav'), $nav_links = $nav.children('a');

	// Breakpoints.
		breakpoints({
			xlarge:  [ '1281px',  '1680px' ],
			large:   [ '981px',   '1280px' ],
			medium:  [ '737px',   '980px'  ],
			small:   [ '361px',   '736px'  ],
			xsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load (make immediate).
		$window.on('load', function() {
			$body.removeClass('is-preload');
		});

	// Nav.
		$nav_links
			.on('click', function(event) {

				var $link = $(this);
				var href = $link.attr('href');

				// Ignore triggers that handle their own interactions (eg. search modal).
					if ($link.is('[data-search-target]') || !href || href === '#')
						return;

				// Not a panel link? Bail.
					if (href.charAt(0) != '#'
					||	$panels.filter(href).length == 0)
						return;

				// Prevent default.
					event.preventDefault();
					event.stopPropagation();

				// Change panels.
					if (window.location.hash != href)
						window.location.hash = href;

			});

	// Panels.

		// Initialize.
			(function() {

				var $panel, $link;

				// Get panel, link.
					if (window.location.hash) {

				 		$panel = $panels.filter(window.location.hash);
						$link = $nav_links.filter('[href="' + window.location.hash + '"]');

					}

				// No panel/link? Default to first.
					if (!$panel
					||	$panel.length == 0) {

						$panel = $panels.first();
						$link = $nav_links.first();

					}

				// Deactivate all panels except this one.
					$panels.not($panel)
						.addClass('inactive')
						.hide();

				// Activate link.
					$link
						.addClass('active');

				// Reset scroll.
					$window.scrollTop(0);

			})();

		// Hashchange event.
			$window.on('hashchange', function(event) {

				var $panel, $link;

				// Get panel, link.
					if (window.location.hash) {

				 		$panel = $panels.filter(window.location.hash);
						$link = $nav_links.filter('[href="' + window.location.hash + '"]');

						// No target panel? Bail.
							if ($panel.length == 0)
								return;

					}

				// No panel/link? Default to first.
					else {

						$panel = $panels.first();
						$link = $nav_links.first();

					}

				// Deactivate all panels.
					$panels.addClass('inactive');

				// Deactivate all links.
					$nav_links.removeClass('active');

				// Activate target link.
					$link.addClass('active');

				// Set max/min height.
					$main
						.css('max-height', $main.height() + 'px')
						.css('min-height', $main.height() + 'px');

				// Remove delay to speed up switching.
					(function() {

						// Hide all panels.
							$panels.hide();

						// Show target panel.
							$panel.show();

						// Set new max/min height.
							$main
								.css('max-height', $panel.outerHeight() + 'px')
								.css('min-height', $panel.outerHeight() + 'px');

						// Reset scroll.
							$window.scrollTop(0);

							// Remove secondary delay as well.
								(function() {

								// Activate target panel.
									$panel.removeClass('inactive');

								// Clear max/min height.
									$main
										.css('max-height', '')
										.css('min-height', '');

								// IE: Refresh.
									$window.triggerHandler('--refresh');

								// Unlock.
										locked = false;
								})();

						})();

			});

	// IE: Fixes.
		if (browser.name == 'ie') {

			// Fix min-height/flexbox.
				$window.on('--refresh', function() {

					$wrapper.css('height', 'auto');

					window.setTimeout(function() {

						var h = $wrapper.height(),
							wh = $window.height();

						if (h < wh)
							$wrapper.css('height', '100vh');

					}, 0);

				});

				$window.on('resize load', function() {
					$window.triggerHandler('--refresh');
				});

			// Fix intro pic.
				$('.panel.intro').each(function() {

					var $pic = $(this).children('.pic'),
						$img = $pic.children('img');

					$pic
						.css('background-image', 'url(' + $img.attr('src') + ')')
						.css('background-size', 'cover')
						.css('background-position', 'center');

					$img
						.css('visibility', 'hidden');

				});

		}


	// Page search modal.
		(function() {

			var $searchContainers = $('.page-search');

			var focusableSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1")]';
			var canUseNormalize = (typeof ''.normalize === 'function');

			function normalizeTerm(str) {
				var result = (str || '').toLowerCase();

				if (canUseNormalize)
					result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

				return result;
			}

		function escapeHtml(str) {
			return (str || '').replace(/[&<>"']/g, function(match) {
				switch (match) {
					case '&':
						return '&amp;';
						case '<':
							return '&lt;';
						case '>':
							return '&gt;';
						case '"':
							return '&quot;';
						default:
							return '&#39;';
					}
				});
			}

		var recentHistory = (function() {
			var storagePrefix = 'archiveprepa.history.';
			var historyLimit = 12;
			var memoryEntries = [];
			var slug = (function() {
				try {
					var path = window.location && window.location.pathname ? window.location.pathname : '';
					var match = path.match(/([\w-]+)\.html$/i);

					if (match && match[1])
						return match[1].toLowerCase();
				}
				catch (err) {
					// Ignore failures and fall back to default slug.
				}

				return 'index';
			})();
			var storageKey = storagePrefix + slug;
			var storageSupported = (function() {
				try {
					if (!('localStorage' in window))
						return false;

					var testKey = storagePrefix + 'support';
					window.localStorage.setItem(testKey, '1');
					window.localStorage.removeItem(testKey);

					return true;
				}
				catch (err) {
					return false;
				}
			})();

			function sanitizeHref(href) {
				if (!href)
					return '';

				if ($ && $.trim)
					return $.trim(href);

				return (href + '').trim();
			}

			function isTrackableHref(href) {
				if (!href)
					return false;

				var lower = href.toLowerCase();

				return lower !== '#' && lower.indexOf('javascript:') !== 0;
			}

			function cloneEntries(entries) {
				return entries.slice(0);
			}

			function loadEntries() {
				if (storageSupported) {
					try {
						var raw = window.localStorage.getItem(storageKey);

						if (!raw)
							return [];

						var parsed = JSON.parse(raw);

						if (Array.isArray(parsed))
							return parsed.filter(function(entry) {
								return entry && entry.href;
							});
					}
					catch (err) {
						storageSupported = false;
					}
				}

				return cloneEntries(memoryEntries);
			}

			function saveEntries(entries) {
				if (storageSupported) {
					try {
						window.localStorage.setItem(storageKey, JSON.stringify(entries));
						return;
					}
					catch (err) {
						storageSupported = false;
					}
				}

				memoryEntries = cloneEntries(entries);
			}

			function formatAbsoluteDate(timestamp) {
				if (!timestamp)
					return '';

				try {
					return new Date(timestamp).toLocaleString('fr-FR', {
						dateStyle: 'medium',
						timeStyle: 'short'
					});
				}
				catch (err) {
					return '';
				}
			}

			function escapeAttribute(str) {
				return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;');
			}

			function formatDayKey(timestamp) {
				if (!timestamp)
					return '';

				var date = new Date(timestamp);
				var y = date.getFullYear();
				var m = ('0' + (date.getMonth() + 1)).slice(-2);
				var d = ('0' + date.getDate()).slice(-2);

				return y + '-' + m + '-' + d;
			}

			function formatDayLabel(timestamp) {
				if (!timestamp)
					return '';

				var target = new Date(timestamp);
				var today = new Date();
				today.setHours(0, 0, 0, 0);

				var diffDays = Math.floor((today.getTime() - target.setHours(0, 0, 0, 0)) / 86400000);
				var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
				var label = new Date(timestamp).toLocaleDateString('fr-FR', options);

				if (diffDays === 0)
					return "Aujourd'hui — " + label;

				if (diffDays === 1)
					return 'Hier — ' + label;

				return label.charAt(0).toUpperCase() + label.slice(1);
			}

			function formatTimeLabel(timestamp) {
				if (!timestamp)
					return '';

				try {
					return new Date(timestamp).toLocaleTimeString('fr-FR', {
						hour: '2-digit',
						minute: '2-digit'
					});
				}
				catch (err) {
					return '';
				}
			}

			function ensureContainer() {
				var $home = $('#home.panel');

				if (!$home.length)
					$home = $('.panel.intro').first();

				if (!$home.length)
					return $();

				var containerId = 'recent-history-' + slug;
				var $container = $home.find('#' + containerId);

				if ($container.length)
					return $container;

				var containerHtml = '' +
					'<section class="panel-history" id="' + containerId + '" role="region" aria-label="Consultés récemment" data-history-container>' +
						'<div class="panel-history__header">' +
							'<h3 class="panel-history__title">Consultés récemment</h3>' +
							'<button type="button" class="panel-history__clear" data-history-clear>Effacer</button>' +
						'</div>' +
						'<div class="panel-history__selection" data-history-selection hidden>' +
							'<span class="panel-history__selection-label">Sélectionnés 0<span class="panel-history__selection-count" data-history-selection-count>0</span></span>' +
							'<div class="panel-history__selection-actions">' +
								'<button type="button" class="panel-history__select-open" data-history-open>Ouvrir</button>' +
								'<button type="button" class="panel-history__select-delete" data-history-delete>Supprimer</button>' +
							'</div>' +
						'</div>' +
						'<ul class="panel-history__list" data-history-list aria-live="polite"></ul>' +
						'<p class="panel-history__empty" data-history-empty>Aucun document consulté pour le moment.</p>' +
					'</section>';
				$container = $(containerHtml);

				var $header = $home.find('> header').first();

				if ($header.length)
					$header.append($container);
				else
					$home.prepend($container);

				$container.on('click', '[data-history-clear]', function(event) {
					event.preventDefault();
					clearHistory();
				});

				// Selection actions will be delegated later once selection logic is initialized.

				return $container;
			}

			function buildEntryRow(entry) {
				var label = escapeHtml(entry.label || entry.href || '');
				var contextText = entry.context ? escapeHtml(entry.context) : '';
				var timeLabel = formatTimeLabel(entry.viewedAt);
				var absoluteTime = entry.viewedAt ? formatAbsoluteDate(entry.viewedAt) : '';
				var hrefAttr = 'href="' + escapeAttribute(entry.href) + '"';
				var targetAttr = entry.target ? ' target="' + escapeAttribute(entry.target) + '"' : '';
				var relValue = entry.rel;

				if (!relValue && entry.target === '_blank')
					relValue = 'noopener noreferrer';

				var relAttr = relValue ? ' rel="' + escapeAttribute(relValue) + '"' : '';
				var linkTitle = absoluteTime ? ' title="' + escapeAttribute(entry.label + ' — ' + absoluteTime) + '"' : '';
				var metaHtml = contextText ? '<small class="panel-history__meta">' + contextText + '</small>' : '';
				var timeTitle = absoluteTime ? ' title="' + escapeAttribute(absoluteTime) + '"' : '';
				var timeHtml = timeLabel ? '<span class="panel-history__time"' + timeTitle + '>' + escapeHtml(timeLabel) + '</span>' : '<span class="panel-history__time"></span>';

				return '' +
					'<li class="panel-history__row" data-history-item data-href="' + escapeAttribute(entry.href) + '">' +
						'<label class="panel-history__select" aria-label="Sélectionner">' +
							'<input type="checkbox" class="panel-history__checkbox" data-history-select />' +
						'</label>' +
						timeHtml +
						'<span class="panel-history__entry">' +
							'<a class="panel-history__link" ' + hrefAttr + targetAttr + relAttr + linkTitle + '>' + label + '</a>' +
							metaHtml +
						'</span>' +
					'</li>';
			}

			function renderHistory() {
				var $container = ensureContainer();

				if (!$container.length)
					return;

				var entries = loadEntries();
				var $list = $container.find('[data-history-list]');
				var $empty = $container.find('[data-history-empty]');
				var $clear = $container.find('[data-history-clear]');

				if (!$list.length || !$empty.length)
					return;

				$list.empty();

				if (!entries.length) {
					$list.attr('hidden', 'hidden');
					$empty.removeAttr('hidden');

					if ($clear.length)
						$clear.attr('hidden', 'hidden');

					return;
				}

				var limitedEntries = entries.slice(0, historyLimit);
				var groups = [];
				var grouped = {};

				for (var i = 0; i < limitedEntries.length; i++) {
					var entry = limitedEntries[i];
					var key = formatDayKey(entry.viewedAt);
					var group = grouped[key];

					if (!group) {
						group = {
							label: formatDayLabel(entry.viewedAt),
							entries: []
						};
						grouped[key] = group;
						groups.push(group);
					}

					group.entries.push(entry);
				}

				var html = '';

				groups.forEach(function(group) {
					html += '<li class="panel-history__group">' +
						'<div class="panel-history__day">' + escapeHtml(group.label || '') + '</div>' +
						'<ul class="panel-history__rows">';

					for (var j = 0; j < group.entries.length; j++)
						html += buildEntryRow(group.entries[j]);

					html += '</ul></li>';
				});

				$list.html(html);
				$list.removeAttr('hidden');
				$empty.attr('hidden', 'hidden');

				initializeSelection($container);

				if ($clear.length)
					$clear.removeAttr('hidden');
			}
			function initializeSelection($container) {
				var $selectionBar = $container.find('[data-history-selection]');
				var $count = $container.find('[data-history-selection-count]');
				var selectedSet = Object.create(null);

				function getKeyFromItem($item) {
					return ($item && $item.attr('data-href')) || '';
				}

				function updateSelectionUI() {
					var keys = Object.keys(selectedSet).filter(function(k) { return !!selectedSet[k]; });
					var n = keys.length;

					if (n > 0) {
						$count.text(n);
						$selectionBar.removeAttr('hidden');
					} else {
						$count.text('0');
						$selectionBar.attr('hidden', 'hidden');
					}
				}

				$container.off('change.pagehistoryselect').on('change.pagehistoryselect', '[data-history-select]', function() {
					var $cb = $(this);
					var $item = $cb.closest('[data-history-item]');
					var key = getKeyFromItem($item);

					if (!key)
						return;

					if ($cb.is(':checked'))
						selectedSet[key] = true;
					else
						delete selectedSet[key];

					updateSelectionUI();
				});

				$container.off('click.pagehistoryopen').on('click.pagehistoryopen', '[data-history-open]', function(event) {
					event.preventDefault();
					var urls = Object.keys(selectedSet).filter(function(k) { return !!selectedSet[k]; });

					if (!urls.length)
						return;

					// Open each in a new tab/window.
					urls.forEach(function(u) {
						try { window.open(u, '_blank', 'noopener'); } catch (err) {}
					});
				});

				$container.off('click.pagehistorydelete').on('click.pagehistorydelete', '[data-history-delete]', function(event) {
					event.preventDefault();
					var urls = Object.keys(selectedSet).filter(function(k) { return !!selectedSet[k]; });

					if (!urls.length)
						return;

					var entries = loadEntries();
					var filtered = entries.filter(function(entry) {
						return entry && urls.indexOf(entry.href) === -1;
					});

					saveEntries(filtered);
					selectedSet = Object.create(null);
					renderHistory();
				});
			}

			function clearHistory() {
				saveEntries([]);
				renderHistory();
			}

			function truncateContent(str, maxLength) {
				if (!str)
					return '';

				if (str.length <= maxLength)
					return str;

				return str.substr(0, maxLength - 1) + '…';
			}

			function addEntry(entry) {
				if (!entry || !entry.href)
					return;

				var href = sanitizeHref(entry.href);

				if (!isTrackableHref(href))
					return;

				entry.href = href;
				entry.viewedAt = Date.now();
				entry.label = truncateContent(entry.label || entry.href, 180);
				entry.context = truncateContent(entry.context || '', 220);

				var entries = loadEntries();
				var filtered = entries.filter(function(existing) {
					return existing && existing.href !== href;
				});

				filtered.unshift(entry);

				if (filtered.length > historyLimit)
					filtered.length = historyLimit;

				saveEntries(filtered);
				renderHistory();
			}

			function entryFromLink($link) {
				if (!$link || !$link.length)
					return null;

				var href = sanitizeHref($link.attr('href'));

				if (!isTrackableHref(href))
					return null;

				var fromHistory = $link.closest('[data-history-container]').length > 0;
				var persisted = null;

				if (fromHistory) {
					var stored = loadEntries();

					for (var i = 0; i < stored.length; i++) {
						if (stored[i] && stored[i].href === href) {
							persisted = stored[i];
							break;
						}
					}
				}

				var text = persisted ? persisted.label : ($ && $.trim ? $.trim($link.text()) : ($link.text() || ''));
				var contextInfo = persisted ? null : buildContextInfo($link);
				var context = persisted ? (persisted.context || '') : (contextInfo.displayContext || contextInfo.panelDisplay || contextInfo.panelTitle || contextInfo.groupTitle || '');
				var target = persisted ? (persisted.target || '') : ($link.attr('target') || '');
				var rel = persisted ? (persisted.rel || '') : ($link.attr('rel') || '');
				var panelId = persisted ? (persisted.panelId || null) : (contextInfo.panelId || null);

				return {
					href: href,
					label: text || context || href,
					context: context,
					panelId: panelId,
					target: target,
					rel: rel
				};
			}

			function addFromLink($link) {
				var entry = entryFromLink($link);

				if (!entry)
					return;

				addEntry(entry);
			}

			return {
				render: renderHistory,
				addFromLink: addFromLink,
				clear: clearHistory,
				isActive: function() {
					return true;
				}
			};
		})();

		function clampColorValue(value, min, max) {
			if (isNaN(value))
				return min;

			return Math.min(max, Math.max(min, value));
		}

		function parseRgbColor(str) {
			if (!str)
				return null;

			var match = str.match(/rgba?\(([^)]+)\)/i);

			if (!match)
				return null;

			var parts = match[1].split(',');

			if (parts.length < 3)
				return null;

			var r = clampColorValue(parseFloat(parts[0]), 0, 255);
			var g = clampColorValue(parseFloat(parts[1]), 0, 255);
			var b = clampColorValue(parseFloat(parts[2]), 0, 255);
			var a = parts.length > 3 ? clampColorValue(parseFloat(parts[3]), 0, 1) : 1;

			return {
				r: Math.round(r),
				g: Math.round(g),
				b: Math.round(b),
				a: a
			};
		}

		function lightenColor(color, weight) {
			if (!color)
				return null;

			return {
				r: clampColorValue(Math.round(color.r + (255 - color.r) * weight), 0, 255),
				g: clampColorValue(Math.round(color.g + (255 - color.g) * weight), 0, 255),
				b: clampColorValue(Math.round(color.b + (255 - color.b) * weight), 0, 255),
				a: clampColorValue(color.a + (1 - color.a) * weight, 0, 1)
			};
		}

		function darkenColor(color, weight) {
			if (!color)
				return null;

			return {
				r: clampColorValue(Math.round(color.r * (1 - weight)), 0, 255),
				g: clampColorValue(Math.round(color.g * (1 - weight)), 0, 255),
				b: clampColorValue(Math.round(color.b * (1 - weight)), 0, 255),
				a: color.a
			};
		}

		function rgbaString(color, alphaOverride) {
			if (!color)
				return '';

			var alpha = typeof alphaOverride === 'number' ? alphaOverride : color.a;
			alpha = clampColorValue(alpha, 0, 1);

			return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + Math.round(alpha * 1000) / 1000 + ')';
		}

		function computeHighlightPalette() {
			var fallbackBg = 'rgba(244, 244, 244, 0.85)';
			var fallbackOutline = 'rgba(31, 41, 55, 0.18)';
			var palette = {
				background: fallbackBg,
				outline: fallbackOutline
			};

			try {
				var baseElement = $main.length ? $main.get(0) : null;
				var sourceColor = null;

				if (baseElement)
					sourceColor = window.getComputedStyle(baseElement).backgroundColor;

				if ((!sourceColor || sourceColor === 'rgba(0, 0, 0, 0)' || sourceColor === 'transparent') && $body.length)
					sourceColor = window.getComputedStyle($body.get(0)).backgroundColor;

				var parsed = parseRgbColor(sourceColor);

				if (parsed) {
					var bgColor = lightenColor(parsed, 0.42);
					var outlineColor = darkenColor(parsed, 0.55);

					if (bgColor)
						palette.background = rgbaString(bgColor, 0.94);

					if (outlineColor)
						palette.outline = rgbaString(outlineColor, 0.28);
				}
			}
			catch (err) {
				// Ignore failures and retain fallback colors.
			}

			return palette;
		}

		if (recentHistory && recentHistory.render)
			recentHistory.render();

		if (recentHistory && recentHistory.addFromLink && $main.length) {
			$main.on('click.pagehistory', 'a[href]', function() {
				var $link = $(this);

				if ($link.closest('.page-search').length)
					return;

				recentHistory.addFromLink($link);
			});
		}

		if ($searchContainers.length === 0)
			return;

		function highlightWordwise(text, normalizedTokens) {
			if (!normalizedTokens.length)
				return escapeHtml(text);

			return text.split(/(\s+)/).map(function(chunk) {
				if (!chunk.trim())
					return escapeHtml(chunk);

				var normalizedChunk = normalizeTerm(chunk);
				var matched = normalizedTokens.some(function(token) {
					return token && normalizedChunk.indexOf(token) !== -1;
				});

				return matched ? '<mark>' + escapeHtml(chunk) + '</mark>' : escapeHtml(chunk);
			}).join('');
		}

		function levenshteinDistance(a, b) {
			if (a === b)
				return 0;

			var alen = a ? a.length : 0;
			var blen = b ? b.length : 0;

			if (alen === 0)
				return blen;

			if (blen === 0)
				return alen;

			var prev = new Array(blen + 1);
			var curr = new Array(blen + 1);

			for (var j = 0; j <= blen; j++)
				prev[j] = j;

			for (var i = 1; i <= alen; i++) {
				curr[0] = i;
				var ca = a.charAt(i - 1);

				for (var k = 1; k <= blen; k++) {
					var cost = (ca === b.charAt(k - 1)) ? 0 : 1;
					var insertion = curr[k - 1] + 1;
					var deletion = prev[k] + 1;
					var substitution = prev[k - 1] + cost;
					var min = insertion < deletion ? insertion : deletion;

					if (substitution < min)
						min = substitution;

					curr[k] = min;
				}

				var tmp = prev;
				prev = curr;
				curr = tmp;
			}

			return prev[blen];
		}


		function buildContextInfo($link) {
			function formatLabel(str) {
				if (!str)
					return '';

					var lower = str.toLowerCase();

					return lower.replace(/\b\w/g, function(ch) {
						return ch.toUpperCase();
					});
				}

			var info = {
				panelId: null,
				panelTitle: '',
				groupTitle: '',
				panelDisplay: '',
				listTitles: [],
				displayContext: '',
				combined: ''
			};

				var $panel = $link.closest('article.panel');

				if ($panel.length) {
					info.panelId = $panel.attr('id') || null;
					var $panelHeader = $panel.find('> header');
					var panelTitle = '';

					if ($panelHeader.length) {
						var $firstHeading = $panelHeader.find('h1, h2, h3').first();

						if ($firstHeading.length)
							panelTitle = $.trim($firstHeading.text());
						else
							panelTitle = $.trim($panelHeader.text());
					}

					if (panelTitle) {
						info.panelTitle = panelTitle;
						info.panelDisplay = formatLabel(panelTitle);
					}
				}

				var $groupLabel = $link.closest('ul').prevAll('.menuh4').first();

				if (!$groupLabel.length)
					$groupLabel = $link.closest('div').prevAll('.menuh4').first();

				if ($groupLabel.length) {
					var groupText = $.trim($groupLabel.text());

					if (groupText)
						info.groupTitle = groupText;
				}

			var listTitles = [];

			$link.parents('li').each(function() {
				var $li = $(this);
				var $clone = $li.clone();

				$clone.find('ul,ol').remove();
				$clone.find('a').remove();
				$clone.find('.menuh4').remove();

				var labelText = $.trim($clone.text());

				if (labelText && labelText !== info.panelTitle && labelText !== info.groupTitle && listTitles.indexOf(labelText) === -1)
					listTitles.push(labelText);
			});

			if (listTitles.length)
				info.listTitles = listTitles;

			var parts = [];

			if (info.panelTitle)
				parts.push(info.panelTitle);

			if (info.groupTitle)
				parts.push(info.groupTitle);

			if (listTitles.length)
				Array.prototype.push.apply(parts, listTitles.slice().reverse());

			info.combined = parts.join(' ');

			var displayParts = [];

			if (info.panelDisplay)
				displayParts.push(info.panelDisplay);
			else if (info.panelTitle)
				displayParts.push(formatLabel(info.panelTitle));

			if (info.groupTitle)
				displayParts.push(formatLabel(info.groupTitle));

			if (listTitles.length) {
				listTitles.slice().reverse().forEach(function(title) {
					displayParts.push(formatLabel(title));
				});
			}

			if (displayParts.length)
				info.displayContext = displayParts.join(' • ');
			else
				info.displayContext = info.panelDisplay || '';

			return info;
		}

			$searchContainers.each(function() {

				var $container = $(this);
				var containerId = $container.attr('id');

				if (!containerId)
					return;

				var $trigger = $('[data-search-target="' + containerId + '"]');

				if ($trigger.length === 0)
					return;

				var namespace = '.pagesearch-' + containerId;
				var shortcutNamespace = '.pagesearch-shortcut-' + containerId;
				var $panel = $container.find('.page-search__panel');
				var $input = $container.find('.page-search__input');
				var $results = $container.find('.page-search__results');
				var highlightClass = 'search-highlight-target';
				var highlightTimeout = null;
				var $lastHighlight = $();
				var highlightPalette = computeHighlightPalette();
				var highlightDuration = 3200;
				var currentMatches = [];
				var activeIndex = -1;

				var items = buildIndex();
				var isOpen = false;
				var previousFocus = null;
				var debounceTimer = null;
				var hideTimer = null;

				function buildIndex() {
					var list = [];
					var seen = {};
					var $scope = $('#main');

					if ($scope.length === 0)
						$scope = $body;

					$scope.find('a[href]').each(function() {
						var $link = $(this);

						if ($link.closest('.page-search').length)
							return;

						var text = $.trim($link.text());
						var href = $link.attr('href');

						if (!text || !href)
							return;

						var key = normalizeTerm(text) + '|' + href;

						if (seen[key])
							return;

						seen[key] = true;

					var contextInfo = buildContextInfo($link);
					var normalizedText = normalizeTerm(text);
					var combinedContext = contextInfo.combined || '';
					var contextNormalized = normalizeTerm(combinedContext);
					var combinedNormalized = normalizedText;

					if (contextNormalized)
						combinedNormalized = normalizedText ? normalizedText + ' ' + contextNormalized : contextNormalized;

					var tokenMap = {};
					var searchTokens = [];
					combinedNormalized.split(/\s+/).forEach(function(token) {
						if (!token)
							return;

						if (!tokenMap[token]) {
							tokenMap[token] = true;
							searchTokens.push(token);
						}
					});

					var displayContext = contextInfo.displayContext || contextInfo.panelDisplay || contextInfo.panelTitle || contextInfo.groupTitle || '';

					list.push({
						text: text,
						href: href,
						panelId: contextInfo.panelId,
						panelTitle: contextInfo.panelTitle,
						groupTitle: contextInfo.groupTitle,
						listTitles: contextInfo.listTitles,
						displayContext: displayContext,
						normalized: normalizedText,
						contextNormalized: contextNormalized,
						combinedNormalized: combinedNormalized,
						searchTokens: searchTokens,
						element: this
					});
					});

					return list;
				}

				function applyHighlightStyles($element) {
					if (!$element || !$element.length)
						return;

					if (highlightPalette && highlightPalette.background)
						$element.css('--search-highlight-color', highlightPalette.background);

					if (highlightPalette && highlightPalette.outline)
						$element.css('--search-highlight-outline', highlightPalette.outline);
				}

				function clearHighlightStyles($element) {
					if (!$element || !$element.length)
						return;

					$element.css('--search-highlight-color', '');
					$element.css('--search-highlight-outline', '');
				}

				function showIdleMessage() {
					window.clearTimeout(debounceTimer);
					currentMatches = [];
					setActiveResult(-1);
					$results.empty();
				}

			function performSearch(rawQuery) {
				var query = (rawQuery || '').trim();

				if (!query) {
					showIdleMessage();
					return;
				}

				var tokens = query.split(/\s+/).filter(function(token) {
					return token.length > 0;
				});
				var normalizedTokens = tokens.map(normalizeTerm);
				var matches = [];

				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					var haystack = item.combinedNormalized || item.normalized;
					var matched = true;
					var fuzzyPenalty = 0;
					var hadDirectMatch = false;

					for (var t = 0; t < normalizedTokens.length; t++) {
						var token = normalizedTokens[t];

						if (!token)
							continue;

						var tokenIndex = haystack.indexOf(token);

						if (tokenIndex !== -1) {
							hadDirectMatch = true;
							continue;
						}

						var bestDistance = Infinity;
						var bestCandidateLength = 0;
						var candidates = item.searchTokens && item.searchTokens.length ? item.searchTokens : [];

						for (var c = 0; c < candidates.length; c++) {
							var candidate = candidates[c];

							if (!candidate)
								continue;

							var distance = levenshteinDistance(token, candidate);

							if (distance < bestDistance) {
								bestDistance = distance;
								bestCandidateLength = candidate.length;

								if (bestDistance === 0)
									break;
							}
						}

						var maxEdits = token.length <= 4 ? 1 : 2;

						if (bestDistance <= maxEdits) {
							var lengthDelta = Math.abs(bestCandidateLength - token.length);
							fuzzyPenalty += 220 + (bestDistance * 120) + (lengthDelta * 10);
						} else {
							matched = false;
							break;
						}
					}

					if (matched) {
						var firstToken = normalizedTokens[0] || '';
						var primaryIndex = firstToken ? haystack.indexOf(firstToken) : 0;

						if (primaryIndex === -1)
							primaryIndex = 2000;

						if (!hadDirectMatch && primaryIndex < 2000)
							primaryIndex += 400;

						var score = primaryIndex + (item.text.length / 300) + fuzzyPenalty;

						matches.push({
							itemIndex: i,
							score: score
						});
					}
				}

					matches.sort(function(a, b) {
						return a.score - b.score;
					});

					if (matches.length === 0) {
						showIdleMessage();
						return;
					}

					var limit = Math.min(matches.length, 40);
					var frag = '';
					currentMatches = [];

					for (var n = 0; n < limit; n++) {
						var matchIndex = matches[n].itemIndex;
						var matchItem = items[matchIndex];
						var textHtml = highlightWordwise(matchItem.text, normalizedTokens);
						var contextHtml = '';

						if (matchItem.displayContext)
							contextHtml = '<span class="page-search__context">' + escapeHtml(matchItem.displayContext) + '</span>';

						frag += '<li class="page-search__result" role="option" data-match-index="' + matchIndex + '" data-result-pos="' + n + '">' +
							'<button type="button" class="page-search__result-btn">' +
								'<span class="page-search__label">' + textHtml + '</span>' + contextHtml +
							'</button>' +
						'</li>';

						currentMatches.push(matchIndex);
					}

					$results.html(frag);
					$results.scrollTop(0);
					if (currentMatches.length)
						setActiveResult(0);
					else
						setActiveResult(-1);
				}

				function setActiveResult(index) {
					if (activeIndex === index)
						return;

					var $prev = $results.find('.page-search__result.is-active');
					if ($prev.length)
						$prev.removeClass('is-active');

					activeIndex = -1;

					if (index < 0 || index >= currentMatches.length)
						return;

					var $candidate = $results.find('.page-search__result[data-result-pos="' + index + '"]');

					if (!$candidate.length)
						return;

					$candidate.addClass('is-active');
					activeIndex = index;
					ensureActiveVisible();
				}

				function ensureActiveVisible() {
					if (activeIndex < 0)
						return;

					var $active = $results.find('.page-search__result[data-result-pos="' + activeIndex + '"]');

					if (!$active.length)
						return;

					var container = $results.get(0);

					if (!container)
						return;

					var activeTop = $active.get(0).offsetTop;
					var activeBottom = activeTop + $active.outerHeight();
					var viewTop = container.scrollTop;
					var viewBottom = viewTop + container.clientHeight;

					if (activeTop < viewTop)
						container.scrollTop = activeTop;
					else if (activeBottom > viewBottom)
						container.scrollTop = activeBottom - container.clientHeight;
				}

				function focusResultTarget(item) {
					if (!item)
						return;

					closeModal(false);
					setActiveResult(-1);

					var panelId = item.panelId;
					var targetHash = panelId ? '#' + panelId : null;

					var executeScroll = function() {
						var $link = $(item.element);
						var $target = $link.closest('li');

						if ($target.length === 0)
							$target = $link;

						if (highlightTimeout)
							window.clearTimeout(highlightTimeout);

						if ($lastHighlight.length) {
							clearHighlightStyles($lastHighlight);
							$lastHighlight.removeClass(highlightClass);
						}

						var offset = $target.offset();

						if (offset)
							$('html, body').animate({ scrollTop: Math.max(offset.top - 80, 0) }, 300);

						applyHighlightStyles($target);
						$target.addClass(highlightClass);
						$lastHighlight = $target;

						highlightTimeout = window.setTimeout(function() {
							$target.removeClass(highlightClass);
							clearHighlightStyles($target);
							$lastHighlight = $();
							highlightTimeout = null;
						}, highlightDuration);

						$link.trigger('focus');
					};

					var delay = 120;

					if (targetHash && window.location.hash !== targetHash) {
						window.location.hash = targetHash;
						delay = 260;
					}

					window.setTimeout(executeScroll, delay);
				}

				function openModal() {
					if (isOpen)
						return;

					window.clearTimeout(hideTimer);
					isOpen = true;
					previousFocus = document.activeElement;

					$container.removeAttr('hidden');
					if (window.requestAnimationFrame)
						window.requestAnimationFrame(function() {
							$container.addClass('is-visible');
						});
					else
						$container.addClass('is-visible');

					$body.addClass('is-search-open');

					$(document)
						.on('keydown' + namespace, handleKeydown)
						.on('mousedown' + namespace, handleOutsideMouseDown);

					window.setTimeout(function() {
						$input.trigger('focus');
					}, 10);

					var existingQuery = ($input.val() || '').trim();

					if (existingQuery.length)
						performSearch(existingQuery);
					else
						showIdleMessage();
				}

				function closeModal(restoreFocus) {
					if (!isOpen)
						return;

					isOpen = false;
					setActiveResult(-1);
					$container.removeClass('is-visible');
					$body.removeClass('is-search-open');

					$(document)
						.off('keydown' + namespace, handleKeydown)
						.off('mousedown' + namespace, handleOutsideMouseDown);

					hideTimer = window.setTimeout(function() {
						if (!isOpen)
							$container.attr('hidden', 'hidden');
					}, 260);

					if (restoreFocus !== false && previousFocus)
						$(previousFocus).trigger('focus');
				}

				function handleKeydown(event) {
					if (!isOpen)
						return;

					var key = event.key || event.originalEvent && event.originalEvent.key;
					var keyCode = event.keyCode;

					if (key === 'Escape' || keyCode === 27) {
						event.preventDefault();
						closeModal();
						return;
					}

					if (key === 'Tab' || keyCode === 9) {
						var $focusables = $panel.find(focusableSelector).filter(':visible');

						if ($focusables.length === 0)
							return;

						var first = $focusables.get(0);
						var last = $focusables.get($focusables.length - 1);

						if (event.shiftKey) {
							if (event.target === first) {
								event.preventDefault();
								last.focus();
							}
						}

						else if (event.target === last) {
							event.preventDefault();
							first.focus();
						}
					}
				}

				function handleOutsideMouseDown(event) {
					if (!isOpen)
						return;

					var $target = $(event.target);

					if ($target.closest('.page-search__panel').length === 0 && $target.closest('[data-search-target="' + containerId + '"]').length === 0)
						closeModal();
				}

				$trigger.on('click' + namespace, function(event) {
					event.preventDefault();
					openModal();
				});

				$trigger.on('keydown' + namespace, function(event) {
					var key = event.key || event.originalEvent && event.originalEvent.key;
					var keyCode = event.keyCode;

					if (key === 'Enter' || keyCode === 13 || key === ' ' || keyCode === 32) {
						event.preventDefault();
						openModal();
					}
				});

				$container.on('click' + namespace, '[data-search-close]', function(event) {
					event.preventDefault();
					closeModal();
				});

				$input.on('input' + namespace, function() {
					var value = $input.val();

					window.clearTimeout(debounceTimer);
					debounceTimer = window.setTimeout(function() {
						performSearch(value);
					}, 80);
				});

				$input.on('keydown' + namespace, function(event) {
					var key = event.key || event.originalEvent && event.originalEvent.key;
					var keyCode = event.keyCode;

					if ((key === 'ArrowDown' || keyCode === 40) && currentMatches.length) {
						event.preventDefault();
						var next = activeIndex >= 0 ? (activeIndex + 1) % currentMatches.length : 0;
						setActiveResult(next);
					}

					else if ((key === 'ArrowUp' || keyCode === 38) && currentMatches.length) {
						event.preventDefault();
						var prev = activeIndex <= 0 ? currentMatches.length - 1 : activeIndex - 1;
						setActiveResult(prev);
					}

					else if (key === 'Enter' || keyCode === 13) {
						if (activeIndex >= 0 && currentMatches[activeIndex] != null) {
							event.preventDefault();
							focusResultTarget(items[currentMatches[activeIndex]]);
						}
					}
				});

				$results.on('keydown' + namespace, '.page-search__result-btn', function(event) {
					var key = event.key || event.originalEvent && event.originalEvent.key;
					var keyCode = event.keyCode;
					var $buttons = $results.find('.page-search__result-btn');
					var index = $buttons.index(this);

					if (index !== -1)
						setActiveResult(index);

					if (key === 'ArrowDown' || keyCode === 40) {
						event.preventDefault();
						var $next = $buttons.eq((index + 1) % $buttons.length);
						$next.trigger('focus');
					}

					else if (key === 'ArrowUp' || keyCode === 38) {
						event.preventDefault();

						if (index === 0)
							$input.trigger('focus');

						else
							$buttons.eq(index - 1).trigger('focus');
					}
				});

				$results.on('click' + namespace, '.page-search__result-btn', function(event) {
					event.preventDefault();

					var $item = $(this).closest('.page-search__result');
					var matchIndex = parseInt($item.attr('data-match-index'), 10);
					var pos = parseInt($item.attr('data-result-pos'), 10);

					if (!isNaN(pos))
						setActiveResult(pos);

					if (isNaN(matchIndex))
						return;

					var targetItem = items[matchIndex];

					focusResultTarget(targetItem);
				});

				$results.on('focus' + namespace, '.page-search__result-btn', function() {
					var $item = $(this).closest('.page-search__result');
					var pos = parseInt($item.attr('data-result-pos'), 10);

					if (!isNaN(pos))
						setActiveResult(pos);
				});

				$(document).on('keydown' + shortcutNamespace, function(event) {
					if (event.defaultPrevented)
						return;

					var key = event.key || event.originalEvent && event.originalEvent.key;

					if (!key)
						return;

					if ((event.metaKey || event.ctrlKey) && !event.altKey && key.toLowerCase() === 'k') {
						event.preventDefault();

						if (isOpen)
							$input.trigger('focus');
						else
							openModal();
					}
				});

				showIdleMessage();
			});

		})();

})(jQuery);

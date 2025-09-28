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

			if ($searchContainers.length === 0)
				return;

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

				var parts = [];

				if (info.panelTitle)
					parts.push(info.panelTitle);

				if (info.groupTitle)
					parts.push(info.groupTitle);

				info.combined = parts.join(' • ');

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

						list.push({
							text: text,
							href: href,
							panelId: contextInfo.panelId,
							panelTitle: contextInfo.panelTitle,
							groupTitle: contextInfo.groupTitle,
							displayContext: contextInfo.panelDisplay || contextInfo.panelTitle || contextInfo.groupTitle,
							normalized: normalizeTerm(text),
							contextNormalized: normalizeTerm(contextInfo.combined),
							element: this
						});
					});

					return list;
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
						var matched = true;

						for (var t = 0; t < normalizedTokens.length; t++) {
							var token = normalizedTokens[t];

							if (!token)
								continue;

							if (item.normalized.indexOf(token) === -1 && item.contextNormalized.indexOf(token) === -1) {
								matched = false;
								break;
							}
						}

						if (matched) {
							var firstToken = normalizedTokens[0] || '';
							var primaryIndex = firstToken ? item.normalized.indexOf(firstToken) : 0;

							if (primaryIndex === -1 && firstToken)
								primaryIndex = item.contextNormalized.indexOf(firstToken);

							if (primaryIndex === -1)
								primaryIndex = 2000;

							matches.push({
								itemIndex: i,
								score: primaryIndex + (item.text.length / 300)
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

						if ($lastHighlight.length)
							$lastHighlight.removeClass(highlightClass);

						var offset = $target.offset();

						if (offset)
							$('html, body').animate({ scrollTop: Math.max(offset.top - 80, 0) }, 300);

						$target.addClass(highlightClass);
						$lastHighlight = $target;

						highlightTimeout = window.setTimeout(function() {
							$target.removeClass(highlightClass);
							$lastHighlight = $();
						}, 1800);

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

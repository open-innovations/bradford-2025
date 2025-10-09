// sourcery skip: use-braces
/**
 * Inclusive Components Progressive Enhancement for the `toggle-section` tag.
 * 
 * Based on https://inclusive-components.design/collapsible-sections/
 * 
 * Create the following HTML, including a class `toggle-section`
 * 
 * ```
 * <div class="toggle-section">
 *	<h2>Section Title</h2>
 *	<p>Some content</p>
 *	<p>Some more content</p>
 * </div>
 * ```
 * 
 * This will be enhanced with a button which enables expansion, and wraps everything but the first element
 * in a div which will be collapsed.
 * 
 * Base styling for this is kept in `_includes/css/inclusive.css`.
 */
function initialiseToggleSections() {
	// Find all the toggle-section elements
	const toggleSections = document.querySelectorAll('.toggle-section');
	
	// Iterate through each one
	Array.prototype.forEach.call(toggleSections, toggleSection => {
		// Find the heading
		const heading = toggleSection.firstElementChild;
		// TODO Check if heading is a heading?

		// find classes
		const classes = Array.from<string>(toggleSection.classList).filter(x => x !== 'toggle-section');
		
		// Update the innerHTML with a button and SVG indicator
		heading.innerHTML = `<button aria-expanded="false">
		${heading.textContent}
		<svg aria-hidden="true" focusable="false" viewBox="0 0 10 10">
		<rect class="vert" height="8" width="2" y="1" x="4"/>
		<rect height="2" width="8" y="4" x="1"/>
		</svg>`;
		
		// Create a div to contain the hideable stuff
		const container = document.createElement('div');
		container.classList.add(...classes);
		// ...and set it to hidden
		container.hidden = true;
		// ...and append it as the last child of the toggleSection
		toggleSection.appendChild(container);
		
		// Iterate endlessly...
		while(true) {
			// Get the sibling directly after the heading
			const el = heading.nextElementSibling;
			// If we've got the container, then we're done, so break out of the loop
			if (el === container) break;
			// Otherwise append that element to the container
			container.appendChild(toggleSection.firstElementChild.nextElementSibling);
		}
		
		// Grab the button
		const btn = heading.querySelector('button');
		
		// Attach an onclick handler
		btn.onclick = () => {
			// Get the state of the aria-expanded property
			const expanded = btn.getAttribute('aria-expanded') === 'true' || false;
			// Flip the polarity of the aria-expanded property
			btn.setAttribute('aria-expanded', !expanded);
			// And set the hidden status of the container
			container.hidden = expanded;
		}
	})
}

/**
 * Inclusive Components Progressive Enhancement for the `tab-set` tag.
 * 
 * Based on https://inclusive-components.design/tabbed-interfaces/
 * 
 * Create the following HTML, including an undefined custom tag `toggle-section`
 * 
 * ```
 * <tab-set>
 *	<ul>
 *		<li><a href="#section1">Section 1</a></li>
 *	</ul>
 *	<section id="section1">
 *		...Content to show...
 *	</section>
 * </tab-set>
 * ```
 * 
 * Base styling for this is kept in `_includes/css/inclusive.css`.
 */

function initialiseTabSet() {
	let tabsets = new TabSets(document.querySelectorAll('tab-set'));
}

/* Updated by Stuart Lowe (2025-10-09) to process history states */
function TabSets(listOfTabbed){
	
	var idcontroller = {};
	var list = new Array(listOfTabbed.length);

	function handleDeepLink(i) {
		var hash = window.location.hash;
		// If we've found the tab we switch to it
		if(hash in idcontroller){
			idcontroller[hash].TabSet.selectTab(idcontroller[hash].index)
		}else{
			if(typeof i==="number" || !hash){
				// Loop over each TabSet and set the first tab
				for(let l = 0; l < list.length; l++) list[l].selectTab(i);
			}
		}
	}

	listOfTabbed.forEach((tabbed, i) => {
		list[i] = new TabSet(tabbed,idcontroller);
	});

	addEventListener('popstate', handleDeepLink);

	handleDeepLink();

	return this;
}
function TabSet(tabbed,idcontroller) {

	let tabId = -1;
	let _default = tabbed.getAttribute('data-default')||0;

	// Get the tablist
	const tablist = tabbed.querySelector('ul');
	// If it's not there, do nothing else!
	if (!tablist) return;

	// Add the tablist role to the first <ul> in the .tabbed container
	tablist.setAttribute('role', 'tablist');

	// Get all the tabs
	const tabs = tablist.querySelectorAll('a');
	// Get all the panels
	const panels = tabbed.querySelectorAll<HTMLElement>('section[data-tab-label]');

	// The tab switching function
	const switchTab = (oldTab: HTMLElement, newTab: HTMLElement) => {
		if(newTab){
			newTab.focus();
			// Make the active tab focusable by the user (Tab key)
			newTab.removeAttribute('tabindex');
			// Set the selected state
			newTab.setAttribute('aria-selected', 'true');
			// Get the indices of the new and old tabs to find the correct
			// tab panels to show and hide
			const index = Array.prototype.indexOf.call(tabs, newTab);
			panels[index].hidden = false;
			tabId = index;
		}
		if(oldTab && oldTab!=newTab){
			oldTab.removeAttribute('aria-selected');
			oldTab.setAttribute('tabindex', '-1');
			const oldIndex = Array.prototype.indexOf.call(tabs, oldTab);
			panels[oldIndex].hidden = true;
		}
	}

	// Add semantics are remove user focusability for each tab
	tabs.forEach((tab, i) => {
		let hash = tab.getAttribute('href');
		if(hash in idcontroller){
			console.warn("There is already a tab with the ID "+hash);
		}else{
			// Update our controller
			idcontroller[hash] = {'tab':tab,'TabSet': this,'index':i};
		}

		tab.setAttribute('role', 'tab');
		tab.setAttribute('id', 'tab' + i);
		tab.setAttribute('tabindex', '-1');
		(tab.parentNode! as HTMLElement).setAttribute('role', 'presentation');

		// Handle clicking of tabs for mouse users
		tab.addEventListener('click', e => {
			e.preventDefault();
			const currentTab = tablist.querySelector<HTMLElement>('[aria-selected]');
			if (currentTab && e.currentTarget && (e.currentTarget !== currentTab)) {
				switchTab(currentTab, e.currentTarget as HTMLElement);
				// Set the window location
				const newHash = new URL((e.currentTarget as HTMLAnchorElement).href).hash;
				if (history.pushState) history.pushState(null, null, newHash);
				else window.location.hash = newHash;
			}

		});

		// Handle keydown events for keyboard users
		tab.addEventListener('keydown', (e) => {
			// Get the index of the current tab in the tabs node list
			const index = Array.prototype.indexOf.call(tabs, e.currentTarget);
			// Work out which key the user is pressing and
			// Calculate the new tab's index where appropriate
			const dir = e.which === 37 ? index - 1 : e.which === 39 ? index + 1 : e.which === 40 ? 'down' : null;
			if (e.currentTarget && dir !== null) {
				e.preventDefault();
				// If the down key is pressed, move focus to the open panel,
				// otherwise switch to the adjacent tab
				dir === 'down' ? panels[i].focus() : tabs[dir] ? switchTab(e.currentTarget as HTMLElement, tabs[dir]) : void 0;
			}
		});
	});

	// Add tab panel semantics and hide them all
	panels.forEach((panel, i) => {
		panel.setAttribute('role', 'tabpanel');
		panel.setAttribute('tabindex', '-1');
		panel.setAttribute('aria-labelledby', tabs[i].id);
		panel.hidden = true;
	});

	this.selectTab = function(t){
		if(typeof t!=="number") t = _default;
		switchTab((tabId < 0 ? null : tabs[tabId]),tabs[t]);
		if(tabs[t]) tabs[t].scrollTo();
		return this;
	};
	
	return this;
}


addEventListener('DOMContentLoaded', () => {
	initialiseToggleSections();
	initialiseTabSet();
})
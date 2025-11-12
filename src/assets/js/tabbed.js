/*
	Open Innovations Tabbed Interface v0.3
	Helper function that finds <tabbed> elements then
	looks for elements with role="pane" and role="tab" within them
*/
(function(root){

	if(!root.OI) root.OI = {};
	if(!root.OI.ready){
		root.OI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}
	var idcontroller = {};

	function TabbedInterface(el){

		var tabs,panes,li,p,h,b,l;
		var scrolloffset = 0;
		var class_on = el.getAttribute('class-on')||"";
		var class_off = el.getAttribute('class-off')||"";

		this.selectTab = function(t,focusIt,updateHistory){
			var tab,pane;
			tab = tabs[t].tab;
			pane = tabs[t].pane;

			// Remove existing selection and set all tabindex values to -1
			el.querySelectorAll('[role=tab]').forEach(function(el){
				el.removeAttribute('aria-selected');
				el.setAttribute('tabindex',-1);
				if(class_on) el.classList.remove(class_on);
				if(class_off) el.classList.add(class_off);
			});

			// Update the selected tab
			tab.setAttribute('aria-selected','true');
			tab.setAttribute('tabindex',0);
			if(class_off) tab.classList.remove(class_off);
			if(class_on) tab.classList.add(class_on);
			if(focusIt) tab.focus();

			panes.forEach(function(el){
				if(el!=pane){
					el.style.display = "none";
					el.setAttribute('hidden',true);
				}
			});
			pane.style.display = "";
			pane.removeAttribute('hidden');
			// Update the leaflet map visibility
			if("ZoomableMap" in OI){
				var maps = OI.ZoomableMap.get();
				for(var m in maps){
					if(pane.contains(maps[m].map._container)) maps[m].updateVisible();
				}
			}
			if(updateHistory){
				// Set the window location
				if (history.pushState) history.pushState(null, null, tab.href);
				else window.location.hash = tab.href;
			}
			return this;
		};
		this.enableTab = function(tab,t){
			var _obj = this;

			// Set the tabindex of the tab panel
			if(panes[t]) panes[t].setAttribute('tabindex',0);

			if(panes[t].hasAttribute('id')){
				// Move the ID to the tab rather than the pane
				var id = panes[t].getAttribute('id');
				tab.setAttribute('id',id);
				panes[t].removeAttribute('id');
				tab.style.scrollMarginTop = scrolloffset + 'px';
				idcontroller[id] = {'interface':this,'tab':t};
			}
			
			// Add a click/focus event
			tab.addEventListener('focus',function(e){ e.preventDefault(); var t = parseInt(e.target.getAttribute('data-tab')); _obj.selectTab(t,true,true); });

			// Store the tab number in the tab (for use in the keydown event)
			tab.setAttribute('data-tab',t);

			// Add keyboard navigation to arrow keys following https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Tab_Role
			tab.addEventListener('keydown',function(e){

				// Get the tab number from the attribute we set
				t = parseInt(e.target.getAttribute('data-tab'));

				if(e.keyCode === 39 || e.keyCode === 40){
					e.preventDefault();
					// Move right or down
					t++;
					if(t >= tabs.length) t = 0;
					_obj.selectTab(t,true,true);
				}else if(e.keyCode === 37 || e.keyCode === 38){
					e.preventDefault();
					// Move left or up
					t--;
					if(t < 0) t = tabs.length-1;
					_obj.selectTab(t,true,true);
				}
			});
		};
		tabs = [];
		panes = el.querySelectorAll('[role=tabpanel]');

		if(el.querySelector('[role=tablist]')){
			var ttabs = el.querySelectorAll('[role=tab]');
			for(p = 0; p < ttabs.length; p++) tabs[p] = {'tab':ttabs[p],'pane':panes[p]};
		}else{
			l = document.createElement('div');
			l.classList.add('tabs');
			l.setAttribute('role','tablist');
			l.setAttribute('aria-label','Visualisations');
			for(p = 0; p < panes.length; p++){
				h = panes[p].querySelector('.tab-title');
				b = document.createElement('a');
				b.classList.add('tab');
				b.setAttribute('role','tab');
				b.setAttribute('href','#')
				if(h) b.appendChild(h);
				l.appendChild(b);
				tabs[p] = {'tab':b,'pane':panes[p]};
			}
			el.prepend(l);
		}
		// Enable the tabs
		for(let t = 0; t < tabs.length; t++) this.enableTab(tabs[t].tab,t);
		this.selectTab(0,false,false);

		return this;
	}
	root.OI.TabbedInterface = function(el){ return new TabbedInterface(el); };

	// Find any remaining `pane` on the page with an ID set
	root.OI.UpdateIDs = function(){

		var ids = document.querySelectorAll('.pane[id]');
		var scrolloffset = 0;

		for(var i = 0; i < ids.length; i++){
			var id = ids[i].getAttribute('id');
			if(!idcontroller[id]){
				idcontroller[id] = {};
				ids[i].style.scrollMarginTop = scrolloffset + 'px';
			}
		}

	}

	// Need to intercept and process initial hash and any changes	
	addEventListener('popstate', function(e){ OI.Anchor(e.target.location.hash.substr(1,)); });
	root.OI.Anchor = function(a){
		if(typeof idcontroller[a]==="object"){
			if(idcontroller[a].interface) idcontroller[a].interface.selectTab(idcontroller[a].tab,false,false);
		}
	}


})(window || this);

OI.ready(function(){
	var tabbed = document.querySelectorAll('tabbed');
	for(var i = 0; i < tabbed.length; i++) OI.TabbedInterface(tabbed[i]);

	OI.UpdateIDs();

	// Now that we've updated our IDs/scroll-offsets we can process the location hash to trigger the correct tab
	OI.Anchor(location.hash.substr(1,));
});
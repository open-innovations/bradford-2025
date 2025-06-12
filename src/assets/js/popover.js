(function(root){

	const POPOVER_PARAM = 'infobox';
	if(!root.OI) root.OI = {};
	if(!root.OI.ready){
		root.OI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}

	function showOnLoad(id){
		if (!id) false;
		const params = new URLSearchParams(globalThis.location.search);
		if(params.get(POPOVER_PARAM)) return params.get(POPOVER_PARAM)==id;
		return false;
	}
	function addToLocation(id){
		if (!id) return;
		const url = new URL(globalThis.location.toString())
		url.searchParams.set(POPOVER_PARAM, id)
		globalThis.history.pushState(null, '', url.toString());
	}
	function removeFromLocation(id){
		if (!id) return;
		const url = new URL(globalThis.location.toString())
		url.searchParams.delete(POPOVER_PARAM, id)
		globalThis.history.pushState(null, '', url.toString());
	}

	/* Create an individual popover */
	function Popover(popover,btnHide,main){
		const _obj = this;

		// Get the button that will show the popover
		const btnShow = popover.querySelector('button.show');
		if(btnShow) btnShow.addEventListener('click', function(){ _obj.show(); });

		const clonedContent = document.createElement('div');
		clonedContent.classList.add('content-area');
		clonedContent.innerHTML = popover.querySelector('div.popover-content').innerHTML;

		this.getID = function(){
			return popover.getAttribute('data-'+POPOVER_PARAM+'-id');
		};

		this.show = function(noupdatehistory){
			const popup = main.getPopup();
			popup.showModal();
			popup.innerHTML = "";
			popup.appendChild(btnHide);
			popup.appendChild(clonedContent);
			main.active = this;
			if(popover.dataset.infoboxId){
				if(!noupdatehistory) addToLocation(popover.dataset.infoboxId);
			}
			btnHide.focus();
			return this;
		};

		this.hide = function(noupdatehistory){
			const popup = main.getPopup();
			popup.close();
			if(popup.contains(btnHide)){
				popup.removeChild(btnHide);
				btnShow.focus();
				main.active = null;
			}
			if(!noupdatehistory) removeFromLocation(popover.dataset.infoboxId);
			return this;
		};

		if (showOnLoad(popover.dataset.infoboxId)) this.show(true);

		return this;
	}

	function Popovers(){
		var list = [];
		var _obj = this;

		// Create the close button (we only need one)
		const btnHide = document.createElement('button');
		btnHide.classList.add('hide', 'icon');
		btnHide.innerHTML = `<svg viewBox="0 0 10 10"><path d="M2 2 L8 8 M2 8 L8 2" stroke="currentColor" stroke-width="2px"></svg>`;
		btnHide.addEventListener('click',function(e){ _obj.hide(); });

		// Create the popup <dialog> if it doesn't exist
		let popup = document.querySelector('dialog');
		if(!document.querySelector('dialog')){
			popup = document.createElement('dialog');
			popup.removeAttribute('open');
			document.body.appendChild(popup);
		}
		popup.dataset.comp = "ActivePopover";
		// Add events to close the <dialog>
		popup.addEventListener('click',function(event){
			var rect = popup.getBoundingClientRect();
			var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
			rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
			if(!isInDialog) _obj.hide();
		});
		popup.addEventListener('keydown',function(event){
			if(event.key === 'Escape'){
				event.preventDefault();
				_obj.hide();
			}
		});
		this.getPopup = function(){ return popup; }

		// Create a new popover
		this.add = function(popover){
			list.push(new Popover(popover,btnHide,this));
			return this;
		};

		// Hide the active popover
		this.hide = function(noupdatehistory){
			if(this.active) this.active.hide(noupdatehistory);
			return this;
		};

		this.show = function(id,noupdatehistory){
			let match = -1;
			for(let i = 0; i < list.length; i++){
				if(list[i].getID()==id) match = i;
			}
			if(match >= 0) list[match].show(noupdatehistory);
			return this;
		};

		this.getIDFromURL = function(){
			const params = new URLSearchParams(globalThis.location.search);
			return params.get(POPOVER_PARAM)||"";
		};

		// Add event to history (back button)
		window.addEventListener("popstate", (event) => {
			let id = _obj.getIDFromURL();
			// We don't want to add this to the history 
			// (because it is a change of history) 
			// so we pass in "true"
			if(id) _obj.show(id,true);
			else _obj.hide(true);
		});

		return this;
	}

	var popovers = new Popovers();
	OI.ready(function(){
		document.querySelectorAll('[data-comp=Popover]').forEach(el => { popovers.add(el); });
	});

})(window || this);

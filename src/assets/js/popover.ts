const POPOVER_PARAM = 'infobox';

function showOnLoad(id: string) {
	if (!id) false;
	const params = new URLSearchParams(globalThis.location.search);
	if(params.get(POPOVER_PARAM)) return params.get(POPOVER_PARAM)==id;
	return false;
}
function addToLocation(id: string) {
	if (!id) return;
	const url = new URL(globalThis.location.toString())
	url.searchParams.set(POPOVER_PARAM, id)
	globalThis.history.pushState(null, '', url.toString());
}
function removeFromLocation(id: string) {
	if (!id) return;
	const url = new URL(globalThis.location.toString())
	url.searchParams.delete(POPOVER_PARAM, id)
	globalThis.history.pushState(null, '', url.toString());
}

function initialisePopover(popover: HTMLElement) {
	const btnShow = popover.querySelector('button.show');
	const content = popover.querySelector('div.popover-content');
	console.debug('init',popover,btnShow);

	let popup = document.querySelector('dialog');
	if(!document.querySelector('dialog')){
		popup = document.createElement('dialog');
		popup.removeAttribute('open');
		document.body.appendChild(popup);
	}
	popup.dataset.comp = "ActivePopover";

	const btnHide = document.createElement('button');
	btnHide.classList.add('hide', 'icon');
	btnHide.innerHTML = `<svg viewBox="0 0 10 10"><path d="M2 2 L8 8 M2 8 L8 2" stroke="currentColor" stroke-width="2px"></svg>`;

	const clonedContent = document.createElement('div');
	clonedContent.classList.add('content-area');
	clonedContent.innerHTML = content!.innerHTML;

	popup.addEventListener('click',function(event){
		var rect = popup.getBoundingClientRect();
		var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
		rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
		if(!isInDialog) hide();
	});

	const show = () => {
		popup.showModal();
		popup.innerHTML = "";
		popup.appendChild(btnHide);
		popup.appendChild(clonedContent);
console.debug('show',btnHide,btnShow,popover);
		btnHide.focus();
		addToLocation(popover.dataset.infoboxId);
	};
	
	const hide = () => {
		popup.close();
		if(popup.contains(btnHide)){
			popup.removeChild(btnHide);
			btnShow.focus();
		}
		removeFromLocation(popover.dataset.infoboxId);
	};
	
	popup.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			hide(); // will call removeFromLocation too
		}
	});
	
	btnShow?.addEventListener('click', show );
	btnHide.addEventListener('click', hide );

	if (showOnLoad(popover.dataset.infoboxId)) show();
	return this;
}

document.querySelectorAll<HTMLElement>('[data-comp=Popover]').forEach(el => { new initialisePopover(el); });
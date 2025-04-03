function initialisePopover(popover: HTMLElement) {
    const btnShow = popover.querySelector('button.show');
    const content = popover.querySelector('div.popover-content');

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
		if(!isInDialog) popup.close();
	});

    const show = () => {
		popup.showModal();
		popup.innerHTML = "";
		popup.appendChild(btnHide);
		popup.appendChild(clonedContent);
        document.body.classList.add('no-scroll');
		btnHide.focus();
    }
    
    const hide = () => {
		popup.close();
        document.body.classList.remove('no-scroll');
		btnShow.focus();
    }
    
    btnShow?.addEventListener('click', show);
    btnHide.addEventListener('click', hide);
}

document
    .querySelectorAll<HTMLElement>('[data-comp=Popover]')
    .forEach(initialisePopover);
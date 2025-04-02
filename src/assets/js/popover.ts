function initialisePopover(popover: HTMLElement) {
    const btnShow = popover.querySelector('button.show');
    const content = popover.querySelector('div.popover-content');
    
    const popup = document.createElement('aside')
    const btnHide = document.createElement('button');
    btnHide.classList.add('hide', 'icon');
    btnHide.innerHTML = `<svg viewBox="0 0 10 10"><path d="M2 2 L8 8 M2 8 L8 2" stroke="currentColor" stroke-width="2px"></svg>`;
    {
        popup.dataset.comp="ActivePopover";
        const container = document.createElement('div');
        const clonedContent = document.createElement('div');
        clonedContent.classList.add('content-area');
        popup.appendChild(container);
        container.appendChild(btnHide);
        container.appendChild(clonedContent);
        clonedContent.innerHTML = content!.innerHTML;
    }
    
    const show = () => {
        if (popup.isConnected) return;
        document.body.appendChild(popup);
        document.body.classList.add('no-scroll');
		btnHide.focus();
    }
    
    const hide = () => {
        if (!popup.isConnected) return;
        popup.remove();
        document.body.classList.remove('no-scroll');
		btnShow.focus();
    }
    
    btnShow?.addEventListener('click', show);
    btnHide.addEventListener('click', hide);
}

document
    .querySelectorAll<HTMLElement>('[data-comp=Popover]')
    .forEach(initialisePopover);
import { asyncWrapProviders } from "node:async_hooks";
import { DOMParser } from '../../../deps/dom.ts';

interface TabSetOptions {
	content: string;
	wrapperClass?: string;
	selected: number;
}

export default function ({ content, wrapperClass, selected, classes }: TabSetOptions) {
	const fragment = new DOMParser().parseFromString(content, 'text/html');
	const panels = Array.from(fragment.querySelectorAll('[data-tab-label]'));

	const tabList = document.createElement('ul');
	tabList.setAttribute('role','tablist');
	tabList.setAttribute('aria-label','Visualisations');

	for (const [idx, panel] of panels.entries()) {
		const tab = document.createElement('li');
		tab.setAttribute('role','presentation');
		tab.innerHTML = `<a href="#${ panel.id }" role="tab" data-tab="${ idx }">${ panel.dataset.tabLabel }</a>`;
		tabList.append(tab);
	}
	return '<tabbed data-dependencies="/assets/js/tabbed.js"' + (selected ? ' data-default="' + selected + '"' : '') + (classes ? ' class="' + classes + '"' : '') + '>' + tabList.outerHTML + '<div ' + (wrapperClass ? ' class="' + wrapperClass + '"': "") + '>' + content + '</div></tabbed>';
}